import { NavLink, Outlet } from 'react-router-dom';
import { WorkspaceProvider } from '../context/WorkspaceContext.js';
import { CommandPalette } from './CommandPalette.js';
import { WorkspaceStatusAnnouncer } from './WorkspaceStatusAnnouncer.js';

const navClass = ({ isActive }: { isActive: boolean }) =>
  [
    'block border-l-2 py-2 pl-4 pr-3 text-sm transition-colors',
    isActive
      ? 'border-[var(--color-accent-soft)] bg-white/8 font-medium text-white'
      : 'border-transparent text-[var(--color-sidebar-muted)] hover:border-white/20 hover:text-white/90',
  ].join(' ');

export function AppLayout() {
  return (
    <WorkspaceProvider>
      <div className="min-h-screen lg:grid lg:grid-cols-[12.5rem_1fr]">
        <aside className="border-b border-[var(--color-line)] bg-[var(--color-sidebar)] text-white lg:border-b-0 lg:border-r">
          <div className="px-4 py-5">
            <p className="font-mono text-[0.65rem] tracking-[0.2em] text-[var(--color-sidebar-muted)] uppercase">
              Desk / MCP
            </p>
            <h1 className="mt-2 text-base font-semibold tracking-tight">Support queue</h1>
            <p className="mt-3 text-[0.7rem] text-[var(--color-sidebar-muted)]">
              <kbd className="rounded border border-white/15 px-1 py-0.5 font-mono text-[0.65rem]">
                ⌘K
              </kbd>{' '}
              Search
            </p>
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
          <main className="px-4 py-5 sm:px-6 sm:py-6">
            <Outlet />
          </main>
        </div>
      </div>
      <CommandPalette />
      <WorkspaceStatusAnnouncer />
    </WorkspaceProvider>
  );
}
