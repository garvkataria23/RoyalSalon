import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AppointmentService } from '../../services/appointment.service';

@Component({
  selector: 'app-history',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-container fade-in">
      <div class="page-header">
        <h2>Appointment History</h2>
      </div>

      <div class="stats-row">
        <div class="stat-mini">
          <span class="stat-mini-val">{{totalCount}}</span>
          <span class="stat-mini-lbl">Past Appointments</span>
        </div>
        <div class="stat-mini">
          <span class="stat-mini-val">{{completedCount}}</span>
          <span class="stat-mini-lbl">Completed</span>
        </div>
        <div class="stat-mini">
          <span class="stat-mini-val">{{cancelledCount}}</span>
          <span class="stat-mini-lbl">Cancelled</span>
        </div>
        <div class="stat-mini">
          <span class="stat-mini-val">₹{{revenue}}</span>
          <span class="stat-mini-lbl">Revenue from Past</span>
        </div>
      </div>

      <div class="filter-bar">
        <span class="material-symbols-outlined filter-icon">search</span>
        <input type="text" class="filter-input" [(ngModel)]="filterText" placeholder="Search by client, service, specialist, or status...">
        <select class="filter-select" [(ngModel)]="statusFilter">
          <option value="">All Status</option>
          <option value="Completed">Completed</option>
          <option value="Cancelled">Cancelled</option>
        </select>
      </div>

      <div class="table-container" *ngIf="pastAppointments.length">
        <table class="table">
          <thead>
            <tr>
              <th>DATE</th>
              <th>CLIENT</th>
              <th>SERVICE</th>
              <th>SPECIALIST</th>
              <th>AMOUNT</th>
              <th>STATUS</th>
              <th style="text-align: right;">ACTION</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let a of filteredList">
              <td>{{a.date | date:'mediumDate'}}</td>
              <td style="font-family: var(--font-heading); font-weight: 700;">{{a.clientName}}</td>
              <td><span class="mastery-tag">{{a.service}}</span></td>
              <td>{{a.staffName}}</td>
              <td style="font-weight: 700;">₹{{a.price - (a.discount || 0)}}</td>
              <td>
                <span class="status-badge-sm" [class.status-completed]="a.status === 'Completed'" [class.status-cancelled]="a.status === 'Cancelled'">
                  {{a.status || 'Booked'}}
                </span>
              </td>
              <td style="text-align: right;">
                <button class="btn btn-secondary" style="padding: 0.4rem 0.8rem; font-size: 0.65rem;" (click)="view(a._id)">
                  <span class="material-symbols-outlined" style="font-size: 1rem;">visibility</span>
                  VIEW
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div *ngIf="!pastAppointments.length" class="empty-state">
        <span class="material-symbols-outlined" style="font-size: 3rem; color: var(--border); margin-bottom: 1rem;">history</span>
        <p>NO PAST APPOINTMENTS</p>
        <p style="font-size: 0.75rem; color: #999;">Completed and cancelled appointments will appear here</p>
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
    .status-completed { background: #f0fdf4; color: #16a34a; }
    .status-cancelled { background: #fef2f2; color: #991b1b; }
  `]
})
export class HistoryComponent implements OnInit {
  allAppointments: any[] = [];
  filterText = '';
  statusFilter = '';

  constructor(
    private appointmentService: AppointmentService,
    private router: Router
  ) {}

  ngOnInit() {
    this.appointmentService.getAppointments().subscribe(data => {
      const today = new Date().toISOString().split('T')[0];
      this.allAppointments = data
        .filter(a => {
          const appDate = new Date(a.date).toISOString().split('T')[0];
          return appDate < today || a.status === 'Completed' || a.status === 'Cancelled';
        })
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    });
  }

  get pastAppointments() { return this.allAppointments; }

  get filteredList() {
    const q = this.filterText.toLowerCase().trim();
    return this.allAppointments.filter(a => {
      if (this.statusFilter && a.status !== this.statusFilter) return false;
      if (!q) return true;
      return (
        a.clientName?.toLowerCase().includes(q) ||
        a.service?.toLowerCase().includes(q) ||
        a.staffName?.toLowerCase().includes(q) ||
        a.status?.toLowerCase().includes(q) ||
        (a.date || '').includes(q)
      );
    });
  }

  get totalCount() { return this.allAppointments.length; }
  get completedCount() { return this.allAppointments.filter(a => a.status === 'Completed').length; }
  get cancelledCount() { return this.allAppointments.filter(a => a.status === 'Cancelled').length; }
  get revenue() {
    return this.allAppointments
      .filter(a => a.status === 'Completed')
      .reduce((sum, a) => sum + (a.price - (a.discount || 0)), 0);
  }

  view(id: string) {
    this.router.navigate(['/home/edit', id]);
  }
}
