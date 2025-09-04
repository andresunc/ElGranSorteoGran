export interface TicketItem {
  numero: string;
  disponible: boolean;
  reservado: boolean;
}

export interface TicketsResponse {
  ticketsDisponibles: string;
}

export interface ParsedTicket {
  numero: number;
  disponible: boolean;
  reservado: boolean;
  estado: 'disponible' | 'reservado' | 'vendido';
}

export interface RaffleStats {
  disponibles: number;
  vendidos: number;
  reservados: number;
  total: number;
  ultimaActualizacion: Date;
}

export interface WhatsAppContact {
  nombre: string;
  numero: string;
}

export interface Premio {
  id: number;
  titulo: string;
  descripcion: string;
  imagen: string;
}

export interface Ganador {
  numeroGanador: number;
  premio: Premio;
  nombre?: string;
  apellido?: string;
  fechaSorteo?: Date;
}

export interface SorteoData {
  nombreSorteo: string;
  linkSorteo: string;
  fechaSorteo: string;
  modalidad: string;
  sorteado: boolean;
}

export interface PremiosResponse {
  sPremio: string;
}