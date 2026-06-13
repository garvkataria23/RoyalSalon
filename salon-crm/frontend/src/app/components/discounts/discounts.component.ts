import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DiscountService } from '../../services/discount.service';
import { ToastService } from '../../services/toast.service';
import { ConfirmService } from '../../services/confirm.service';

@Component({
  selector: 'app-discounts',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-container fade-in">
      <div class="page-header">
        <h2>Discounts & Offers</h2>
        <button class="btn btn-primary" (click)="openNew()">
          <span class="material-symbols-outlined">add_circle</span>
          CREATE OFFER
        </button>
      </div>

      <div class="stats-row">
        <div class="stat-mini">
          <span class="stat-mini-val">{{activeCount}}</span>
          <span class="stat-mini-lbl">Active Offers</span>
        </div>
        <div class="stat-mini">
          <span class="stat-mini-val">{{discountList.length}}</span>
          <span class="stat-mini-lbl">Total Offers</span>
        </div>
        <div class="stat-mini">
          <span class="stat-mini-val">{{expiredCount}}</span>
          <span class="stat-mini-lbl">Expired</span>
        </div>
      </div>

      <div class="filter-bar">
        <span class="material-symbols-outlined filter-icon">search</span>
        <input type="text" class="filter-input" [(ngModel)]="filterText" placeholder="Search by offer name or code...">
        <select class="filter-select" [(ngModel)]="statusFilter">
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="expired">Expired</option>
        </select>
      </div>

      <div class="luxury-form-overlay" *ngIf="showForm">
        <div class="luxury-form-card">
          <h3>{{editMode ? 'EDIT' : 'NEW'}} DISCOUNT OFFER</h3>
          <form (ngSubmit)="save()">
            <div class="grid-form">
              <div class="form-group">
                <label>OFFER NAME <span class="required">*</span></label>
                <input type="text" [(ngModel)]="current.name" name="name" #nameField="ngModel" required placeholder="Ex. Summer Special">
                <span class="field-error" *ngIf="nameField.invalid && submitted">Required</span>
              </div>
              <div class="form-group">
                <label>PROMO CODE <span class="required">*</span></label>
                <input type="text" [(ngModel)]="current.code" name="code" #codeField="ngModel" required placeholder="Ex. SUMMER20">
                <span class="field-error" *ngIf="codeField.invalid && submitted">Required</span>
              </div>
              <div class="form-group">
                <label>DISCOUNT TYPE <span class="required">*</span></label>
                <select [(ngModel)]="current.type" name="type" required>
                  <option value="percentage">Percentage (%)</option>
                  <option value="flat">Flat Amount (₹)</option>
                </select>
              </div>
              <div class="form-group">
                <label>{{current.type === 'percentage' ? 'DISCOUNT %' : 'DISCOUNT AMOUNT (₹)'}} <span class="required">*</span></label>
                <input type="number" [(ngModel)]="current.value" name="value" #valueField="ngModel" required [placeholder]="current.type === 'percentage' ? 'Ex. 20' : 'Ex. 500'">
                <span class="field-error" *ngIf="valueField.invalid && submitted">Required</span>
              </div>
              <div class="form-group">
                <label>APPLICABLE TO <span class="required">*</span></label>
                <select [(ngModel)]="current.applicableTo" name="applicableTo" required>
                  <option value="all">All Services</option>
                  <option value="service">Specific Service</option>
                  <option value="client">Specific Client</option>
                </select>
              </div>
              <div class="form-group">
                <label>EXPIRY DATE <span class="required">*</span></label>
                <input type="date" [(ngModel)]="current.expiryDate" name="expiryDate" #expiryField="ngModel" required [min]="today">
                <span class="field-error" *ngIf="expiryField.invalid && submitted">Required</span>
              </div>
              <div class="form-group">
                <label>MINIMUM PURCHASE (₹)</label>
                <input type="number" [(ngModel)]="current.minPurchase" name="minPurchase" placeholder="0 = No minimum">
              </div>
              <div class="form-group">
                <label>DESCRIPTION</label>
                <textarea [(ngModel)]="current.description" name="description" rows="2" placeholder="Offer description"></textarea>
              </div>
              <div class="form-group">
                <label class="toggle-label">
                  <input type="checkbox" [(ngModel)]="current.active" name="active" class="toggle-checkbox">
                  <span class="toggle-text">Active</span>
                </label>
              </div>
            </div>
            <div class="actions">
              <button type="submit" class="btn btn-primary">{{editMode ? 'UPDATE OFFER' : 'CREATE OFFER'}}</button>
              <button type="button" class="btn btn-secondary" (click)="showForm=false">DISCARD</button>
            </div>
          </form>
        </div>
      </div>

      <div class="table-scroll" *ngIf="discountList.length">
      <div class="table-container">
        <table class="table">
          <thead>
            <tr>
              <th>OFFER</th>
              <th>CODE</th>
              <th>DISCOUNT</th>
              <th>EXPIRY</th>
              <th>MIN PURCHASE</th>
              <th>STATUS</th>
              <th style="text-align: right;">ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let d of filteredList">
              <td>
                <div style="font-family: var(--font-heading); font-weight: 700;">{{d.name}}</div>
                <div class="desc-cell">{{d.description}}</div>
              </td>
              <td><span class="mastery-tag">{{d.code}}</span></td>
              <td style="font-weight: 700; color: var(--gold-hover);">
                {{d.type === 'percentage' ? d.value + '%' : '₹' + d.value}}
              </td>
              <td>
                <span class="expiry-text" [class.expired]="isExpired(d)">{{d.expiryDate | date:'mediumDate'}}</span>
              </td>
              <td style="font-size: 0.8rem; color: #888;">{{d.minPurchase ? '₹' + d.minPurchase : '—'}}</td>
              <td>
                <span class="status-badge-sm"
                      [class.active-badge]="d.active && !isExpired(d)"
                      [class.inactive-badge]="!d.active || isExpired(d)">
                  {{isExpired(d) ? 'EXPIRED' : d.active ? 'ACTIVE' : 'INACTIVE'}}
                </span>
              </td>
              <td style="text-align: right;">
                <div style="display: flex; gap: 1rem; justify-content: flex-end;">
                  <button class="btn btn-secondary" style="padding: 0.5rem;" (click)="openEdit(d)">
                    <span class="material-symbols-outlined">edit_note</span>
                  </button>
                  <button class="btn btn-danger" style="padding: 0.5rem;" (click)="delete(d._id)">
                    <span class="material-symbols-outlined">delete_forever</span>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      </div>

      <div *ngIf="!discountList.length && !showForm" class="empty-state">
        <span class="material-symbols-outlined" style="font-size: 3rem; color: var(--border); margin-bottom: 1rem;">sell</span>
        <p>NO DISCOUNTS OR OFFERS YET</p>
        <p style="font-size: 0.75rem; color: #999;">Create promotional offers to attract more clients</p>
      </div>
    </div>
  `,
  styles: [`
    .stats-row { display: flex; gap: 1.5rem; margin-bottom: 2rem; }
    .stat-mini { display: flex; flex-direction: column; align-items: center; padding: 1rem 2rem; background: var(--white); border: 1px solid var(--border); min-width: 120px; transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94); animation: fadeInUp 0.5s ease-out both; cursor: default; }
    .stat-mini:nth-child(1) { animation-delay: 0.05s; }
    .stat-mini:nth-child(2) { animation-delay: 0.10s; }
    .stat-mini:nth-child(3) { animation-delay: 0.15s; }
    .stat-mini:hover { transform: translateY(-4px); border-color: var(--gold); box-shadow: 0 6px 20px rgba(0,0,0,0.08); }
    .stat-mini-val { font-family: var(--font-heading); font-size: 1.6rem; font-weight: 700; color: var(--gold); transition: color 0.3s ease; }
    .stat-mini:hover .stat-mini-val { color: var(--gold-hover); }
    .stat-mini-lbl { font-size: 0.55rem; letter-spacing: 0.1em; color: #999; font-weight: 600; transition: color 0.3s ease; }
    .stat-mini:hover .stat-mini-lbl { color: var(--gold); }
    .desc-cell { font-size: 0.7rem; color: #999; margin-top: 0.2rem; }
    .required { color: var(--danger); animation: fadeIn 0.3s ease both; }
    .field-error { color: var(--danger); font-size: 0.65rem; display: block; margin-top: 0.2rem; animation: fadeInDown 0.3s ease both; }
    .status-badge-sm { padding: 0.25rem 0.6rem; font-size: 0.6rem; font-weight: 700; letter-spacing: 0.05em; transition: all 0.3s ease; }
    .status-badge-sm:hover { transform: scale(1.05); }
    .active-badge { background: #f0fdf4; color: #16a34a; }
    .inactive-badge { background: #fef2f2; color: #991b1b; }
    .expiry-text { font-size: 0.75rem; color: var(--charcoal); transition: color 0.3s ease; }
    .expiry-text.expired { color: var(--danger); text-decoration: line-through; }
    .toggle-label { display: flex; align-items: center; gap: 0.5rem; cursor: pointer; transition: opacity 0.3s ease; }
    .toggle-label:hover { opacity: 0.8; }
    .toggle-checkbox { width: 18px; height: 18px; accent-color: var(--gold); cursor: pointer; transition: transform 0.3s ease; }
    .toggle-checkbox:hover { transform: scale(1.15); }
    .toggle-text { font-size: 0.8rem; font-weight: 600; color: var(--charcoal); }
    .table-scroll { overflow-y: auto; max-height: 65vh; border: 1px solid var(--border); animation: fadeInUp 0.5s ease-out both; }
    .table-scroll::-webkit-scrollbar { width: 8px; }
    .table-scroll::-webkit-scrollbar-track { background: var(--cream); }
    .table-scroll::-webkit-scrollbar-thumb { background: var(--gold); border-radius: 4px; }
    .table-scroll::-webkit-scrollbar-thumb:hover { background: var(--gold-hover); }
  `]
})
export class DiscountsComponent implements OnInit {
  discountList: any[] = [];
  filterText = '';
  statusFilter = '';
  showForm = false;
  editMode = false;
  submitted = false;
  current: any = { name: '', code: '', type: 'percentage', value: 0, applicableTo: 'all', expiryDate: '', minPurchase: 0, description: '', active: true };

  get filteredList() {
    const q = this.filterText.toLowerCase().trim();
    let list = this.discountList;
    if (q) {
      list = list.filter(d =>
        d.name?.toLowerCase().includes(q) ||
        d.code?.toLowerCase().includes(q)
      );
    }
    if (this.statusFilter === 'active') {
      list = list.filter(d => d.active && !this.isExpired(d));
    } else if (this.statusFilter === 'inactive') {
      list = list.filter(d => !d.active && !this.isExpired(d));
    } else if (this.statusFilter === 'expired') {
      list = list.filter(d => this.isExpired(d));
    }
    return list;
  }

  constructor(
    private discountService: DiscountService,
    private toastService: ToastService,
    private confirmService: ConfirmService
  ) {}

  ngOnInit() { this.load(); }

  get today(): string { return new Date().toISOString().split('T')[0]; }

  get activeCount() { return this.discountList.filter(d => d.active && !this.isExpired(d)).length; }
  get expiredCount() { return this.discountList.filter(d => this.isExpired(d)).length; }

  isExpired(d: any): boolean {
    if (!d.expiryDate) return false;
    return new Date(d.expiryDate) < new Date(this.today);
  }

  load() { this.discountService.getDiscounts().subscribe(data => this.discountList = data); }

  openNew() {
    this.editMode = false;
    this.submitted = false;
    this.current = { name: '', code: '', type: 'percentage', value: 0, applicableTo: 'all', expiryDate: '', minPurchase: 0, description: '', active: true };
    this.showForm = true;
  }

  openEdit(d: any) {
    this.editMode = true;
    this.submitted = false;
    this.current = { ...d };
    this.showForm = true;
  }

  save() {
    this.submitted = true;
    if (!this.current.name || !this.current.code || !this.current.value || !this.current.expiryDate) {
      this.toastService.show('FILL ALL REQUIRED FIELDS', 'error');
      return;
    }
    if (this.editMode) {
      this.discountService.updateDiscount(this.current._id, this.current).subscribe({
        next: () => {
          this.toastService.show('OFFER UPDATED');
          this.load();
          this.showForm = false;
        },
        error: (err) => this.toastService.show(err.error?.message || 'ERROR', 'error')
      });
    } else {
      this.discountService.createDiscount(this.current).subscribe({
        next: () => {
          this.toastService.show('OFFER CREATED');
          this.load();
          this.showForm = false;
        },
        error: (err) => this.toastService.show(err.error?.message || 'ERROR', 'error')
      });
    }
  }

  delete(id: string) {
    this.confirmService.confirm('Are you sure you want to delete this offer? This cannot be undone.').subscribe(result => {
      if (result) {
        this.discountService.deleteDiscount(id).subscribe({
          next: () => {
            this.toastService.show('OFFER REMOVED', 'info');
            this.load();
          }
        });
      }
    });
  }
}
