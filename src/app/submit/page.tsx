'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { ToastContainer, useToast } from '@/components/Toast';
import { COURSES, POSITIONS, ACADEMIC_LEVELS, DEPARTMENTS, TOTAL_COURSES } from '@/lib/courses';
import { Teacher, Certificate, TeacherSearchResult, ApiResponse } from '@/lib/types';

type Step = 'search' | 'auth' | 'upload';

// ─────────────────────────────────────────
// Step Indicator
// ─────────────────────────────────────────
function StepIndicator({ step }: { step: Step }) {
  const steps = [
    { key: 'search', label: 'ค้นหาชื่อ',   icon: 'fa-magnifying-glass', n: 1 },
    { key: 'auth',   label: 'ยืนยันตัวตน', icon: 'fa-shield-halved',   n: 2 },
    { key: 'upload', label: 'อัพโหลด',      icon: 'fa-file-arrow-up',  n: 3 },
  ];
  const active = steps.findIndex((s) => s.key === step);

  return (
    <div className="flex items-center justify-center mb-8">
      {steps.map((s, i) => (
        <div key={s.key} className="flex items-center">
          <div className="flex flex-col items-center gap-1.5">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm border-2 transition-all duration-300
              ${i < active ? 'step-done' : i === active ? 'step-active' : 'step-pending'}`}>
              {i < active
                ? <i className="fa-solid fa-check text-sm" />
                : <i className={`fa-solid ${s.icon} text-sm`} />}
            </div>
            <span className={`text-xs font-medium ${i === active ? 'text-primary-700' : i < active ? 'text-green-600' : 'text-slate-400'}`}>
              {s.label}
            </span>
          </div>
          {i < steps.length - 1 && (
            <div className={`w-16 sm:w-24 h-0.5 mb-5 mx-2 transition-all duration-500 ${i < active ? 'bg-green-400' : 'bg-slate-200'}`} />
          )}
        </div>
      ))}
    </div>
  );
}

function Spinner() {
  return <i className="fa-solid fa-spinner animate-spin" />;
}

// ─────────────────────────────────────────
// Step 1: Search
// ─────────────────────────────────────────
function SearchStep({ onSelect }: {
  onSelect: (t: TeacherSearchResult | null, name: string) => void;
}) {
  const [query, setQuery]     = useState('');
  const [results, setResults] = useState<TeacherSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const search = useCallback(async (q: string) => {
    if (!q.trim()) { setResults([]); setSearched(false); return; }
    setLoading(true);
    try {
      const res = await fetch(`/api/teachers?search=${encodeURIComponent(q)}`);
      const json: ApiResponse<TeacherSearchResult[]> = await res.json();
      setResults(json.data ?? []);
      setSearched(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => search(query), 350);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [query, search]);

  return (
    <div className="animate-fade-in">
      <div className="text-center mb-6">
        <div className="w-16 h-16 rounded-2xl bg-primary-100 flex items-center justify-center mx-auto mb-3">
          <i className="fa-solid fa-magnifying-glass text-2xl text-primary-600" />
        </div>
        <h2 className="text-xl font-bold text-slate-800">ค้นหาชื่อของคุณ</h2>
        <p className="text-slate-500 text-sm mt-1">พิมพ์ชื่อ-นามสกุล เพื่อเข้าสู่ระบบ</p>
      </div>

      <div className="relative">
        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
          {loading ? <Spinner /> : <i className="fa-solid fa-magnifying-glass" />}
        </div>
        <input
          type="text" value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="พิมพ์ชื่อ-นามสกุล..."
          className="input-field pl-11" autoFocus
        />
      </div>

      {searched && (
        <div className="mt-3 space-y-2 animate-fade-in">
          {results.length === 0 ? (
            <div className="text-center py-6">
              <i className="fa-regular fa-face-frown text-3xl text-slate-300 mb-2 block" />
              <p className="text-slate-500 text-sm">ไม่พบชื่อ &ldquo;{query}&rdquo; ในระบบ</p>
              <p className="text-slate-400 text-xs mt-1">คุณสามารถลงทะเบียนใหม่ได้</p>
              <button onClick={() => onSelect(null, query.trim())} className="btn-primary mt-4 text-sm">
                <i className="fa-solid fa-user-plus" />
                ลงทะเบียนด้วยชื่อ &ldquo;{query}&rdquo;
              </button>
            </div>
          ) : (
            results.map((t) => (
              <button key={t.id} onClick={() => onSelect(t, t.name)}
                className="w-full flex items-center justify-between gap-3 p-4 rounded-xl border border-slate-200 hover:border-primary-400 hover:bg-primary-50 transition-all duration-200 group text-left">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-teal-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                    {t.name.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-800 truncate">{t.name}</p>
                    <p className="text-xs text-slate-500 truncate">
                      <i className="fa-solid fa-building-columns mr-1" />{t.department} · {t.position}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className={`badge ${t.cert_count >= 7 ? 'bg-green-100 text-green-700' : 'bg-primary-100 text-primary-700'}`}>
                    <i className="fa-solid fa-file-pdf" />{t.cert_count}/7
                  </span>
                  <i className="fa-solid fa-chevron-right text-slate-300 group-hover:text-primary-500 transition-colors" />
                </div>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────
// Step 2: Auth
// ─────────────────────────────────────────
function AuthStep({ teacher, newName, onSuccess, onBack, showToast }: {
  teacher: TeacherSearchResult | null;
  newName: string;
  onSuccess: (t: Teacher, c: Certificate[], phone: string) => void;
  onBack: () => void;
  showToast: (msg: string, type: 'success' | 'error' | 'warning' | 'info') => void;
}) {
  const isNew       = !teacher;
  const isFirstTime = teacher && !teacher.is_registered;
  const needsProfile = isNew || isFirstTime;

  const [phone, setPhone]             = useState('');
  const [position, setPosition]       = useState('');
  const [academicLevel, setLevel]     = useState('');
  const [department, setDepartment]   = useState('');
  const [loading, setLoading]         = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^\d{10}$/.test(phone)) { showToast('เบอร์โทรต้องเป็นตัวเลข 10 หลัก', 'warning'); return; }
    if (needsProfile && (!position || !academicLevel || !department)) {
      showToast('กรุณากรอกข้อมูลให้ครบถ้วน', 'warning'); return;
    }
    setLoading(true);
    try {
      if (isFirstTime) {
        // ครูที่ admin pre-add ไว้แล้ว → UPDATE ข้อมูลครั้งแรก
        const res = await fetch(`/api/teachers/${teacher!.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phone, position, academic_level: academicLevel, department }),
        });
        const json: ApiResponse<{ teacher: Teacher; certificates: Certificate[] }> = await res.json();
        if (!json.success) { showToast(json.error ?? 'เกิดข้อผิดพลาด', 'error'); return; }
        showToast('ลงทะเบียนสำเร็จ! ยินดีต้อนรับ', 'success');
        onSuccess(json.data!.teacher, json.data!.certificates, phone);
      } else if (isNew) {
        // ครูที่ไม่อยู่ในระบบ → CREATE ใหม่
        const res = await fetch('/api/teachers', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: newName, phone, position, academic_level: academicLevel, department }),
        });
        const json: ApiResponse<Teacher> = await res.json();
        if (!json.success) { showToast(json.error ?? 'เกิดข้อผิดพลาด', 'error'); return; }
        showToast('ลงทะเบียนสำเร็จ! ยินดีต้อนรับ', 'success');
        onSuccess(json.data!, [], phone);
      } else {
        const res = await fetch('/api/teachers/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ teacher_id: teacher!.id, phone }),
        });
        const json: ApiResponse<{ teacher: Teacher; certificates: Certificate[] }> = await res.json();
        if (!json.success) { showToast(json.error ?? 'เบอร์โทรไม่ถูกต้อง', 'error'); return; }
        showToast(`ยินดีต้อนรับกลับ, ${json.data!.teacher.name}!`, 'success');
        onSuccess(json.data!.teacher, json.data!.certificates, phone);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="text-center mb-6">
        <div className="w-16 h-16 rounded-2xl bg-teal-100 flex items-center justify-center mx-auto mb-3">
          <i className="fa-solid fa-shield-halved text-2xl text-teal-600" />
        </div>
        <h2 className="text-xl font-bold text-slate-800">
          {isNew ? 'ลงทะเบียนใหม่' : isFirstTime ? 'ตั้งค่าครั้งแรก' : 'ยืนยันตัวตน'}
        </h2>
        <p className="text-slate-500 text-sm mt-1">
          {isNew
            ? `ลงทะเบียน: ${newName}`
            : isFirstTime
            ? `สวัสดี ${teacher!.name} — กรุณากรอกข้อมูลเพิ่มเติม`
            : `สวัสดี ${teacher!.name} — กรุณายืนยันเบอร์โทร`}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">
            <i className="fa-solid fa-mobile-screen-button mr-2 text-primary-500" />
            เบอร์โทรศัพท์มือถือ 10 หลัก
          </label>
          <input type="tel" value={phone}
            onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
            placeholder="0XX-XXX-XXXX"
            className="input-field tracking-widest text-lg font-mono"
            maxLength={10} inputMode="numeric" autoFocus required
          />
          <p className="text-xs text-slate-400 mt-1">
            <i className="fa-solid fa-lock mr-1" />
            {needsProfile ? 'เบอร์นี้จะใช้ยืนยันตัวตนในครั้งถัดไป' : 'ใช้เพื่อป้องกันผู้อื่นแก้ไขข้อมูล'}
          </p>
        </div>

        {needsProfile && (
          <div className="space-y-4 p-4 rounded-xl bg-slate-50 border border-slate-200 animate-fade-in">
            <p className="text-sm font-semibold text-slate-600 flex items-center gap-2">
              <i className="fa-solid fa-circle-info text-primary-500" />ข้อมูลเพิ่มเติม (กรอกครั้งเดียว)
            </p>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                <i className="fa-solid fa-user-tie mr-2 text-slate-400" />ตำแหน่ง
              </label>
              <select value={position} onChange={(e) => setPosition(e.target.value)} className="input-field" required>
                <option value="">เลือกตำแหน่ง</option>
                {POSITIONS.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                <i className="fa-solid fa-award mr-2 text-slate-400" />วิทยฐานะ
              </label>
              <select value={academicLevel} onChange={(e) => setLevel(e.target.value)} className="input-field" required>
                <option value="">เลือกวิทยฐานะ</option>
                {ACADEMIC_LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                <i className="fa-solid fa-building-columns mr-2 text-slate-400" />กลุ่มสาระการเรียนรู้
              </label>
              <select value={department} onChange={(e) => setDepartment(e.target.value)} className="input-field" required>
                <option value="">เลือกกลุ่มสาระการเรียนรู้</option>
                {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
          </div>
        )}

        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onBack} className="btn-secondary flex-1">
            <i className="fa-solid fa-arrow-left" />ย้อนกลับ
          </button>
          <button type="submit" disabled={loading} className="btn-primary flex-1">
            {loading ? <><Spinner />กำลังดำเนินการ...</> : <><i className="fa-solid fa-arrow-right" />ดำเนินการต่อ</>}
          </button>
        </div>
      </form>
    </div>
  );
}

