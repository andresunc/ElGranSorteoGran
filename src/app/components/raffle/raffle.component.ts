import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { RaffleService } from '../../services/raffle.service';
import { WhatsAppModalComponent } from '../whatsapp-modal/whatsapp-modal.component';
import { PrizesModalComponent } from '../prizes-modal/prizes-modal.component';
import { ParsedTicket, RaffleStats } from '../../interfaces/raffle.interface';

@Component({
  selector: 'app-raffle',
  standalone: true,
  imports: [CommonModule, WhatsAppModalComponent, PrizesModalComponent],
  template: `
    <div class="raffle-container">
      <!-- Header -->
      <header class="header">
        <div class="header-content">
          <h1 class="title">El Gran Premio Gran 🏆</h1>
          <p class="subtitle">Números Disponibles</p>
          <button class="prizes-button" (click)="openPrizesModal()">
            🏆 Ver Premios y Resultados
          </button>
        </div>
      </header>

      <!-- Stats Bar -->
      <section class="stats-section">
        <div class="stats-container">
          <div class="stats-grid">
            <div class="stat-item disponible">
              <div class="stat-number">{{stats.disponibles}}</div>
              <div class="stat-label">Disponibles</div>
            </div>
            <div class="stat-item vendido">
              <div class="stat-number">{{stats.vendidos}}</div>
              <div class="stat-label">Vendidos</div>
            </div>
            <div class="stat-item reservado">
              <div class="stat-number">{{stats.reservados}}</div>
              <div class="stat-label">Reservados</div>
            </div>
            <div class="stat-item total">
              <div class="stat-number">{{stats.total}}</div>
              <div class="stat-label">Total</div>
            </div>
          </div>
          <div class="last-update">
            <div class="update-indicator" [class.loading]="isLoading">
              <span class="update-icon">🔄</span>
            </div>
            <span class="update-text">
              Última actualización: {{stats.ultimaActualizacion | date:'HH:mm:ss'}}
            </span>
          </div>
        </div>
      </section>

      <!-- Legend -->
      <section class="legend-section">
        <div class="legend-container">
          <div class="legend-item">
            <div class="legend-color disponible"></div>
            <span>Disponible</span>
          </div>
          <div class="legend-item">
            <div class="legend-color reservado"></div>
            <span>Reservado</span>
          </div>
          <div class="legend-item">
            <div class="legend-color vendido"></div>
            <span>Vendido</span>
          </div>
        </div>
      </section>

      <!-- Error Message -->
      <div class="error-message" *ngIf="errorMessage">
        <div class="error-content">
          <span class="error-icon">⚠️</span>
          <span>{{errorMessage}}</span>
          <button class="retry-button" (click)="retry()">Reintentar</button>
        </div>
      </div>

      <!-- Numbers Grid -->
      <main class="grid-section">
        <div class="grid-container">
          <div class="numbers-grid">
            <button
              *ngFor="let ticket of tickets"
              class="number-button"
              [class.disponible]="ticket.estado === 'disponible'"
              [class.reservado]="ticket.estado === 'reservado'"
              [class.vendido]="ticket.estado === 'vendido'"
              [disabled]="ticket.estado !== 'disponible'"
              (click)="openWhatsAppModal(ticket.numero)">
              {{ticket.numero}}
            </button>
          </div>
        </div>
      </main>

      <!-- Loading Overlay -->
      <div class="loading-overlay" *ngIf="isLoading && tickets.length === 0">
        <div class="loading-spinner"></div>
        <p>Cargando números...</p>
      </div>
    </div>

    <!-- WhatsApp Modal -->
    <app-whatsapp-modal
      [isOpen]="showWhatsAppModal"
      [selectedNumber]="selectedNumber"
      (close)="closeWhatsAppModal()">
    </app-whatsapp-modal>

    <!-- Prizes Modal -->
    <app-prizes-modal
      [isOpen]="showPrizesModal"
      (close)="closePrizesModal()">
    </app-prizes-modal>
  `,
  styles: [`
    .raffle-container {
      min-height: 100vh;
      background: linear-gradient(135deg, #ebcbcb 0%, #c9d4e5 100%);
    }

    /* Header */
    .header {
      background: linear-gradient(135deg, #0d3b8a 0%, #0a67c3 100%);
      padding: 24px 0;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
    }

    .header-content {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 20px;
      text-align: center;
    }

    .title {
      color: #ffffff;
      font-size: 2.5rem;
      font-weight: 700;
      margin: 0 0 8px;
      text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
    }

    .subtitle {
      color: #e6f0ff;
      font-size: 1.25rem;
      margin: 0 0 16px;
      font-weight: 400;
    }

    .prizes-button {
      background: linear-gradient(135deg, #ffc107 0%, #ffb300 100%);
      border: 2px solid rgba(255, 255, 255, 0.3);
      color: #000000;
      font-size: 1rem;
      font-weight: 700;
      padding: 12px 24px;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.3s ease;
      box-shadow: 0 4px 15px rgba(255, 193, 7, 0.3);
      text-shadow: 0 1px 2px rgba(255, 255, 255, 0.5);
    }

    .prizes-button:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(255, 193, 7, 0.4);
      border-color: rgba(255, 255, 255, 0.5);
    }

    /* Stats Section */
    .stats-section {
      padding: 24px 0;
    }

    .stats-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 20px;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;
      margin-bottom: 20px;
    }

    .stat-item {
      background: #0a67c3;
      border: 2px solid rgba(255, 255, 255, 0.18);
      border-radius: 12px;
      padding: 20px;
      text-align: center;
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
    }

    .stat-number {
      font-size: 2rem;
      font-weight: 700;
      color: #ffffff;
      line-height: 1;
      margin-bottom: 8px;
    }

    .stat-label {
      color: #e6f0ff;
      font-size: 0.875rem;
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .stat-item.disponible {
      background: linear-gradient(135deg, #00b8a9 0%, #00e6ff 100%);
    }

    .stat-item.reservado {
      background: linear-gradient(135deg, #ffc107 0%, #ffb300 100%);
    }

    .stat-item.vendido {
      background: linear-gradient(135deg, #6c757d 0%, #495057 100%);
    }

    .stat-item.total {
      background: linear-gradient(135deg, #0b4aa6 0%, #08306b 100%);
    }

    .last-update {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 12px;
      color: #08306b;
      font-size: 0.875rem;
    }

    .update-indicator {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 24px;
      height: 24px;
    }

    .update-indicator.loading .update-icon {
      animation: spin 1s linear infinite;
    }

    .update-icon {
      font-size: 16px;
      transition: transform 0.3s ease;
    }

    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }

    /* Legend */
    .legend-section {
      padding: 0 0 24px;
    }

    .legend-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 20px;
      display: flex;
      justify-content: center;
      gap: 32px;
      flex-wrap: wrap;
    }

    .legend-item {
      display: flex;
      align-items: center;
      gap: 8px;
      color: #08306b;
      font-weight: 600;
      font-size: 0.875rem;
    }

    .legend-color {
      width: 20px;
      height: 20px;
      border-radius: 4px;
      border: 2px solid rgba(255, 255, 255, 0.18);
    }

    .legend-color.disponible {
      background: #00e6ff;
    }

    .legend-color.reservado {
      background: #ffc107;
    }

    .legend-color.vendido {
      background: #6c757d;
    }

    /* Error Message */
    .error-message {
      max-width: 1200px;
      margin: 0 auto 24px;
      padding: 0 20px;
    }

    .error-content {
      background: #dc3545;
      color: #ffffff;
      padding: 16px 20px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      gap: 12px;
      box-shadow: 0 4px 15px rgba(220, 53, 69, 0.3);
    }

    .error-icon {
      font-size: 20px;
    }

    .retry-button {
      background: rgba(255, 255, 255, 0.2);
      border: 1px solid rgba(255, 255, 255, 0.3);
      color: #ffffff;
      padding: 8px 16px;
      border-radius: 6px;
      cursor: pointer;
      font-size: 0.875rem;
      font-weight: 600;
      margin-left: auto;
      transition: background-color 0.2s ease;
    }

    .retry-button:hover {
      background: rgba(255, 255, 255, 0.3);
    }

    /* Numbers Grid */
    .grid-section {
      padding-bottom: 40px;
    }

    .grid-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 20px;
    }

    .numbers-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(60px, 1fr));
      gap: 8px;
      max-width: 100%;
    }

    .number-button {
      aspect-ratio: 1;
      border: 2px solid rgba(255, 255, 255, 0.18);
      border-radius: 8px;
      font-size: 1rem;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 60px;
      color: #ffffff;
    }

    .number-button.disponible {
      background: #00e6ff;
      box-shadow: 0 4px 15px rgba(0, 230, 255, 0.3);
    }

    .number-button.disponible:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(0, 230, 255, 0.4);
      border-color: rgba(255, 255, 255, 0.4);
    }

    .number-button.reservado {
      background: #ffc107;
      cursor: not-allowed;
      opacity: 0.8;
      color: #000000;
    }

    .number-button.vendido {
      background: #6c757d;
      cursor: not-allowed;
      opacity: 0.7;
    }

    .number-button:disabled {
      cursor: not-allowed;
    }

    /* Loading Overlay */
    .loading-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.8);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      z-index: 999;
      color: #ffffff;
    }

    .loading-spinner {
      width: 50px;
      height: 50px;
      border: 4px solid rgba(255, 255, 255, 0.3);
      border-top: 4px solid #00e6ff;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin-bottom: 20px;
    }

    /* Responsive Design */
    @media (max-width: 768px) {
      .title {
        font-size: 2rem;
      }

      .subtitle {
        font-size: 1.125rem;
      }

      .prizes-button {
        font-size: 0.9rem;
        padding: 10px 20px;
      }

      .stats-grid {
        grid-template-columns: repeat(2, 1fr);
        gap: 12px;
      }

      .legend-container {
        gap: 20px;
      }

      .numbers-grid {
        grid-template-columns: repeat(auto-fill, minmax(50px, 1fr));
        gap: 6px;
      }

      .number-button {
        min-height: 50px;
        font-size: 0.875rem;
      }
    }

    @media (max-width: 480px) {
      .header {
        padding: 20px 0;
      }

      .header-content,
      .stats-container,
      .grid-container {
        padding: 0 16px;
      }

      .title {
        font-size: 1.75rem;
      }

      .subtitle {
        font-size: 1rem;
      }

      .prizes-button {
        font-size: 0.85rem;
        padding: 8px 16px;
      }

      .stats-grid {
        grid-template-columns: 1fr;
        gap: 10px;
      }

      .stat-item {
        padding: 16px;
      }

      .legend-container {
        flex-direction: column;
        align-items: center;
        gap: 16px;
      }

      .numbers-grid {
        grid-template-columns: repeat(auto-fill, minmax(45px, 1fr));
        gap: 4px;
      }

      .number-button {
        min-height: 45px;
        font-size: 0.8rem;
      }
    }
  `]
})
export class RaffleComponent implements OnInit, OnDestroy {
  tickets: ParsedTicket[] = [];
  stats: RaffleStats = {
    disponibles: 0,
    vendidos: 0,
    reservados: 0,
    total: 0,
    ultimaActualizacion: new Date()
  };
  errorMessage: string | null = null;
  isLoading = false;
  showWhatsAppModal = false;
  selectedNumber = 0;
  showPrizesModal = false;

  private destroy$ = new Subject<void>();

  constructor(private raffleService: RaffleService) {}

  ngOnInit(): void {
    this.raffleService.tickets$
      .pipe(takeUntil(this.destroy$))
      .subscribe(tickets => {
        this.tickets = tickets;
      });

    this.raffleService.stats$
      .pipe(takeUntil(this.destroy$))
      .subscribe(stats => {
        this.stats = stats;
      });

    this.raffleService.error$
      .pipe(takeUntil(this.destroy$))
      .subscribe(error => {
        this.errorMessage = error;
      });

    this.raffleService.loading$
      .pipe(takeUntil(this.destroy$))
      .subscribe(loading => {
        this.isLoading = loading;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  openWhatsAppModal(numero: number): void {
    this.selectedNumber = numero;
    this.showWhatsAppModal = true;
  }

  closeWhatsAppModal(): void {
    this.showWhatsAppModal = false;
    this.selectedNumber = 0;
  }

  retry(): void {
    this.raffleService.refreshData();
  }

  openPrizesModal(): void {
    this.showPrizesModal = true;
  }

  closePrizesModal(): void {
    this.showPrizesModal = false;
  }
}