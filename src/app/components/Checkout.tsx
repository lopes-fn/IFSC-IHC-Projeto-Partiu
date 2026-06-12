import { FormEvent, useEffect, useMemo, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Calendar, Check, CreditCard, MapPin, Shield, Wallet } from 'lucide-react';

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

interface PaymentForm {
  cardNumber: string;
  expiry: string;
  cvv: string;
  cardName: string;
  cpf: string;
}

type PaymentErrors = Partial<Record<keyof PaymentForm, string>>;

interface PaidTrip {
  signature: string;
  paidAt: string;
  insuranceSelected?: boolean;
}

function parseCurrency(value: string) {
  const normalized = value.replace(/[^\d,.-]/g, '').replace(/\./g, '').replace(',', '.');
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : 0;
}

function formatCurrency(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
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

function getPaidTrip() {
  try {
    return JSON.parse(localStorage.getItem(PAYMENT_KEY) || 'null') as PaidTrip | null;
  } catch {
    localStorage.removeItem(PAYMENT_KEY);
    return null;
  }
}

function onlyDigits(value: string) {
  return value.replace(/\D/g, '');
}

function formatCardNumber(value: string) {
  return onlyDigits(value).slice(0, 16).replace(/(\d{4})(?=\d)/g, '$1 ');
}

function formatExpiry(value: string) {
  const digits = onlyDigits(value).slice(0, 4);
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)}/${digits.slice(2)}`;
}

function formatCpf(value: string) {
  return onlyDigits(value)
    .slice(0, 11)
    .replace(/(\d{3})(?=\d)/, '$1.')
    .replace(/(\d{3})(?=\d)/, '$1.')
    .replace(/(\d{3})(?=\d{1,2}$)/, '$1-');
}

function validatePayment(form: PaymentForm) {
  const errors: PaymentErrors = {};
  const cardDigits = onlyDigits(form.cardNumber);
  const cpfDigits = onlyDigits(form.cpf);
  const cvvDigits = onlyDigits(form.cvv);
  const expiryDigits = onlyDigits(form.expiry);

  if (cardDigits.length !== 16) errors.cardNumber = 'Informe os 16 dígitos do cartão.';

  if (expiryDigits.length !== 4) {
    errors.expiry = 'Use o formato MM/AA.';
  } else {
    const month = Number(expiryDigits.slice(0, 2));
    const year = Number(`20${expiryDigits.slice(2)}`);
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();
    if (month < 1 || month > 12) errors.expiry = 'Mês de validade inválido.';
    if (!errors.expiry && (year < currentYear || (year === currentYear && month < currentMonth))) {
      errors.expiry = 'Cartão vencido.';
    }
  }

  if (cvvDigits.length < 3 || cvvDigits.length > 4) errors.cvv = 'Informe 3 ou 4 dígitos.';
  if (form.cardName.trim().split(/\s+/).length < 2) errors.cardName = 'Informe nome e sobrenome.';
  if (cpfDigits.length !== 11) errors.cpf = 'Informe os 11 dígitos do CPF.';

  return errors;
}

export function Checkout() {
  const [plan, setPlan] = useState<PlannedTrip | null>(null);
  const [planLoaded, setPlanLoaded] = useState(false);
  const [insuranceSelected, setInsuranceSelected] = useState(false);
  const [paymentForm, setPaymentForm] = useState<PaymentForm>({
    cardNumber: '',
    expiry: '',
    cvv: '',
    cardName: '',
    cpf: '',
  });
  const [errors, setErrors] = useState<PaymentErrors>({});
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [isPaid, setIsPaid] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      setPlanLoaded(true);
      return;
    }

    try {
      const parsedPlan = JSON.parse(stored) as PlannedTrip;
      const paidTrip = getPaidTrip();
      const paid = paidTrip?.signature === getPlanSignature(parsedPlan);
      setPlan(parsedPlan);
      setIsPaid(paid);
      setInsuranceSelected(paid ? Boolean(paidTrip?.insuranceSelected) : false);
    } catch {
      localStorage.removeItem(STORAGE_KEY);
      setPlan(null);
      setIsPaid(false);
    } finally {
      setPlanLoaded(true);
    }
  }, []);

  const totals = useMemo(() => {
    const subtotal = plan ? parseCurrency(plan.budget) : 0;
    const insurance = Math.round(subtotal * 0.1);
    const taxes = Math.round(subtotal * 0.05);
    const discount = Math.round(subtotal * 0.06);
    const total = subtotal + taxes - discount + (insuranceSelected ? insurance : 0);

    return { subtotal, insurance, taxes, discount, total };
  }, [insuranceSelected, plan]);

  const updateField = (field: keyof PaymentForm, value: string) => {
    if (isPaid) return;

    const formattedValue =
      field === 'cardNumber'
        ? formatCardNumber(value)
        : field === 'expiry'
          ? formatExpiry(value)
          : field === 'cpf'
            ? formatCpf(value)
            : field === 'cvv'
              ? onlyDigits(value).slice(0, 4)
              : value;

    setPaymentForm((current) => ({ ...current, [field]: formattedValue }));
    setErrors((current) => ({ ...current, [field]: undefined }));
    setPaymentSuccess(false);
  };

  const handlePaymentSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!plan || isPaid) return;

    const validationErrors = validatePayment(paymentForm);
    setErrors(validationErrors);
    const valid = Object.keys(validationErrors).length === 0;
    setPaymentSuccess(valid);

    if (valid) {
      localStorage.setItem(PAYMENT_KEY, JSON.stringify({ signature: getPlanSignature(plan), paidAt: new Date().toISOString(), insuranceSelected }));
      setIsPaid(true);
    }
  };

  if (!planLoaded) {
    return null;
  }

  if (!plan) {
    return <Navigate to="/planejamento" replace />;
  }

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div className="flex-1 flex flex-col overflow-hidden container mx-auto px-4 sm:px-6 py-4 sm:py-6">
        <div className="mb-4 shrink-0">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Finalizar pagamento</h1>
          <div className="mt-2 flex flex-wrap gap-2 text-xs text-gray-500">
            <span className="flex items-center gap-1 rounded-full bg-white border border-gray-100 px-3 py-1">
              <MapPin className="h-3.5 w-3.5 text-[#5A67D8]" /> {plan.origin ? `${plan.origin} - ` : ''}{plan.destination}
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
              <button
                onClick={() => setInsuranceSelected((selected) => !selected)}
                disabled={isPaid}
                className={`w-full rounded-[12px] border-2 border-dashed px-4 py-2.5 text-sm font-semibold transition-colors ${
                  insuranceSelected
                    ? 'border-[#DD6B20] bg-[#DD6B20]/5 text-[#DD6B20] hover:bg-[#DD6B20]/10'
                    : 'border-[#5A67D8] bg-[#5A67D8]/5 text-[#5A67D8] hover:bg-[#5A67D8]/10'
                } disabled:cursor-not-allowed disabled:opacity-60`}
              >
                {insuranceSelected ? 'Remover seguro' : '+ Adicionar seguro'}
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
              <form onSubmit={handlePaymentSubmit} className="space-y-3" noValidate>
                {isPaid && (
                  <p className="rounded-[10px] bg-green-50 px-3 py-2 text-xs font-medium text-green-700">
                    Esta viagem já está paga. Para editar o pagamento, altere o roteiro da viagem.
                  </p>
                )}
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-700">Número do cartão</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    autoComplete="cc-number"
                    disabled={isPaid}
                    value={paymentForm.cardNumber}
                    onChange={(event) => updateField('cardNumber', event.target.value)}
                    placeholder="0000 0000 0000 0000"
                    className={`w-full rounded-[12px] border bg-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#5A67D8] disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-400 ${errors.cardNumber ? 'border-red-300' : 'border-gray-200'}`}
                  />
                  {errors.cardNumber && <p className="mt-1 text-xs font-medium text-red-600">{errors.cardNumber}</p>}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1 block text-xs font-medium text-gray-700">Validade</label>
                    <input
                      type="text"
                      inputMode="numeric"
                      autoComplete="cc-exp"
                      disabled={isPaid}
                      value={paymentForm.expiry}
                      onChange={(event) => updateField('expiry', event.target.value)}
                      placeholder="MM/AA"
                      className={`w-full rounded-[12px] border bg-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#5A67D8] disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-400 ${errors.expiry ? 'border-red-300' : 'border-gray-200'}`}
                    />
                    {errors.expiry && <p className="mt-1 text-xs font-medium text-red-600">{errors.expiry}</p>}
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-gray-700">CVV</label>
                    <input
                      type="password"
                      inputMode="numeric"
                      autoComplete="cc-csc"
                      disabled={isPaid}
                      value={paymentForm.cvv}
                      onChange={(event) => updateField('cvv', event.target.value)}
                      placeholder="123"
                      className={`w-full rounded-[12px] border bg-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#5A67D8] disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-400 ${errors.cvv ? 'border-red-300' : 'border-gray-200'}`}
                    />
                    {errors.cvv && <p className="mt-1 text-xs font-medium text-red-600">{errors.cvv}</p>}
                  </div>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-700">Nome no cartão</label>
                  <input
                    type="text"
                    autoComplete="cc-name"
                    disabled={isPaid}
                    value={paymentForm.cardName}
                    onChange={(event) => updateField('cardName', event.target.value)}
                    placeholder="Nome completo"
                    className={`w-full rounded-[12px] border bg-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#5A67D8] disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-400 ${errors.cardName ? 'border-red-300' : 'border-gray-200'}`}
                  />
                  {errors.cardName && <p className="mt-1 text-xs font-medium text-red-600">{errors.cardName}</p>}
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-700">CPF</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    disabled={isPaid}
                    value={paymentForm.cpf}
                    onChange={(event) => updateField('cpf', event.target.value)}
                    placeholder="000.000.000-00"
                    className={`w-full rounded-[12px] border bg-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#5A67D8] disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-400 ${errors.cpf ? 'border-red-300' : 'border-gray-200'}`}
                  />
                  {errors.cpf && <p className="mt-1 text-xs font-medium text-red-600">{errors.cpf}</p>}
                </div>
                {paymentSuccess && !isPaid && (
                  <p className="rounded-[10px] bg-green-50 px-3 py-2 text-xs font-medium text-green-700">
                    Dados validados com sucesso.
                  </p>
                )}
                <button type="submit" disabled={isPaid} className="w-full rounded-[12px] bg-[#5A67D8] px-6 py-3 text-sm font-semibold text-white hover:bg-[#4C5BC7] transition-colors flex items-center justify-center gap-2 mt-1 disabled:cursor-not-allowed disabled:bg-gray-300">
                  <Check className="h-4 w-4" />
                  {isPaid ? 'Viagem paga' : 'Finalizar pagamento'}
                </button>
              </form>
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
                {insuranceSelected && (
                  <div className="flex justify-between text-gray-700 text-sm">
                    <span>Seguro</span>
                    <span className="font-medium">{formatCurrency(totals.insurance)}</span>
                  </div>
                )}
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
                  {['Cartão de crédito', 'Cartão de débito', 'Pix', 'Boleto'].map((method) => (
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
