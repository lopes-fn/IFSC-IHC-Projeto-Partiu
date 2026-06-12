import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bot,
  Calendar,
  Check,
  ChevronRight,
  Hotel,
  MapPin,
  Send,
  Sparkles,
  User,
  Wallet,
} from 'lucide-react';

interface ChatMessage {
  id: number;
  from: 'bot' | 'user';
  text: string;
}

interface TripAnswers {
  origin: string;
  destination: string;
  dates: string;
  budget: string;
  accommodation: string;
  tours: string;
}

interface DestinationSuggestion {
  name: string;
  price: string;
  dates: string;
  accommodation: string;
  tours: string[];
  img: string;
  tag: string;
}

const STORAGE_KEY = 'partiu-trip-plan';

const questions: { key: keyof TripAnswers; text: string; helper: string }[] = [
  {
    key: 'origin',
    text: 'De onde você vai sair?',
    helper: 'Cidade, estado ou país de origem',
  },
  {
    key: 'destination',
    text: 'Para qual destino você quer viajar?',
    helper: 'Cidade, região ou país',
  },
  {
    key: 'dates',
    text: 'Quais datas ou período você tem em mente?',
    helper: 'Ex.: 10 a 14 de junho ou 5 dias em julho',
  },
  {
    key: 'budget',
    text: 'Qual é o orçamento previsto para essa viagem?',
    helper: 'Ex.: Orçamento total de R$ 2.500 ou R$ 900 por pessoa',
  },
  {
    key: 'accommodation',
    text: 'Que tipo de hospedagem você prefere?',
    helper: 'Hotel, pousada, resort, hostel, apartamento...',
  },
  {
    key: 'tours',
    text: 'Quais passeios ou experiências você quer incluir?',
    helper: 'Praias, trilhas, museus, restaurantes, compras...',
  },
];

const destinations: DestinationSuggestion[] = [
  {
    name: 'Florianópolis',
    price: 'R$ 1.840',
    dates: '10 a 14 de junho',
    accommodation: 'Hotel Majestic Beira-Mar',
    tours: ['Lagoa da Conceição', 'Praia Mole', 'Centro Histórico', 'Jantar no Ribeirão da Ilha', 'Santo Antônio de Lisboa'],
    img: 'https://images.unsplash.com/photo-1626568939752-a9359ca59df9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800',
    tag: 'praias e gastronomia',
  },
  {
    name: 'Lisboa',
    price: 'R$ 4.290',
    dates: '5 dias em setembro',
    accommodation: 'Hotel histórico no Chiado',
    tours: ['Torre de Belém', 'Mosteiro dos Jerónimos', 'Alfama', 'Jantar com fado', 'Bate-volta para Sintra'],
    img: 'https://images.unsplash.com/photo-1525207934214-58e69a8f8a3e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800',
    tag: 'cultura e história',
  },
  {
    name: 'Bariloche',
    price: 'R$ 3.560',
    dates: '7 dias em agosto',
    accommodation: 'Lodge de montanha com vista para o lago',
    tours: ['Cerro Catedral', 'Circuito Chico', 'Lago Nahuel Huapi', 'Jantar em chocolateria', 'Cerro Campanário'],
    img: 'https://images.unsplash.com/photo-1577801599718-f4e3ad3fc794?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800',
    tag: 'montanha e neve',
  },
];

const brazilianStates = [
  'Acre', 'Alagoas', 'Amapá', 'Amazonas', 'Bahia', 'Ceará', 'Distrito Federal', 'Espírito Santo', 'Goiás',
  'Maranhão', 'Mato Grosso', 'Mato Grosso do Sul', 'Minas Gerais', 'Pará', 'Paraíba', 'Paraná', 'Pernambuco',
  'Piauí', 'Rio de Janeiro', 'Rio Grande do Norte', 'Rio Grande do Sul', 'Rondônia', 'Roraima', 'Santa Catarina',
  'São Paulo', 'Sergipe', 'Tocantins', 'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS',
  'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO',
];

