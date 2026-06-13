import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AppointmentService } from '../../services/appointment.service';
import { ConfirmService } from '../../services/confirm.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-appointments-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-container fade-in">
      <div class="page-header">
        <h2>All Appointments</h2>
      </div>

      <div class="stats-row">
        <div class="stat-mini">
          <span class="stat-mini-val">{{totalCount}}</span>
          <span class="stat-mini-lbl">Total</span>
        </div>
        <div class="stat-mini">
          <span class="stat-mini-val">{{upcomingCount}}</span>
          <span class="stat-mini-lbl">Upcoming</span>
        </div>
        <div class="stat-mini">
          <span class="stat-mini-val">{{completedCount}}</span>
          <span class="stat-mini-lbl">Completed</span>
        </div>
        <div class="stat-mini">
          <span class="stat-mini-val">{{cancelledCount}}</span>
          <span class="stat-mini-lbl">Cancelled</span>
        </div>
      </div>

      <div class="filter-bar">
        <span class="material-symbols-outlined filter-icon">search</span>
        <input type="text" class="filter-input" [(ngModel)]="filterText" placeholder="Search by client, service, or specialist...">
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
              <th>TIME</th>
              <th>CLIENT</th>
              <th>SERVICE</th>
              <th>SPECIALIST</th>
              <th>AMOUNT</th>
              <th>STATUS</th>
              <th style="text-align: right;">ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let a of filteredList">
              <td>{{a.date | date:'mediumDate'}}</td>
              <td>{{a.timeSlot || '--'}}</td>
              <td style="font-family: var(--font-heading); font-weight: 700;">{{a.clientName}}</td>
              <td><span class="mastery-tag">{{a.service}}</span></td>
              <td>{{a.staffName}}</td>
              <td style="font-weight: 700;">₹{{a.price - (a.discount || 0)}}</td>
              <td>
                <span class="status-badge-sm" [class.status-booked]="a.status === 'Booked' || !a.status" [class.status-completed]="a.status === 'Completed'" [class.status-cancelled]="a.status === 'Cancelled'">
                  {{a.status || 'Booked'}}
                </span>
              </td>
              <td style="text-align: right;">
                <div class="action-btns">
                  <button class="btn btn-sm btn-secondary" (click)="edit(a._id)" title="Edit appointment">
                    <span class="material-symbols-outlined">edit</span>
                  </button>
                  <button class="btn btn-sm btn-secondary" (click)="edit(a._id)" title="Reschedule">
                    <span class="material-symbols-outlined">event</span>
                  </button>
                  <button class="btn btn-sm btn-danger-outline" *ngIf="a.status !== 'Cancelled' && a.status !== 'Completed'" (click)="cancel(a)" title="Cancel appointment">
                    <span class="material-symbols-outlined">close</span>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div *ngIf="!appointments.length" class="empty-state">
        <span class="material-symbols-outlined" style="font-size: 3rem; color: var(--border); margin-bottom: 1rem;">calendar_month</span>
        <p>NO APPOINTMENTS FOUND</p>
        <p style="font-size: 0.75rem; color: #999;">Book your first appointment from the Calendar</p>
        <button class="btn btn-primary" style="margin-top: 1rem;" (click)="goToCalendar()">
          <span class="material-symbols-outlined">calendar_month</span>
          GO TO CALENDAR
        </button>
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
    .action-btns { display: flex; gap: 0.4rem; justify-content: flex-end; }
    .btn-sm { padding: 0.35rem 0.5rem; font-size: 0; line-height: 0; border-radius: 4px; background: transparent; border: 1px solid var(--border); cursor: pointer; transition: all 0.3s ease; }
    .btn-sm .material-symbols-outlined { font-size: 1.1rem; color: #888; }
    .btn-sm:hover { border-color: var(--gold); background: rgba(197,160,89,0.08); }
    .btn-sm:hover .material-symbols-outlined { color: var(--gold); }
    .btn-danger-outline { border-color: #fca5a5; }
    .btn-danger-outline .material-symbols-outlined { color: #ef4444; }
    .btn-danger-outline:hover { border-color: #ef4444; background: #fef2f2; }
    .btn-danger-outline:hover .material-symbols-outlined { color: #991b1b; }
  `]
})
export class AppointmentsListComponent implements OnInit {
  appointments: any[] = [];
  filterText = '';
  statusFilter = '';

  constructor(
    private appointmentService: AppointmentService,
    private confirmService: ConfirmService,
    private toastService: ToastService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadAppointments();
  }

  loadAppointments() {
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
        a.staffName?.toLowerCase().includes(q) ||
        (a.date || '').includes(q)
      );
    }
    if (this.statusFilter) {
      list = list.filter(a => a.status === this.statusFilter);
    }
    return list;
  }

  get totalCount() { return this.appointments.length; }
  get upcomingCount() { return this.appointments.filter(a => a.status === 'Booked' || !a.status).length; }
  get completedCount() { return this.appointments.filter(a => a.status === 'Completed').length; }
  get cancelledCount() { return this.appointments.filter(a => a.status === 'Cancelled').length; }

  edit(id: string) {
    this.router.navigate(['/home/edit', id]);
  }

  cancel(a: any) {
    this.confirmService.confirm(`Cancel appointment for ${a.clientName}?`).subscribe(result => {
      if (result) {
        this.appointmentService.updateAppointment(a._id, { ...a, status: 'Cancelled' }).subscribe({
          next: () => {
            this.toastService.show('APPOINTMENT CANCELLED', 'info');
            this.loadAppointments();
          },
          error: () => {
            const local = JSON.parse(localStorage.getItem('offlineAppointments') || '[]');
            const idx = local.findIndex((x: any) => x._id === a._id);
            if (idx >= 0) { local[idx].status = 'Cancelled'; localStorage.setItem('offlineAppointments', JSON.stringify(local)); }
            this.toastService.show('APPOINTMENT CANCELLED', 'info');
            this.loadAppointments();
          }
        });
      }
    });
  }

  goToCalendar() {
    this.router.navigate(['/home/calendar']);
  }
}
