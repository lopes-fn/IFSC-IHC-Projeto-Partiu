import { HashRouter, Navigate, Routes, Route } from 'react-router-dom';
import { Header } from './components/Header';
import { Home } from './components/Home';
import { Planejamento } from './components/Planejamento';
import { Checkout } from './components/Checkout';
import { Suporte } from './components/Suporte';
import { Login, Cadastro, clearStoredUser, getStoredUser, type StoredUser } from './components/Auth';
import { useState } from 'react';

export default function App() {
  const [user, setUser] = useState<StoredUser | null>(() => getStoredUser());
  const handleLogout = () => {
    clearStoredUser();
    setUser(null);
  };

  return (
    <HashRouter>
      <div className="h-screen flex flex-col overflow-hidden bg-[#FDFBF7]">
        <Header user={user} onLogout={handleLogout} />
        <main className="flex-1 overflow-hidden">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/planejamento" element={<Planejamento />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/suporte" element={user ? <Suporte /> : <Navigate to="/login" state={{ from: '/suporte' }} replace />} />
          <Route path="/login" element={<Login onAuth={setUser} />} />
          <Route path="/cadastro" element={<Cadastro onAuth={setUser} />} />
        </Routes>
        </main>
      </div>
    </HashRouter>
  );
}
