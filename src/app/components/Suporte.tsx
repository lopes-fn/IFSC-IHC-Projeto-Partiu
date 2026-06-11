import { LayoutDashboard, MessageCircle, MessageSquare, Ticket, Copy, Upload, HelpCircle } from 'lucide-react';
import { useState } from 'react';

export function Suporte() {
  const [activeTab, setActiveTab] = useState('suporte');

  const tabs = [
    { id: 'dashboard', name: 'Dashboard', icon: LayoutDashboard },
    { id: 'suporte', name: 'Suporte', icon: MessageCircle },
    { id: 'feedback', name: 'Feedback', icon: MessageSquare },
    { id: 'tickets', name: 'Tickets', icon: Ticket },
  ];

  const faqItems = [
    'Como alterar minha reserva?',
    'Política de cancelamento',
    'Reembolso e estorno',
    'Problemas com pagamento',
  ];

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div className="flex-1 flex flex-col overflow-hidden container mx-auto px-4 sm:px-6 py-4 sm:py-6">

        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 shrink-0">Central de Ajuda</h1>

        <div className="flex-1 overflow-hidden grid grid-cols-1 lg:grid-cols-4 gap-4">

          {/* Sidebar */}
          <div className="lg:col-span-1 shrink-0 lg:shrink">
            <div className="rounded-[16px] bg-white border border-gray-100 p-3 shadow-sm">
              <nav className="flex flex-row lg:flex-col gap-1.5 overflow-x-auto lg:overflow-x-visible">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
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

          {/* Main Content */}
          <div className="lg:col-span-2 overflow-y-auto space-y-3">
            {/* Email */}
            <div className="rounded-[16px] bg-white border border-gray-100 p-4 shadow-sm">
              <h3 className="font-semibold text-gray-900 text-sm mb-2">Abrir chamado a partir do e-mail</h3>
              <p className="text-xs text-gray-600 mb-3">Envie sua solicitação diretamente para:</p>
              <div className="flex items-center gap-2 rounded-[12px] bg-gray-50 border border-gray-200 px-3 py-2.5">
                <code className="flex-1 text-xs font-mono text-[#5A67D8]">suporte@partiu.viagem.com</code>
                <button className="rounded-[8px] bg-[#5A67D8] p-1.5 text-white hover:bg-[#4C5BC7]">
                  <Copy className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {/* Formulário */}
            <div className="rounded-[16px] bg-white border border-gray-100 p-4 shadow-sm">
              <h3 className="font-semibold text-gray-900 text-sm mb-4">Abrir novo chamado</h3>
              <form className="space-y-3">
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-700">Assunto</label>
                  <input type="text" placeholder="Descreva brevemente o problema" className="w-full rounded-[12px] border border-gray-200 bg-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#5A67D8]" />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-700">Categoria</label>
                  <select className="w-full rounded-[12px] border border-gray-200 bg-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#5A67D8]">
                    <option>Selecione uma categoria</option>
                    <option>Problemas com reserva</option>
                    <option>Pagamento</option>
                    <option>Cancelamento</option>
                    <option>Outros</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-700">Descrição</label>
                  <textarea rows={3} placeholder="Descreva detalhadamente sua solicitação..." className="w-full rounded-[12px] border border-gray-200 bg-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#5A67D8] resize-none" />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-700">Anexar arquivo</label>
                  <label className="flex flex-col items-center justify-center w-full h-20 border-2 border-gray-200 border-dashed rounded-[12px] cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                    <Upload className="w-5 h-5 mb-1 text-gray-400" />
                    <p className="text-xs text-gray-500"><span className="font-semibold">Clique para enviar</span> ou arraste aqui</p>
                    <input type="file" className="hidden" />
                  </label>
                </div>
                <div className="flex gap-2 pt-1">
                  <button type="button" className="flex-1 rounded-[12px] border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50">Cancelar</button>
                  <button type="submit" className="flex-1 rounded-[12px] bg-[#5A67D8] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#4C5BC7]">Enviar Chamado</button>
                </div>
              </form>
            </div>
          </div>

          {/* Right sidebar */}
          <div className="lg:col-span-1 overflow-y-auto space-y-3">
            {/* Como funciona */}
            <div className="rounded-[16px] bg-white border border-gray-100 p-4 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <HelpCircle className="h-4 w-4 text-[#5A67D8]" />
                <h3 className="font-semibold text-gray-900 text-sm">Como funciona?</h3>
              </div>
              <div className="space-y-3">
                {[
                  'Preencha o formulário com detalhes',
                  'Nossa equipe analisa em até 24h',
                  'Você recebe a resposta por e-mail',
                ].map((text, i) => (
                  <div key={i} className="flex gap-2.5 items-start">
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#5A67D8] text-white text-xs font-semibold">{i + 1}</div>
                    <p className="text-xs text-gray-700 mt-0.5">{text}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* FAQ */}
            <div className="rounded-[16px] bg-white border border-gray-100 p-4 shadow-sm">
              <h3 className="font-semibold text-gray-900 text-sm mb-3">Dúvidas frequentes</h3>
              <div className="space-y-1">
                {faqItems.map((item, index) => (
                  <button key={index} className="w-full text-left rounded-[8px] px-3 py-2 text-xs text-gray-700 hover:bg-gray-50 transition-colors">
                    {item}
                  </button>
                ))}
              </div>
              <button className="mt-3 w-full rounded-[10px] border border-[#5A67D8] bg-white px-3 py-2 text-xs font-semibold text-[#5A67D8] hover:bg-[#5A67D8]/5">
                Ver todas as dúvidas
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
