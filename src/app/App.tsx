import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Header } from './components/Header';
import { Home } from './components/Home';
import { Planejamento } from './components/Planejamento';
import { Checkout } from './components/Checkout';
import { Suporte } from './components/Suporte';

export default function App() {
  return (
    <BrowserRouter>
      <div className="h-screen flex flex-col overflow-hidden bg-[#FDFBF7]">
        <Header />
        <main className="flex-1 overflow-hidden">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/planejamento" element={<Planejamento />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/suporte" element={<Suporte />} />
        </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}