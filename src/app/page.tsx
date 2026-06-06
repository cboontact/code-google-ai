'use client';

import { useState, useEffect, useRef } from 'react';
import { COURSES } from '@/lib/courses';
import { DashboardStats, ApiResponse } from '@/lib/types';

// ── Animated counter: นับจาก 0 → target ──────────────────────────────────
function AnimatedCounter({ value, suffix = '' }: { value: number; suffix?: string }) {
  const [n, setN] = useState(0);
  const rafRef = useRef<number>(0);
  useEffect(() => {
    if (value === 0) { setN(0); return; }
    const duration = 900;
    const start = performance.now();
    const tick = (now: number) => {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3); // ease-out-cubic
      setN(Math.round(eased * value));
      if (p < 1) rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [value]);
  return <>{n}{suffix}</>;
}

// ── Animated progress bar ─────────────────────────────────────────────────
function AnimatedBar({
  pct, colorClass, delay = 0, height = 'h-2',
}: {
  pct: number; colorClass: string; delay?: number; height?: string;
}) {
  const [w, setW] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setW(pct), delay);
    return () => clearTimeout(t);
  }, [pct, delay]);
  return (
    <div className={`${height} bg-slate-100 rounded-full overflow-hidden`}>
      <div
        className={`h-full rounded-full ${colorClass}`}
        style={{
          width: `${w}%`,
          transition: `width 1.1s cubic-bezier(0.34, 1.2, 0.64, 1)`,
        }}
      />
    </div>
  );
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('th-TH', {
    day: 'numeric', month: 'short', year: '2-digit',
    hour: '2-digit', minute: '2-digit',
  });
}

