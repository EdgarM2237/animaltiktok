'use client';
import type { WsStatus } from '../lib/types';

interface Props {
  numVivos: number;
  numMuertos: number;
  wsStatus: WsStatus;
}

const DOT: Record<WsStatus, string> = {
  desconectado: 'bg-gray-500',
  intentando:   'bg-orange-400 animate-pulse',
  conectado:    'bg-green-400 shadow-[0_0_6px_#4ade80]',
  error:        'bg-red-500',
};
const LABEL: Record<WsStatus, string> = {
  desconectado: 'Sin conectar',
  intentando:   'Conectando...',
  conectado:    'Conectado ✓',
  error:        'Error',
};

export default function HUD({ numVivos, numMuertos, wsStatus }: Props) {
  return (
    <div className="fixed top-3 left-1/2 -translate-x-1/2 flex gap-2 z-50">
      {[
        { label: `🌿 Vivos: ${numVivos}` },
        { label: `💀 Cazados: ${numMuertos}` },
      ].map(c => (
        <div key={c.label}
          className="bg-black/55 backdrop-blur border border-white/10 rounded-2xl px-3 py-1 text-white text-sm font-bold">
          {c.label}
        </div>
      ))}
      <div className="bg-black/55 backdrop-blur border border-white/10 rounded-2xl px-3 py-1 text-white text-sm font-bold flex items-center gap-2">
        <span className={`w-2 h-2 rounded-full inline-block ${DOT[wsStatus]}`} />
        {LABEL[wsStatus]}
      </div>
    </div>
  );
}