const knownCities = [
  'Florianópolis', 'Floripa', 'São Paulo', 'Rio de Janeiro', 'Belo Horizonte', 'Curitiba', 'Porto Alegre',
  'Brasília', 'Salvador', 'Recife', 'Fortaleza', 'Natal', 'João Pessoa', 'Maceió', 'Aracaju', 'Manaus', 'Belém',
  'Goiânia', 'Cuiabá', 'Campo Grande', 'Vitória', 'Gramado', 'Canela', 'Foz do Iguaçu', 'Balneário Camboriú',
  'Bombinhas', 'Ubatuba', 'Paraty', 'Búzios', 'Angra dos Reis', 'Ouro Preto', 'Tiradentes', 'Bonito',
  'Jericoacoara', 'Lençóis Maranhenses', 'Chapada Diamantina', 'Porto Seguro', 'Morro de São Paulo',
  'Fernando de Noronha', 'Porto de Galinhas', 'Maragogi', 'Bariloche', 'Buenos Aires', 'Santiago', 'Montevidéu',
  'Punta del Este', 'Lisboa', 'Porto', 'Madrid', 'Barcelona', 'Paris', 'Londres', 'Roma', 'Veneza', 'Milão',
  'Amsterdã', 'Berlim', 'Praga', 'Viena', 'Atenas', 'Nova York', 'NYC', 'Orlando', 'Miami', 'Los Angeles',
  'Las Vegas', 'San Francisco', 'Cancún', 'Cidade do México', 'Tóquio', 'Kyoto', 'Dubai',
];

const destinationAliases = [
  'Brasil', 'Estados Unidos', 'EUA', 'USA', 'Reino Unido', 'Inglaterra', 'Escócia', 'Argentina', 'Chile',
  'Uruguai', 'Paraguai', 'Peru', 'Colômbia', 'México', 'Canadá', 'Portugal', 'Espanha', 'França', 'Itália',
  'Alemanha', 'Holanda', 'Países Baixos', 'Grécia', 'Japão', 'Emirados Árabes', 'África do Sul', 'Albânia',
  'Arábia Saudita', 'Austrália', 'Áustria', 'Bélgica', 'Bolívia', 'China', 'Coreia do Sul', 'Costa Rica',
  'Croácia', 'Cuba', 'Dinamarca', 'Egito', 'Equador', 'Finlândia', 'Índia', 'Indonésia', 'Irlanda', 'Islândia',
  'Israel', 'Marrocos', 'Noruega', 'Nova Zelândia', 'Panamá', 'Polônia', 'República Tcheca', 'Suécia', 'Suíça',
  'Tailândia', 'Turquia', 'Vietnã',
];

function buildTripPlan(answers: TripAnswers) {
  const tours = answers.tours
    .split(/,| e |;|\n/)
    .map((tour) => tour.trim())
    .filter(Boolean);

  return {
    title: `Viagem para ${answers.destination}`,
    origin: answers.origin,
    destination: answers.destination,
    dates: answers.dates,
    budget: answers.budget,
    accommodation: answers.accommodation,
    tours: tours.length ? tours : [answers.tours],
    createdAt: new Date().toISOString(),
  };
}

function buildSuggestedTripPlan(destination: DestinationSuggestion) {
  return {
    title: `Viagem para ${destination.name}`,
    origin: '',
    destination: destination.name,
    dates: destination.dates,
    budget: destination.price,
    accommodation: destination.accommodation,
    tours: destination.tours,
    createdAt: new Date().toISOString(),
  };
}

function hasLetters(value: string) {
  return /[a-zA-ZÀ-ÿ]/.test(value);
}

