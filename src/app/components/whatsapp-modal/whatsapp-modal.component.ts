import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WhatsAppContact } from '../../interfaces/raffle.interface';
import { RaffleService } from '../../services/raffle.service';

@Component({
  selector: 'app-whatsapp-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="modal-overlay" (click)="onClose()" *ngIf="isOpen">
      <div class="modal-content" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h3>Contactar para el Número {{selectedNumber}}</h3>
          <button class="close-button" (click)="onClose()">&times;</button>
        </div>
        <div class="modal-body">
          <p class="modal-description">Selecciona con quién deseas contactarte por WhatsApp:</p>
          <div class="contacts-grid">
            <button 
              *ngFor="let contact of contacts" 
              class="contact-button"
              (click)="openWhatsApp(contact)">
              <div class="contact-icon">💬</div>
              <div class="contact-name">{{contact.nombre}}</div>
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.8);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      padding: 20px;
    }

    .modal-content {
      background: linear-gradient(135deg, #0a67c3 0%, #0b4aa6 100%);
      border-radius: 16px;
      border: 2px solid rgba(255, 255, 255, 0.18);
      max-width: 400px;
      width: 100%;
      max-height: 90vh;
      overflow-y: auto;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
      animation: modalAppear 0.3s ease-out;
    }

    @keyframes modalAppear {
      from {
        opacity: 0;
        transform: scale(0.8) translateY(-50px);
      }
      to {
        opacity: 1;
        transform: scale(1) translateY(0);
      }
    }

    .modal-header {
      padding: 24px 24px 16px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid rgba(255, 255, 255, 0.18);
    }

    .modal-header h3 {
      margin: 0;
      color: #ffffff;
      font-size: 1.25rem;
      font-weight: 600;
    }

    .close-button {
      background: none;
      border: none;
      color: #ffffff;
      font-size: 28px;
      cursor: pointer;
      padding: 0;
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      transition: background-color 0.2s ease;
    }

    .close-button:hover {
      background: rgba(255, 255, 255, 0.1);
    }

    .modal-body {
      padding: 24px;
    }

    .modal-description {
      color: #e6f0ff;
      margin: 0 0 24px;
      text-align: center;
      font-size: 1rem;
      line-height: 1.5;
    }

    .contacts-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
      gap: 16px;
    }

    .contact-button {
      background: linear-gradient(135deg, #08306b 0%, #0d3b8a 100%);
      border: 2px solid rgba(255, 255, 255, 0.18);
      border-radius: 12px;
      padding: 20px 16px;
      color: #ffffff;
      cursor: pointer;
      transition: all 0.3s ease;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
      min-height: 100px;
    }

    .contact-button:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
      border-color: rgba(255, 255, 255, 0.3);
      background: linear-gradient(135deg, #0a4c8a 0%, #1147a3 100%);
    }

    .contact-button:active {
      transform: translateY(0);
    }

    .contact-icon {
      font-size: 24px;
      margin-bottom: 4px;
    }

    .contact-name {
      font-weight: 600;
      font-size: 1rem;
      text-align: center;
    }

    @media (max-width: 480px) {
      .modal-content {
        margin: 10px;
        max-width: none;
        width: calc(100% - 20px);
      }

      .modal-header {
        padding: 20px 20px 16px;
      }

      .modal-header h3 {
        font-size: 1.1rem;
      }

      .modal-body {
        padding: 20px;
      }

      .contacts-grid {
        grid-template-columns: 1fr;
        gap: 12px;
      }

      .contact-button {
        padding: 16px;
        min-height: 80px;
      }
    }
  `]
})
export class WhatsAppModalComponent {
  @Input() isOpen = false;
  @Input() selectedNumber = 0;
  @Output() close = new EventEmitter<void>();

  contacts: WhatsAppContact[] = [];

  constructor(private raffleService: RaffleService) {
    this.contacts = this.raffleService.getWhatsAppContacts();
  }

  onClose(): void {
    this.close.emit();
  }

  openWhatsApp(contact: WhatsAppContact): void {
    const message = this.raffleService.generateWhatsAppMessage(this.selectedNumber, contact.nombre);
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${contact.numero}?text=${encodedMessage}`;
    
    window.open(whatsappUrl, '_blank');
    this.onClose();
  }
}