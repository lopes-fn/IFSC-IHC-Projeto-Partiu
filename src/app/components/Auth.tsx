import { FormEvent, useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, Lock, Mail, User } from 'lucide-react';

export interface StoredUser {
  name: string;
  email: string;
  password: string;
}

const USERS_KEY = 'partiu-users';
const CURRENT_USER_KEY = 'partiu-current-user';

function getUsers(): StoredUser[] {
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY) || '[]') as StoredUser[];
  } catch {
    localStorage.removeItem(USERS_KEY);
    return [];
  }
}

function saveUsers(users: StoredUser[]) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export function getStoredUser() {
  const currentEmail = localStorage.getItem(CURRENT_USER_KEY);
  if (!currentEmail) return null;

  return getUsers().find((user) => user.email === currentEmail) || null;
}

function getReturnPath(state: unknown) {
  if (state && typeof state === 'object' && 'from' in state && typeof state.from === 'string') {
    return state.from;
  }

  return '/';
}

function AuthShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div className="h-full overflow-y-auto">
      <div className="container mx-auto flex min-h-full max-w-5xl items-center justify-center px-4 py-8 sm:px-6">
        <div className="grid w-full max-w-4xl overflow-hidden rounded-[18px] border border-gray-100 bg-white shadow-sm md:grid-cols-[1fr_1.15fr]">
          <div className="hidden bg-[#5A67D8] p-8 text-white md:flex md:flex-col md:justify-between">
            <Link to="/" className="inline-flex w-fit items-center gap-2 text-sm font-semibold text-white/90 hover:text-white">
              <ArrowLeft className="h-4 w-4" />
              Partiu?
            </Link>
            <div>
              <p className="text-sm font-medium text-white/75">Sua viagem em um só lugar</p>
              <h1 className="mt-3 text-3xl font-bold leading-tight">Entre para continuar planejando com mais praticidade.</h1>
            </div>
          </div>

          <div className="p-5 sm:p-8">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
              <p className="mt-2 text-sm text-gray-500">{subtitle}</p>
            </div>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

export function Login({ onAuth }: { onAuth: (user: StoredUser) => void }) {
  const navigate = useNavigate();
  const location = useLocation();
  const returnPath = getReturnPath(location.state);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (getUsers().length === 0) {
      navigate('/cadastro', { replace: true, state: { from: returnPath } });
    }
  }, [navigate, returnPath]);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    const cleanEmail = normalizeEmail(email);
    const user = getUsers().find((item) => item.email === cleanEmail);

    if (!user) {
      navigate('/cadastro', { state: { from: returnPath, email: cleanEmail } });
      return;
    }

    if (user.password !== password) {
      setError('Senha incorreta. Verifique os dados e tente novamente.');
      return;
    }

    localStorage.setItem(CURRENT_USER_KEY, user.email);
    onAuth(user);
    navigate(returnPath, { replace: true });
  };

  return (
    <AuthShell title="Entrar" subtitle="Use seu e-mail e senha cadastrados para acessar o Partiu.">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-gray-700">E-mail</label>
          <div className="flex items-center gap-2 rounded-[12px] border border-gray-200 bg-white px-3 py-2.5 focus-within:ring-2 focus-within:ring-[#5A67D8]">
            <Mail className="h-4 w-4 text-gray-400" />
            <input value={email} onChange={(event) => setEmail(event.target.value)} type="email" required className="w-full bg-transparent text-sm outline-none" placeholder="voce@email.com" />
          </div>
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-gray-700">Senha</label>
          <div className="flex items-center gap-2 rounded-[12px] border border-gray-200 bg-white px-3 py-2.5 focus-within:ring-2 focus-within:ring-[#5A67D8]">
            <Lock className="h-4 w-4 text-gray-400" />
            <input value={password} onChange={(event) => setPassword(event.target.value)} type="password" required className="w-full bg-transparent text-sm outline-none" placeholder="Sua senha" />
          </div>
        </div>

        {error && <p className="rounded-[10px] bg-red-50 px-3 py-2 text-xs font-medium text-red-600">{error}</p>}

        <button type="submit" className="w-full rounded-[12px] bg-[#5A67D8] px-4 py-3 text-sm font-semibold text-white hover:bg-[#4C5BC7]">
          Entrar
        </button>
        <Link to="/cadastro" state={{ from: returnPath, email }} className="block text-center text-sm font-semibold text-[#5A67D8] hover:text-[#4C5BC7]">
          Criar cadastro
        </Link>
      </form>
    </AuthShell>
  );
}

export function Cadastro({ onAuth }: { onAuth: (user: StoredUser) => void }) {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as { from?: string; email?: string } | null;
  const returnPath = getReturnPath(location.state);
  const [name, setName] = useState('');
  const [email, setEmail] = useState(state?.email || '');
  const [password, setPassword] = useState('');

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    const user = {
      name: name.trim(),
      email: normalizeEmail(email),
      password,
    };
    const users = getUsers().filter((item) => item.email !== user.email);

    saveUsers([...users, user]);
    localStorage.setItem(CURRENT_USER_KEY, user.email);
    onAuth(user);
    navigate(returnPath, { replace: true });
  };

  return (
    <AuthShell title="Cadastro" subtitle="Preencha seus dados para salvar seu acesso neste navegador.">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-gray-700">Nome</label>
          <div className="flex items-center gap-2 rounded-[12px] border border-gray-200 bg-white px-3 py-2.5 focus-within:ring-2 focus-within:ring-[#5A67D8]">
            <User className="h-4 w-4 text-gray-400" />
            <input value={name} onChange={(event) => setName(event.target.value)} required className="w-full bg-transparent text-sm outline-none" placeholder="Seu nome" />
          </div>
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-gray-700">E-mail</label>
          <div className="flex items-center gap-2 rounded-[12px] border border-gray-200 bg-white px-3 py-2.5 focus-within:ring-2 focus-within:ring-[#5A67D8]">
            <Mail className="h-4 w-4 text-gray-400" />
            <input value={email} onChange={(event) => setEmail(event.target.value)} type="email" required className="w-full bg-transparent text-sm outline-none" placeholder="voce@email.com" />
          </div>
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-gray-700">Senha</label>
          <div className="flex items-center gap-2 rounded-[12px] border border-gray-200 bg-white px-3 py-2.5 focus-within:ring-2 focus-within:ring-[#5A67D8]">
            <Lock className="h-4 w-4 text-gray-400" />
            <input value={password} onChange={(event) => setPassword(event.target.value)} type="password" required minLength={3} className="w-full bg-transparent text-sm outline-none" placeholder="Crie uma senha" />
          </div>
        </div>

        <button type="submit" className="w-full rounded-[12px] bg-[#5A67D8] px-4 py-3 text-sm font-semibold text-white hover:bg-[#4C5BC7]">
          Salvar cadastro
        </button>
        <Link to="/login" state={{ from: returnPath }} className="block text-center text-sm font-semibold text-[#5A67D8] hover:text-[#4C5BC7]">
          Já tenho cadastro
        </Link>
      </form>
    </AuthShell>
  );
}
