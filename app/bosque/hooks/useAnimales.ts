'use client';
import { useRef, useState, useCallback, useEffect } from 'react';
import type { Animal, TipoAnimal } from '../lib/types';

export const EMOJIS: Record<TipoAnimal, string> = {
  conejo: '🐰', ciervo: '🦌', zorro: '🦊', lobo: '🐺', oso: '🐻',
};
export const TAMAÑO_BASE: Record<TipoAnimal, number> = {
  conejo: 38, ciervo: 42, zorro: 38, lobo: 44, oso: 52,
};
const VELOCIDAD: Record<TipoAnimal, number> = {
  conejo: 1.8, ciervo: 2.2, zorro: 1.4, lobo: 1.2, oso: 0.9,
};
const RANGO_CAZA: Partial<Record<TipoAnimal, number>> = {
  zorro: 160, lobo: 200, oso: 240,
};
const RANGO_HUIDA: Partial<Record<TipoAnimal, number>> = {
  conejo: 140, ciervo: 180, zorro: 150,
};
export const CADENA: Partial<Record<TipoAnimal, TipoAnimal[]>> = {
  zorro: ['conejo'],
  lobo:  ['ciervo', 'zorro', 'conejo'],
  oso:   ['conejo', 'ciervo', 'zorro', 'lobo'],
};

function uid() { return Math.random().toString(36).slice(2, 9); }
function dist(a: Animal, b: Animal) {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
}

interface UseAnimalesOpts {
  areaRef: React.RefObject<HTMLDivElement | null>;
  onCaza?: (cazador: Animal, presa: Animal) => void;
}

