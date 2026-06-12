import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  AlertTriangle,
  CalendarDays,
  Check,
  Edit2,
  Hotel,
  MapPin,
  MapPinned,
  Plane,
  Plus,
  Trash2,
  Utensils,
  Wallet,
  X,
} from 'lucide-react';
import type { StoredUser } from './Auth';

type ItemIcon = 'Plane' | 'Hotel' | 'MapPinned' | 'Utensils' | 'AlertTriangle';

interface TimelineItem {
  id: number;
  dayId: string;
  time: string;
  icon: ItemIcon;
  title: string;
  subtitle: string;
  isAlert?: boolean;
}

interface TripDay {
  id: string;
  label: string;
  shortLabel: string;
}

interface PlannedTrip {
  title: string;
  origin?: string;
  destination: string;
  dates: string;
  budget: string;
  accommodation: string;
  tours: string[];
  createdAt: string;
  updatedAt?: string;
}

const STORAGE_KEY = 'partiu-trip-plan';
const PAYMENT_KEY = 'partiu-paid-trip';

const iconMap: Record<ItemIcon, React.ElementType> = { Plane, Hotel, MapPinned, Utensils, AlertTriangle };

const iconOptions: { value: ItemIcon; label: string }[] = [
  { value: 'Plane', label: 'Voo' },
  { value: 'Hotel', label: 'Hospedagem' },
  { value: 'MapPinned', label: 'Passeio' },
  { value: 'Utensils', label: 'Refeição' },
  { value: 'AlertTriangle', label: 'Alerta' },
];

const monthMap: Record<string, number> = {
  janeiro: 0,
  fevereiro: 1,
  marco: 2,
  março: 2,
  abril: 3,
  maio: 4,
  junho: 5,
  julho: 6,
  agosto: 7,
  setembro: 8,
  outubro: 9,
  novembro: 10,
  dezembro: 11,
};

