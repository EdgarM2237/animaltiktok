'use client';
import { useState, useEffect } from 'react';
import type { ReglaRegalo, TipoAnimal, WsStatus } from '../lib/types';
import { EMOJIS } from '../hooks/useAnimales';

const REGLAS_DEFAULT: ReglaRegalo[] = [
  { regalo: 'Rosa',           animal: 'conejo', cantidad: 1 },
  { regalo: 'Rose',           animal: 'conejo', cantidad: 1 },
  { regalo: 'Corazón coreano',animal: 'ciervo', cantidad: 1 },
  { regalo: 'Korean Heart',   animal: 'ciervo', cantidad: 1 },
  { regalo: 'Corazón',        animal: 'zorro',  cantidad: 1 },
  { regalo: 'Heart',          animal: 'zorro',  cantidad: 1 },
  { regalo: 'León',           animal: 'lobo',   cantidad: 1 },
  { regalo: 'Lion',           animal: 'lobo',   cantidad: 1 },
  { regalo: 'Universo',       animal: 'oso',    cantidad: 1 },
  { regalo: 'Universe',       animal: 'oso',    cantidad: 1 },
];

const STORAGE_KEY = 'bosque_reglas';
const TIPOS: TipoAnimal[] = ['conejo', 'ciervo', 'zorro', 'lobo', 'oso'];

interface Props {
  open: boolean;
  onClose: () => void;
  wsStatus: WsStatus;
  wsLogs: string[];
  onConectar: (url: string) => void;
  onDesconectar: () => void;
  onReglasChange: (r: ReglaRegalo[]) => void;
}

