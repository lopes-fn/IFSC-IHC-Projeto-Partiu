import { Bell, User, Menu, X } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useState } from 'react';

export function Header() {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const menuItems = [
    { name: 'Home', path: '/' },
    { name: 'Planejamento', path: '/planejamento' },
    { name: 'Checkout', path: '/checkout' },
    { name: 'Suporte', path: '/suporte' },
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
            <button className="relative rounded-full p-2 hover:bg-gray-50">
              <Bell className="h-5 w-5 text-gray-600" />
              <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-[#DD6B20]"></span>
            </button>
            <button className="hidden sm:flex items-center gap-2 rounded-[16px] bg-gray-50 px-3 py-2 hover:bg-gray-100 transition-colors">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#5A67D8] text-white">
                <User className="h-4 w-4" />
              </div>
              <span className="text-sm font-medium hidden lg:inline text-gray-700">Fazer login</span>
            </button>
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
          </nav>
        )}
      </div>
    </header>
  );
}