export function useAnimales({ areaRef, onCaza }: UseAnimalesOpts) {
  const animalesRef = useRef<Animal[]>([]);
  const [animales,  setAnimales ] = useState<Animal[]>([]);
  const [numVivos,  setNumVivos ] = useState(0);
  const [numMuertos,setNumMuertos] = useState(0);
  const rafRef = useRef<number>(0);

  const sync = useCallback(() => {
    setAnimales([...animalesRef.current]);
    setNumVivos(animalesRef.current.filter(a => a.estado !== 'muerto').length);
  }, []);

  // ── Agregar ────────────────────────────────────────────────────────────────
  const agregar = useCallback((nombre: string, tipo: TipoAnimal) => {
    const el = areaRef.current;
    if (!el) return;
    const { offsetWidth: bW, offsetHeight: bH } = el;
    const minY = bH * 0.56, maxY = bH * 0.80;

    const a: Animal = {
      id:      uid(),
      tipo, nombre,
      x:       bW * 0.05 + Math.random() * bW * 0.85,
      y:       minY + Math.random() * (maxY - minY),
      vx:      (Math.random() - 0.5) * 1.5,
      vy:      (Math.random() - 0.5) * 0.5,
      size:    TAMAÑO_BASE[tipo],
      estado:  'libre',
      objetivo: null,
      timer:   0,
    };
    animalesRef.current.push(a);
    sync();
  }, [areaRef, sync]);

  // ── Eliminar ───────────────────────────────────────────────────────────────
  const eliminar = useCallback((id: string) => {
    const a = animalesRef.current.find(x => x.id === id);
    if (!a || a.estado === 'muerto') return;
    a.estado = 'muerto';
    setTimeout(() => {
      animalesRef.current = animalesRef.current.filter(x => x.id !== id);
      sync();
    }, 400);
    sync();
  }, [sync]);

  const limpiar = useCallback(() => {
    animalesRef.current = [];
    setNumVivos(0);
    setNumMuertos(0);
    sync();
  }, [sync]);

  // ── Forzar caza ────────────────────────────────────────────────────────────
  const forzarCaza = useCallback((cazadorId: string, presaId: string) => {
    const c = animalesRef.current.find(a => a.id === cazadorId);
    const p = animalesRef.current.find(a => a.id === presaId);
    if (!c || !p) return;
    c.objetivo = p.id;
    c.estado   = 'cazando';
  }, []);

  // ── Game loop ──────────────────────────────────────────────────────────────
  useEffect(() => {
    function loop() {
      const el = areaRef.current;
      if (!el) { rafRef.current = requestAnimationFrame(loop); return; }
      const { offsetWidth: bW, offsetHeight: bH } = el;
      const minY = bH * 0.55, maxY = bH * 0.82;
      const vivos = animalesRef.current.filter(a => a.estado !== 'muerto');
      let changed = false;

      vivos.forEach(a => {
        const presas = CADENA[a.tipo];

        // Buscar presa cercana
        if (presas && a.estado !== 'cazando') {
          let nearest: Animal | null = null, dMin = Infinity;
          vivos.forEach(b => {
            if (b === a || !presas.includes(b.tipo)) return;
            const d = dist(a, b);
            if (d < (RANGO_CAZA[a.tipo] ?? 150) && d < dMin) { dMin = d; nearest = b; }
          });
          if (nearest) { a.objetivo = (nearest as Animal).id; a.estado = 'cazando'; changed = true; }
        }

        // Huir si no está cazando
        if (a.estado !== 'cazando') {
          let amenaza: Animal | null = null, dMin = Infinity;
          vivos.forEach(b => {
            if (b === a) return;
            if (!(CADENA[b.tipo] ?? []).includes(a.tipo)) return;
            const d = dist(a, b);
            const r = RANGO_HUIDA[a.tipo] ?? 120;
            if (d < r && d < dMin) { dMin = d; amenaza = b; }
          });
          if (amenaza) {
            a.estado = 'huyendo';
            const dx = a.x - (amenaza as Animal).x, dy = a.y - (amenaza as Animal).y;
            const mag = Math.sqrt(dx * dx + dy * dy) || 1;
            a.vx = dx / mag * VELOCIDAD[a.tipo] * 1.6;
            a.vy = dy / mag * VELOCIDAD[a.tipo] * 0.8;
            changed = true;
          } else if (a.estado === 'huyendo') {
            a.estado = 'libre'; changed = true;
          }
        }

        // Moverse hacia objetivo
        if (a.estado === 'cazando' && a.objetivo) {
          const presa = vivos.find(x => x.id === a.objetivo);
          if (presa) {
            const dx = presa.x - a.x, dy = presa.y - a.y;
            const d = Math.sqrt(dx * dx + dy * dy) || 1;
            const vel = VELOCIDAD[a.tipo] * 2.2;
            a.vx = dx / d * vel; a.vy = dy / d * vel * 0.6;
            if (d < 40) {
              // ¡Comer!
              presa.estado = 'muerto';
              a.estado = 'libre'; a.objetivo = null;
              a.size = Math.min(a.size + 6, TAMAÑO_BASE[a.tipo] * 1.8);
              onCaza?.(a, presa);
              setTimeout(() => {
                animalesRef.current = animalesRef.current.filter(x => x.id !== presa.id);
                setNumMuertos(m => m + 1);
                sync();
              }, 700);
              changed = true;
            }
          } else {
            a.estado = 'libre'; a.objetivo = null; changed = true;
          }
        }

        // Movimiento libre
        if (a.estado === 'libre') {
          a.timer++;
          if (a.timer % 80 === 0) {
            a.vx = (Math.random() - 0.5) * VELOCIDAD[a.tipo] * 2;
            a.vy = (Math.random() - 0.5) * VELOCIDAD[a.tipo] * 0.8;
          }
          a.vx *= 0.98; a.vy *= 0.98;
        }

        a.x = Math.max(20, Math.min(bW - 60, a.x + a.vx));
        a.y = Math.max(minY, Math.min(maxY, a.y + a.vy));
        changed = true;
      });

      if (changed) sync();
      rafRef.current = requestAnimationFrame(loop);
    }

    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [areaRef, onCaza, sync]);

  return { animales, numVivos, numMuertos, agregar, eliminar, limpiar, forzarCaza };
}