function StatCard({ icon, label, value, sub, color }: {
  icon: string; label: string; value: string | number; sub?: string; color: string;
}) {
  return (
    <div className="card flex items-start gap-4">
      <div className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
        <i className={`fa-solid ${icon} text-xl`} />
      </div>
      <div className="min-w-0">
        <p className="text-sm text-slate-500 font-medium">{label}</p>
        <p className="text-3xl font-bold text-slate-800 mt-0.5">{value}</p>
        {sub && <p className="text-xs text-slate-400 mt-1">{sub}</p>}
      </div>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="card flex items-start gap-4">
      <div className="skeleton w-12 h-12 rounded-xl flex-shrink-0" />
      <div className="flex-1 space-y-2 pt-1">
        <div className="skeleton h-4 w-24 rounded" />
        <div className="skeleton h-8 w-16 rounded" />
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/dashboard')
      .then((r) => r.json())
      .then((j: ApiResponse<DashboardStats>) => {
        if (j.success && j.data) setStats(j.data);
        else setError(j.error ?? 'เกิดข้อผิดพลาด');
      })
      .catch(() => setError('ไม่สามารถเชื่อมต่อฐานข้อมูลได้'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-sky-50">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Page header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
            <i className="fa-solid fa-chart-pie text-primary-600" />
            สรุปภาพรวมการส่งเกียรติบัตร
          </h1>
          <p className="text-slate-500 mt-1 text-sm">
            <i className="fa-solid fa-graduation-cap mr-1.5" />
            หลักสูตร Google AI Professional Certificate · ปีการศึกษา 2569 · โรงเรียนจอมทอง
          </p>
        </div>

        {error && (
          <div className="card border border-red-200 bg-red-50 text-red-700 flex items-center gap-3 mb-8">
            <i className="fa-solid fa-triangle-exclamation text-xl" />
            <p>{error}</p>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
          ) : stats ? (
            <>
              <StatCard icon="fa-users" label="บุคลากรทั้งหมด" value={stats.total_teachers} sub="คน" color="bg-primary-100 text-primary-700" />
              <StatCard icon="fa-file-pdf" label="เกียรติบัตรที่ส่งแล้ว" value={stats.total_certificates}
                sub={`จาก ${stats.total_teachers * 7} ฉบับ`} color="bg-teal-100 text-teal-700" />
              <StatCard icon="fa-percent" label="ความคืบหน้าภาพรวม" value={`${stats.completion_rate}%`}
                sub="ของทั้งหมด" color="bg-amber-100 text-amber-700" />
              <StatCard icon="fa-trophy" label="ส่งครบ 7 หลักสูตร" value={stats.completed_all}
                sub="คน" color="bg-green-100 text-green-700" />
            </>
          ) : null}
        </div>

        {/* Course Progress */}
        <div className="card mb-6">
          <h2 className="text-lg font-bold text-slate-800 mb-5 flex items-center gap-2">
            <i className="fa-solid fa-list-check text-primary-600" />
            ความคืบหน้าแต่ละหลักสูตร
          </h2>
          {loading ? (
            <div className="space-y-4">
              {Array.from({ length: 7 }).map((_, i) => (
                <div key={i} className="space-y-1.5">
                  <div className="skeleton h-4 w-48 rounded" />
                  <div className="skeleton h-2 w-full rounded-full" />
                </div>
              ))}
            </div>
          ) : stats && (
            <div className="space-y-4">
              {COURSES.map((course, idx) => {
                const found = stats.by_course.find((c) => c.course_id === course.id);
                const count = found?.count ?? 0;
                const pct = stats.total_teachers > 0
                  ? Math.round((count / stats.total_teachers) * 100) : 0;
                const colorClass = pct >= 80
                  ? 'bg-gradient-to-r from-green-400 to-green-500'
                  : pct >= 50
                  ? 'bg-gradient-to-r from-amber-400 to-amber-500'
                  : 'bg-gradient-to-r from-primary-400 to-teal-500';
                const badgeClass = pct >= 80
                  ? 'bg-green-100 text-green-700'
                  : pct >= 50
                  ? 'bg-amber-100 text-amber-700'
                  : 'bg-slate-100 text-slate-600';
                return (
                  <div key={course.id}
                    className="animate-fade-in"
                    style={{ animationDelay: `${idx * 60}ms`, animationFillMode: 'both' }}>
                    <div className="flex items-center justify-between mb-2 gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="flex-shrink-0 w-7 h-7 rounded-lg bg-primary-100 text-primary-700 text-xs font-bold flex items-center justify-center">
                          {course.id}
                        </span>
                        <span className="text-sm font-medium text-slate-700 truncate">{course.name}</span>
                        <span className="hidden sm:inline text-xs text-slate-400 flex-shrink-0">
                          <i className="fa-regular fa-clock mr-1" />{course.duration} ชม.
                        </span>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="text-sm font-semibold text-slate-700">
                          <AnimatedCounter value={count} />/{stats.total_teachers}
                        </span>
                        <span className={`badge ${badgeClass} tabular-nums`}>
                          <AnimatedCounter value={pct} suffix="%" />
                        </span>
                      </div>
                    </div>
                    <AnimatedBar
                      pct={pct}
                      colorClass={colorClass}
                      delay={idx * 80 + 200}
                      height="h-3"
                    />
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Department Table */}
          <div className="card lg:col-span-2">
            <h2 className="text-lg font-bold text-slate-800 mb-5 flex items-center gap-2">
              <i className="fa-solid fa-building-columns text-primary-600" />
              สรุปตามกลุ่มสาระการเรียนรู้
            </h2>
            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => <div key={i} className="skeleton h-10 w-full rounded-xl" />)}
              </div>
            ) : !stats || stats.by_department.length === 0 ? (
              <p className="text-slate-400 text-sm text-center py-8">ยังไม่มีข้อมูล</p>
            ) : (
              <div className="overflow-x-auto -mx-2">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-100">
                      <th className="text-left py-2.5 px-3 text-slate-500 font-semibold">กลุ่มสาระ</th>
                      <th className="text-center py-2.5 px-2 text-slate-500 font-semibold">คน</th>
                      <th className="text-center py-2.5 px-2 text-slate-500 font-semibold">ส่งแล้ว</th>
                      <th className="text-left py-2.5 px-3 text-slate-500 font-semibold">ความคืบหน้า</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.by_department.map((dept) => (
                      <tr key={dept.department} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                        <td className="py-2.5 px-3 font-medium text-slate-700">{dept.department}</td>
                        <td className="py-2.5 px-2 text-center text-slate-600">{dept.teacher_count}</td>
                        <td className="py-2.5 px-2 text-center text-slate-600">
                          {dept.cert_count}/{dept.teacher_count * 7}
                        </td>
                        <td className="py-2.5 px-3">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 min-w-[60px]">
                              <AnimatedBar
                                pct={dept.completion_rate}
                                colorClass={dept.completion_rate >= 80 ? 'bg-gradient-to-r from-green-400 to-green-500' : dept.completion_rate >= 50 ? 'bg-gradient-to-r from-amber-400 to-amber-500' : 'bg-gradient-to-r from-primary-400 to-teal-500'}
                                delay={200}
                              />
                            </div>
                            <span className={`text-xs font-semibold w-12 text-right tabular-nums ${dept.completion_rate >= 80 ? 'text-green-600' : dept.completion_rate >= 50 ? 'text-amber-600' : 'text-primary-600'}`}>
                              <AnimatedCounter value={dept.completion_rate} suffix="%" />
                            </span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Recent Activity */}
          <div className="card">
            <h2 className="text-lg font-bold text-slate-800 mb-5 flex items-center gap-2">
              <i className="fa-solid fa-clock-rotate-left text-primary-600" />
              ส่งล่าสุด
            </h2>
            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => <div key={i} className="skeleton h-16 w-full rounded-xl" />)}
              </div>
            ) : !stats || stats.recent.length === 0 ? (
              <p className="text-slate-400 text-sm text-center py-8">ยังไม่มีการส่งเกียรติบัตร</p>
            ) : (
              <div className="space-y-3">
                {stats.recent.map((item, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-slate-50">
                    <span className="flex-shrink-0 w-7 h-7 rounded-lg bg-primary-600 text-white text-xs font-bold flex items-center justify-center">
                      {item.course_id}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-slate-800 truncate">{item.teacher_name}</p>
                      <p className="text-xs text-slate-500 truncate">
                        {COURSES.find((c) => c.id === item.course_id)?.name ?? `Course ${item.course_id}`}
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        <i className="fa-regular fa-clock mr-1" />{formatDate(item.submitted_at)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Refresh button */}
        <div className="mt-6 flex justify-center">
          <button
            onClick={() => { setLoading(true); setError('');
              fetch('/api/dashboard').then(r => r.json())
                .then((j: ApiResponse<DashboardStats>) => { if (j.success && j.data) setStats(j.data); else setError(j.error ?? 'เกิดข้อผิดพลาด'); })
                .catch(() => setError('ไม่สามารถโหลดข้อมูลได้'))
                .finally(() => setLoading(false));
            }}
            className="btn-secondary text-sm"
            disabled={loading}
          >
            {loading
              ? <><i className="fa-solid fa-spinner animate-spin" />กำลังโหลด...</>
              : <><i className="fa-solid fa-rotate-right" />รีเฟรชข้อมูล</>}
          </button>
        </div>

      </main>
    </div>
  );
}
