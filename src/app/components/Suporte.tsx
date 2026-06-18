import {
  AlertCircle,
  BarChart3,
  CheckCircle2,
  Copy,
  HelpCircle,
  LayoutDashboard,
  MessageCircle,
  MessageSquare,
  Send,
  Ticket,
  Upload,
} from 'lucide-react';
import { FormEvent, useMemo, useState } from 'react';

interface SupportTicket {
  id: string;
  subject: string;
  category: string;
  description: string;
  attachmentName?: string;
  status: 'Aberto' | 'Em análise' | 'Resolvido';
  createdAt: string;
}

interface TicketForm {
  subject: string;
  category: string;
  description: string;
  attachmentName: string;
}

interface FeedbackForm {
  rating: string;
  message: string;
}

type TicketErrors = Partial<Record<keyof TicketForm, string>>;
type FeedbackErrors = Partial<Record<keyof FeedbackForm, string>>;

const SUPPORT_EMAIL = 'suporte@partiu.viagem.com';
const TICKETS_KEY = 'partiu-support-tickets';

const initialTicketForm: TicketForm = {
  subject: '',
  category: '',
  description: '',
  attachmentName: '',
};

const initialFeedbackForm: FeedbackForm = {
  rating: '',
  message: '',
};

function loadTickets() {
  try {
    return JSON.parse(localStorage.getItem(TICKETS_KEY) || '[]') as SupportTicket[];
  } catch {
    localStorage.removeItem(TICKETS_KEY);
    return [];
  }
}

