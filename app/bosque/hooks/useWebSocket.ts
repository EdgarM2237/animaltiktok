'use client';
import { useEffect, useRef, useCallback, useState } from 'react';
import type { WsStatus, WsEvent } from '../lib/types';

interface Opts {
  onEvent: (e: WsEvent) => void;
}

export function useWebSocket({ onEvent }: Opts) {
  const wsRef     = useRef<WebSocket | null>(null);
  const [status, setStatus] = useState<WsStatus>('desconectado');
  const [logs,   setLogs  ] = useState<string[]>([]);

  const log = useCallback((msg: string) => {
    setLogs(p => [msg, ...p].slice(0, 30));
  }, []);

  const conectar = useCallback((url: string) => {
    if (wsRef.current) wsRef.current.close();
    setStatus('intentando');
    log(`🔌 Conectando a ${url}...`);

    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onopen = () => {
      setStatus('conectado');
      log('✅ Conectado');
    };

    ws.onmessage = (e) => {
      try {
        const data: WsEvent = JSON.parse(e.data);
        log(`📨 ${data.event}${data.giftName ? ` — ${data.giftName}` : ''}`);
        onEvent(data);
      } catch { log('⚠️ Mensaje no parseable'); }
    };

    ws.onerror = () => {
      setStatus('error');
      log('❌ Error de conexión');
    };

    ws.onclose = () => {
      setStatus('desconectado');
      log('🔴 Desconectado');
      wsRef.current = null;
    };
  }, [onEvent, log]);

  const desconectar = useCallback(() => {
    wsRef.current?.close();
  }, []);

  // Limpiar al desmontar
  useEffect(() => () => { wsRef.current?.close(); }, []);

  return { status, logs, conectar, desconectar };
}