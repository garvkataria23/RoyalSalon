import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="toast-container">
      <div *ngFor="let toast of toastService.toasts | async" 
           [class]="'toast ' + toast.type"
           (click)="toastService.remove(toast.id)">
        <span class="material-symbols-outlined">
          {{ toast.type === 'success' ? 'check_circle' : toast.type === 'error' ? 'error' : 'info' }}
        </span>
        <span class="message">{{ toast.message }}</span>
      </div>
    </div>
  `,
  styles: [`
    .toast-container {
      position: fixed;
      top: 2rem;
      right: 2rem;
      z-index: 9999;
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }
    .toast {
      padding: 1rem 1.5rem;
      background: var(--charcoal);
      color: var(--white);
      border: 1px solid var(--gold);
      display: flex;
      align-items: center;
      gap: 1rem;
      box-shadow: var(--shadow-gold);
      cursor: pointer;
      animation: slideIn 0.3s ease-out;
      min-width: 300px;
    }
    .toast.success { border-left: 4px solid var(--gold); }
    .toast.error { border-left: 4px solid var(--danger); }
    .toast.info { border-left: 4px solid #3b82f6; }
    .message { font-size: 0.85rem; font-weight: 500; letter-spacing: 0.05em; text-transform: uppercase; }
    @keyframes slideIn {
      from { transform: translateX(100%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
  `]
})
export class ToastComponent {
  constructor(public toastService: ToastService) {}
}
