'use client'
import { useRef, useState, useCallback } from 'react';
import { useAnimales, EMOJIS, CADENA } from './hooks/useAnimales';
import { useWebSocket } from './hooks/useWebSocket';
import Animal from './components/Animal';
import HUD from './components/HUD';
import ModalConfig from './components/ModalConfig';
import type { TipoAnimal, ReglaRegalo, WsEvent, Animal as AnimalType } from './lib/types';

const TIPOS: TipoAnimal[] = ['conejo', 'ciervo', 'zorro', 'lobo', 'oso'];
const TIPO_LABEL: Record<TipoAnimal, { label: string; color: string }> = {
  conejo: { label: 'PRESA', color: 'text-green-400' },
  ciervo: { label: 'PRESA', color: 'text-green-400' },
  zorro:  { label: 'CAZA',  color: 'text-orange-400' },
  lobo:   { label: 'CAZA',  color: 'text-orange-400' },
  oso:    { label: 'APEX',  color: 'text-red-400' },
};

const REGLAS_DEFAULT: ReglaRegalo[] = [
  { regalo: 'Rosa',            animal: 'conejo', cantidad: 1 },
  { regalo: 'Rose',            animal: 'conejo', cantidad: 1 },
  { regalo: 'Corazón coreano', animal: 'ciervo', cantidad: 1 },
  { regalo: 'Korean Heart',    animal: 'ciervo', cantidad: 1 },
  { regalo: 'Corazón',         animal: 'zorro',  cantidad: 1 },
  { regalo: 'Heart',           animal: 'zorro',  cantidad: 1 },
  { regalo: 'León',            animal: 'lobo',   cantidad: 1 },
  { regalo: 'Lion',            animal: 'lobo',   cantidad: 1 },
  { regalo: 'Universo',        animal: 'oso',    cantidad: 1 },
  { regalo: 'Universe',        animal: 'oso',    cantidad: 1 },
];