function saveTickets(tickets: SupportTicket[]) {
  localStorage.setItem(TICKETS_KEY, JSON.stringify(tickets));
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function validateTicket(form: TicketForm) {
  const errors: TicketErrors = {};

  if (form.subject.trim().length < 5) errors.subject = 'Informe um assunto com pelo menos 5 caracteres.';
  if (!form.category) errors.category = 'Selecione uma categoria.';
  if (form.description.trim().length < 15) errors.description = 'Descreva o problema com pelo menos 15 caracteres.';

  return errors;
}

function validateFeedback(form: FeedbackForm) {
  const errors: FeedbackErrors = {};

  if (!form.rating) errors.rating = 'Selecione uma avaliação.';
  if (form.message.trim().length < 8) errors.message = 'Escreva um comentário um pouco mais completo.';

  return errors;
}

export function Suporte() {
  const [activeTab, setActiveTab] = useState('suporte');
  const [tickets, setTickets] = useState<SupportTicket[]>(() => loadTickets());
  const [ticketForm, setTicketForm] = useState<TicketForm>(initialTicketForm);
  const [ticketErrors, setTicketErrors] = useState<TicketErrors>({});
  const [feedbackForm, setFeedbackForm] = useState<FeedbackForm>(initialFeedbackForm);
  const [feedbackErrors, setFeedbackErrors] = useState<FeedbackErrors>({});
  const [successMessage, setSuccessMessage] = useState('');
  const [copiedEmail, setCopiedEmail] = useState(false);

  const tabs = [
    { id: 'dashboard', name: 'Dashboard', icon: LayoutDashboard },
    { id: 'suporte', name: 'Suporte', icon: MessageCircle },
    { id: 'feedback', name: 'Feedback', icon: MessageSquare },
    { id: 'tickets', name: 'Tickets', icon: Ticket },
  ];

  const faqItems = [
    { title: 'Como alterar minha reserva?', category: 'Problemas com reserva' },
    { title: 'Política de cancelamento', category: 'Cancelamento' },
    { title: 'Reembolso e estorno', category: 'Pagamento' },
    { title: 'Problemas com pagamento', category: 'Pagamento' },
  ];

  const ticketStats = useMemo(() => {
    const open = tickets.filter((ticket) => ticket.status === 'Aberto').length;
    const reviewing = tickets.filter((ticket) => ticket.status === 'Em análise').length;
    const resolved = tickets.filter((ticket) => ticket.status === 'Resolvido').length;

    return { open, reviewing, resolved, total: tickets.length };
  }, [tickets]);

  const updateTicketForm = (field: keyof TicketForm, value: string) => {
    setTicketForm((current) => ({ ...current, [field]: value }));
    setTicketErrors((current) => ({ ...current, [field]: undefined }));
    setSuccessMessage('');
  };

  const updateFeedbackForm = (field: keyof FeedbackForm, value: string) => {
    setFeedbackForm((current) => ({ ...current, [field]: value }));
    setFeedbackErrors((current) => ({ ...current, [field]: undefined }));
    setSuccessMessage('');
  };

  const handleTicketSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const errors = validateTicket(ticketForm);
    setTicketErrors(errors);
    if (Object.keys(errors).length > 0) return;

    const newTicket: SupportTicket = {
      id: `CH-${String(Date.now()).slice(-6)}`,
      subject: ticketForm.subject.trim(),
      category: ticketForm.category,
      description: ticketForm.description.trim(),
      attachmentName: ticketForm.attachmentName || undefined,
      status: 'Aberto',
      createdAt: new Date().toISOString(),
    };
    const nextTickets = [newTicket, ...tickets];
    setTickets(nextTickets);
    saveTickets(nextTickets);
    setTicketForm(initialTicketForm);
    setSuccessMessage(`Chamado ${newTicket.id} aberto com sucesso.`);
    setActiveTab('tickets');
  };

  const handleFeedbackSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const errors = validateFeedback(feedbackForm);
    setFeedbackErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setFeedbackForm(initialFeedbackForm);
    setSuccessMessage('Feedback enviado. Obrigado por ajudar a melhorar o Partiu.');
  };

  const updateTicketStatus = (id: string, status: SupportTicket['status']) => {
    const nextTickets = tickets.map((ticket) => (ticket.id === id ? { ...ticket, status } : ticket));
    setTickets(nextTickets);
    saveTickets(nextTickets);
  };

  const copyEmail = async () => {
    await navigator.clipboard.writeText(SUPPORT_EMAIL);
    setCopiedEmail(true);
    window.setTimeout(() => setCopiedEmail(false), 1600);
  };

  const selectFaq = (item: (typeof faqItems)[number]) => {
    setTicketForm((current) => ({ ...current, subject: item.title, category: item.category }));
    setActiveTab('suporte');
    setSuccessMessage('');
  };

  const renderMainContent = () => {
    if (activeTab === 'dashboard') {
      return (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Chamados', value: ticketStats.total },
              { label: 'Abertos', value: ticketStats.open },
              { label: 'Em análise', value: ticketStats.reviewing },
              { label: 'Resolvidos', value: ticketStats.resolved },
            ].map((stat) => (
              <div key={stat.label} className="rounded-[14px] bg-white border border-gray-100 p-4 shadow-sm">
                <p className="text-xs font-medium text-gray-500">{stat.label}</p>
                <p className="mt-2 text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
            ))}
          </div>
          <div className="rounded-[16px] bg-white border border-gray-100 p-4 shadow-sm">
            <div className="mb-3 flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-[#5A67D8]" />
              <h3 className="font-semibold text-gray-900 text-sm">Atividade recente</h3>
            </div>
            {tickets.length ? (
              <div className="space-y-2">
                {tickets.slice(0, 4).map((ticket) => (
                  <div key={ticket.id} className="rounded-[12px] bg-gray-50 border border-gray-100 px-3 py-2">
                    <div className="flex items-center justify-between gap-2">
                      <p className="line-clamp-2 text-sm font-semibold text-gray-900 sm:truncate">{ticket.subject}</p>
                      <span className="shrink-0 text-xs text-gray-500">{ticket.status}</span>
                    </div>
                    <p className="mt-1 text-xs text-gray-500">{ticket.id} - {formatDate(ticket.createdAt)}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">Nenhum chamado aberto ainda.</p>
            )}
          </div>
        </div>
      );
    }

    if (activeTab === 'feedback') {
      return (
        <div className="rounded-[16px] bg-white border border-gray-100 p-4 shadow-sm">
          <h3 className="font-semibold text-gray-900 text-sm mb-4">Enviar feedback</h3>
          <form onSubmit={handleFeedbackSubmit} className="space-y-3" noValidate>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-700">Avaliação</label>
              <select value={feedbackForm.rating} onChange={(event) => updateFeedbackForm('rating', event.target.value)} className={`w-full rounded-[12px] border bg-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#5A67D8] ${feedbackErrors.rating ? 'border-red-300' : 'border-gray-200'}`}>
                <option value="">Selecione uma nota</option>
                <option value="5">5 - Excelente</option>
                <option value="4">4 - Bom</option>
                <option value="3">3 - Regular</option>
                <option value="2">2 - Ruim</option>
                <option value="1">1 - Muito ruim</option>
              </select>
              {feedbackErrors.rating && <p className="mt-1 text-xs font-medium text-red-600">{feedbackErrors.rating}</p>}
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-700">Comentário</label>
              <textarea value={feedbackForm.message} onChange={(event) => updateFeedbackForm('message', event.target.value)} rows={5} placeholder="Conte o que funcionou bem ou o que poderia melhorar." className={`w-full rounded-[12px] border bg-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#5A67D8] resize-none ${feedbackErrors.message ? 'border-red-300' : 'border-gray-200'}`} />
              {feedbackErrors.message && <p className="mt-1 text-xs font-medium text-red-600">{feedbackErrors.message}</p>}
            </div>
            <button type="submit" className="flex w-full items-center justify-center gap-2 rounded-[12px] bg-[#5A67D8] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#4C5BC7]">
              <Send className="h-4 w-4" />
              Enviar feedback
            </button>
          </form>
        </div>
      );
    }

    if (activeTab === 'tickets') {
      return (
        <div className="space-y-3">
          {successMessage && (
            <div className="flex items-center gap-2 rounded-[12px] bg-green-50 border border-green-100 px-3 py-2 text-sm font-medium text-green-700">
              <CheckCircle2 className="h-4 w-4" />
              {successMessage}
            </div>
          )}
          {tickets.length ? (
            tickets.map((ticket) => (
              <div key={ticket.id} className="rounded-[16px] bg-white border border-gray-100 p-4 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-[#5A67D8]">{ticket.id}</p>
                    <h3 className="mt-1 line-clamp-2 text-sm font-semibold text-gray-900 sm:truncate">{ticket.subject}</h3>
                    <p className="mt-1 text-xs text-gray-500">{ticket.category} - {formatDate(ticket.createdAt)}</p>
                  </div>
                  <select value={ticket.status} onChange={(event) => updateTicketStatus(ticket.id, event.target.value as SupportTicket['status'])} className="rounded-[10px] border border-gray-200 bg-white px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-[#5A67D8]">
                    <option>Aberto</option>
                    <option>Em análise</option>
                    <option>Resolvido</option>
                  </select>
                </div>
                <p className="mt-3 text-sm text-gray-700">{ticket.description}</p>
                {ticket.attachmentName && <p className="mt-2 text-xs text-gray-500">Anexo: {ticket.attachmentName}</p>}
              </div>
            ))
          ) : (
            <div className="rounded-[16px] bg-white border border-gray-100 p-6 text-center shadow-sm">
              <Ticket className="mx-auto h-7 w-7 text-[#5A67D8]" />
              <p className="mt-3 text-sm font-semibold text-gray-900">Nenhum ticket encontrado</p>
              <button onClick={() => setActiveTab('suporte')} className="mt-3 rounded-[12px] bg-[#5A67D8] px-4 py-2 text-sm font-semibold text-white hover:bg-[#4C5BC7]">
                Abrir chamado
              </button>
            </div>
          )}
        </div>
      );
    }

    return (
      <div className="space-y-3">
        {successMessage && (
          <div className="flex items-center gap-2 rounded-[12px] bg-green-50 border border-green-100 px-3 py-2 text-sm font-medium text-green-700">
            <CheckCircle2 className="h-4 w-4" />
            {successMessage}
          </div>
        )}
        <div className="rounded-[16px] bg-white border border-gray-100 p-4 shadow-sm">
          <h3 className="font-semibold text-gray-900 text-sm mb-2">Abrir chamado a partir do e-mail</h3>
          <p className="text-xs text-gray-600 mb-3">Envie sua solicitação diretamente para:</p>
          <div className="flex items-center gap-2 rounded-[12px] bg-gray-50 border border-gray-200 px-3 py-2.5">
            <code className="flex-1 text-xs font-mono text-[#5A67D8]">{SUPPORT_EMAIL}</code>
            <button onClick={copyEmail} className="rounded-[8px] bg-[#5A67D8] p-1.5 text-white hover:bg-[#4C5BC7]" aria-label="Copiar e-mail">
              <Copy className="h-3.5 w-3.5" />
            </button>
          </div>
          {copiedEmail && <p className="mt-2 text-xs font-medium text-green-600">E-mail copiado.</p>}
        </div>

        <div className="rounded-[16px] bg-white border border-gray-100 p-4 shadow-sm">
          <h3 className="font-semibold text-gray-900 text-sm mb-4">Abrir novo chamado</h3>
          <form onSubmit={handleTicketSubmit} className="space-y-3" noValidate>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-700">Assunto</label>
              <input value={ticketForm.subject} onChange={(event) => updateTicketForm('subject', event.target.value)} type="text" placeholder="Descreva brevemente o problema" className={`w-full rounded-[12px] border bg-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#5A67D8] ${ticketErrors.subject ? 'border-red-300' : 'border-gray-200'}`} />
              {ticketErrors.subject && <p className="mt-1 text-xs font-medium text-red-600">{ticketErrors.subject}</p>}
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-700">Categoria</label>
              <select value={ticketForm.category} onChange={(event) => updateTicketForm('category', event.target.value)} className={`w-full rounded-[12px] border bg-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#5A67D8] ${ticketErrors.category ? 'border-red-300' : 'border-gray-200'}`}>
                <option value="">Selecione uma categoria</option>
                <option>Problemas com reserva</option>
                <option>Pagamento</option>
                <option>Cancelamento</option>
                <option>Roteiro</option>
                <option>Conta e login</option>
                <option>Outros</option>
              </select>
              {ticketErrors.category && <p className="mt-1 text-xs font-medium text-red-600">{ticketErrors.category}</p>}
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-700">Descrição</label>
              <textarea value={ticketForm.description} onChange={(event) => updateTicketForm('description', event.target.value)} rows={3} placeholder="Descreva detalhadamente sua solicitação..." className={`w-full rounded-[12px] border bg-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#5A67D8] resize-none ${ticketErrors.description ? 'border-red-300' : 'border-gray-200'}`} />
              {ticketErrors.description && <p className="mt-1 text-xs font-medium text-red-600">{ticketErrors.description}</p>}
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-700">Anexar arquivo</label>
              <label className="flex flex-col items-center justify-center w-full h-20 border-2 border-gray-200 border-dashed rounded-[12px] cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                <Upload className="w-5 h-5 mb-1 text-gray-400" />
                <p className="text-xs text-gray-500">{ticketForm.attachmentName || 'Clique para enviar um arquivo'}</p>
                <input type="file" className="hidden" onChange={(event) => updateTicketForm('attachmentName', event.target.files?.[0]?.name || '')} />
              </label>
            </div>
            <div className="flex gap-2 pt-1">
              <button type="button" onClick={() => { setTicketForm(initialTicketForm); setTicketErrors({}); }} className="flex-1 rounded-[12px] border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50">Cancelar</button>
              <button type="submit" className="flex-1 rounded-[12px] bg-[#5A67D8] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#4C5BC7]">Enviar chamado</button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-full flex flex-col lg:h-full lg:overflow-hidden">
      <div className="flex-1 flex flex-col container mx-auto px-4 sm:px-6 py-4 sm:py-6 lg:min-h-0 lg:overflow-hidden">

        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 shrink-0">Central de Ajuda</h1>

        <div className="grid grid-cols-1 gap-4 lg:min-h-0 lg:flex-1 lg:grid-cols-4 lg:overflow-hidden">

          <div className="lg:col-span-1 shrink-0 lg:shrink">
            <div className="rounded-[16px] bg-white border border-gray-100 p-3 shadow-sm">
              <nav className="flex flex-row lg:flex-col gap-1.5 overflow-x-auto lg:overflow-x-visible">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => { setActiveTab(tab.id); setSuccessMessage(''); }}
                      className={`flex shrink-0 lg:w-full items-center gap-2 rounded-[10px] px-3 py-2.5 text-left transition-colors ${
                        activeTab === tab.id ? 'bg-[#5A67D8] text-white' : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <Icon className="h-4 w-4 shrink-0" />
                      <span className="text-sm font-medium whitespace-nowrap">{tab.name}</span>
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          <div className="space-y-3 lg:col-span-2 lg:overflow-y-auto">
            {renderMainContent()}
          </div>

          <div className="space-y-3 lg:col-span-1 lg:overflow-y-auto">
            <div className="rounded-[16px] bg-white border border-gray-100 p-4 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <HelpCircle className="h-4 w-4 text-[#5A67D8]" />
                <h3 className="font-semibold text-gray-900 text-sm">Como funciona?</h3>
              </div>
              <div className="space-y-3">
                {[
                  'Preencha o formulário com detalhes',
                  'Nossa equipe analisa em até 24h',
                  'Acompanhe o status em Tickets',
                ].map((text, i) => (
                  <div key={i} className="flex gap-2.5 items-start">
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#5A67D8] text-white text-xs font-semibold">{i + 1}</div>
                    <p className="text-xs text-gray-700 mt-0.5">{text}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[16px] bg-white border border-gray-100 p-4 shadow-sm">
              <h3 className="font-semibold text-gray-900 text-sm mb-3">Dúvidas frequentes</h3>
              <div className="space-y-1">
                {faqItems.map((item) => (
                  <button key={item.title} onClick={() => selectFaq(item)} className="w-full text-left rounded-[8px] px-3 py-2 text-xs text-gray-700 hover:bg-gray-50 transition-colors">
                    {item.title}
                  </button>
                ))}
              </div>
              <button onClick={() => setActiveTab('suporte')} className="mt-3 w-full rounded-[10px] border border-[#5A67D8] bg-white px-3 py-2 text-xs font-semibold text-[#5A67D8] hover:bg-[#5A67D8]/5">
                Abrir chamado
              </button>
            </div>

            <div className="rounded-[16px] bg-[#FFFAF0] border border-[#DD6B20]/20 p-4">
              <div className="flex items-start gap-2">
                <AlertCircle className="mt-0.5 h-4 w-4 text-[#DD6B20]" />
                <p className="text-xs text-gray-700">Chamados são salvos neste navegador para acompanhamento durante o protótipo.</p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
