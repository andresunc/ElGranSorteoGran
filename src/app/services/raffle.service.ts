import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import {
  BehaviorSubject,
  Observable,
  timer,
  throwError,
  combineLatest,
} from 'rxjs';
import { catchError, switchMap, map, retry, tap } from 'rxjs/operators';
import {
  TicketsResponse,
  ParsedTicket,
  RaffleStats,
  WhatsAppContact,
  PremiosResponse,
  Premio,
  Ganador,
  SorteoData,
} from '../interfaces/raffle.interface';

@Injectable({
  providedIn: 'root',
})
export class RaffleService {
  private apiUrl =
    'https://test.bizuit.com/agarciaBIZUITDashboardAPI/api/RestFunction/rf_GetNumeros';
  private premiosApiUrl =
    'https://test.bizuit.com/agarciaBIZUITDashboardAPI/api/RestFunction/GetDataPremios';

  private ticketsSubject = new BehaviorSubject<ParsedTicket[]>([]);
  private statsSubject = new BehaviorSubject<RaffleStats>({
    disponibles: 0,
    vendidos: 0,
    reservados: 0,
    total: 0,
    ultimaActualizacion: new Date(),
  });
  private errorSubject = new BehaviorSubject<string | null>(null);
  private loadingSubject = new BehaviorSubject<boolean>(false);

  private premiosSubject = new BehaviorSubject<Premio[]>([]);
  private ganadoresSubject = new BehaviorSubject<Ganador[]>([]);
  private sorteoDataSubject = new BehaviorSubject<SorteoData | null>(null);
  private premiosErrorSubject = new BehaviorSubject<string | null>(null);
  private premiosLoadingSubject = new BehaviorSubject<boolean>(false);

  public tickets$ = this.ticketsSubject.asObservable();
  public stats$ = this.statsSubject.asObservable();
  public error$ = this.errorSubject.asObservable();
  public loading$ = this.loadingSubject.asObservable();

  public premios$ = this.premiosSubject.asObservable();
  public ganadores$ = this.ganadoresSubject.asObservable();
  public sorteoData$ = this.sorteoDataSubject.asObservable();
  public premiosError$ = this.premiosErrorSubject.asObservable();
  public premiosLoading$ = this.premiosLoadingSubject.asObservable();

  private whatsAppContacts: WhatsAppContact[] = [
    { nombre: 'Andrés', numero: '3512071483' },
    { nombre: 'Anita', numero: '+5493517303299' },
    { nombre: 'Vero', numero: '+5493513982122' },
    { nombre: 'Fabri', numero: '+5493543512573' },
    { nombre: 'Male', numero: '+5493543611259' },
    { nombre: 'Clau', numero: '+5493513740005' }
  ];

  constructor(private http: HttpClient) {
    this.startPolling();
    this.startPremiosPolling();
  }

  private startPolling(): void {
    timer(0, 30000)
      .pipe(switchMap(() => this.fetchTickets()))
      .subscribe();
  }

