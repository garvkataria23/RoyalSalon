import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AppointmentService } from '../../services/appointment.service';
import { StaffService } from '../../services/staff.service';
import { ClientService } from '../../services/client.service';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page-container fade-in">
      <div class="page-header" style="display: flex; justify-content: space-between; align-items: center;">
        <div>
          <h2>Royal Insights</h2>
        </div>
        <button class="btn btn-primary" (click)="quickBook()" style="padding: 0.75rem 2rem;">
          <span class="material-symbols-outlined">add_circle</span>
          Quick Book
        </button>
      </div>

      <div class="stats-grid">
        <div class="stat-card">
          <div class="icon-wrap"><span class="material-symbols-outlined">payments</span></div>
          <div class="data">
            <span class="label">TOTAL REVENUE</span>
            <span class="value">₹{{stats.revenue}}</span>
          </div>
        </div>
        <div class="stat-card">
          <div class="icon-wrap"><span class="material-symbols-outlined">event_seat</span></div>
          <div class="data">
            <span class="label">APPOINTMENTS</span>
            <span class="value">{{stats.appointments}}</span>
          </div>
        </div>
        <div class="stat-card">
          <div class="icon-wrap"><span class="material-symbols-outlined">pending_actions</span></div>
          <div class="data">
            <span class="label">PENDING TODAY</span>
            <span class="value">{{stats.pendingToday}}</span>
          </div>
        </div>
        <div class="stat-card">
          <div class="icon-wrap"><span class="material-symbols-outlined">groups</span></div>
          <div class="data">
            <span class="label">CLIENT PATRONS</span>
            <span class="value">{{stats.clients}}</span>
          </div>
        </div>
        <div class="stat-card">
          <div class="icon-wrap"><span class="material-symbols-outlined">workspace_premium</span></div>
          <div class="data">
            <span class="label">SPECIALISTS</span>
            <span class="value">{{stats.staff}}</span>
          </div>
        </div>
      </div>

      <div class="dashboard-content">
        <div class="recent-activity luxury-form-card">
           <h3>TODAY'S APPOINTMENTS</h3>
           <table class="table" style="margin-top: 2rem;">
              <thead>
                <tr>
                  <th>CLIENT</th>
                  <th>SERVICE</th>
                  <th>TIME</th>
                  <th>SPECIALIST</th>
                  <th>STATUS</th>
                  <th style="text-align: right;">ACTION</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let app of todayApps">
                  <td style="font-family: var(--font-heading); font-weight: 700;">{{app.clientName}}</td>
                  <td><span class="mastery-tag">{{app.service}}</span></td>
                  <td>{{app.timeSlot}}</td>
                  <td>{{app.staffName}}</td>
                  <td><span class="status-badge-sm" [class]="app.status?.toLowerCase() || 'booked'">{{app.status || 'Booked'}}</span></td>
                  <td style="text-align: right;">
                    <button class="btn btn-secondary" style="padding: 0.4rem 0.8rem; font-size: 0.65rem;" (click)="viewAppointment(app._id)">
                      <span class="material-symbols-outlined" style="font-size: 1rem;">visibility</span>
                      VIEW
                    </button>
                  </td>
                </tr>
                <tr *ngIf="!todayApps.length">
                  <td colspan="6" style="text-align: center; color: #999; padding: 2rem;">NO APPOINTMENTS FOR TODAY</td>
                </tr>
              </tbody>
           </table>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 2rem; margin-bottom: 3rem; }
    .stat-card { background: var(--white); border: 1px solid var(--border); padding: 2rem; display: flex; align-items: center; gap: 1.5rem; transition: all 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94); animation: fadeInUp 0.6s ease-out both; cursor: default; }
    .stat-card:nth-child(1) { animation-delay: 0.05s; }
    .stat-card:nth-child(2) { animation-delay: 0.10s; }
    .stat-card:nth-child(3) { animation-delay: 0.15s; }
    .stat-card:nth-child(4) { animation-delay: 0.20s; }
    .stat-card:nth-child(5) { animation-delay: 0.25s; }
    .stat-card:hover { transform: translateY(-6px) scale(1.01); border-color: var(--gold); box-shadow: 0 8px 30px rgba(0,0,0,0.08); }
    .icon-wrap { width: 50px; height: 50px; background: var(--gold-light); color: var(--gold); display: flex; align-items: center; justify-content: center; border-radius: 0; transition: background 0.4s ease, color 0.4s ease, transform 0.4s ease; }
    .stat-card:hover .icon-wrap { background: var(--gold); color: var(--white); transform: scale(1.1) rotate(-5deg); }
    .data .label { font-size: 0.6rem; letter-spacing: 0.1em; color: #999; display: block; transition: color 0.3s ease; }
    .stat-card:hover .data .label { color: var(--gold); }
    .data .value { font-family: var(--font-heading); font-size: 1.6rem; font-weight: 700; color: var(--charcoal); transition: color 0.3s ease; }
    .stat-card:hover .data .value { color: var(--gold-hover); }
    .dashboard-content { display: grid; grid-template-columns: 1fr; gap: 2rem; }
    .status-badge-sm { padding: 0.25rem 0.6rem; font-size: 0.6rem; font-weight: 700; letter-spacing: 0.05em; }
    .status-badge-sm.booked { background: #eff6ff; color: #3b82f6; }
    .status-badge-sm.completed { background: #f0fdf4; color: #16a34a; }
    .status-badge-sm.cancelled { background: #fef2f2; color: #991b1b; }
  `]
})
export class DashboardComponent implements OnInit {
  stats = { revenue: 0, appointments: 0, clients: 0, staff: 0, pendingToday: 0 };
  todayApps: any[] = [];

  constructor(
    private router: Router,
    private appService: AppointmentService,
    private staffService: StaffService,
    private clientService: ClientService
  ) {}

  ngOnInit() {
    forkJoin({
      apps: this.appService.getAppointments(),
      staff: this.staffService.getStaff(),
      clients: this.clientService.getClients()
    }).subscribe(({ apps, staff, clients }) => {
      this.stats.appointments = apps.length;
      this.stats.staff = staff.length;
      this.stats.clients = clients.length;

      const today = new Date().toISOString().split('T')[0];
      const todayApps = apps.filter(app => {
        const appDate = new Date(app.date).toISOString().split('T')[0];
        return appDate === today;
      });
      this.todayApps = todayApps;

      this.stats.revenue = apps
        .filter(app => app.status === 'Completed')
        .reduce((acc, app) => acc + (app.price - (app.discount || 0)), 0);

      this.stats.pendingToday = todayApps.filter(app => app.status === 'Booked').length;
    });
  }

  quickBook() {
    this.router.navigate(['/home/book']);
  }

  viewAppointment(id: string) {
    this.router.navigate(['/home/edit', id]);
  }
}