function normalizeDestination(value: string) {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function getCountryNames() {
  try {
    const intlWithRegions = Intl as typeof Intl & { supportedValuesOf?: (key: string) => string[] };
    const regionCodes = intlWithRegions.supportedValuesOf?.('region') || [];
    const displayNames = new Intl.DisplayNames(['pt-BR'], { type: 'region' });

    return regionCodes
      .map((code) => displayNames.of(code))
      .filter((name): name is string => Boolean(name));
  } catch {
    return [];
  }
}

const knownDestinationNames = new Set(
  [...getCountryNames(), ...brazilianStates, ...knownCities, ...destinationAliases].map(normalizeDestination)
);

function isKnownDestination(value: string) {
  const normalized = normalizeDestination(value);
  const candidates = [
    normalized,
    ...normalized.split(/\s*,\s*|\s+-\s+/),
    normalized.replace(/\b(cidade de|estado de|pais de|país de|praia de|ilha de)\b/g, '').trim(),
  ].filter(Boolean);

  return candidates.some((candidate) => knownDestinationNames.has(candidate));
}

function parseBudgetValue(value: string) {
  const lower = value.toLowerCase();
  const match = lower.match(/(?:r\$\s*)?(\d[\d.\s]*(?:,\d{1,2})?|\d+(?:\.\d+)?|\d+(?:,\d+)?)(?:\s*(mil|k|reais|real))?/i);
  if (!match) return null;

  const rawNumber = match[1].replace(/\s/g, '');
  const hasDecimalComma = /,\d{1,2}$/.test(rawNumber);
  const normalized = hasDecimalComma
    ? rawNumber.replace(/\./g, '').replace(',', '.')
    : rawNumber.replace(/[.,]/g, '');
  const numericValue = Number(normalized);

  if (!Number.isFinite(numericValue) || numericValue <= 0) return null;

  const multiplier = /mil|k/.test(match[2] || '') ? 1000 : 1;
  return Math.round(numericValue * multiplier).toString();
}

function parseAccommodationType(value: string) {
  const normalized = normalizeDestination(value);
  const options: { label: string; patterns: RegExp[] }[] = [
    { label: 'Hotel', patterns: [/\bhotel\b/, /\bhoteis\b/, /\bhot[eé]is\b/] },
    { label: 'Pousada', patterns: [/\bpousada\b/, /\bpousadinha\b/] },
    { label: 'Resort', patterns: [/\bresort\b/, /\ball inclusive\b/] },
    { label: 'Hostel', patterns: [/\bhostel\b/, /\balbergue\b/] },
    { label: 'Apartamento', patterns: [/\bapartamento\b/, /\bapto\b/, /\bflat\b/] },
    { label: 'Airbnb', patterns: [/\bairbnb\b/, /\bapp de hospedagem\b/] },
    { label: 'Casa', patterns: [/\bcasa\b/, /\bsobrado\b/] },
    { label: 'Chalé', patterns: [/\bchale\b/, /\bcabana\b/] },
    { label: 'Lodge', patterns: [/\blodge\b/] },
    { label: 'Camping', patterns: [/\bcamping\b/, /\bacampar\b/] },
  ];

  return options.find((option) => option.patterns.some((pattern) => pattern.test(normalized)))?.label || null;
}

function validateAnswer(key: keyof TripAnswers, value: string) {
  const normalized = value.trim();

  if (normalized.length < (key === 'origin' || key === 'destination' ? 2 : 3)) {
    return 'Responda com um pouco mais de detalhe para eu montar um roteiro melhor.';
  }

  if (key === 'origin' || key === 'destination') {
    if (!hasLetters(normalized)) {
      return 'Informe uma cidade, estado ou país.';
    }

    if (!isKnownDestination(normalized)) {
      return 'Não reconheci esse local. Informe uma cidade, estado ou país existente. Ex.: Florianópolis, Santa Catarina, Brasil ou Portugal.';
    }
  }

  if (key === 'dates') {
    const hasDateClue = /\d/.test(normalized) || /dia|dias|semana|fim de semana|janeiro|fevereiro|março|marco|abril|maio|junho|julho|agosto|setembro|outubro|novembro|dezembro/i.test(normalized);
    if (!hasDateClue) {
      return 'Informe uma data, período ou duração. Ex.: 10 a 14 de junho, 5 dias em julho ou fim de semana.';
    }
  }

  if (key === 'budget' && !parseBudgetValue(normalized)) {
    return 'Informe o orçamento com um valor numérico. Ex.: R$ 2.500, 2500 ou 2 mil.';
  }

  if (key === 'accommodation' && !parseAccommodationType(normalized)) {
    return 'Informe um tipo de hospedagem reconhecido. Ex.: hotel, pousada, resort, hostel, apartamento, Airbnb, casa, chalé ou camping.';
  }

  if (key === 'tours' && normalized.length < 5) {
    return 'Informe pelo menos um passeio ou experiência. Ex.: praias, museus, trilhas ou restaurantes.';
  }

  return '';
}

function extractTripDetails(message: string): Partial<TripAnswers> {
  const text = message.trim();
  const lower = text.toLowerCase();
  const extracted: Partial<TripAnswers> = {};

  const originMatch = text.match(/(?:saindo de|partindo de|origem em|origem:|de)\s+([A-ZÀ-Ýa-zà-ÿ\s'-]+?)(?=\s+(?:para|até|ate|rumo a|com destino)|[,.]|$)/i);
  if (originMatch?.[1]) {
    extracted.origin = originMatch[1].trim();
  }

  const destinationMatch = text.match(/(?:para|em|no|na|nas|nos)\s+([A-ZÀ-Ýa-zà-ÿ\s'-]+?)(?=\s+(?:por|com|entre|de|do|da|no|na|em|gastando|orçamento|orcamento|ficando|hosped|quero|pretendo|e\s+(?:ficar|visitar))|[,.]|$)/i);
  if (destinationMatch?.[1]) {
    extracted.destination = destinationMatch[1].trim();
  }

  const dateMatch = text.match(/(\d{1,2}\s*(?:a|até|-)\s*\d{1,2}(?:\s+de\s+[A-ZÀ-Ýa-zà-ÿ]+)?|\d{1,2}\s+dias?(?:\s+em\s+[A-ZÀ-Ýa-zà-ÿ]+)?|fim de semana|feriado|janeiro|fevereiro|março|marco|abril|maio|junho|julho|agosto|setembro|outubro|novembro|dezembro)/i);
  if (dateMatch?.[1]) {
    extracted.dates = dateMatch[1].trim();
  }

  const budgetMatch = text.match(/(?:r\$\s*)?\d[\d.\s]*(?:,\d{2})?\s*(?:mil|reais)?(?:\s*(?:total|por pessoa|cada|pessoa))?/i);
  if (budgetMatch?.[0] && /r\$|reais|mil|orçamento|orcamento|budget|gastar|gastando|valor|tenho|até|ate|no máximo|maximo/i.test(text)) {
    const parsedBudget = parseBudgetValue(budgetMatch[0]);
    if (parsedBudget) extracted.budget = parsedBudget;
  }

  const accommodationMatch = text.match(/(?:hotel|pousada|resort|hostel|albergue|apartamento|apto|flat|airbnb|casa|chal[eé]|cabana|lodge|camping|hospedagem)[A-ZÀ-Ýa-zà-ÿ\s'-]*/i);
  if (accommodationMatch?.[0]) {
    const parsedAccommodation = parseAccommodationType(accommodationMatch[0]);
    if (parsedAccommodation) extracted.accommodation = parsedAccommodation;
  }

  const toursMatch = text.match(/(?:visitar|conhecer|incluir|passeios?|experi[eê]ncias?)\s+(.+)$/i);
  if (toursMatch?.[1]) {
    extracted.tours = toursMatch[1].trim();
  } else if (/praia|trilha|museu|restaurante|compras|bar|gastronomia|show|parque|centro hist/i.test(lower)) {
    const activities = text
      .split(/,| e |;|\./)
      .map((part) => part.trim())
      .filter((part) => /praia|trilha|museu|restaurante|compras|bar|gastronomia|show|parque|centro hist/i.test(part));
    if (activities.length) extracted.tours = activities.join(', ');
  }

  return Object.fromEntries(
    Object.entries(extracted).filter(([key, value]) => value && !validateAnswer(key as keyof TripAnswers, value))
  ) as Partial<TripAnswers>;
}

function getMissingStep(values: Partial<TripAnswers>) {
  return questions.findIndex((question) => !values[question.key]);
}

export function Home() {
  const navigate = useNavigate();
  const [chatStarted, setChatStarted] = useState(false);
  const [input, setInput] = useState('');
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Partial<TripAnswers>>({});
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 1,
      from: 'bot',
      text: 'Comece por aqui seu planejamento: descreva sua viagem ideal. Se puder, inclua origem, destino, período, orçamento, hospedagem e passeios; eu completo perguntando só o que faltar.',
    },
  ]);

  const activeQuestion = questions[step];
  const progress = Math.round((Object.keys(answers).length / questions.length) * 100);

  const pushMessage = (from: ChatMessage['from'], text: string) => {
    setMessages((current) => [...current, { id: Date.now() + current.length, from, text }]);
  };

  const openSuggestedTrip = (destination: DestinationSuggestion) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(buildSuggestedTripPlan(destination)));
    navigate('/planejamento');
  };

  const handleSubmit = () => {
    const value = input.trim();
    if (!value) return;

    setInput('');
    setChatStarted(true);
    pushMessage('user', value);

    if (!chatStarted) {
      const extractedAnswers = extractTripDetails(value);
      const missingStep = getMissingStep(extractedAnswers);

      if (Object.keys(extractedAnswers).length > 0) {
        setAnswers(extractedAnswers);
        pushMessage('bot', 'Consegui identificar algumas informações na sua mensagem. Vou perguntar só o que ainda falta.');
      }

      if (missingStep === -1) {
        const plan = buildTripPlan(extractedAnswers as TripAnswers);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(plan));
        pushMessage('bot', 'Roteiro criado com os dados que você enviou. Vou abrir seu planejamento agora.');
        window.setTimeout(() => navigate('/planejamento'), 650);
        return;
      }

      setStep(missingStep);
      pushMessage('bot', questions[missingStep].text);
      return;
    }

    const currentQuestion = questions[step];
    const validationError = validateAnswer(currentQuestion.key, value);
    if (validationError) {
      pushMessage('bot', validationError);
      return;
    }

    const storedValue =
      currentQuestion.key === 'budget'
        ? parseBudgetValue(value) || value
        : currentQuestion.key === 'accommodation'
          ? parseAccommodationType(value) || value
          : value;
    const nextAnswers = { ...answers, [currentQuestion.key]: storedValue };
    setAnswers(nextAnswers);

    const nextStep = getMissingStep(nextAnswers);
    if (nextStep !== -1) {
      setStep(nextStep);
      pushMessage('bot', questions[nextStep].text);
      return;
    }

    const completeAnswers = nextAnswers as TripAnswers;
    const plan = buildTripPlan(completeAnswers);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(plan));
    pushMessage('bot', 'Roteiro criado. Vou abrir seu planejamento organizado agora.');
    window.setTimeout(() => navigate('/planejamento'), 650);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') handleSubmit();
  };

  const resetChat = () => {
    setChatStarted(false);
    setInput('');
    setStep(0);
    setAnswers({});
    setMessages([
      {
        id: 1,
        from: 'bot',
        text: 'Comece por aqui seu planejamento: descreva sua viagem ideal. Se puder, inclua origem, destino, período, orçamento, hospedagem e passeios; eu completo perguntando só o que faltar.',
      },
    ]);
  };

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div className="flex-1 flex flex-col overflow-hidden container mx-auto px-4 sm:px-6 py-4 sm:py-6">
        <div className="mb-3 shrink-0">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 leading-tight">
            Tudo da viagem num só lugar. <span className="text-[#5A67D8]">Sem retrabalho, sem abas.</span>
          </h1>
          <p className="text-sm sm:text-base text-gray-500 mt-1">
            Planeje, reserve e organize sua viagem completa em um único ambiente.
          </p>
        </div>

        <div className="mb-3 shrink-0">
          <div className="rounded-[20px] bg-gradient-to-br from-[#5A67D8] to-[#7C3AED] p-5 sm:p-7 text-white shadow-xl ring-1 ring-[#5A67D8]/20">
            <div className="mb-4 flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px] bg-white/18">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div>
                  <span className="block font-bold text-lg sm:text-xl">Assistente de roteiro</span>
                  <p className="mt-0.5 text-sm text-white/75">Monte uma viagem completa respondendo poucas perguntas.</p>
                </div>
              </div>
              {chatStarted && (
                <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold">
                  {progress}% completo
                </span>
              )}
            </div>

            <div className="mb-4 max-h-56 overflow-y-auto rounded-[16px] bg-white/10 p-3 space-y-2 border border-white/15">
              {messages.map((message) => {
                const Icon = message.from === 'bot' ? Bot : User;
                return (
                  <div
                    key={message.id}
                    className={`flex items-start gap-2 ${message.from === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    {message.from === 'bot' && (
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/20">
                        <Icon className="h-3.5 w-3.5" />
                      </span>
                    )}
                    <div
                      className={`max-w-[82%] rounded-[14px] px-3 py-2 text-sm ${
                        message.from === 'user'
                          ? 'bg-white text-[#5A67D8] font-medium'
                          : 'bg-white/15 text-white'
                      }`}
                    >
                      {message.text}
                    </div>
                  </div>
                );
              })}
            </div>

            {chatStarted && activeQuestion && (
              <div className="mb-3 grid grid-cols-2 lg:grid-cols-6 gap-2">
                {questions.map((question, index) => {
                  const completed = Boolean(answers[question.key]);
                  return (
                    <div
                      key={question.key}
                      className={`rounded-[12px] border px-3 py-2 text-xs ${
                        completed
                          ? 'border-white/30 bg-white/20'
                          : index === step
                            ? 'border-white bg-white/15'
                            : 'border-white/10 bg-white/5'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 font-semibold">
                        {completed && <Check className="h-3 w-3" />}
                        {question.helper}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              <input
                type="text"
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={chatStarted && activeQuestion ? activeQuestion.helper : 'Ex.: Saindo de Florianópolis para Lisboa por 5 dias com R$ 4000...'}
                className="flex-1 rounded-[14px] bg-white/20 backdrop-blur-sm px-4 py-3.5 text-white placeholder:text-white/70 border border-white/30 focus:outline-none focus:ring-2 focus:ring-white/50 text-sm"
              />
              <button
                onClick={handleSubmit}
                disabled={!input.trim()}
                className="rounded-[14px] bg-white px-6 py-3.5 font-semibold text-[#5A67D8] hover:bg-white/90 transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
              >
                <Send className="h-4 w-4" />
                Enviar
              </button>
            </div>

            {chatStarted && (
              <button onClick={resetChat} className="mt-3 text-xs font-medium text-white/75 hover:text-white">
                Reiniciar conversa
              </button>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-hidden">
          {chatStarted ? (
            <div className="h-full grid grid-cols-1 lg:grid-cols-3 gap-3 overflow-hidden">
              <div className="rounded-[16px] bg-white border border-gray-100 p-4 shadow-sm overflow-hidden">
                <div className="flex items-center gap-2 mb-3 text-[#5A67D8]">
                  <MapPin className="h-4 w-4" />
                  <h2 className="font-bold text-gray-900">Origem, destino e período</h2>
                </div>
                <p className="text-sm text-gray-700">
                  {answers.origin || 'Aguardando origem'} - {answers.destination || 'aguardando destino'}
                </p>
                <p className="mt-2 text-xs text-gray-500">{answers.dates || 'As datas entram aqui assim que você responder.'}</p>
              </div>

              <div className="rounded-[16px] bg-white border border-gray-100 p-4 shadow-sm overflow-hidden">
                <div className="flex items-center gap-2 mb-3 text-[#5A67D8]">
                  <Wallet className="h-4 w-4" />
                  <h2 className="font-bold text-gray-900">Orçamento e hospedagem</h2>
                </div>
                <p className="text-sm text-gray-700">{answers.budget || 'Orçamento ainda não informado'}</p>
                <div className="mt-2 flex items-center gap-1.5 text-xs text-gray-500">
                  <Hotel className="h-3.5 w-3.5" />
                  {answers.accommodation || 'Preferência de hospedagem pendente'}
                </div>
              </div>

              <div className="rounded-[16px] bg-white border border-gray-100 p-4 shadow-sm overflow-hidden">
                <div className="flex items-center gap-2 mb-3 text-[#5A67D8]">
                  <Calendar className="h-4 w-4" />
                  <h2 className="font-bold text-gray-900">Passeios</h2>
                </div>
                <p className="text-sm text-gray-700 line-clamp-4">
                  {answers.tours || 'As experiências escolhidas serão separadas no roteiro.'}
                </p>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col">
              <div className="mb-2 flex items-center justify-between shrink-0">
                <h2 className="font-bold text-gray-900">Sugestões prontas</h2>
                <span className="text-xs text-gray-400">Clique para gerar roteiro</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 overflow-y-auto pr-1">
                {destinations.map((dest) => (
                  <button
                    key={dest.name}
                    onClick={() => openSuggestedTrip(dest)}
                    className="group rounded-[16px] bg-white shadow-sm border border-gray-100 overflow-hidden hover:shadow-md hover:border-[#5A67D8]/30 transition-all text-left"
                  >
                    <div className="flex h-full min-h-[118px]">
                      <div className="relative w-28 shrink-0 overflow-hidden">
                        <img src={dest.img} alt={dest.name} className="h-full w-full object-cover transition-transform group-hover:scale-105" />
                        <div className="absolute inset-0 bg-black/10" />
                      </div>
                      <div className="flex min-w-0 flex-1 flex-col justify-between p-3">
                        <div>
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <h3 className="truncate font-semibold text-gray-900">{dest.name}</h3>
                              <p className="mt-0.5 text-xs text-gray-500">{dest.tag}</p>
                            </div>
                            <ChevronRight className="h-4 w-4 shrink-0 text-gray-300 transition-colors group-hover:text-[#5A67D8]" />
                          </div>
                          <div className="mt-2 flex items-center gap-1 text-xs text-gray-500">
                            <Calendar className="h-3.5 w-3.5 text-[#5A67D8]" />
                            {dest.dates}
                          </div>
                        </div>
                        <div className="mt-2 flex items-center justify-between gap-2">
                          <span className="rounded-[9px] bg-[#5A67D8]/8 px-2 py-1 text-xs font-semibold text-[#5A67D8]">
                            {dest.price}
                          </span>
                          <span className="text-xs font-medium text-gray-400 group-hover:text-[#5A67D8]">Planejar</span>
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