export default function ModalConfig({
  open, onClose, wsStatus, wsLogs, onConectar, onDesconectar, onReglasChange,
}: Props) {
  const [wsUrl, setWsUrl] = useState(() => {
    if (typeof window === 'undefined') return 'wss://tu-app.railway.app';
    return localStorage.getItem('bosque_ws_url') || 'wss://tu-app.railway.app';
  });
  const [reglas, setReglas] = useState<ReglaRegalo[]>(() => {
    if (typeof window === 'undefined') return REGLAS_DEFAULT;
    try {
      const s = localStorage.getItem(STORAGE_KEY);
      return s ? JSON.parse(s) : REGLAS_DEFAULT;
    } catch {
      return REGLAS_DEFAULT;
    }
  });

  function guardar() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(reglas));
    localStorage.setItem('bosque_ws_url', wsUrl);
    onReglasChange(reglas);
    onClose();
  }

  function setRegla(i: number, field: keyof ReglaRegalo, val: string | number) {
    setReglas(r => r.map((x, j) => j === i ? { ...x, [field]: val } : x));
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 bg-black/75 backdrop-blur-md z-50 flex items-center justify-center"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-gradient-to-br from-[#0d2010] to-[#0a1a0a] border border-white/10 rounded-3xl p-7 w-[min(680px,95vw)] max-h-[85vh] overflow-y-auto shadow-2xl">
        <h2 className="font-bold text-[#a5d6a7] text-xl mb-1">⚙️ Configuración</h2>
        <p className="text-white/40 text-xs mb-5">Reglas de regalos y conexión al servidor</p>

        {/* WS */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 mb-6">
          <h3 className="text-[#81c784] font-bold text-sm mb-3">🔌 URL del servidor WebSocket</h3>
          <p className="text-[#fde68a]/80 text-xs bg-yellow-900/20 border border-yellow-700/30 rounded-xl px-3 py-2 mb-3">
            Pega la URL de tu servidor Railway o Render.<br/>
            Ej: <em>wss://bosque-live.railway.app</em>
          </p>
          <div className="flex flex-wrap gap-2 items-center">
            <input
              type="text" value={wsUrl}
              onChange={e => setWsUrl(e.target.value)}
              className="bg-white/7 border border-white/10 rounded-lg text-black text-sm px-3 py-2 flex-1 min-w-[200px] outline-none focus:border-green-500/50"
              placeholder="wss://tu-app.railway.app"
            />
            <button onClick={() => onConectar(wsUrl)}
              className="bg-gradient-to-br from-[#1b5e20] to-[#2e7d32] text-white text-sm font-bold px-4 py-2 rounded-lg hover:brightness-110 transition">
              Conectar
            </button>
            <button onClick={onDesconectar}
              className="bg-gradient-to-br from-[#5c1a1a] to-[#7d2e2e] text-white text-sm font-bold px-4 py-2 rounded-lg hover:brightness-110 transition">
              Desconectar
            </button>
            <span className="text-white/40 text-xs">{wsStatus}</span>
          </div>
          {/* Logs */}
          {wsLogs.length > 0 && (
            <div className="mt-3 flex flex-col gap-1 max-h-32 overflow-y-auto">
              {wsLogs.map((l, i) => (
                <div key={i} className="text-[11px] font-mono text-white/50 bg-white/5 rounded px-2 py-0.5">{l}</div>
              ))}
            </div>
          )}
        </div>

        {/* Reglas */}
        <h3 className="text-[#a5d6a7] font-bold text-sm mb-3">🎁 Reglas de regalos</h3>
        <div className="grid grid-cols-[1fr_110px_80px_36px] gap-2 px-1 pb-2 border-b border-white/10 mb-2">
          {['Nombre del regalo', 'Animal', 'Cantidad', ''].map(h => (
            <span key={h} className="text-[10px] text-white/30 font-bold uppercase tracking-wide">{h}</span>
          ))}
        </div>
        {reglas.map((r, i) => (
          <div key={i} className="grid grid-cols-[1fr_110px_80px_36px] gap-2 items-center py-1.5 px-1 hover:bg-white/5 rounded-xl">
            <input type="text" value={r.regalo}
              onChange={e => setRegla(i, 'regalo', e.target.value)}
              className="bg-white/7 border border-white/10 rounded-lg text-black text-sm px-3 py-1.5 outline-none focus:border-green-500/40 w-full"
              placeholder="Ej: Rosa"
            />
            <select value={r.animal}
              onChange={e => setRegla(i, 'animal', e.target.value)}
              className="bg-[#0d2010] border border-white/10 rounded-lg text-white text-sm px-2 py-1.5 outline-none cursor-pointer w-full">
              {TIPOS.map(t => (
                <option key={t} value={t}>{EMOJIS[t]} {t.charAt(0).toUpperCase() + t.slice(1)}</option>
              ))}
            </select>
            <input type="number" value={r.cantidad} min={1} max={20}
              onChange={e => setRegla(i, 'cantidad', parseInt(e.target.value) || 1)}
              className="bg-white/7 border border-white/10 rounded-lg text-black text-sm px-2 py-1.5 outline-none text-center w-full"
            />
            <button onClick={() => setReglas(r => r.filter((_, j) => j !== i))}
              className="bg-red-900/20 border border-red-700/30 text-red-400 rounded-lg w-8 h-8 flex items-center justify-center hover:bg-red-900/40 transition text-sm">
              ✕
            </button>
          </div>
        ))}
        <button
          onClick={() => setReglas(r => [...r, { regalo: '', animal: 'conejo', cantidad: 1 }])}
          className="mt-2 w-full border border-dashed border-green-700/40 text-green-500/80 text-sm font-bold py-2 rounded-xl hover:bg-green-900/20 transition">
          + Nueva regla
        </button>

        <div className="flex gap-3 justify-end mt-6 pt-4 border-t border-white/10">
          <button onClick={onClose}
            className="bg-white/7 border border-white/10 text-white/70 font-bold text-sm px-5 py-2.5 rounded-xl hover:bg-white/12 transition">
            Cancelar
          </button>
          <button onClick={guardar}
            className="bg-gradient-to-br from-[#2e7d32] to-[#4caf50] text-white font-bold text-sm px-6 py-2.5 rounded-xl hover:brightness-110 transition shadow-lg shadow-green-900/40">
            💾 Guardar
          </button>
        </div>
      </div>
    </div>
  );
}