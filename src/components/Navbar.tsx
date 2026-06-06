import Image from 'next/image';
import Link from 'next/link';

export default function Navbar() {
  return (
    <header className="bg-white border-b border-slate-100 shadow-sm sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">

          {/* Logo + Title */}
          <Link href="/" className="flex items-center gap-3 min-w-0">
            <Image
              src="/logo.png"
              alt="โรงเรียนจอมทอง"
              width={44}
              height={44}
              className="rounded-full object-contain"
              priority
            />
            <div className="min-w-0 hidden sm:block">
              <p className="text-sm font-bold text-slate-800 leading-tight truncate">ระบบส่งเกียรติบัตร Google AI Professional Certificate 2569</p>
              <p className="text-xs text-slate-500 leading-tight truncate">โรงเรียนจอมทอง</p>
            </div>
          </Link>

          {/* Navigation */}
          <nav className="flex items-center gap-1.5">
            {/* Capsule nav */}
            <div className="flex items-center gap-1 bg-slate-100 rounded-full p-1">
              <Link href="/"
                className="flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium text-slate-600 hover:bg-white hover:text-slate-800 transition-all duration-200">
                <i className="fa-solid fa-chart-pie text-xs" />
                <span className="hidden sm:inline">แดชบอร์ด</span>
              </Link>
              <Link href="/submit"
                className="flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium bg-primary-600 text-white shadow-sm hover:bg-primary-700 transition-all duration-200">
                <i className="fa-solid fa-file-arrow-up text-xs" />
                <span>ส่งเกียรติบัตร</span>
              </Link>
            </div>

            {/* Admin button */}
            <Link href="/admin"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-all duration-200 ml-1"
              title="ผู้ดูแลระบบ">
              <i className="fa-solid fa-gear text-xs" />
              <span className="hidden sm:inline">Admin</span>
            </Link>
          </nav>

        </div>
      </div>
    </header>
  );
}
