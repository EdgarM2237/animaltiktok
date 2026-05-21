export type TipoAnimal = 'conejo' | 'ciervo' | 'zorro' | 'lobo' | 'oso';

export interface Animal {
  id:      string;
  tipo:    TipoAnimal;
  nombre:  string;
  x:       number;
  y:       number;
  vx:      number;
  vy:      number;
  size:    number;
  estado:  'libre' | 'cazando' | 'huyendo' | 'muerto';
  objetivo: string | null; // id del animal objetivo
  timer:   number;
}

export interface ReglaRegalo {
  regalo:   string;
  animal:   TipoAnimal;
  cantidad: number;
}

export type WsStatus = 'desconectado' | 'intentando' | 'conectado' | 'error';

export interface WsEvent {
  event:       string;
  giftName?:   string;
  senderName?: string;
  uniqueId?:   string;
  amount?:     number;
  comment?:    string;
  likeCount?:  number;
  status?:     string;
  roomId?:     string;
  message?:    string;
}