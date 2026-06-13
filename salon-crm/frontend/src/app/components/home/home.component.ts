import { Component, OnInit, HostListener } from '@angular/core';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { RouterOutlet, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ToastService } from '../../services/toast.service';
import { AuthService } from '../../services/auth.service';
import { ClientService } from '../../services/client.service';
import { StaffService } from '../../services/staff.service';
import { SalonService } from '../../services/salon-service.service';
import { AppointmentService } from '../../services/appointment.service';
import { forkJoin } from 'rxjs';

interface SearchResult {
  type: 'client' | 'staff' | 'service' | 'appointment';
  label: string;
  subtitle: string;
  icon: string;
  action: () => void;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [SidebarComponent, RouterOutlet, FormsModule, CommonModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit {
  sidebarOpen = false;
  searchQuery: string = '';
  showSuggestions: boolean = false;
  searchResults: SearchResult[] = [];
  showProfileMenu: boolean = false;
  userName: string = 'Salon Admin';
  userRole: string = 'ADMIN';

  private clients: any[] = [];
  private staff: any[] = [];
  private services: any[] = [];
  private appointments: any[] = [];

  constructor(
    public router: Router,
    private toastService: ToastService,
    private authService: AuthService,
    private clientService: ClientService,
    private staffService: StaffService,
    private salonService: SalonService,
    private appService: AppointmentService
  ) {
    const user = localStorage.getItem('user');
    if (user) {
      const parsed = JSON.parse(user);
      this.userName = parsed.name;
      this.userRole = parsed.role?.toUpperCase() || 'STAFF';
    }
  }

  ngOnInit() {
    forkJoin({
      clients: this.clientService.getClients(),
      staff: this.staffService.getStaff(),
      services: this.salonService.getServices(),
      appointments: this.appService.getAppointments()
    }).subscribe(({ clients, staff, services, appointments }) => {
      this.clients = clients;
      this.staff = staff;
      this.services = services;
      this.appointments = appointments;
    });
  }

  get isAdmin(): boolean {
    return this.userRole === 'ADMIN';
  }

  onSearch() {
    if (!this.searchQuery.trim()) return;
    const q = this.searchQuery.toLowerCase();
    this.toastService.show(`SEARCHING: ${q.toUpperCase()}`, 'info');
    if (q.includes('client')) this.router.navigate(['/home/clients']);
    else if (q.includes('staff') || q.includes('specialist')) this.router.navigate(['/home/staff']);
    else if (q.includes('bill') || q.includes('invoice')) this.router.navigate(['/home/billing']);
    else if (q.includes('calendar') || q.includes('book')) this.router.navigate(['/home/calendar']);
    else this.toastService.show('NO MATCH — TRY CLIENTS, STAFF, BILLING', 'info');
    this.searchQuery = '';
  }

  onSearchInput() {
    const q = this.searchQuery.trim().toLowerCase();
    if (q.length < 2) {
      this.searchResults = [];
      this.showSuggestions = false;
      return;
    }

    const results: SearchResult[] = [];

    for (const c of this.clients) {
      if (c.name?.toLowerCase().includes(q) || c.email?.toLowerCase().includes(q) || c.phone?.includes(q)) {
        results.push({
          type: 'client', label: c.name, subtitle: c.email || c.phone,
          icon: 'person', action: () => this.router.navigate(['/home/clients'])
        });
        if (results.length >= 6) break;
      }
    }

    for (const s of this.staff) {
      if (results.length >= 8) break;
      if (s.name?.toLowerCase().includes(q) || s.specialization?.toLowerCase().includes(q) || s.email?.toLowerCase().includes(q)) {
        results.push({
          type: 'staff', label: s.name, subtitle: s.specialization,
          icon: 'badge', action: () => this.router.navigate(['/home/staff'])
        });
      }
    }

    for (const s of this.services) {
      if (results.length >= 8) break;
      if (s.name?.toLowerCase().includes(q) || s.category?.toLowerCase().includes(q)) {
        results.push({
          type: 'service', label: s.name, subtitle: `₹${s.price} · ${s.duration || ''}`,
          icon: 'spa', action: () => this.router.navigate(['/home/services'])
        });
      }
    }

    for (const a of this.appointments) {
      if (results.length >= 10) break;
      if (a.clientName?.toLowerCase().includes(q) || a.service?.toLowerCase().includes(q) || a.staffName?.toLowerCase().includes(q)) {
        results.push({
          type: 'appointment', label: `${a.clientName} — ${a.service}`, subtitle: `${a.date ? new Date(a.date).toLocaleDateString() : ''} ${a.timeSlot} · ${a.staffName}`,
          icon: 'event', action: () => this.router.navigate(['/home/edit', a._id])
        });
      }
    }

    this.searchResults = results;
    this.showSuggestions = results.length > 0;
  }

  selectResult(r: SearchResult) {
    this.showSuggestions = false;
    this.searchQuery = '';
    r.action();
  }

  @HostListener('document:click', ['$event'])
  onDocClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest('.search-bar-wrapper')) {
      this.showSuggestions = false;
    }
    if (!target.closest('.user-profile')) {
      this.showProfileMenu = false;
    }
  }

  toggleProfileMenu() {
    this.showProfileMenu = !this.showProfileMenu;
  }

  toggleSidebar() {
    this.sidebarOpen = !this.sidebarOpen;
  }

  closeSidebar() {
    this.sidebarOpen = false;
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
