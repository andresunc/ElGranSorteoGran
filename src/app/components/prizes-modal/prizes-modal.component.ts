import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Premio, Ganador, SorteoData } from '../../interfaces/raffle.interface';
import { RaffleService } from '../../services/raffle.service';

@Component({
  selector: 'app-prizes-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './prizes-modal.component.html',
  styleUrl: './prizes-modal.component.css'
})
export class PrizesModalComponent implements OnInit, OnDestroy {
  @Input() isOpen = false;
  @Output() close = new EventEmitter<void>();

  premios: Premio[] = [];
  ganadores: Ganador[] = [];
  sorteoData: SorteoData | null = null;
  isLoading = false;
  errorMessage: string | null = null;

  private destroy$ = new Subject<void>();

  constructor(private raffleService: RaffleService) {}

  ngOnInit(): void {
    // Suscribirse a los datos de premios
    this.raffleService.premios$
      .pipe(takeUntil(this.destroy$))
      .subscribe(premios => {
        this.premios = premios;
      });

    // Suscribirse a los datos de ganadores
    this.raffleService.ganadores$
      .pipe(takeUntil(this.destroy$))
      .subscribe(ganadores => {
        this.ganadores = ganadores;
      });

    // Suscribirse a los datos del sorteo
    this.raffleService.sorteoData$
      .pipe(takeUntil(this.destroy$))
      .subscribe(sorteoData => {
        this.sorteoData = sorteoData;
      });

    // Suscribirse al estado de carga
    this.raffleService.premiosLoading$
      .pipe(takeUntil(this.destroy$))
      .subscribe(loading => {
        this.isLoading = loading;
      });

    // Suscribirse a errores
    this.raffleService.premiosError$
      .pipe(takeUntil(this.destroy$))
      .subscribe(error => {
        this.errorMessage = error;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  get sorteoRealizado(): boolean {
    return this.sorteoData?.sorteado || false;
  }

  closeModal(): void {
    this.close.emit();
  }

  onOverlayClick(event: Event): void {
    if (event.target === event.currentTarget) {
      this.closeModal();
    }
  }

  retry(): void {
    this.raffleService.refreshData();
  }

  get nombreSorteo(): string {
    return this.sorteoData?.nombreSorteo || 'El Gran Sorteo Gran';
  }

  get fechaSorteo(): string {
    return this.sorteoData?.fechaSorteo || '';
  }

  get fechaSorteoFormateada(): string {
    if (!this.sorteoData?.fechaSorteo) return '';
    
    try {
      const fecha = new Date(this.sorteoData.fechaSorteo);
      const day = fecha.getDate().toString().padStart(2, '0');
      const month = (fecha.getMonth() + 1).toString().padStart(2, '0');
      const year = fecha.getFullYear();
      const hours = fecha.getHours().toString().padStart(2, '0');
      const minutes = fecha.getMinutes().toString().padStart(2, '0');
      
      return `${day}/${month}/${year} ${hours}:${minutes}`;
    } catch (error) {
      return this.sorteoData.fechaSorteo;
    }
  }

  get modalidad(): string {
    return this.sorteoData?.modalidad || '';
  }

  get linkSorteo(): string {
    return this.sorteoData?.linkSorteo || '';
  }

  openLiveSorteo(): void {
    const link = this.linkSorteo;

    // Si no hay link o es "_blank", mostrar modal informativo
    if (!link || link.trim() === '' || link.trim() === '_blank') {
      this.mostrarModalInfoSorteo();
      return;
    }

    // Si hay un link válido, abrirlo
    window.open(link, '_blank', 'noopener,noreferrer');
  }

  mostrarModalInfoSorteo(): void {
    const mensaje = `🎬 ¡Acceso al Sorteo en Vivo!

📅 El enlace se habilitará el día del sorteo: ${this.fechaSorteoFormateada}
🎲 Modalidad: ${this.modalidad}

⏰ Una vez que comience la transmisión en vivo, podrás acceder directamente desde este botón.

🏆 ¡No te lo pierdas! Los ganadores se determinarán en tiempo real.`;

    alert(mensaje);
  }

  get ganadoresOrdenados(): Ganador[] {
    return [...this.ganadores].sort((a, b) => a.premio.id - b.premio.id);
  }
}