export default function BosquePage() {
  const areaRef = useRef<HTMLDivElement>(null);
  const [toast,      setToast     ] = useState('');
  const toastRef = useRef<ReturnType<typeof setTimeout>>();
  const [modal,      setModal     ] = useState(false);
  const [nombre,     setNombre    ] = useState('');
  const [tipoSel,    setTipoSel  ] = useState<TipoAnimal>('conejo');
  const [modoElim,   setModoElim ] = useState(false);
  const [selCazador, setSelCazador] = useState<string | null>(null);
  const [reglas,     setReglas   ] = useState<ReglaRegalo[]>(REGLAS_DEFAULT);

  function showToast(msg: string) {
    setToast(msg);
    clearTimeout(toastRef.current);
    toastRef.current = setTimeout(() => setToast(''), 2800);
  }

  const onCaza = useCallback((caz: AnimalType, pre: AnimalType) => {
    showToast(`🍖 ${EMOJIS[caz.tipo]} ${caz.nombre} devoró a ${EMOJIS[pre.tipo]} ${pre.nombre}!`);
  }, []);

  const { animales, numVivos, numMuertos, agregar, eliminar, limpiar, forzarCaza } =
    useAnimales({ areaRef, onCaza });

  const onWsEvent = useCallback((e: WsEvent) => {
    if (e.event !== 'gift') return;
    const regla = reglas.find(
      r => r.regalo.trim().toLowerCase() === (e.giftName ?? '').trim().toLowerCase()
    );
    if (!regla) return;
    const total = regla.cantidad * (e.amount ?? 1);
    for (let i = 0; i < total; i++) {
      setTimeout(() => agregar(e.senderName ?? 'Anon', regla.animal), i * 300);
    }
    showToast(`🎁 ${e.senderName} → ${e.giftName} ×${e.amount ?? 1} = ${total} ${EMOJIS[regla.animal]}`);
  }, [reglas, agregar]);

  const { status: wsStatus, logs: wsLogs, conectar, desconectar } =
    useWebSocket({ onEvent: onWsEvent });

  function onClickAnimal(id: string) {
    const a = animales.find(x => x.id === id);
    if (!a) return;

    if (modoElim) {
      eliminar(id);
      showToast(`☠️ ${EMOJIS[a.tipo]} ${a.nombre} eliminado`);
      return;
    }

    if (!selCazador) {
      if (CADENA[a.tipo]) {
        setSelCazador(id);
        showToast(`🎯 ${EMOJIS[a.tipo]} ${a.nombre} — haz click en su presa`);
      } else {
        showToast(`🐾 ${EMOJIS[a.tipo]} ${a.nombre} no puede cazar`);
      }
      return;
    }

    if (selCazador === id) { setSelCazador(null); showToast('❌ Cancelado'); return; }

    const caz = animales.find(x => x.id === selCazador);
    if (!caz) { setSelCazador(null); return; }

    if (!(CADENA[caz.tipo] ?? []).includes(a.tipo)) {
      showToast(`⚠️ ${EMOJIS[caz.tipo]} no puede cazar ${EMOJIS[a.tipo]}`);
      setSelCazador(null); return;
    }

    forzarCaza(selCazador, id);
    setSelCazador(null);
    showToast(`🔥 ${EMOJIS[caz.tipo]} ${caz.nombre} persigue a ${EMOJIS[a.tipo]} ${a.nombre}!`);
  }

  function agregarManual() {
    if (!nombre.trim()) { showToast('⚠️ Escribe un nombre'); return; }
    agregar(nombre.trim(), tipoSel);
    setNombre('');
  }

  return (
    <div className="w-screen h-screen overflow-hidden relative font-sans">

      {/* ── Fondo — pointer-events-none para no bloquear clicks del panel ── */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'linear-gradient(180deg,#0d1f35 0%,#1a3a5c 20%,#2e6b9e 38%,#e8925a 48%,#c8703a 52%,#4a9e3f 55%,#2d7a1f 68%,#1a4e10 85%,#0f3008 100%)',
        }}
      >
        {/* Suelo */}
        <div
          className="absolute bottom-0 left-0 right-0 h-[46%] z-[2]"
          style={{
            background: 'linear-gradient(180deg,#4caf50 0%,#2e7d32 15%,#1b5e20 50%,#0f3a0a 100%)',
            borderRadius: '55% 55% 0 0 / 15% 15% 0 0',
          }}
        />
        {/* Luna */}
        <div
          className="absolute top-[6%] right-[8%] w-12 h-12 rounded-full z-[1]"
          style={{
            background: 'radial-gradient(circle at 35% 35%,#fff9e6,#f0d890)',
            boxShadow: '0 0 30px rgba(240,216,144,0.5),0 0 80px rgba(240,216,144,0.2)',
          }}
        />
      </div>

      {/* ── Área de animales — necesita ref para el game loop ── */}
      <div ref={areaRef} className="absolute inset-0 pointer-events-none">
        {animales.map(a => (
          // pointer-events-auto solo en los animales
          <div key={a.id} className="pointer-events-auto">
            <Animal animal={a} onClick={onClickAnimal} resaltado={selCazador === a.id} />
          </div>
        ))}
      </div>

      {/* HUD */}
      <HUD numVivos={numVivos} numMuertos={numMuertos} wsStatus={wsStatus} />

      {/* Info cadena */}
      <div className="fixed top-3 right-3 bg-black/60 backdrop-blur border border-white/10 rounded-2xl px-3 py-2 z-50 text-[11px] text-white/70 leading-7">
        <div className="text-[#a5d6a7] font-bold text-xs mb-1">⛓ Cadena alimenticia</div>
        🐰 Conejo → 🦊 Zorro<br />
        🦌 Ciervo → 🐺 Lobo<br />
        🦊 Zorro → 🐺 Lobo<br />
        🐰🦌🦊🐺 → 🐻 Oso<br />
        <span className="text-yellow-400/60 text-[10px]">Click en animal = forzar caza</span>
      </div>

      {/* Toast */}
      {toast && (
        <div className="fixed top-14 left-1/2 -translate-x-1/2 bg-[#14380a]/95 text-white font-bold text-sm px-5 py-2 rounded-full border border-green-800/50 z-[300] whitespace-nowrap shadow-lg">
          {toast}
        </div>
      )}

      {/* Panel inferior */}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-black/80 backdrop-blur border border-green-800/25 rounded-3xl px-4 py-3 flex items-center gap-2 z-[100] shadow-2xl">
        <input
          type="text"
          value={nombre}
          onChange={e => setNombre(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && agregarManual()}
          placeholder="Nombre..."
          maxLength={16}
          className="bg-white/10 border border-white/10 rounded-xl text-white text-sm px-3 py-2 w-32 outline-none focus:border-green-500/50 placeholder-white/30"
        />
        <div className="w-px h-7 bg-white/10" />
        {TIPOS.map(t => (
          <button
            key={t}
            onClick={() => setTipoSel(t)}
            className={`w-12 h-11 border rounded-xl flex flex-col items-center justify-center text-xl transition-all
              ${tipoSel === t
                ? 'bg-green-800/40 border-green-500/60'
                : 'bg-white/10 border-white/10 hover:bg-white/20'}`}
          >
            {EMOJIS[t]}
            <span className={`text-[8px] font-bold ${TIPO_LABEL[t].color} leading-none mt-0.5`}>
              {TIPO_LABEL[t].label}
            </span>
          </button>
        ))}
        <div className="w-px h-7 bg-white/10" />
        <button
          onClick={agregarManual}
          className="bg-green-700 hover:bg-green-600 text-white font-bold text-sm px-4 py-2 rounded-xl transition"
        >
          + Agregar
        </button>
        <button
          onClick={() => setModoElim(m => !m)}
          className={`w-9 h-9 border rounded-xl text-base flex items-center justify-center transition-all
            ${modoElim ? 'bg-red-900/40 border-red-500/60' : 'bg-white/10 border-white/10 hover:bg-white/20 text-white/70'}`}
        >
          ☠️
        </button>
        <button
          onClick={() => setModal(true)}
          className="w-9 h-9 border border-white/10 bg-white/10 rounded-xl text-base flex items-center justify-center hover:bg-white/20 transition text-white/70"
        >
          ⚙️
        </button>
        <button
          onClick={() => { if (confirm('¿Limpiar el bosque?')) { limpiar(); showToast('🌿 Bosque limpio'); } }}
          className="w-9 h-9 border border-red-900/30 bg-red-900/10 rounded-xl text-base flex items-center justify-center hover:bg-red-900/20 transition text-red-400/80"
        >
          🗑️
        </button>
      </div>

      <ModalConfig
        open={modal}
        onClose={() => setModal(false)}
        wsStatus={wsStatus}
        wsLogs={wsLogs}
        onConectar={conectar}
        onDesconectar={desconectar}
        onReglasChange={setReglas}
      />
    </div>
  );
}