import { NavLink, Outlet } from 'react-router-dom';

const navClass = ({ isActive }: { isActive: boolean }) =>
  [
    'block border-l-2 py-2 pl-4 pr-3 text-sm transition-colors',
    isActive
      ? 'border-[var(--color-accent-soft)] bg-white/8 font-medium text-white'
      : 'border-transparent text-[var(--color-sidebar-muted)] hover:border-white/20 hover:text-white/90',
  ].join(' ');

export function AppLayout() {
  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[15rem_1fr]">
      <aside className="border-b border-[var(--color-line)] bg-[var(--color-sidebar)] text-white lg:border-b-0 lg:border-r">
        <div className="px-5 py-6">
          <p className="font-mono text-[0.65rem] tracking-[0.2em] text-[var(--color-sidebar-muted)] uppercase">
            Desk / MCP
          </p>
          <h1 className="mt-2 text-lg font-semibold tracking-tight">Support queue</h1>
        </div>
        <nav className="flex gap-1 px-3 pb-5 lg:flex-col lg:px-0">
          <NavLink to="/" end className={navClass}>
            Tickets
          </NavLink>
          <NavLink to="/activity" className={navClass}>
            Tool log
          </NavLink>
        </nav>
      </aside>

      <div className="min-w-0">
        <main className="mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