// ─────────────────────────────────────────
// Course Upload Card
// ─────────────────────────────────────────
function CourseCard({ course, cert, teacherId, phone, onUploaded, onDeleted, showToast }: {
  course: typeof COURSES[number];
  cert?: Certificate;
  teacherId: number;
  phone: string;
  onUploaded: (c: Certificate) => void;
  onDeleted: (courseId: number) => void;
  showToast: (msg: string, type: 'success' | 'error' | 'warning' | 'info') => void;
}) {
  const [uploading, setUploading]         = useState(false);
  const [deleting, setDeleting]           = useState(false);
  const [dragOver, setDragOver]           = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deletePhone, setDeletePhone]     = useState('');

  const uploadFile = useCallback(async (file: File) => {
    if (file.type !== 'application/pdf') { showToast('กรุณาอัพโหลดไฟล์ PDF เท่านั้น', 'warning'); return; }
    if (file.size > 15 * 1024 * 1024)   { showToast('ไฟล์ขนาดใหญ่เกิน 15MB', 'warning'); return; }
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('teacher_id', String(teacherId));
      fd.append('course_id',  String(course.id));
      fd.append('phone',      phone);
      fd.append('file',       file);
      const res = await fetch('/api/certificates', { method: 'POST', body: fd });
      const json: ApiResponse<Certificate> = await res.json();
      if (!json.success) { showToast(json.error ?? 'อัพโหลดไม่สำเร็จ', 'error'); return; }
      showToast(`อัพโหลด ${course.name} สำเร็จ!`, 'success');
      onUploaded(json.data!);
    } finally { setUploading(false); }
  }, [course, teacherId, phone, onUploaded, showToast]);

  const handleDelete = async () => {
    if (!/^\d{10}$/.test(deletePhone)) { showToast('กรุณากรอกเบอร์โทร 10 หลัก', 'warning'); return; }
    setDeleting(true);
    try {
      const res = await fetch(`/api/certificates/${cert!.id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: deletePhone, teacher_id: teacherId }),
      });
      const json: ApiResponse = await res.json();
      if (!json.success) { showToast(json.error ?? 'ลบไม่สำเร็จ', 'error'); return; }
      showToast('ลบเกียรติบัตรสำเร็จ', 'success');
      setConfirmDelete(false); setDeletePhone('');
      onDeleted(course.id);
    } finally { setDeleting(false); }
  };

  const fmtSize = (b: number) => b < 1048576 ? `${(b/1024).toFixed(1)} KB` : `${(b/1048576).toFixed(1)} MB`;
  const fmtDate = (d: string) => new Date(d).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: '2-digit', hour: '2-digit', minute: '2-digit' });

  return (
    <div className={`rounded-2xl border-2 transition-all duration-200 overflow-hidden
      ${cert ? 'border-green-200 bg-green-50' : 'border-slate-200 bg-white hover:border-primary-300'}`}>

      <div className={`flex items-center gap-3 px-4 py-3 ${cert ? 'bg-green-100' : 'bg-slate-50'}`}>
        <span className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm flex-shrink-0
          ${cert ? 'bg-green-500 text-white' : 'bg-primary-600 text-white'}`}>
          {cert ? <i className="fa-solid fa-check" /> : course.id}
        </span>
        <div className="min-w-0 flex-1">
          <p className={`font-semibold text-sm truncate ${cert ? 'text-green-800' : 'text-slate-800'}`}>
            {course.fullName}
          </p>
          <p className={`text-xs ${cert ? 'text-green-600' : 'text-slate-500'}`}>
            <i className="fa-regular fa-clock mr-1" />{course.duration} ชั่วโมง
          </p>
        </div>
        {cert && <span className="badge bg-green-200 text-green-800 flex-shrink-0"><i className="fa-solid fa-circle-check" />ส่งแล้ว</span>}
      </div>

      <div className="px-4 py-4">
        {cert ? (
          <div className="space-y-3">
            <div className="flex items-center gap-2.5 p-3 rounded-xl bg-white border border-green-200">
              <i className="fa-solid fa-file-pdf text-red-500 text-xl flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-slate-700 truncate">{cert.file_name}</p>
                <p className="text-xs text-slate-400">{fmtSize(cert.file_size)} · {fmtDate(cert.submitted_at)}</p>
              </div>
            </div>

            {!confirmDelete ? (
              <div className="flex gap-2">
                <a href={`/api/certificates/${cert.id}`} target="_blank" rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-primary-50 hover:bg-primary-100 text-primary-700 text-sm font-medium transition-colors">
                  <i className="fa-solid fa-eye" />ดูไฟล์
                </a>
                <label className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-700 text-sm font-medium transition-colors cursor-pointer">
                  {uploading ? <><Spinner />อัพโหลด...</> : <><i className="fa-solid fa-rotate" />แก้ไข</>}
                  <input type="file" accept=".pdf" className="hidden" disabled={uploading}
                    onChange={(e) => e.target.files?.[0] && uploadFile(e.target.files[0])} />
                </label>
                <button onClick={() => setConfirmDelete(true)} className="btn-danger px-3">
                  <i className="fa-solid fa-trash" />
                </button>
              </div>
            ) : (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 space-y-2 animate-fade-in">
                <p className="text-sm font-semibold text-red-700 flex items-center gap-2">
                  <i className="fa-solid fa-triangle-exclamation" />ยืนยันการลบ
                </p>
                <input type="tel" value={deletePhone}
                  onChange={(e) => setDeletePhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  placeholder="กรอกเบอร์โทรเพื่อยืนยัน"
                  className="input-field text-sm" inputMode="numeric" autoFocus />
                <div className="flex gap-2">
                  <button onClick={() => { setConfirmDelete(false); setDeletePhone(''); }} className="btn-secondary flex-1 text-sm py-2">
                    ยกเลิก
                  </button>
                  <button onClick={handleDelete} disabled={deleting}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-medium transition-colors disabled:opacity-50">
                    {deleting ? <><Spinner />กำลังลบ...</> : <><i className="fa-solid fa-trash" />ยืนยันลบ</>}
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <label
            className={`flex flex-col items-center justify-center gap-2 p-6 rounded-xl border-2 border-dashed cursor-pointer transition-all duration-200
              ${dragOver ? 'drag-over border-primary-400 bg-primary-50' : 'border-slate-300 hover:border-primary-400 hover:bg-primary-50'}`}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files[0]; if (f) uploadFile(f); }}>
            {uploading ? (
              <><i className="fa-solid fa-spinner animate-spin text-3xl text-primary-500" />
              <span className="text-sm font-medium text-primary-600">กำลังอัพโหลด...</span></>
            ) : (
              <><i className="fa-solid fa-cloud-arrow-up text-3xl text-slate-400" />
              <span className="text-sm font-medium text-slate-600">คลิกหรือลากไฟล์มาวาง</span>
              <span className="text-xs text-slate-400">PDF เท่านั้น · สูงสุด 15MB</span></>
            )}
            <input type="file" accept=".pdf" className="hidden" disabled={uploading}
              onChange={(e) => e.target.files?.[0] && uploadFile(e.target.files[0])} />
          </label>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────
// Step 3: Upload
// ─────────────────────────────────────────
function UploadStep({ teacher, phone, initialCerts, onBack, showToast }: {
  teacher: Teacher;
  phone: string;
  initialCerts: Certificate[];
  onBack: () => void;
  showToast: (msg: string, type: 'success' | 'error' | 'warning' | 'info') => void;
}) {
  const [certs, setCerts] = useState<Certificate[]>(initialCerts);
  const submitted = certs.length;
  const pct = Math.round((submitted / TOTAL_COURSES) * 100);

  const handleUploaded = useCallback((cert: Certificate) => {
    setCerts((prev) => [...prev.filter((c) => c.course_id !== cert.course_id), cert]);
  }, []);

  const handleDeleted = useCallback((courseId: number) => {
    setCerts((prev) => prev.filter((c) => c.course_id !== courseId));
  }, []);

  return (
    <div className="animate-fade-in">
      {/* Teacher Banner */}
      <div className="flex items-center gap-3 p-4 rounded-2xl bg-gradient-to-r from-primary-600 to-teal-600 text-white mb-6">
        <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center font-bold text-lg flex-shrink-0">
          {teacher.name.charAt(0)}
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-bold text-lg truncate">{teacher.name}</p>
          <p className="text-sm text-white/80 truncate">
            <i className="fa-solid fa-building-columns mr-1.5" />
            {teacher.department} · {teacher.position}
          </p>
        </div>
        <button onClick={onBack} className="text-white/70 hover:text-white transition-colors flex-shrink-0 p-1" title="ออกจากระบบ">
          <i className="fa-solid fa-right-from-bracket" />
        </button>
      </div>

      {/* Progress */}
      <div className="card mb-6">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="font-bold text-slate-800 flex items-center gap-2">
              <i className="fa-solid fa-chart-line text-primary-600" />ความคืบหน้า
            </p>
            <p className="text-sm text-slate-500 mt-0.5">ส่งแล้ว {submitted} จาก {TOTAL_COURSES} หลักสูตร</p>
          </div>
          <span className={`text-3xl font-bold ${pct === 100 ? 'text-green-600' : 'text-primary-600'}`}>{pct}%</span>
        </div>
        <div className="h-4 bg-slate-100 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-700 ${pct === 100 ? 'bg-gradient-to-r from-green-500 to-teal-500' : 'bg-gradient-to-r from-primary-500 to-teal-500'}`}
            style={{ width: `${pct}%` }}
          />
        </div>
        {pct === 100 && (
          <div className="flex items-center gap-3 mt-3 p-3 rounded-xl bg-green-50 text-green-700 animate-bounce-in">
            <i className="fa-solid fa-trophy text-2xl" />
            <div>
              <p className="font-bold text-sm">ยอดเยี่ยม! ส่งครบทุกหลักสูตรแล้ว</p>
              <p className="text-xs text-green-600">คุณผ่านหลักสูตร Google AI Professional Certificate แล้ว</p>
            </div>
          </div>
        )}
      </div>

      {/* Course Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {COURSES.map((course) => (
          <CourseCard
            key={course.id}
            course={course}
            cert={certs.find((c) => c.course_id === course.id)}
            teacherId={teacher.id}
            phone={phone}
            onUploaded={handleUploaded}
            onDeleted={handleDeleted}
            showToast={showToast}
          />
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────
// Main Page
// ─────────────────────────────────────────
export default function SubmitPage() {
  const { toasts, showToast, removeToast } = useToast();
  const [step, setStep]                   = useState<Step>('search');
  const [selectedTeacher, setSelected]    = useState<TeacherSearchResult | null>(null);
  const [newName, setNewName]             = useState('');
  const [authTeacher, setAuthTeacher]     = useState<Teacher | null>(null);
  const [authPhone, setAuthPhone]         = useState('');
  const [certs, setCerts]                 = useState<Certificate[]>([]);

  const handleSearchSelect = useCallback((t: TeacherSearchResult | null, name: string) => {
    setSelected(t);
    setNewName(name);
    setStep('auth');
  }, []);

  const handleAuthSuccess = useCallback((t: Teacher, c: Certificate[], p: string) => {
    setAuthTeacher(t);
    setCerts(c);
    setAuthPhone(p);
    setStep('upload');
  }, []);

  const handleLogout = useCallback(() => {
    setStep('search');
    setSelected(null);
    setAuthTeacher(null);
    setCerts([]);
    setAuthPhone('');
  }, []);

  return (
    <div className="min-h-screen bg-sky-50">
      <ToastContainer toasts={toasts} onRemove={removeToast} />

      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-3">
            <img src="/logo.png" alt="โรงเรียนจอมทอง" width={52} height={52} className="rounded-full" />
            <div className="text-left">
              <p className="font-bold text-slate-800">ระบบส่งเกียรติบัตร Google AI Professional Certificate 2569</p>
              <p className="text-xs text-slate-500">โรงเรียนจอมทอง</p>
            </div>
          </div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center justify-center gap-2">
            <i className="fa-solid fa-file-arrow-up text-primary-600" />ส่งเกียรติบัตร
          </h1>
        </div>

        <div className="card">
          <StepIndicator step={step} />

          {step === 'search' && <SearchStep onSelect={handleSearchSelect} />}

          {step === 'auth' && (
            <AuthStep
              teacher={selectedTeacher}
              newName={newName}
              onSuccess={handleAuthSuccess}
              onBack={() => setStep('search')}
              showToast={showToast}
            />
          )}

          {step === 'upload' && authTeacher && (
            <UploadStep
              teacher={authTeacher}
              phone={authPhone}
              initialCerts={certs}
              onBack={handleLogout}
              showToast={showToast}
            />
          )}
        </div>
      </main>
    </div>
  );
}
