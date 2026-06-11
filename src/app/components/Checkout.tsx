import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Check, CreditCard, MapPin, Shield, Wallet } from 'lucide-react';

interface PlannedTrip {
  title: string;
  destination: string;
  dates: string;
  budget: string;
  accommodation: string;
  tours: string[];
  createdAt: string;
}

const STORAGE_KEY = 'partiu-trip-plan';

function parseCurrency(value: string) {
  const normalized = value.replace(/[^\d,.-]/g, '').replace(/\./g, '').replace(',', '.');
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : 0;
}

function formatCurrency(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export function Checkout() {
  const [plan, setPlan] = useState<PlannedTrip | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return;

    try {
      setPlan(JSON.parse(stored) as PlannedTrip);
    } catch {
      localStorage.removeItem(STORAGE_KEY);
      setPlan(null);
    }
  }, []);

  const totals = useMemo(() => {
    const subtotal = plan ? parseCurrency(plan.budget) : 0;
    const insurance = Math.round(subtotal * 0.1);
    const taxes = Math.round(subtotal * 0.05);
    const discount = Math.round(subtotal * 0.06);
    const total = subtotal + taxes - discount;

    return { subtotal, insurance, taxes, discount, total };
  }, [plan]);

  if (!plan) {
    return (
      <div className="h-full flex flex-col overflow-hidden">
        <div className="flex-1 flex items-center justify-center container mx-auto px-4 sm:px-6 py-4 sm:py-6">
          <div className="max-w-md rounded-[18px] bg-white border border-gray-100 p-6 text-center shadow-sm">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-[14px] bg-[#5A67D8]/10 text-[#5A67D8]">
              <CreditCard className="h-6 w-6" />
            </div>
            <h1 className="text-xl font-bold text-gray-900">Nenhuma viagem para finalizar</h1>
            <p className="mt-2 text-sm text-gray-500">
              Escolha uma sugestão ou crie um roteiro no assistente antes de avançar para o pagamento.
            </p>
            <Link to="/" className="mt-5 inline-flex items-center justify-center rounded-[12px] bg-[#5A67D8] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#4C5BC7]">
              Escolher viagem
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div className="flex-1 flex flex-col overflow-hidden container mx-auto px-4 sm:px-6 py-4 sm:py-6">
        <div className="mb-4 shrink-0">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Finalizar pagamento</h1>
          <div className="mt-2 flex flex-wrap gap-2 text-xs text-gray-500">
            <span className="flex items-center gap-1 rounded-full bg-white border border-gray-100 px-3 py-1">
              <MapPin className="h-3.5 w-3.5 text-[#5A67D8]" /> {plan.destination}
            </span>
            <span className="flex items-center gap-1 rounded-full bg-white border border-gray-100 px-3 py-1">
              <Calendar className="h-3.5 w-3.5 text-[#5A67D8]" /> {plan.dates}
            </span>
          </div>
        </div>

        <div className="flex-1 overflow-hidden grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="overflow-y-auto">
            <div className="rounded-[16px] bg-white border border-gray-100 p-4 shadow-sm h-full flex flex-col">
              <div className="flex items-start gap-3 mb-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] bg-[#5A67D8]/10">
                  <Shield className="h-5 w-5 text-[#5A67D8]" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 text-sm">Seguro Imprevisto</h3>
                  <p className="text-xs text-gray-600 mt-0.5">Cobertura completa para cancelamento</p>
                </div>
              </div>
              <div className="mb-4">
                <span className="text-xl font-bold text-gray-900">{formatCurrency(totals.insurance)}</span>
              </div>
              <button className="w-full rounded-[12px] border-2 border-dashed border-[#5A67D8] bg-[#5A67D8]/5 px-4 py-2.5 text-sm font-semibold text-[#5A67D8] hover:bg-[#5A67D8]/10 transition-colors">
                + Adicionar Seguro
              </button>
              <div className="mt-4 flex-1 rounded-[12px] bg-gray-50 border border-gray-100 p-4">
                <p className="text-xs text-gray-500 mb-3">Coberturas incluídas:</p>
                {['Cancelamento por doença', 'Extravio de bagagem', 'Assistência 24h', 'Despesas médicas'].map((c) => (
                  <div key={c} className="flex items-center gap-2 py-1.5 border-b border-gray-100 last:border-0">
                    <Check className="h-3.5 w-3.5 text-green-500 shrink-0" />
                    <span className="text-xs text-gray-700">{c}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="overflow-y-auto">
            <div className="rounded-[16px] bg-white border border-gray-100 p-4 shadow-sm">
              <div className="mb-4 flex items-center gap-2 rounded-[10px] bg-[#5A67D8]/10 px-3 py-1.5 w-fit">
                <CreditCard className="h-3.5 w-3.5 text-[#5A67D8]" />
                <span className="text-xs font-semibold text-[#5A67D8]">Pagamento com cartão</span>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-700">Número do cartão</label>
                  <input type="text" placeholder="0000 0000 0000 0000" className="w-full rounded-[12px] border border-gray-200 bg-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#5A67D8]" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1 block text-xs font-medium text-gray-700">Validade</label>
                    <input type="text" placeholder="MM/AA" className="w-full rounded-[12px] border border-gray-200 bg-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#5A67D8]" />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-gray-700">CVV</label>
                    <input type="text" placeholder="123" className="w-full rounded-[12px] border border-gray-200 bg-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#5A67D8]" />
                  </div>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-700">Nome no cartão</label>
                  <input type="text" placeholder="Nome completo" className="w-full rounded-[12px] border border-gray-200 bg-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#5A67D8]" />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-700">CPF</label>
                  <input type="text" placeholder="000.000.000-00" className="w-full rounded-[12px] border border-gray-200 bg-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#5A67D8]" />
                </div>
                <button className="w-full rounded-[12px] bg-[#5A67D8] px-6 py-3 text-sm font-semibold text-white hover:bg-[#4C5BC7] transition-colors flex items-center justify-center gap-2 mt-1">
                  <Check className="h-4 w-4" />
                  Finalizar pagamento
                </button>
              </div>
            </div>
          </div>

          <div className="overflow-y-auto">
            <div className="rounded-[16px] bg-white border border-gray-100 p-4 shadow-sm">
              <h3 className="mb-4 font-semibold text-gray-900 text-sm">Resumo do pedido</h3>
              <div className="mb-4 rounded-[12px] bg-gray-50 border border-gray-100 p-3">
                <p className="text-sm font-semibold text-gray-900">{plan.title}</p>
                <p className="mt-1 text-xs text-gray-500">{plan.accommodation}</p>
                <div className="mt-2 flex items-center gap-1 text-xs text-gray-500">
                  <Wallet className="h-3.5 w-3.5 text-[#5A67D8]" />
                  Valor previsto pelo roteiro
                </div>
              </div>
              <div className="space-y-2.5 mb-4">
                <div className="flex justify-between text-gray-700 text-sm">
                  <span>Subtotal</span>
                  <span className="font-medium">{formatCurrency(totals.subtotal)}</span>
                </div>
                <div className="flex justify-between text-gray-700 text-sm">
                  <span>Taxas</span>
                  <span className="font-medium">{formatCurrency(totals.taxes)}</span>
                </div>
                <div className="flex justify-between text-green-600 text-sm">
                  <span>Desconto</span>
                  <span className="font-medium">- {formatCurrency(totals.discount)}</span>
                </div>
                <div className="border-t border-gray-200 pt-2.5">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-gray-900 text-sm">Total</span>
                    <span className="text-xl font-bold text-[#5A67D8]">{formatCurrency(totals.total)}</span>
                  </div>
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-2">Formas de pagamento aceitas:</p>
                <div className="flex flex-wrap gap-1.5">
                  {['Visa', 'Master', 'Elo', 'Amex', 'Pix', 'Boleto'].map((method) => (
                    <div key={method} className="rounded-[8px] bg-gray-50 border border-gray-200 px-2.5 py-1 text-xs font-medium text-gray-700">{method}</div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
