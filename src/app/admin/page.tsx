'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { COURSES, POSITIONS, ACADEMIC_LEVELS, DEPARTMENTS } from '@/lib/courses';
import { ApiResponse } from '@/lib/types';

// ─── Types ───────────────────────────────
interface AdminTeacher {
  id: number; name: string; phone: string | null;
  position: string; academic_level: string; department: string;
  created_at: string; cert_count: number; submitted_courses: string | null;
}

type Tab = 'teachers' | 'certificates';

// ─── Helpers ─────────────────────────────
function Spinner() { return <i className="fa-solid fa-spinner animate-spin" />; }

function adminHeaders(pw: string) {
  return { 'Content-Type': 'application/json', 'x-admin-password': pw };
}

const fmtDate = (d: string) => new Date(d).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: '2-digit' });

// ─── Login Screen ─────────────────────────
function LoginScreen({ onLogin }: { onLogin: (pw: string) => void }) {
  const [pw, setPw] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError('');
    const res = await fetch('/api/admin/teachers', { headers: { 'x-admin-password': pw } });
    if (res.ok) { onLogin(pw); }
    else { setError('รหัสผ่านไม่ถูกต้อง'); }
    setLoading(false);
  };

  return (
    <div className="min-h-[calc(100vh-8rem)] bg-sky-50 px-4 py-10 text-slate-900 sm:px-6">
      <div className="mx-auto flex min-h-[560px] max-w-5xl items-center justify-center">
        <div className="w-full max-w-[460px]">
          <div className="rounded-lg border border-slate-200 bg-white shadow-[0_14px_40px_rgba(15,23,42,0.08)]">
            <div className="px-7 pb-5 pt-7 text-center">
              <Image
                src="/logo.png"
                alt="โรงเรียนจอมทอง"
                width={64}
                height={64}
                className="mx-auto h-16 w-16 rounded-full object-contain"
                priority
              />
              <h1 className="mt-4 text-[18px] font-semibold leading-7 text-slate-950">
                <span className="block">ระบบส่งเกียรติบัตร</span>
                <span className="block">Google AI Professional Certificate 2569</span>
              </h1>
              <p className="mt-1 text-sm text-slate-500">โรงเรียนจอมทอง</p>
            </div>

            <div className="h-px bg-slate-100" />

            <form onSubmit={handleSubmit} className="px-7 py-6">
              <h2 className="mb-5 text-center text-base font-semibold text-slate-800">เข้าสู่ระบบผู้ดูแล</h2>

              <label className="mb-2 block text-sm font-medium text-slate-700" htmlFor="admin-password">
                รหัสผ่าน
              </label>
              <input
                id="admin-password"
                type="password"
                value={pw}
                onChange={(e) => setPw(e.target.value)}
                className="h-12 w-full rounded-md border border-slate-300 bg-white px-3.5 text-base text-slate-900 outline-none transition-colors focus:border-slate-600 focus:ring-2 focus:ring-slate-200"
                autoFocus
                required
              />

              {error && (
                <div className="mt-4 rounded-md border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-700">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="mt-5 inline-flex h-12 w-full items-center justify-center rounded-md bg-[#1f2937] px-4 text-sm font-semibold text-white transition-colors hover:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? <><Spinner />กำลังตรวจสอบ...</> : 'เข้าสู่ระบบ'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Teacher Form Modal ───────────────────
function TeacherModal({ teacher, adminPw, onClose, onSaved }: {
  teacher: AdminTeacher | null; adminPw: string;
  onClose: () => void; onSaved: () => void;
}) {
  const isEdit = !!teacher;
  const [name, setName]               = useState(teacher?.name ?? '');
  const [phone, setPhone]             = useState(teacher?.phone ?? '');
  const [position, setPosition]       = useState(teacher?.position ?? 'ครู');
  const [academicLevel, setLevel]     = useState(teacher?.academic_level ?? 'ไม่มีวิทยฐานะ');
  const [department, setDept]         = useState(
    teacher?.department && teacher.department !== 'ยังไม่ระบุ' ? teacher.department : ''
  );
  const [showExtra, setShowExtra]     = useState(isEdit);
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setError(''); setLoading(true);
    const body = {
      name,
      phone: phone || null,
      position: position || 'ครู',
      academic_level: academicLevel || 'ไม่มีวิทยฐานะ',
      department: department || 'ยังไม่ระบุ',
    };
    const res = await fetch(
      isEdit ? `/api/admin/teachers/${teacher!.id}` : '/api/admin/teachers',
      { method: isEdit ? 'PUT' : 'POST', headers: adminHeaders(adminPw), body: JSON.stringify(body) }
    );
    const json: ApiResponse = await res.json();
    setLoading(false);
    if (!json.success) { setError(json.error ?? 'เกิดข้อผิดพลาด'); return; }
    onSaved();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md animate-bounce-in">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h3 className="font-bold text-slate-800 flex items-center gap-2">
            <i className={`fa-solid ${isEdit ? 'fa-pen' : 'fa-user-plus'} text-primary-600`} />
            {isEdit ? 'แก้ไขข้อมูลครู' : 'เพิ่มครูใหม่'}
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-xl">
            <i className="fa-solid fa-xmark" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">

          {/* ── บังคับ: ชื่อ-นามสกุล ── */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              <i className="fa-solid fa-user mr-2 text-slate-400" />
              ชื่อ-นามสกุล <span className="text-red-500">*</span>
            </label>
            <input value={name} onChange={(e) => setName(e.target.value)}
              placeholder="ชื่อ-นามสกุล" className="input-field" autoFocus required />
          </div>

          {/* ── ไม่บังคับ: ข้อมูลเพิ่มเติม ── */}
          {!isEdit && (
            <button type="button" onClick={() => setShowExtra(!showExtra)}
              className="flex items-center gap-2 text-sm text-primary-600 hover:text-primary-700 font-medium">
              <i className={`fa-solid fa-chevron-${showExtra ? 'up' : 'down'} text-xs`} />
              {showExtra ? 'ซ่อนข้อมูลเพิ่มเติม' : 'กรอกข้อมูลเพิ่มเติม (ไม่บังคับ)'}
            </button>
          )}

          {showExtra && (
            <div className="space-y-4 animate-fade-in">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  <i className="fa-solid fa-mobile-screen-button mr-2 text-slate-400" />เบอร์โทร
                </label>
                <input type="tel" value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  placeholder="0XX-XXX-XXXX" className="input-field font-mono"
                  maxLength={10} inputMode="numeric" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    <i className="fa-solid fa-user-tie mr-1.5 text-slate-400" />ตำแหน่ง
                  </label>
                  <select value={position} onChange={(e) => setPosition(e.target.value)} className="input-field">
                    {POSITIONS.map((p) => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    <i className="fa-solid fa-award mr-1.5 text-slate-400" />วิทยฐานะ
                  </label>
                  <select value={academicLevel} onChange={(e) => setLevel(e.target.value)} className="input-field">
                    {ACADEMIC_LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  <i className="fa-solid fa-building-columns mr-2 text-slate-400" />กลุ่มสาระ
                </label>
                <select value={department} onChange={(e) => setDept(e.target.value)} className="input-field">
                  <option value="">ยังไม่ระบุ</option>
                  {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
            </div>
          )}

          {error && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 text-red-600 text-sm">
              <i className="fa-solid fa-triangle-exclamation" />{error}
            </div>
          )}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">ยกเลิก</button>
            <button type="submit" disabled={loading} className="btn-primary flex-1">
              {loading ? <><Spinner />กำลังบันทึก...</> : <><i className="fa-solid fa-floppy-disk" />บันทึก</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Certificate Detail Modal ─────────────
function CertModal({ teacher, adminPw, onClose, onDeleted }: {
  teacher: AdminTeacher; adminPw: string; onClose: () => void; onDeleted: () => void;
}) {
  const [certs, setCerts] = useState<{ id: number; course_id: number; file_path: string; file_name: string; file_size: number; submitted_at: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<number | null>(null);

  useEffect(() => {
    fetch(`/api/certificates?teacher_id=${teacher.id}`)
      .then(r => r.json()).then(j => { if (j.success) setCerts(j.data); })
      .finally(() => setLoading(false));
  }, [teacher.id]);

  const handleDelete = async (certId: number) => {
    if (!confirm('ต้องการลบเกียรติบัตรนี้?')) return;
    setDeleting(certId);
    const res = await fetch(`/api/admin/certificates/${certId}`, { method: 'DELETE', headers: { 'x-admin-password': adminPw } });
    const json: ApiResponse = await res.json();
    if (json.success) { setCerts(p => p.filter(c => c.id !== certId)); onDeleted(); }
    setDeleting(null);
  };

  const fmtSize = (b: number) => b < 1048576 ? `${(b / 1024).toFixed(1)} KB` : `${(b / 1048576).toFixed(1)} MB`;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg animate-bounce-in max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 flex-shrink-0">
          <div>
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              <i className="fa-solid fa-folder-open text-amber-500" />เกียรติบัตรของ {teacher.name}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {teacher.department} · ส่งแล้ว {teacher.cert_count}/7 หลักสูตร
            </p>
            <p className="text-xs text-slate-400 mt-0.5 font-mono">
              <i className="fa-solid fa-folder mr-1" />
              uploads/{teacher.id}/
            </p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-xl"><i className="fa-solid fa-xmark" /></button>
        </div>
        <div className="p-4 overflow-y-auto flex-1">
          {loading ? (
            <div className="text-center py-8 text-slate-400"><Spinner /> กำลังโหลด...</div>
          ) : (
            <div className="space-y-2">
              {COURSES.map((course) => {
                const cert = certs.find(c => c.course_id === course.id);
                return (
                  <div key={course.id} className={`flex items-center gap-3 p-3 rounded-xl border ${cert ? 'border-green-200 bg-green-50' : 'border-slate-100 bg-slate-50'}`}>
                    <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0 ${cert ? 'bg-green-500 text-white' : 'bg-slate-300 text-white'}`}>
                      {cert ? <i className="fa-solid fa-check" /> : course.id}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-slate-700 truncate">{course.name}</p>
                      {cert && <p className="text-xs text-slate-400">{cert.file_name} · {fmtSize(cert.file_size)} · {fmtDate(cert.submitted_at)}</p>}
                    </div>
                    {cert ? (
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <a href={`/api/certificates/${cert.id}`} target="_blank" rel="noopener noreferrer"
                          title={`เปิด ${cert.file_name}`}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary-600 hover:bg-primary-700 text-white text-xs font-semibold transition-colors shadow-sm">
                          <i className="fa-solid fa-file-pdf" />
                          <span>เปิดดู</span>
                        </a>
                        <button onClick={() => handleDelete(cert.id)} disabled={deleting === cert.id}
                          title="ลบไฟล์"
                          className="px-2.5 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 text-xs font-medium transition-colors disabled:opacity-50">
                          {deleting === cert.id ? <Spinner /> : <i className="fa-solid fa-trash" />}
                        </button>
                      </div>
                    ) : (
                      <span className="badge bg-slate-100 text-slate-400 flex-shrink-0">ยังไม่ส่ง</span>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Main Admin Page ──────────────────────
export default function AdminPage() {
  const [adminPw, setAdminPw] = useState('');
  const [teachers, setTeachers] = useState<AdminTeacher[]>([]);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState<Tab>('teachers');
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [modalTeacher, setModalTeacher] = useState<AdminTeacher | 'new' | null>(null);
  const [certTeacher, setCertTeacher] = useState<AdminTeacher | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const loadTeachers = useCallback(async (pw: string) => {
    setLoading(true);
    const res = await fetch('/api/admin/teachers', { headers: { 'x-admin-password': pw } });
    const json: ApiResponse<AdminTeacher[]> = await res.json();
    if (json.success && json.data) setTeachers(json.data);
    setLoading(false);
  }, []);

  const handleLogin = (pw: string) => { setAdminPw(pw); loadTeachers(pw); };

  const handleDelete = async (t: AdminTeacher) => {
    if (!confirm(`ต้องการลบ "${t.name}" และเกียรติบัตรทั้งหมด?`)) return;
    setDeletingId(t.id);
    const res = await fetch(`/api/admin/teachers/${t.id}`, { method: 'DELETE', headers: { 'x-admin-password': adminPw } });
    const json: ApiResponse = await res.json();
    if (json.success) setTeachers(p => p.filter(x => x.id !== t.id));
    setDeletingId(null);
  };

  const handleExport = () => {
    const a = document.createElement('a');
    a.href = `/api/admin/export`;
    // ส่ง password ผ่าน URL param สำหรับ export (GET request)
    a.href = `/api/admin/export?pw=${encodeURIComponent(adminPw)}`;
    a.click();
  };

  if (!adminPw) return <LoginScreen onLogin={handleLogin} />;

  const filtered = teachers.filter(t =>
    (!search || t.name.toLowerCase().includes(search.toLowerCase())) &&
    (!deptFilter || t.department === deptFilter)
  );

  const submittedAll = teachers.filter(t => t.cert_count >= 7).length;
  const totalCerts = teachers.reduce((s, t) => s + t.cert_count, 0);
  const pct = teachers.length > 0 ? Math.round((totalCerts / (teachers.length * 7)) * 100) : 0;

  return (
    <div className="min-h-screen bg-sky-50">
      {/* Header */}
      <header className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between gap-4 sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0">
            <i className="fa-solid fa-shield-halved text-white" />
          </div>
          <div>
            <p className="font-bold leading-tight">Admin Panel</p>
            <p className="text-xs text-slate-400">ระบบส่งเกียรติบัตร Google AI Professional Certificate 2569 · โรงเรียนจอมทอง</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-green-500 hover:bg-green-600 text-white text-sm font-medium transition-colors">
            <i className="fa-solid fa-file-csv" />
            <span className="hidden sm:inline">Export CSV</span>
          </button>
          <button onClick={() => { setModalTeacher('new'); }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium transition-colors">
            <i className="fa-solid fa-user-plus" />
            <span className="hidden sm:inline">เพิ่มครู</span>
          </button>
          <button onClick={() => setAdminPw('')}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-sm font-medium transition-colors">
            <i className="fa-solid fa-right-from-bracket" />
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {[
            { icon: 'fa-users', label: 'ครูทั้งหมด', value: teachers.length, color: 'bg-primary-100 text-primary-700' },
            { icon: 'fa-file-pdf', label: 'เกียรติบัตร', value: totalCerts, color: 'bg-teal-100 text-teal-700' },
            { icon: 'fa-percent', label: 'ความคืบหน้า', value: `${pct}%`, color: 'bg-amber-100 text-amber-700' },
            { icon: 'fa-trophy', label: 'ครบ 7 หลักสูตร', value: submittedAll, color: 'bg-green-100 text-green-700' },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-2xl p-4 flex items-center gap-3 shadow-card">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${s.color}`}>
                <i className={`fa-solid ${s.icon}`} />
              </div>
              <div>
                <p className="text-xs text-slate-500">{s.label}</p>
                <p className="text-2xl font-bold text-slate-800">{s.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Filter Bar */}
        <div className="bg-white rounded-2xl shadow-card p-4 mb-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <i className="fa-solid fa-magnifying-glass absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input value={search} onChange={(e) => setSearch(e.target.value)}
                placeholder="ค้นหาชื่อครู..." className="input-field pl-10 text-sm" />
            </div>
            <select value={deptFilter} onChange={(e) => setDeptFilter(e.target.value)} className="input-field sm:w-56 text-sm">
              <option value="">กลุ่มสาระทั้งหมด</option>
              {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
            <button onClick={() => loadTeachers(adminPw)} className="btn-secondary text-sm px-4 flex-shrink-0">
              <i className="fa-solid fa-rotate-right" />รีเฟรช
            </button>
          </div>
        </div>

        {/* Teachers Table */}
        <div className="bg-white rounded-2xl shadow-card overflow-hidden">
          <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between">
            <h2 className="font-bold text-slate-800 flex items-center gap-2">
              <i className="fa-solid fa-users text-primary-600" />
              รายชื่อครูและบุคลากร
              <span className="badge bg-primary-100 text-primary-700 ml-1">{filtered.length} คน</span>
            </h2>
          </div>

          {loading ? (
            <div className="text-center py-16 text-slate-400">
              <i className="fa-solid fa-spinner animate-spin text-3xl mb-3 block" />
              <p>กำลังโหลดข้อมูล...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16 text-slate-400">
              <i className="fa-regular fa-folder-open text-3xl mb-3 block" />
              <p>ไม่พบข้อมูล</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="text-left px-4 py-3 text-slate-500 font-semibold">#</th>
                    <th className="text-left px-4 py-3 text-slate-500 font-semibold">ชื่อ-นามสกุล</th>
                    <th className="text-left px-4 py-3 text-slate-500 font-semibold hidden md:table-cell">กลุ่มสาระ</th>
                    <th className="text-left px-4 py-3 text-slate-500 font-semibold hidden lg:table-cell">ตำแหน่ง</th>
                    <th className="text-left px-4 py-3 text-slate-500 font-semibold hidden lg:table-cell">เบอร์โทร</th>
                    <th className="text-center px-4 py-3 text-slate-500 font-semibold">ความคืบหน้า</th>
                    <th className="text-center px-4 py-3 text-slate-500 font-semibold">วันที่</th>
                    <th className="text-center px-4 py-3 text-slate-500 font-semibold">จัดการ</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((t, i) => {
                    const submitted = t.submitted_courses ? t.submitted_courses.split(',').map(Number) : [];
                    const certPct = Math.round((t.cert_count / 7) * 100);
                    return (
                      <tr key={t.id} className="border-t border-slate-50 hover:bg-slate-50 transition-colors">
                        <td className="px-4 py-3 text-slate-400 text-xs">{i + 1}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-teal-500 flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                              {t.name.charAt(0)}
                            </div>
                            <div>
                              <p className="font-semibold text-slate-800">{t.name}</p>
                              <p className="text-xs text-slate-400 md:hidden">{t.department}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-slate-600 hidden md:table-cell">{t.department}</td>
                        <td className="px-4 py-3 text-slate-600 hidden lg:table-cell text-xs">{t.position}<br /><span className="text-slate-400">{t.academic_level}</span></td>
                        <td className="px-4 py-3 hidden lg:table-cell">
                          {t.phone ? (
                            <span className="font-mono text-slate-600 text-xs">{t.phone}</span>
                          ) : (
                            <span className="text-slate-300 text-xs italic">ยังไม่มี</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-col items-center gap-1.5">
                            <div className="flex gap-0.5">
                              {COURSES.map((c) => (
                                <div key={c.id} title={c.name}
                                  className={`w-4 h-4 rounded-sm text-[9px] flex items-center justify-center font-bold
                                    ${submitted.includes(c.id) ? 'bg-green-500 text-white' : 'bg-slate-200 text-slate-400'}`}>
                                  {c.id}
                                </div>
                              ))}
                            </div>
                            <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                              <div className={`h-full rounded-full ${certPct === 100 ? 'bg-green-500' : 'bg-primary-500'}`}
                                style={{ width: `${certPct}%` }} />
                            </div>
                            <span className={`text-xs font-bold ${certPct === 100 ? 'text-green-600' : 'text-primary-600'}`}>
                              {t.cert_count}/7
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-center text-xs text-slate-400">{fmtDate(t.created_at)}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-center gap-1.5">
                            <button onClick={() => setCertTeacher(t)}
                              className="px-2.5 py-1.5 rounded-lg bg-primary-50 hover:bg-primary-100 text-primary-700 text-xs font-medium transition-colors"
                              title="ดูเกียรติบัตรทั้งหมด">
                              <i className="fa-solid fa-folder-open" />
                            </button>
                            <button onClick={() => setModalTeacher(t)}
                              className="px-2.5 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-700 text-xs font-medium transition-colors"
                              title="แก้ไขข้อมูล">
                              <i className="fa-solid fa-pen" />
                            </button>
                            <button onClick={() => handleDelete(t)} disabled={deletingId === t.id}
                              className="px-2.5 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 text-xs font-medium transition-colors disabled:opacity-50"
                              title="ลบครูและเกียรติบัตรทั้งหมด">
                              {deletingId === t.id ? <Spinner /> : <i className="fa-solid fa-trash" />}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* Teacher Modal */}
      {modalTeacher && (
        <TeacherModal
          teacher={modalTeacher === 'new' ? null : modalTeacher}
          adminPw={adminPw}
          onClose={() => setModalTeacher(null)}
          onSaved={() => { setModalTeacher(null); loadTeachers(adminPw); }}
        />
      )}

      {/* Cert Modal */}
      {certTeacher && (
        <CertModal
          teacher={certTeacher}
          adminPw={adminPw}
          onClose={() => setCertTeacher(null)}
          onDeleted={() => loadTeachers(adminPw)}
        />
      )}
    </div>
  );
}
