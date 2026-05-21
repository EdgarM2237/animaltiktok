'use client';
import { EMOJIS } from '../hooks/useAnimales';
import type { Animal as AnimalType } from '../lib/types';

interface Props {
  animal: AnimalType;
  onClick: (id: string) => void;
  resaltado?: boolean;
}

export default function Animal({ animal, onClick, resaltado }: Props) {
  if (animal.estado === 'muerto') return null;

  const flipped = animal.vx < -0.2;

  return (
    <div
      onClick={() => onClick(animal.id)}
      className="absolute flex flex-col items-center cursor-pointer select-none"
      style={{
        left: animal.x,
        top:  animal.y,
        zIndex: Math.round(10 + (animal.y / 800) * 20),
        outline: resaltado ? '2px solid #ff6b35' : 'none',
        outlineOffset: resaltado ? '3px' : '0',
        transition: 'outline 0.15s',
      }}
    >
      <span
        style={{
          fontSize: animal.size,
          transform: flipped ? 'scaleX(-1)' : 'scaleX(1)',
          display: 'inline-block',
          transition: 'transform 0.1s',
        }}
      >
        {EMOJIS[animal.tipo]}
      </span>
      <span className="text-xs text-white bg-black/60 backdrop-blur px-2 py-0.5 rounded-full border border-white/20 mt-0.5 whitespace-nowrap">
        {animal.nombre}
      </span>
    </div>
  );
}