import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ClientService } from '../../services/client.service';
import { ToastService } from '../../services/toast.service';
import { AppointmentService } from '../../services/appointment.service';
import { ConfirmService } from '../../services/confirm.service';

@Component({
  selector: 'app-clients',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-container fade-in">
      <div class="page-header">
        <h2>Client Registry</h2>
        <button class="btn btn-primary" (click)="openNew()">
          <span class="material-symbols-outlined">person_add</span>
          ENROLL NEW CLIENT
        </button>
      </div>

      <div class="luxury-form-overlay" *ngIf="showForm">
        <div class="luxury-form-card">
          <h3>{{editMode ? 'REFINE' : 'NEW'}} CLIENT PROFILE</h3>
          <form (ngSubmit)="save()">
            <div class="grid-form">
              <div class="form-group">
                <label>FULL NAME <span style="color:var(--danger)">*</span></label>
                <input type="text" [(ngModel)]="current.name" name="name" required placeholder="Ex. Lady Genevieve">
              </div>
              <div class="form-group">
                <label>VISITS</label>
                <input type="number" [(ngModel)]="current.visits" name="visits" min="0" placeholder="Auto-calculated, set manually if needed">
              </div>
              <div class="form-group">
                <label>CONTACT NUMBER <span style="color:var(--danger)">*</span></label>
                <div style="display: flex; gap: 0.5rem; align-items: stretch;">
                  <select [(ngModel)]="current.countryCode" name="countryCode"
                    style="width: 110px; flex-shrink: 0; padding: 0.75rem; border: none; border-bottom: 1px solid var(--border); background: var(--cream); font-family: inherit; font-size: 0.85rem; cursor: pointer;">
                    <option value="+1">🇺🇸 +1</option>
                    <option value="+44">🇬🇧 +44</option>
                    <option value="+91" selected>🇮🇳 +91</option>
                    <option value="+61">🇦🇺 +61</option>
                    <option value="+81">🇯🇵 +81</option>
                    <option value="+86">🇨🇳 +86</option>
                    <option value="+49">🇩🇪 +49</option>
                    <option value="+33">🇫🇷 +33</option>
                    <option value="+39">🇮🇹 +39</option>
                    <option value="+7">🇷🇺 +7</option>
                    <option value="+55">🇧🇷 +55</option>
                    <option value="+971">🇦🇪 +971</option>
                    <option value="+966">🇸🇦 +966</option>
                    <option value="+65">🇸🇬 +65</option>
                    <option value="+82">🇰🇷 +82</option>
                  </select>
                  <input type="text" [(ngModel)]="current.phone" name="phone" required placeholder="Enter number without country code"
                    style="flex: 1;">
                </div>
              </div>
            </div>
            <div class="actions">
              <button type="submit" class="btn btn-primary">COMMIT CHANGES</button>
              <button type="button" class="btn btn-secondary" (click)="showForm=false">DISCARD</button>
            </div>
          </form>
        </div>
      </div>

      <div class="filter-bar" style="position: relative;">
        <span class="material-symbols-outlined filter-icon">search</span>
        <input type="text" class="filter-input" [(ngModel)]="filterText" placeholder="Search by name or phone..." (input)="onSearchInput()" (focus)="onSearchFocus()" (blur)="onSearchBlur()" autocomplete="off">
        <select class="filter-select" [(ngModel)]="loyaltyFilter" (change)="onSearchInput()">
          <option value="">All Loyalty</option>
          <option value="Royal Patron">Royal Patron</option>
          <option value="Gold Member">Gold Member</option>
          <option value="Silver Tier">Silver Tier</option>
          <option value="First Visit">First Visit</option>
        </select>
        <div class="search-suggestions" *ngIf="showSuggestions && filteredSuggestions.length" (mousedown)="$event.preventDefault()">
          <div class="suggestion-item" *ngFor="let c of filteredSuggestions" (click)="selectSuggestion(c)">
            <span class="material-symbols-outlined" style="font-size: 1.1rem; color: var(--gold);">person</span>
            <div class="suggestion-info">
              <span class="suggestion-name">{{c.name}}</span>
              <span class="suggestion-phone">{{c.phone}}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="table-container" *ngIf="clientList.length">
        <table class="table">
          <thead>
            <tr>
              <th>CLIENT</th>
              <th>CONTACT</th>
              <th>LOYALTY</th>
              <th style="text-align: right;">ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let c of filteredList">
              <td>
                <div style="font-family: var(--font-heading); font-weight: 700; font-size: 1.1rem; cursor: pointer;" (click)="viewHistory(c)">{{c.name}}</div>
              </td>
              <td>{{c.phone}}</td>
              <td>
                <span [class]="'loyalty-badge ' + getLoyaltyClass(c.visits)">
                  {{getLoyaltyTier(c.visits)}}
                </span>
              </td>
              <td style="text-align: right;">
                <div style="display: flex; gap: 0.5rem; justify-content: flex-end; align-items: center;">
                  <button class="btn btn-secondary btn-sm" (click)="openSMSCampaign(c)" title="Send Offer via SMS">
                    <span class="material-symbols-outlined" style="font-size: 1rem;">campaign</span>
                    OFFER
                  </button>
                  <button class="btn btn-secondary" style="padding: 0.5rem;" (click)="openEdit(c)" title="Refine">
                    <span class="material-symbols-outlined">edit_note</span>
                  </button>
                  <button class="btn btn-danger" style="padding: 0.5rem;" (click)="delete(c._id)" title="Remove">
                    <span class="material-symbols-outlined">delete_forever</span>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <div *ngIf="!clientList.length && !showForm" class="empty-state">
        <span class="material-symbols-outlined">person_off</span>
        <p>THE REGISTRY IS CURRENTLY VACANT</p>
      </div>
    </div>

    <div class="luxury-form-overlay" *ngIf="showHistoryModal" (click)="closeModalOnOverlay($event)">
      <div class="luxury-form-card" style="max-width: 700px; max-height: 80vh; overflow-y: auto;">
        <h3>APPOINTMENT HISTORY — {{selectedClient?.name}}</h3>
        <table class="table" style="margin-top: 1.5rem;" *ngIf="clientAppointments.length">
          <thead>
            <tr>
              <th>DATE</th>
              <th>TIME</th>
              <th>SERVICE</th>
              <th>SPECIALIST</th>
              <th>STATUS</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let a of clientAppointments">
              <td>{{a.date | date:'mediumDate'}}</td>
              <td>{{a.timeSlot}}</td>
              <td><span class="mastery-tag">{{a.service}}</span></td>
              <td>{{a.staffName}}</td>
              <td><span class="status-badge-sm" [class]="getStatusClass(a.status)">{{a.status || 'Booked'}}</span></td>
            </tr>
          </tbody>
        </table>
        <div *ngIf="!clientAppointments.length" style="text-align: center; padding: 2rem; color: #999;">
          No appointments found
        </div>
        <div class="actions" style="margin-top: 1.5rem;">
          <button type="button" class="btn btn-secondary" (click)="closeHistoryModal()">CLOSE</button>
        </div>
      </div>
    </div>

    <div class="luxury-form-overlay" *ngIf="showSMSModal" (click)="closeModalOnOverlay($event)">
      <div class="luxury-form-card" style="max-width: 500px;">
        <h3>SEND OFFER VIA SMS</h3>
        <p style="color: var(--charcoal-light); font-size: 0.8rem; margin-bottom: 1.5rem;">
          Target: <strong>{{smsTarget?.name}}</strong> — {{smsTarget?.phone}}
        </p>
        <div class="form-group">
          <label>MESSAGE</label>
          <textarea [(ngModel)]="smsMessage" name="smsMessage" rows="4"
            placeholder="Type your promotional offer here..."
            style="width: 100%; padding: 0.75rem; border: 1px solid var(--border); font-family: inherit; font-size: 0.85rem; resize: vertical;"></textarea>
        </div>
        <div style="font-size: 0.6rem; color: var(--charcoal-light); margin-bottom: 1.5rem; text-align: right;">
          {{smsMessage.length}} / 160 characters
        </div>
        <div class="actions">
          <button class="btn btn-primary" (click)="sendSMS()">
            <span class="material-symbols-outlined">send</span>
            SEND OFFER
          </button>
          <button class="btn btn-secondary" (click)="closeSMSModal()">CANCEL</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .loyalty-badge {
      padding: 0.35rem 0.75rem;
      font-size: 0.65rem;
      font-weight: 700;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      transition: all 0.3s ease;
    }
    .loyalty-badge:hover { transform: scale(1.04); }
    .tier-royal { background: var(--charcoal); color: var(--gold); border: 1px solid var(--gold); }
    .tier-gold { background: var(--gold-light); color: var(--gold-hover); }
    .tier-bronze { background: #f3f4f6; color: #6b7280; }
    .tier-new { background: white; color: var(--border); border: 1px solid var(--border); }
    .status-badge-sm { padding: 0.25rem 0.6rem; font-size: 0.6rem; font-weight: 700; letter-spacing: 0.05em; transition: all 0.3s ease; }
    .status-badge-sm:hover { transform: scale(1.05); }
    .status-badge-sm.status-booked { background: #eff6ff; color: #3b82f6; }
    .status-badge-sm.status-completed { background: #f0fdf4; color: #16a34a; }
    .status-badge-sm.status-cancelled { background: #fef2f2; color: #991b1b; }
    .btn-sm { padding: 0.35rem 0.6rem; font-size: 0.6rem; transition: all 0.3s ease; }
    .btn-sm:hover { transform: translateY(-1px); }
    textarea:focus { outline: none; border-color: var(--gold) !important; }
    .search-suggestions { position: absolute; top: 100%; left: 0; right: 0; background: var(--white); border: 1px solid var(--gold); z-index: 100; max-height: 280px; overflow-y: auto; animation: fadeInDown 0.2s ease both; box-shadow: 0 8px 30px rgba(0,0,0,0.1); }
    .suggestion-item { display: flex; align-items: center; gap: 0.75rem; padding: 0.75rem 1rem; cursor: pointer; transition: background 0.2s ease; border-bottom: 1px solid var(--border); }
    .suggestion-item:last-child { border-bottom: none; }
    .suggestion-item:hover { background: var(--gold-light); }
    .suggestion-info { display: flex; flex-direction: column; }
    .suggestion-name { font-family: var(--font-heading); font-weight: 700; font-size: 0.85rem; color: var(--charcoal); }
    .suggestion-phone { font-size: 0.7rem; color: #999; }
  `]
})
export class ClientsComponent implements OnInit {
  clientList: any[] = [];
  filterText = '';
  loyaltyFilter = '';
  showForm = false;
  editMode = false;
  current: any = { name: '', phone: '' };
  showSuggestions = false;
  private suggestTimer: any = null;

  get filteredList() {
    const q = this.filterText.toLowerCase().trim();
    let list = this.clientList;
    if (q) {
      list = list.filter(c =>
        c.name?.toLowerCase().includes(q) ||
        c.phone?.toLowerCase().includes(q)
      );
    }
    if (this.loyaltyFilter) {
      list = list.filter(c => this.getLoyaltyTier(c.visits) === this.loyaltyFilter);
    }
    return list;
  }

  get filteredSuggestions() {
    const q = this.filterText.toLowerCase().trim();
    if (!q || q.length < 1) return [];
    return this.clientList.filter(c =>
      c.name?.toLowerCase().includes(q) ||
      c.phone?.toLowerCase().includes(q)
    ).slice(0, 8);
  }

  @HostListener('document:click')
  onDocClick() {
    this.showSuggestions = false;
  }

  onSearchInput() {
    if (this.suggestTimer) clearTimeout(this.suggestTimer);
    this.suggestTimer = setTimeout(() => {
      this.showSuggestions = this.filterText.trim().length > 0;
    }, 100);
  }

  onSearchFocus() {
    if (this.filterText.trim()) this.showSuggestions = true;
  }

  onSearchBlur() {
    setTimeout(() => { this.showSuggestions = false; }, 200);
  }

  selectSuggestion(c: any) {
    this.filterText = c.name;
    this.showSuggestions = false;
    this.openEdit(c);
  }

  showHistoryModal = false;
  selectedClient: any = null;
  clientAppointments: any[] = [];

  showSMSModal = false;
  smsTarget: any = null;
  smsMessage = '';

  constructor(
    private clientService: ClientService,
    private toastService: ToastService,
    private appointmentService: AppointmentService,
    private confirmService: ConfirmService
  ) {}

  ngOnInit() { this.loadClients(); }

  loadClients() {
    this.clientService.getClients().subscribe({
      next: (data) => this.clientList = data,
      error: () => {
        const local = localStorage.getItem('offlineClients');
        this.clientList = local ? JSON.parse(local) : [];
      }
    });
  }

  getLoyaltyTier(visits: number = 0): string {
    if (visits >= 10) return 'Royal Patron';
    if (visits >= 5) return 'Gold Member';
    if (visits >= 2) return 'Silver Tier';
    return 'First Visit';
  }

  getLoyaltyClass(visits: number = 0): string {
    if (visits >= 10) return 'tier-royal';
    if (visits >= 5) return 'tier-gold';
    if (visits >= 2) return 'tier-bronze';
    return 'tier-new';
  }

  openNew() {
    this.editMode = false;
    this.current = { name: '', phone: '', countryCode: '+91', visits: 0 };
    this.showForm = true;
  }

  openEdit(c: any) {
    this.editMode = true;
    const codes = ['+1','+44','+91','+61','+81','+86','+49','+33','+39','+7','+55','+971','+966','+65','+82'].sort((a,b) => b.length - a.length);
    let countryCode = '+91';
    let phone = c.phone || '';
    for (const code of codes) {
      if (phone.startsWith(code)) {
        countryCode = code;
        phone = phone.slice(code.length);
        break;
      }
    }
    this.current = { ...c, countryCode, phone, visits: c.visits || 0 };
    this.showForm = true;
  }

  isDuplicatePhone(phone: string, excludeId?: string): boolean {
    const fullPhone = (this.current.countryCode || '') + phone;
    return this.clientList.some(c => {
      const existingPhone = (c.countryCode || '') + c.phone;
      return existingPhone === fullPhone && c._id !== excludeId;
    });
  }

  private saveLocal(payload: any) {
    const local = JSON.parse(localStorage.getItem('offlineClients') || '[]');
    if (this.editMode) {
      const idx = local.findIndex((c: any) => c._id === payload._id);
      if (idx >= 0) local[idx] = { ...local[idx], ...payload };
    } else {
      payload._id = 'local_' + Date.now();
      local.push(payload);
    }
    localStorage.setItem('offlineClients', JSON.stringify(local));
    this.loadClients();
    this.showForm = false;
    this.toastService.show(this.editMode ? 'CLIENT PROFILE REFINED' : 'NEW CLIENT ENROLLED');
  }

  save() {
    const payload: any = { name: this.current.name, phone: (this.current.countryCode || '') + this.current.phone, visits: this.current.visits || 0 };
    if (this.editMode) payload._id = this.current._id;
    if (this.isDuplicatePhone(this.current.phone, this.editMode ? this.current._id : undefined)) {
      this.toastService.show('PHONE NUMBER ALREADY EXISTS', 'error');
      return;
    }
    if (this.editMode) {
      this.clientService.updateClient(payload._id, payload).subscribe({
        next: () => {
          this.toastService.show('CLIENT PROFILE REFINED');
          this.loadClients();
          this.showForm = false;
        },
        error: () => this.saveLocal(payload)
      });
    } else {
      this.clientService.createClient(payload).subscribe({
        next: () => {
          this.toastService.show('NEW CLIENT ENROLLED');
          this.loadClients();
          this.showForm = false;
        },
        error: () => this.saveLocal(payload)
      });
    }
  }

  viewHistory(c: any) {
    this.selectedClient = c;
    this.appointmentService.getAppointments().subscribe(apps => {
      this.clientAppointments = apps.filter(a => a.clientName === c.name);
    });
    this.showHistoryModal = true;
  }

  closeHistoryModal() {
    this.showHistoryModal = false;
    this.selectedClient = null;
    this.clientAppointments = [];
  }

  getStatusClass(status: string): string {
    const s = (status || 'Booked').toLowerCase();
    return s === 'completed' ? 'status-completed' : s === 'cancelled' ? 'status-cancelled' : 'status-booked';
  }

  openSMSCampaign(c: any) {
    this.smsTarget = c;
    this.smsMessage = `Hi ${c.name}! Exclusive offer just for you at Royal Salon. Book your appointment today and enjoy special discounts. Reply STOP to opt out.`;
    this.showSMSModal = true;
  }

  closeSMSModal() {
    this.showSMSModal = false;
    this.smsTarget = null;
    this.smsMessage = '';
  }

  sendSMS() {
    if (!this.smsMessage.trim()) {
      this.toastService.show('MESSAGE CANNOT BE EMPTY', 'error');
      return;
    }
    const sent = JSON.parse(localStorage.getItem('smsCampaigns') || '[]');
    sent.push({
      to: this.smsTarget?.phone,
      name: this.smsTarget?.name,
      message: this.smsMessage,
      sentAt: new Date().toISOString()
    });
    localStorage.setItem('smsCampaigns', JSON.stringify(sent));
    this.toastService.show(`OFFER SENT TO ${this.smsTarget?.name}`, 'success');
    this.closeSMSModal();
  }

  delete(id: string) {
    this.confirmService.confirm('Are you sure you want to delete this? This cannot be undone.').subscribe(result => {
      if (result) {
        this.clientService.deleteClient(id).subscribe({
          next: () => {
            this.toastService.show('CLIENT REMOVED', 'info');
            this.loadClients();
          },
          error: () => {
            const local = JSON.parse(localStorage.getItem('offlineClients') || '[]');
            const filtered = local.filter((c: any) => c._id !== id);
            localStorage.setItem('offlineClients', JSON.stringify(filtered));
            this.toastService.show('CLIENT REMOVED', 'info');
            this.loadClients();
          }
        });
      }
    });
  }

  closeModalOnOverlay(event: MouseEvent) {
    const el = event.target as HTMLElement;
    if (el.classList.contains('luxury-form-overlay')) {
      this.closeHistoryModal();
      this.closeSMSModal();
    }
  }
}
