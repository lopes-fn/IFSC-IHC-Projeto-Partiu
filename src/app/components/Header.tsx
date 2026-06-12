import { LogOut, User, Menu, X } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import type { StoredUser } from './Auth';

const STORAGE_KEY = 'partiu-trip-plan';

export function Header({ user, onLogout }: { user: StoredUser | null; onLogout: () => void }) {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [hasTripPlan, setHasTripPlan] = useState(false);

  useEffect(() => {
    try {
      setHasTripPlan(Boolean(localStorage.getItem(STORAGE_KEY)));
    } catch {
      setHasTripPlan(false);
    }
  }, [location.pathname]);

  const menuItems = [
    { name: 'Home', path: '/' },
    { name: 'Planejamento', path: '/planejamento' },
    ...(user && hasTripPlan ? [{ name: 'Checkout', path: '/checkout' }] : []),
    ...(user ? [{ name: 'Suporte', path: '/suporte' }] : []),
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-md">
      <div className="container mx-auto px-4 sm:px-6 py-3 sm:py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-[#5A67D8]">Partiu?</h1>
          </div>

          {/* Menu Central — desktop */}
          <nav className="hidden md:flex items-center gap-2 rounded-[20px] bg-white px-4 lg:px-6 py-2 shadow-sm border border-gray-100">
            {menuItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`px-3 lg:px-4 py-2 rounded-[14px] transition-all text-sm lg:text-base ${
                  location.pathname === item.path
                    ? 'bg-[#5A67D8] text-white'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Perfil + botão mobile */}
          <div className="flex items-center gap-2 sm:gap-4">
            <div className="relative hidden sm:block">
              {user ? (
                <>
                  <button
                    onClick={() => setUserMenuOpen((value) => !value)}
                    className="flex items-center gap-2 rounded-[16px] bg-gray-50 px-3 py-2 hover:bg-gray-100 transition-colors"
                    aria-expanded={userMenuOpen}
                    aria-label="Opções da conta"
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#5A67D8] text-white">
                      <User className="h-4 w-4" />
                    </div>
                    <span className="text-sm font-medium hidden lg:inline text-gray-700">{user.name}</span>
                  </button>
                  {userMenuOpen && (
                    <div className="absolute right-0 mt-2 w-44 rounded-[12px] border border-gray-100 bg-white p-1.5 shadow-lg">
                      <button
                        onClick={() => {
                          onLogout();
                          setUserMenuOpen(false);
                        }}
                        className="flex w-full items-center gap-2 rounded-[10px] px-3 py-2 text-left text-sm font-medium text-gray-700 hover:bg-gray-50"
                      >
                        <LogOut className="h-4 w-4 text-[#DD6B20]" />
                        Logout
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <Link to="/login" state={{ from: location.pathname }} className="flex items-center gap-2 rounded-[16px] bg-gray-50 px-3 py-2 hover:bg-gray-100 transition-colors">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#5A67D8] text-white">
                    <User className="h-4 w-4" />
                  </div>
                  <span className="text-sm font-medium hidden lg:inline text-gray-700">Fazer login</span>
                </Link>
              )}
            </div>
            <button
              className="md:hidden rounded-full p-2 hover:bg-gray-50"
              onClick={() => setMobileOpen((v) => !v)}
              aria-label="Menu"
            >
              {mobileOpen ? <X className="h-5 w-5 text-gray-700" /> : <Menu className="h-5 w-5 text-gray-700" />}
            </button>
          </div>
        </div>

        {/* Menu mobile */}
        {mobileOpen && (
          <nav className="md:hidden mt-3 pb-2 flex flex-col gap-1">
            {menuItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileOpen(false)}
                className={`px-4 py-3 rounded-[14px] transition-all text-sm font-medium ${
                  location.pathname === item.path
                    ? 'bg-[#5A67D8] text-white'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                {item.name}
              </Link>
            ))}
            {user ? (
              <button
                onClick={() => {
                  onLogout();
                  setMobileOpen(false);
                }}
                className="flex items-center gap-2 px-4 py-3 rounded-[14px] transition-all text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                <LogOut className="h-4 w-4 text-[#DD6B20]" />
                Logout
              </button>
            ) : (
              <Link
                to="/login"
                state={{ from: location.pathname }}
                onClick={() => setMobileOpen(false)}
                className="px-4 py-3 rounded-[14px] transition-all text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Fazer login
              </Link>
            )}
          </nav>
        )}
      </div>
    </header>
  );
}