function normalizeText(value: string) {
  return value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

function titleCase(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function formatDay(date: Date): TripDay {
  const weekday = titleCase(date.toLocaleDateString('pt-BR', { weekday: 'long' }));
  const month = titleCase(date.toLocaleDateString('pt-BR', { month: 'long' }));
  const day = date.getDate();

  return {
    id: `day-${day}-${date.getMonth() + 1}`,
    label: `${weekday}, ${day} de ${month}`,
    shortLabel: `${day} ${month.slice(0, 3)}`,
  };
}

function buildTripDays(rawDates: string): TripDay[] {
  const normalized = normalizeText(rawDates);
  const currentYear = new Date().getFullYear();
  const monthName = Object.keys(monthMap).find((month) => normalized.includes(normalizeText(month)));
  const month = monthName ? monthMap[monthName] : new Date().getMonth();
  const range = normalized.match(/(\d{1,2})\s*(?:a|ate|-)\s*(\d{1,2})/);
  const daysAmount = normalized.match(/(\d{1,2})\s*dias?/);

  if (range) {
    const start = Number(range[1]);
    const end = Number(range[2]);
    const total = Math.max(1, Math.min(14, end >= start ? end - start + 1 : start));

    return Array.from({ length: total }, (_, index) => {
      const day = end >= start ? start + index : index + 1;
      return formatDay(new Date(currentYear, month, day));
    });
  }

  const total = daysAmount ? Math.min(14, Math.max(1, Number(daysAmount[1]))) : 5;
  return Array.from({ length: total }, (_, index) => ({
    id: `day-${index + 1}`,
    label: `Dia ${index + 1} da viagem`,
    shortLabel: `Dia ${index + 1}`,
  }));
}

function buildItemsFromPlan(plan: PlannedTrip, days: TripDay[]): TimelineItem[] {
  const firstDay = days[0]?.id || 'day-1';
  const lastDay = days[days.length - 1]?.id || firstDay;
  const origin = plan.origin?.trim();
  const tourTimes = ['10:00', '14:30', '17:30', '19:30'];

  const tourItems = plan.tours.map((tour, index) => {
    const targetDay = days[Math.min(days.length - 1, Math.floor(index / 2) + 1)] || days[0];
    const isDinner = /jantar|restaurante|gastronomia|comida|bar/i.test(tour);

    return {
      id: index + 4,
      dayId: targetDay.id,
      time: tourTimes[index % tourTimes.length],
      icon: (isDinner ? 'Utensils' : 'MapPinned') as ItemIcon,
      title: isDinner ? `Experiência gastronômica - ${tour}` : `Passeio - ${tour}`,
      subtitle: `Atividade organizada para ${targetDay.shortLabel}`,
    };
  });

  const plannedItems: TimelineItem[] = [
    {
      id: 1,
      dayId: firstDay,
      time: '08:00',
      icon: 'Plane',
      title: origin ? `Saída de ${origin} para ${plan.destination}` : `Chegada em ${plan.destination}`,
      subtitle: `Início do período: ${plan.dates}`,
    },
    {
      id: 2,
      dayId: firstDay,
      time: '10:00',
      icon: 'Hotel',
      title: `Check-in - ${plan.accommodation}`,
      subtitle: 'Hospedagem preferida para o roteiro',
    },
    ...tourItems,
    {
      id: tourItems.length + 4,
      dayId: lastDay,
      time: '18:00',
      icon: 'Plane',
      title: origin ? `Retorno para ${origin}` : `Retorno de ${plan.destination}`,
      subtitle: 'Encerramento do roteiro e deslocamento final',
    },
  ];

  let nextId = plannedItems.length + 1;
  days.forEach((day, index) => {
    const hasActivities = plannedItems.some((item) => item.dayId === day.id);
    if (hasActivities) return;

    plannedItems.push({
      id: nextId,
      dayId: day.id,
      time: index % 2 === 0 ? '10:00' : '14:00',
      icon: 'MapPinned',
      title: index % 2 === 0 ? 'Explorar a região' : 'Tempo livre planejado',
      subtitle: `Espaço reservado para ajustar passeios em ${day.shortLabel}`,
    });
    nextId += 1;
  });

  return plannedItems;
}

function getConflictItemIds(items: TimelineItem[]) {
  const groups = new Map<string, TimelineItem[]>();

  items.forEach((item) => {
    const key = `${item.dayId}-${item.time}`;
    groups.set(key, [...(groups.get(key) || []), item]);
  });

  return new Set(
    Array.from(groups.values())
      .filter((group) => group.length > 1)
      .flatMap((group) => group.map((item) => item.id))
  );
}

function getPlanSignature(plan: PlannedTrip) {
  return JSON.stringify({
    title: plan.title,
    origin: plan.origin || '',
    destination: plan.destination,
    dates: plan.dates,
    budget: plan.budget,
    accommodation: plan.accommodation,
    tours: plan.tours,
    createdAt: plan.createdAt,
    updatedAt: plan.updatedAt || '',
  });
}

function isPlanPaid(plan: PlannedTrip) {
  try {
    const paidTrip = JSON.parse(localStorage.getItem(PAYMENT_KEY) || 'null') as { signature?: string } | null;
    return paidTrip?.signature === getPlanSignature(plan);
  } catch {
    localStorage.removeItem(PAYMENT_KEY);
    return false;
  }
}

function EditableItem({
  item,
  days,
  onSave,
  onCancel,
}: {
  item: TimelineItem;
  days: TripDay[];
  onSave: (u: TimelineItem) => void;
  onCancel: () => void;
}) {
  const [draft, setDraft] = useState({ ...item });

  return (
    <div className="rounded-[16px] p-4 border-2 border-[#5A67D8] bg-white shadow-md shrink-0">
      <div className="flex flex-col gap-2">
        <div className="grid grid-cols-1 sm:grid-cols-[96px_1fr_1fr] gap-2">
          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-500">Horário</label>
            <input type="time" value={draft.time} onChange={(e) => setDraft({ ...draft, time: e.target.value })} className="rounded-[8px] border border-gray-200 px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#5A67D8]" />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-500">Dia</label>
            <select value={draft.dayId} onChange={(e) => setDraft({ ...draft, dayId: e.target.value })} className="rounded-[8px] border border-gray-200 px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#5A67D8]">
              {days.map((day) => <option key={day.id} value={day.id}>{day.label}</option>)}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-500">Tipo</label>
            <select value={draft.icon} onChange={(e) => setDraft({ ...draft, icon: e.target.value as ItemIcon })} className="rounded-[8px] border border-gray-200 px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#5A67D8]">
              {iconOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-gray-500">Título</label>
          <input value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} className="rounded-[8px] border border-gray-200 px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#5A67D8]" />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-gray-500">Descrição</label>
          <input value={draft.subtitle} onChange={(e) => setDraft({ ...draft, subtitle: e.target.value })} className="rounded-[8px] border border-gray-200 px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#5A67D8]" />
        </div>
        <div className="flex gap-2 justify-end">
          <button onClick={onCancel} className="flex items-center gap-1 rounded-[8px] border border-gray-200 px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-50">
            <X className="h-3.5 w-3.5" /> Cancelar
          </button>
          <button onClick={() => onSave(draft)} className="flex items-center gap-1 rounded-[8px] bg-[#5A67D8] px-3 py-1.5 text-xs text-white hover:bg-[#4C5BC7]">
            <Check className="h-3.5 w-3.5" /> Salvar
          </button>
        </div>
      </div>
    </div>
  );
}

export function Planejamento({ user }: { user: StoredUser | null }) {
  const navigate = useNavigate();
  const [hasTrip, setHasTrip] = useState(false);
  const [days, setDays] = useState<TripDay[]>([]);
  const [selectedDay, setSelectedDay] = useState('');
  const [items, setItems] = useState<TimelineItem[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [tripTitle, setTripTitle] = useState('');
  const [tripMeta, setTripMeta] = useState({
    origin: '',
    destination: '',
    dates: '',
    budget: '',
    accommodation: '',
  });
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState('');
  const [paymentCompleted, setPaymentCompleted] = useState(false);
  const [checkoutLoginMessage, setCheckoutLoginMessage] = useState('');

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return;

    try {
      const plan = JSON.parse(stored) as PlannedTrip;
      const plannedDays = buildTripDays(plan.dates);
      setHasTrip(true);
      setDays(plannedDays);
      setSelectedDay(plannedDays[0]?.id || 'day-1');
      setItems(buildItemsFromPlan(plan, plannedDays));
      setTripTitle(plan.title);
      setTitleDraft(plan.title);
      setPaymentCompleted(isPlanPaid(plan));
      setTripMeta({
        origin: plan.origin || '',
        destination: plan.destination,
        dates: plan.dates,
        budget: plan.budget,
        accommodation: plan.accommodation,
      });
    } catch {
      localStorage.removeItem(STORAGE_KEY);
      setHasTrip(false);
    }
  }, []);

  const nextId = () => Math.max(0, ...items.map((i) => i.id)) + 1;

  const markTripChanged = (updates: Partial<PlannedTrip> = {}) => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return;

    try {
      const plan = JSON.parse(stored) as PlannedTrip;
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...plan, ...updates, updatedAt: new Date().toISOString() }));
      setPaymentCompleted(false);
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  const handleSave = (updated: TimelineItem) => {
    setItems((prev) => prev.map((i) => (i.id === updated.id ? updated : i)));
    markTripChanged();
    setEditingId(null);
  };

  const handleDelete = (id: number) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
    markTripChanged();
    setDeletingId(null);
  };

  const handleAddItem = () => {
    const newItem: TimelineItem = {
      id: nextId(),
      dayId: selectedDay,
      time: '12:00',
      icon: 'MapPinned',
      title: 'Novo item',
      subtitle: 'Descrição do item',
    };
    setItems((prev) => [...prev, newItem]);
    markTripChanged();
    setEditingId(newItem.id);
  };

  const handleCheckoutClick = () => {
    if (user) {
      navigate('/checkout');
      return;
    }

    setCheckoutLoginMessage('Você deve fazer login para continuar com seu pagamento.');
    window.setTimeout(() => {
      navigate('/login', { state: { from: '/checkout' } });
    }, 900);
  };

  const selectedDayData = days.find((day) => day.id === selectedDay) || days[0];
  const visibleItems = items
    .filter((item) => item.dayId === selectedDay)
    .sort((a, b) => a.time.localeCompare(b.time));
  const conflictItemIds = getConflictItemIds(items);

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div className="flex-1 flex flex-col overflow-hidden container mx-auto px-4 sm:px-6 py-4 sm:py-6 max-w-4xl">
        {!hasTrip ? (
          <div className="flex h-full items-center justify-center">
            <div className="max-w-md rounded-[18px] bg-white border border-gray-100 p-6 text-center shadow-sm">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-[14px] bg-[#5A67D8]/10 text-[#5A67D8]">
                <CalendarDays className="h-6 w-6" />
              </div>
              <h1 className="text-xl font-bold text-gray-900">Nenhuma viagem selecionada</h1>
              <p className="mt-2 text-sm text-gray-500">
                Monte um roteiro pelo assistente ou escolha uma sugestão de destino para preencher esta tela.
              </p>
              <Link to="/" className="mt-5 inline-flex items-center justify-center rounded-[12px] bg-[#5A67D8] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#4C5BC7]">
                Escolher viagem
              </Link>
            </div>
          </div>
        ) : (
          <>
            <div className="mb-3 shrink-0">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                <div className="flex items-center gap-2">
                  {editingTitle ? (
                    <div className="flex items-center gap-2">
                      <input value={titleDraft} onChange={(e) => setTitleDraft(e.target.value)} className="text-xl sm:text-2xl font-bold text-gray-900 border-b-2 border-[#5A67D8] bg-transparent focus:outline-none" autoFocus />
                      <button onClick={() => { setTripTitle(titleDraft); markTripChanged({ title: titleDraft }); setEditingTitle(false); }} className="rounded-full p-1 bg-[#5A67D8] text-white"><Check className="h-3.5 w-3.5" /></button>
                      <button onClick={() => { setTitleDraft(tripTitle); setEditingTitle(false); }} className="rounded-full p-1 bg-gray-100 text-gray-600"><X className="h-3.5 w-3.5" /></button>
                    </div>
                  ) : (
                    <>
                      <h1 className="text-xl sm:text-2xl font-bold text-gray-900">{tripTitle}</h1>
                      <button onClick={() => { setTitleDraft(tripTitle); setEditingTitle(true); }} className="rounded-full p-1.5 hover:bg-gray-100"><Edit2 className="h-3.5 w-3.5 text-gray-600" /></button>
                    </>
                  )}
                </div>
                <button onClick={handleAddItem} className="flex items-center gap-1.5 rounded-[12px] bg-[#5A67D8] px-4 py-2 text-sm text-white hover:bg-[#4C5BC7]">
                  <Plus className="h-3.5 w-3.5" />Adicionar item
                </button>
              </div>
              <div className="flex items-center gap-2 text-gray-500 text-sm">
                <MapPin className="h-3.5 w-3.5" />
                <span>{tripMeta.origin ? `${tripMeta.origin} - ` : ''}{tripMeta.destination} - {tripMeta.dates}</span>
              </div>
            </div>

            <div className="mb-3 grid grid-cols-1 sm:grid-cols-3 gap-2 shrink-0">
              <div className="rounded-[12px] bg-white border border-gray-100 px-3 py-2 shadow-sm">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-[#5A67D8]">
                  <Wallet className="h-3.5 w-3.5" /> Orçamento
                </div>
                <p className="mt-1 text-xs text-gray-700 truncate">{tripMeta.budget}</p>
              </div>
              <div className="rounded-[12px] bg-white border border-gray-100 px-3 py-2 shadow-sm">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-[#5A67D8]">
                  <Hotel className="h-3.5 w-3.5" /> Hospedagem
                </div>
                <p className="mt-1 text-xs text-gray-700 truncate">{tripMeta.accommodation}</p>
              </div>
              <div className="rounded-[12px] bg-white border border-gray-100 px-3 py-2 shadow-sm">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-[#5A67D8]">
                  <CalendarDays className="h-3.5 w-3.5" /> Dias
                </div>
                <p className="mt-1 text-xs text-gray-700 truncate">{days.length} dias preenchidos</p>
              </div>
            </div>

            <div className="mb-3 shrink-0 space-y-2">
              <select
                value={selectedDay}
                onChange={(event) => {
                  setSelectedDay(event.target.value);
                  setEditingId(null);
                  setDeletingId(null);
                }}
                className="w-full rounded-[12px] border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#5A67D8]"
              >
                {days.map((day) => (
                  <option key={day.id} value={day.id}>{day.label}</option>
                ))}
              </select>

              <div className="flex gap-2 overflow-x-auto pb-1">
                {days.map((day) => {
                  const total = items.filter((item) => item.dayId === day.id).length;
                  const active = selectedDay === day.id;
                  return (
                    <button
                      key={day.id}
                      onClick={() => setSelectedDay(day.id)}
                      className={`shrink-0 rounded-[12px] border px-3 py-2 text-left transition-colors ${
                        active
                          ? 'bg-[#5A67D8] border-[#5A67D8] text-white'
                          : 'bg-white border-gray-100 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <div className="text-xs font-semibold">{day.shortLabel}</div>
                      <div className={`text-[11px] ${active ? 'text-white/80' : 'text-gray-400'}`}>{total} atividades</div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mb-2 flex items-center justify-between shrink-0">
              <h2 className="font-bold text-gray-900 text-sm">{selectedDayData?.label}</h2>
              <span className="text-xs font-medium text-gray-500">{visibleItems.length} itens</span>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {visibleItems.length === 0 && (
                <div className="rounded-[16px] bg-white border border-dashed border-gray-200 p-6 text-center">
                  <p className="text-sm font-semibold text-gray-900">Nenhuma atividade neste dia</p>
                  <p className="mt-1 text-xs text-gray-500">Use "Adicionar item" para preencher este trecho do roteiro.</p>
                </div>
              )}

              {visibleItems.map((item) => {
                const hasConflict = conflictItemIds.has(item.id);
                const Icon = hasConflict ? AlertTriangle : iconMap[item.icon];
                if (editingId === item.id) {
                  return (
                    <EditableItem
                      key={item.id}
                      item={item}
                      days={days}
                      onSave={handleSave}
                      onCancel={() => { if (item.title === 'Novo item') setItems((prev) => prev.filter((i) => i.id !== item.id)); setEditingId(null); }}
                    />
                  );
                }
                return (
                  <div key={item.id} className={`rounded-[16px] p-3 sm:p-4 border group transition-all ${hasConflict ? 'bg-[#FFFAF0] border-[#DD6B20]' : 'bg-white border-gray-100 shadow-sm hover:shadow-md'}`}>
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-semibold text-gray-900 min-w-[40px]">{item.time}</span>
                      <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] ${hasConflict ? 'bg-[#DD6B20] text-white' : 'bg-[#5A67D8]/10 text-[#5A67D8]'}`}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className={`font-semibold text-sm truncate ${hasConflict ? 'text-[#DD6B20]' : 'text-gray-900'}`}>{item.title}</h3>
                        <p className="text-xs text-gray-500 truncate">
                          {hasConflict ? 'Conflito de horário neste dia' : item.subtitle}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                        <button onClick={() => setEditingId(item.id)} className="rounded-[8px] p-1.5 hover:bg-gray-100 text-gray-500 hover:text-[#5A67D8]"><Edit2 className="h-3.5 w-3.5" /></button>
                        {deletingId === item.id ? (
                          <div className="flex items-center gap-1">
                            <span className="text-xs text-gray-500">Confirmar?</span>
                            <button onClick={() => handleDelete(item.id)} className="rounded-[8px] p-1 bg-red-500 text-white hover:bg-red-600"><Check className="h-3 w-3" /></button>
                            <button onClick={() => setDeletingId(null)} className="rounded-[8px] p-1 bg-gray-100 text-gray-600 hover:bg-gray-200"><X className="h-3 w-3" /></button>
                          </div>
                        ) : (
                          <button onClick={() => setDeletingId(item.id)} className="rounded-[8px] p-1.5 hover:bg-red-50 text-gray-500 hover:text-red-500"><Trash2 className="h-3.5 w-3.5" /></button>
                        )}
                      </div>
                      {hasConflict && deletingId !== item.id && editingId !== item.id && (
                        <button onClick={() => setEditingId(item.id)} className="shrink-0 rounded-[10px] bg-[#DD6B20] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#C05621]">Resolver</button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="pt-3 shrink-0">
              <button
                type="button"
                onClick={handleCheckoutClick}
                className={`flex w-full items-center justify-center rounded-[16px] px-6 py-3 text-sm font-semibold transition-colors ${
                  paymentCompleted
                    ? 'bg-[#A7F3D0] text-[#065F46] hover:bg-[#86EFAC]'
                    : 'bg-[#5A67D8] text-white hover:bg-[#4C5BC7]'
                }`}
              >
                {paymentCompleted ? 'Pagamento efetuado' : 'Ir para checkout'}
              </button>
              {checkoutLoginMessage && (
                <p className="mt-2 rounded-[10px] bg-amber-50 px-3 py-2 text-center text-xs font-medium text-amber-700">
                  {checkoutLoginMessage}
                </p>
              )}
            </div>

          </>
        )}
      </div>
    </div>
  );
}
