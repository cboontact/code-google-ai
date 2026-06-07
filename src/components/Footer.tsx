export default function Footer() {
  return (
    <footer className="relative z-10 py-4 mt-auto bg-sky-50">
      <div className="max-w-screen-xl mx-auto px-4 text-center">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 mb-2">
          <span className="text-sm text-slate-600 flex items-center gap-2">
            <i className="fas fa-bolt text-blue-500"></i>
            <span className="font-semibold text-slate-800">Chonnatee Boonta</span>
          </span>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-3">
              <span className="relative group inline-flex">
                <svg className="w-4 h-4" viewBox="0 0 128 128" aria-label="Next.js">
                  <circle cx="64" cy="64" r="64" fill="#000" />
                  <path d="M106.2 112.1L49.1 38H38v52h8.9V49.3l52.2 67.4c2.7-1.3 5.1-2.8 7.1-4.6z" fill="#fff" />
                  <path d="M80.9 38h9v52h-9z" fill="#fff" />
                </svg>
                <span className="pointer-events-none absolute left-1/2 -translate-x-1/2 bottom-full mb-2 whitespace-nowrap rounded-md bg-slate-800 text-white text-[10px] px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity">Next.js</span>
              </span>
              <span className="relative group inline-flex">
                <i className="fab fa-react text-sky-500 text-base" aria-label="React"></i>
                <span className="pointer-events-none absolute left-1/2 -translate-x-1/2 bottom-full mb-2 whitespace-nowrap rounded-md bg-slate-800 text-white text-[10px] px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity">React</span>
              </span>
              <span className="relative group inline-flex">
                <svg className="h-4 w-4" viewBox="0 0 54 33" aria-label="Tailwind CSS">
                  <path fill="#38bdf8" d="M27 0C19.8 0 15.3 3.6 13.5 10.8c2.7-3.6 5.85-4.95 9.45-4.05 2.05.51 3.52 2 5.14 3.65C30.72 13.07 33.76 16.2 40.5 16.2c7.2 0 11.7-3.6 13.5-10.8-2.7 3.6-5.85 4.95-9.45 4.05-2.05-.51-3.52-2-5.14-3.65C36.78 3.13 33.74 0 27 0ZM13.5 16.2C6.3 16.2 1.8 19.8 0 27c2.7-3.6 5.85-4.95 9.45-4.05 2.05.51 3.52 2 5.14 3.65C17.22 29.27 20.26 32.4 27 32.4c7.2 0 11.7-3.6 13.5-10.8-2.7 3.6-5.85 4.95-9.45 4.05-2.05-.51-3.52-2-5.14-3.65-2.63-2.67-5.67-5.8-12.41-5.8Z" />
                </svg>
                <span className="pointer-events-none absolute left-1/2 -translate-x-1/2 bottom-full mb-2 whitespace-nowrap rounded-md bg-slate-800 text-white text-[10px] px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity">Tailwind CSS</span>
              </span>
              <span className="relative group inline-flex">
                <i className="fas fa-database text-cyan-700 text-base" aria-label="MariaDB"></i>
                <span className="pointer-events-none absolute left-1/2 -translate-x-1/2 bottom-full mb-2 whitespace-nowrap rounded-md bg-slate-800 text-white text-[10px] px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity">MariaDB</span>
              </span>
              <span className="relative group inline-flex">
                <i className="fas fa-server text-slate-700 text-base" aria-label="Hostatom"></i>
                <span className="pointer-events-none absolute left-1/2 -translate-x-1/2 bottom-full mb-2 whitespace-nowrap rounded-md bg-slate-800 text-white text-[10px] px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity">Hostatom</span>
              </span>
            </div>
          </div>
        </div>
        <div className="text-xs text-slate-400">© 2025 สงวนลิขสิทธิ์</div>
      </div>
    </footer>
  );
}
