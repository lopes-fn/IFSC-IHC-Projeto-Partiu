import { Calendar, CheckCircle2, Hotel, MapPin, Route, Shield, Wallet } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useMemo } from 'react';

interface PlannedTrip {
  title: string;
  origin?: string;
  destination: string;
  dates: string;
  startDate?: string;
  endDate?: string;
  budget: string;
  accommodation: string;
  tours: string[];
  createdAt: string;
  updatedAt?: string;
}

interface CompletedTrip {
  signature: string;
  paidAt: string;
  insuranceSelected: boolean;
  total: number;
  plan: PlannedTrip;
}

const STORAGE_KEY = 'partiu-trip-plan';
const COMPLETED_TRIPS_KEY = 'partiu-completed-trips';

function loadCompletedTrips() {
  try {
    return JSON.parse(localStorage.getItem(COMPLETED_TRIPS_KEY) || '[]') as CompletedTrip[];
  } catch {
    localStorage.removeItem(COMPLETED_TRIPS_KEY);
    return [];
  }
}

function formatDateTime(value: string) {
  return new Date(value).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatCurrency(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export function RoteirosFinalizados() {
  const navigate = useNavigate();
  const completedTrips = useMemo(() => loadCompletedTrips(), []);

  const openTrip = (trip: CompletedTrip) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trip.plan));
    navigate('/planejamento');
  };

  return (
    <div className="min-h-full overflow-y-auto">
      <div className="container mx-auto px-4 py-4 sm:px-6 sm:py-6">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">Roteiros finalizados</h1>
            <p className="mt-1 text-sm text-gray-500">Viagens salvas automaticamente depois da confirmação de pagamento.</p>
          </div>
          <Link to="/" className="inline-flex items-center justify-center rounded-[12px] bg-[#5A67D8] px-4 py-2 text-sm font-semibold text-white hover:bg-[#4C5BC7]">
            Criar novo roteiro
          </Link>
        </div>

        {completedTrips.length === 0 ? (
          <div className="flex min-h-[58dvh] items-center justify-center">
            <div className="max-w-md rounded-[18px] border border-gray-100 bg-white p-6 text-center shadow-sm">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-[14px] bg-[#5A67D8]/10 text-[#5A67D8]">
                <Route className="h-6 w-6" />
              </div>
              <h2 className="text-lg font-bold text-gray-900">Nenhum roteiro finalizado ainda</h2>
              <p className="mt-2 text-sm text-gray-500">
                Finalize um pagamento no checkout para guardar a viagem nesta página.
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
            {completedTrips.map((trip) => (
              <article key={trip.signature} className="rounded-[16px] border border-gray-100 bg-white p-4 shadow-sm">
                <div className="mb-3 flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-green-50 px-2.5 py-1 text-xs font-semibold text-green-700">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Pago em {formatDateTime(trip.paidAt)}
                    </div>
                    <h2 className="line-clamp-2 text-lg font-bold text-gray-900">{trip.plan.title}</h2>
                  </div>
                  <span className="shrink-0 rounded-[10px] bg-[#5A67D8]/10 px-3 py-1.5 text-sm font-bold text-[#5A67D8]">
                    {formatCurrency(trip.total)}
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-2 text-sm text-gray-600 sm:grid-cols-2">
                  <div className="flex items-center gap-2 rounded-[12px] bg-gray-50 px-3 py-2">
                    <MapPin className="h-4 w-4 shrink-0 text-[#5A67D8]" />
                    <span className="line-clamp-2">{trip.plan.origin ? `${trip.plan.origin} - ` : ''}{trip.plan.destination}</span>
                  </div>
                  <div className="flex items-center gap-2 rounded-[12px] bg-gray-50 px-3 py-2">
                    <Calendar className="h-4 w-4 shrink-0 text-[#5A67D8]" />
                    <span className="line-clamp-2">{trip.plan.dates}</span>
                  </div>
                  <div className="flex items-center gap-2 rounded-[12px] bg-gray-50 px-3 py-2">
                    <Hotel className="h-4 w-4 shrink-0 text-[#5A67D8]" />
                    <span className="line-clamp-2">{trip.plan.accommodation}</span>
                  </div>
                  <div className="flex items-center gap-2 rounded-[12px] bg-gray-50 px-3 py-2">
                    {trip.insuranceSelected ? <Shield className="h-4 w-4 shrink-0 text-[#DD6B20]" /> : <Wallet className="h-4 w-4 shrink-0 text-[#5A67D8]" />}
                    <span>{trip.insuranceSelected ? 'Seguro incluso' : 'Sem seguro adicional'}</span>
                  </div>
                </div>

                <div className="mt-3">
                  <p className="mb-2 text-xs font-semibold uppercase text-gray-400">Passeios</p>
                  <div className="flex flex-wrap gap-1.5">
                    {trip.plan.tours.slice(0, 5).map((tour) => (
                      <span key={tour} className="rounded-[9px] bg-[#FDFBF7] px-2.5 py-1 text-xs font-medium text-gray-700">
                        {tour}
                      </span>
                    ))}
                    {trip.plan.tours.length > 5 && (
                      <span className="rounded-[9px] bg-gray-50 px-2.5 py-1 text-xs font-medium text-gray-500">
                        +{trip.plan.tours.length - 5}
                      </span>
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => openTrip(trip)}
                  className="mt-4 w-full rounded-[12px] border border-[#5A67D8] bg-white px-4 py-2.5 text-sm font-semibold text-[#5A67D8] hover:bg-[#5A67D8]/5"
                >
                  Abrir planejamento
                </button>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
