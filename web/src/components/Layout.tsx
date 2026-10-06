import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { FolderKanban, LayoutDashboard, LogOut, Target } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { cx } from './ui';

const links = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/projects', label: 'Projects', icon: FolderKanban },
];

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate('/login');
  }

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-20 border-b border-white/70 bg-cream/70 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
          <Link to="/dashboard" className="flex items-center gap-2">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-600 text-white shadow-lg shadow-brand-600/30">
              <Target className="h-5 w-5" />
            </span>
            <span className="hidden font-display text-xl font-semibold sm:block">FocusBoard</span>
          </Link>

          <nav className="flex items-center gap-1 rounded-full bg-white/80 p-1 shadow-sm ring-1 ring-black/5">
            {links.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  cx(
                    'flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition',
                    isActive ? 'bg-brand-600 text-white shadow' : 'text-ink/65 hover:text-ink',
                  )
                }
              >
                <Icon className="h-4 w-4" />
                <span className="hidden sm:inline">{label}</span>
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <div
              className="grid h-9 w-9 place-items-center rounded-full bg-coral-100 text-sm font-bold text-coral-500"
              title={user?.email}
            >
              {user?.fullName.charAt(0).toUpperCase()}
            </div>
            <button
              onClick={handleLogout}
              className="grid h-9 w-9 place-items-center rounded-full text-ink/60 transition hover:bg-black/5"
              aria-label="Log out"
              title="Log out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <Outlet />
      </main>
    </div>
  );
}
