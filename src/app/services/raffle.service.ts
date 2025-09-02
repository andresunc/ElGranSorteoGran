import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, timer, throwError } from 'rxjs';
import { catchError, switchMap, map, retry } from 'rxjs/operators';
import { TicketsResponse, ParsedTicket, RaffleStats, WhatsAppContact } from '../interfaces/raffle.interface';

@Injectable({
  providedIn: 'root'
})
export class RaffleService {
  private apiUrl = 'https://test.bizuit.com/agarciaBIZUITDashboardAPI/api/RestFunction/rf_GetNumeros';
  private ticketsSubject = new BehaviorSubject<ParsedTicket[]>([]);
  private statsSubject = new BehaviorSubject<RaffleStats>({
    disponibles: 0,
    vendidos: 0,
    reservados: 0,
    total: 0,
    ultimaActualizacion: new Date()
  });
  private errorSubject = new BehaviorSubject<string | null>(null);
  private loadingSubject = new BehaviorSubject<boolean>(false);

  public tickets$ = this.ticketsSubject.asObservable();
  public stats$ = this.statsSubject.asObservable();
  public error$ = this.errorSubject.asObservable();
  public loading$ = this.loadingSubject.asObservable();

  private whatsAppContacts: WhatsAppContact[] = [
    { nombre: 'Andrés', numero: '3512071483' },
    { nombre: 'Anita', numero: '+5493517303299' },
    { nombre: 'Vero', numero: '+5493513982122' }
  ];

  constructor(private http: HttpClient) {
    this.startPolling();
  }

  private startPolling(): void {
    timer(0, 30000)
      .pipe(
        switchMap(() => this.fetchTickets())
      )
      .subscribe();
  }

  private fetchTickets(): Observable<ParsedTicket[]> {
    this.loadingSubject.next(true);
    this.errorSubject.next(null);

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    });

    return this.http.post<TicketsResponse>(this.apiUrl, {}, { headers })
      .pipe(
        retry(2),
        map(response => this.parseTicketsResponse(response)),
        catchError(error => {
          this.loadingSubject.next(false);
          const errorMessage = this.handleError(error);
          this.errorSubject.next(errorMessage);
          return throwError(() => error);
        })
      );
  }

  private parseTicketsResponse(response: TicketsResponse): ParsedTicket[] {
    try {
      const xmlString = response.ticketsDisponibles;
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xmlString, 'text/xml');
      
      const items = xmlDoc.getElementsByTagName('item');
      const tickets: ParsedTicket[] = [];

      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        const numeroElement = item.getElementsByTagName('numero')[0];
        const disponibleElement = item.getElementsByTagName('disponible')[0];
        const reservadoElement = item.getElementsByTagName('reservado')[0];

        if (numeroElement && disponibleElement && reservadoElement) {
          const numero = parseInt(numeroElement.textContent || '0');
          const disponible = disponibleElement.textContent === 'true';
          const reservado = reservadoElement.textContent === 'true';

          let estado: 'disponible' | 'reservado' | 'vendido';
          if (disponible) {
            estado = 'disponible';
          } else if (reservado) {
            estado = 'reservado';
          } else {
            estado = 'vendido';
          }

          tickets.push({
            numero,
            disponible,
            reservado,
            estado
          });
        }
      }

      tickets.sort((a, b) => a.numero - b.numero);
      
      this.ticketsSubject.next(tickets);
      this.updateStats(tickets);
      this.loadingSubject.next(false);
      
      return tickets;
    } catch (error) {
      this.loadingSubject.next(false);
      this.errorSubject.next('Error al procesar los datos del servidor');
      throw error;
    }
  }

  private updateStats(tickets: ParsedTicket[]): void {
    const stats: RaffleStats = {
      disponibles: tickets.filter(t => t.estado === 'disponible').length,
      reservados: tickets.filter(t => t.estado === 'reservado').length,
      vendidos: tickets.filter(t => t.estado === 'vendido').length,
      total: tickets.length,
      ultimaActualizacion: new Date()
    };

    this.statsSubject.next(stats);
  }

  private handleError(error: any): string {
    if (error.status === 0) {
      return 'Error de conexión. Verificar conectividad a internet.';
    } else if (error.status >= 400 && error.status < 500) {
      return 'Error en la solicitud. Contactar al administrador.';
    } else if (error.status >= 500) {
      return 'Error del servidor. Intente nuevamente más tarde.';
    }
    return 'Error inesperado. Intente nuevamente.';
  }

  public getWhatsAppContacts(): WhatsAppContact[] {
    return this.whatsAppContacts;
  }

  public generateWhatsAppMessage(numero: number, contacto: string): string {
    return `¡Hola ${contacto}! Me interesa el número ${numero} de la rifa 'El Gran Premio Gran'. ¿Está disponible?`;
  }

  public refreshData(): void {
    this.fetchTickets().subscribe();
  }
}