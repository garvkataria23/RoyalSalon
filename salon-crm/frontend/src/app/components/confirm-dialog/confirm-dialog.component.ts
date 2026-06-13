import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ConfirmService } from '../../services/confirm.service';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="luxury-form-overlay" *ngIf="confirmService.showConfirm">
      <div class="luxury-form-card confirm-dialog-card">
        <div class="confirm-icon">
          <span class="material-symbols-outlined">warning_amber</span>
        </div>
        <p class="confirm-message">{{ confirmService.message }}</p>
        <div class="actions" style="justify-content: center; gap: 1.5rem; margin-top: 2rem;">
          <button type="button" class="btn btn-secondary" (click)="confirmService.resolve(false)">
            Cancel
          </button>
          <button type="button" class="btn btn-danger" (click)="confirmService.resolve(true)">
            CONFIRM
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .confirm-dialog-card {
      max-width: 420px;
      text-align: center;
      padding: 3rem 2.5rem;
    }
    .confirm-icon span {
      font-size: 3.5rem;
      color: var(--danger);
      margin-bottom: 1rem;
    }
    .confirm-message {
      font-family: var(--font-heading);
      font-size: 1rem;
      color: var(--charcoal);
      line-height: 1.6;
      margin: 1rem 0 0;
    }
  `]
})
export class ConfirmDialogComponent {
  constructor(public confirmService: ConfirmService) {}
}
