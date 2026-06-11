import { Map, MapPin, Navigation } from 'lucide-react';

export function Mapa() {
  return (
    <div className="min-h-screen bg-[#FDFBF7]">
      <div className="container mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Guia & Mapa</h1>

        <div className="rounded-[24px] bg-white border border-gray-100 p-12 shadow-sm text-center">
          <div className="flex justify-center mb-6">
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-[#5A67D8]/10">
              <Map className="h-12 w-12 text-[#5A67D8]" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Visualização de mapa interativo
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto mb-8">
            Esta tela exibirá um mapa interativo com todos os pontos de interesse da sua viagem,
            incluindo hotel, passeios, restaurantes e rotas otimizadas.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
            <div className="rounded-[16px] bg-gray-50 border border-gray-200 p-4">
              <MapPin className="h-6 w-6 text-[#5A67D8] mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-700">Pontos de interesse</p>
            </div>
            <div className="rounded-[16px] bg-gray-50 border border-gray-200 p-4">
              <Navigation className="h-6 w-6 text-[#5A67D8] mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-700">Rotas otimizadas</p>
            </div>
            <div className="rounded-[16px] bg-gray-50 border border-gray-200 p-4">
              <Map className="h-6 w-6 text-[#5A67D8] mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-700">Vista de satélite</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
