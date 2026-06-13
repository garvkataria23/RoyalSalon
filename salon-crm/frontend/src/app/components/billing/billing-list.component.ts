import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AppointmentService } from '../../services/appointment.service';

@Component({
  selector: 'app-billing-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-container fade-in">
      <div class="page-header">
        <h2>Financial Ledger</h2>
      </div>

      <div class="stats-row">
        <div class="stat-mini">
          <span class="stat-mini-val">₹{{totalRevenue}}</span>
          <span class="stat-mini-lbl">Total Revenue</span>
        </div>
        <div class="stat-mini">
          <span class="stat-mini-val">₹{{completedRevenue}}</span>
          <span class="stat-mini-lbl">Completed</span>
        </div>
        <div class="stat-mini">
          <span class="stat-mini-val">{{totalInvoices}}</span>
          <span class="stat-mini-lbl">Invoices</span>
        </div>
        <div class="stat-mini">
          <span class="stat-mini-val">{{paidCount}}</span>
          <span class="stat-mini-lbl">Paid</span>
        </div>
      </div>

      <div class="filter-bar">
        <span class="material-symbols-outlined filter-icon">search</span>
        <input type="text" class="filter-input" [(ngModel)]="filterText" placeholder="Search by client, service, or date...">
        <select class="filter-select" [(ngModel)]="statusFilter">
          <option value="">All Status</option>
          <option value="Booked">Booked</option>
          <option value="Completed">Completed</option>
          <option value="Cancelled">Cancelled</option>
        </select>
      </div>

      <div class="table-container" *ngIf="appointments.length">
        <table class="table">
          <thead>
            <tr>
              <th>DATE</th>
              <th>CLIENT</th>
              <th>SERVICE</th>
              <th>AMOUNT</th>
              <th>STATUS</th>
              <th style="text-align: right;">INVOICE</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let app of filteredList">
              <td>{{app.date | date}}</td>
              <td style="font-family: var(--font-heading); font-weight: 700;">{{app.clientName}}</td>
              <td><span class="mastery-tag">{{app.service}}</span></td>
              <td style="font-weight: 700;">₹{{app.price - (app.discount || 0)}}</td>
              <td>
                <span class="status-badge-sm" [class.status-booked]="app.status === 'Booked'" [class.status-completed]="app.status === 'Completed'" [class.status-cancelled]="app.status === 'Cancelled'">
                  {{app.status || 'Booked'}}
                </span>
              </td>
              <td style="text-align: right;">
                <button class="btn btn-secondary" (click)="viewBill(app._id)">
                  <span class="material-symbols-outlined">receipt</span>
                  VIEW
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div *ngIf="!appointments.length" class="empty-state">
        <span class="material-symbols-outlined">receipt_long</span>
        <p>NO FINANCIAL RECORDS FOUND</p>
      </div>
    </div>
  `,
  styles: [`
    .stats-row { display: flex; gap: 1.5rem; margin-bottom: 2rem; flex-wrap: wrap; }
    .stat-mini { display: flex; flex-direction: column; align-items: center; padding: 1rem 2rem; background: var(--white); border: 1px solid var(--border); min-width: 140px; flex: 1; transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94); animation: fadeInUp 0.5s ease-out both; cursor: default; }
    .stat-mini:nth-child(1) { animation-delay: 0.05s; }
    .stat-mini:nth-child(2) { animation-delay: 0.10s; }
    .stat-mini:nth-child(3) { animation-delay: 0.15s; }
    .stat-mini:nth-child(4) { animation-delay: 0.20s; }
    .stat-mini:hover { transform: translateY(-4px); border-color: var(--gold); box-shadow: 0 6px 20px rgba(0,0,0,0.08); }
    .stat-mini-val { font-family: var(--font-heading); font-size: 1.4rem; font-weight: 700; color: var(--gold); transition: color 0.3s ease; }
    .stat-mini:hover .stat-mini-val { color: var(--gold-hover); }
    .stat-mini-lbl { font-size: 0.55rem; letter-spacing: 0.1em; color: #999; font-weight: 600; margin-top: 0.3rem; transition: color 0.3s ease; }
    .stat-mini:hover .stat-mini-lbl { color: var(--gold); }
    .status-badge-sm { padding: 0.25rem 0.6rem; font-size: 0.6rem; font-weight: 700; letter-spacing: 0.05em; transition: all 0.3s ease; }
    .status-badge-sm:hover { transform: scale(1.05); }
    .status-booked { background: #eff6ff; color: #3b82f6; }
    .status-completed { background: #f0fdf4; color: #16a34a; }
    .status-cancelled { background: #fef2f2; color: #991b1b; }
  `]
})
export class BillingListComponent implements OnInit {
  appointments: any[] = [];
  filterText = '';
  statusFilter = '';

  constructor(private appointmentService: AppointmentService, private router: Router) {}

  ngOnInit(): void {
    this.appointmentService.getAppointments().subscribe(data => {
      this.appointments = data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    });
  }

  get filteredList() {
    const q = this.filterText.toLowerCase().trim();
    let list = this.appointments;
    if (q) {
      list = list.filter(a =>
        a.clientName?.toLowerCase().includes(q) ||
        a.service?.toLowerCase().includes(q) ||
        (a.date || '').includes(q)
      );
    }
    if (this.statusFilter) {
      list = list.filter(a => a.status === this.statusFilter);
    }
    return list;
  }

  get totalRevenue(): number {
    return this.appointments.reduce((sum, a) => sum + (a.price - (a.discount || 0)), 0);
  }

  get completedRevenue(): number {
    return this.appointments
      .filter(a => a.status === 'Completed')
      .reduce((sum, a) => sum + (a.price - (a.discount || 0)), 0);
  }

  get totalInvoices(): number {
    return this.appointments.length;
  }

  get paidCount(): number {
    return this.appointments.filter(a => a.status === 'Completed').length;
  }

  viewBill(id: string) {
    this.router.navigate(['/home/billing', id]);
  }
}