  private fetchTickets(): Observable<ParsedTicket[]> {
    this.loadingSubject.next(true);
    this.errorSubject.next(null);

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Accept: 'application/json',
    });

    return this.http.post<TicketsResponse>(this.apiUrl, {}, { headers }).pipe(
      retry(2),
      map((response) => this.parseTicketsResponse(response)),
      catchError((error) => {
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
          if (reservado) {
            estado = 'reservado';
          } else if (disponible) {
            estado = 'disponible';
          } else {
            estado = 'vendido';
          }

          tickets.push({
            numero,
            disponible,
            reservado,
            estado,
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
      disponibles: tickets.filter((t) => t.estado === 'disponible').length,
      reservados: tickets.filter((t) => t.estado === 'reservado').length,
      vendidos: tickets.filter((t) => t.estado === 'vendido').length,
      total: tickets.length,
      ultimaActualizacion: new Date(),
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
    this.fetchPremios().subscribe();
  }

  private startPremiosPolling(): void {
    timer(0, 60000)
      .pipe(switchMap(() => this.fetchPremios()))
      .subscribe();
  }

  private fetchPremios(): Observable<any> {
    this.premiosLoadingSubject.next(true);
    this.premiosErrorSubject.next(null);

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Accept: 'application/json',
    });

    return this.http
      .post<PremiosResponse>(this.premiosApiUrl, {}, { headers })
      .pipe(
        retry(2),
        map((response) => this.parsePremiosResponse(response)),
        catchError((error) => {
          this.premiosLoadingSubject.next(false);
          const errorMessage = this.handleError(error);
          this.premiosErrorSubject.next(errorMessage);
          return throwError(() => error);
        })
      );
  }

  private parsePremiosResponse(response: PremiosResponse): void {
    try {
      const xmlString = response.sPremio;
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xmlString, 'text/xml');

      // Parsear datos del sorteo
      const nombreSorteo =
        xmlDoc.getElementsByTagName('NombreSorteo')[0]?.textContent || '';
      const linkSorteo =
        xmlDoc.getElementsByTagName('LinkSorteo')[0]?.textContent || '';
      const fechaSorteo =
        xmlDoc.getElementsByTagName('FechaSorteo')[0]?.textContent || '';
      const modalidad =
        xmlDoc.getElementsByTagName('Modalidad')[0]?.textContent || '';
      const sorteado =
        xmlDoc.getElementsByTagName('Sorteado')[0]?.textContent === 'true';

      const sorteoData: SorteoData = {
        nombreSorteo,
        linkSorteo,
        fechaSorteo,
        modalidad,
        sorteado,
      };

      // Parsear premios
      const premiosElements = xmlDoc.getElementsByTagName('premio');
      const premios: Premio[] = [];

      for (let i = 0; i < premiosElements.length; i++) {
        const premioElement = premiosElements[i];
        const id = parseInt(
          premioElement.getElementsByTagName('id')[0]?.textContent || '0'
        );
        const titulo =
          premioElement.getElementsByTagName('Titulo')[0]?.textContent || '';
        const descripcion =
          premioElement.getElementsByTagName('Descripcion')[0]?.textContent ||
          '';
        const imagen =
          premioElement.getElementsByTagName('ImagenURL')[0]?.textContent || '';

        premios.push({ id, titulo, descripcion, imagen });
      }

      // Parsear ganadores
      const ganadoresElements = xmlDoc.getElementsByTagName('ganador');
      const ganadores: Ganador[] = [];

      for (let i = 0; i < ganadoresElements.length; i++) {
        const ganadorElement = ganadoresElements[i];
        const numeroGanador = parseInt(
          ganadorElement.getElementsByTagName('NumeroGanador')[0]
            ?.textContent || '0'
        );
        const idPremio = parseInt(
          ganadorElement.getElementsByTagName('idPremio')[0]?.textContent || '0'
        );
        const nombre =
          ganadorElement.getElementsByTagName('NombreGanador')[0]
            ?.textContent || '';
        const apellido =
          ganadorElement.getElementsByTagName('ApellidoGanador')[0]
            ?.textContent || '';

        const premio = premios.find((p) => p.id === idPremio);
        if (premio) {
          ganadores.push({
            numeroGanador,
            premio,
            nombre,
            apellido,
            fechaSorteo: sorteoData.sorteado
              ? new Date(fechaSorteo)
              : undefined,
          });
        }
      }

      this.sorteoDataSubject.next(sorteoData);
      this.premiosSubject.next(premios);
      this.ganadoresSubject.next(ganadores);
      this.premiosLoadingSubject.next(false);
    } catch (error) {
      this.premiosLoadingSubject.next(false);
      this.premiosErrorSubject.next('Error al procesar los datos de premios');
      throw error;
    }
  }
}
