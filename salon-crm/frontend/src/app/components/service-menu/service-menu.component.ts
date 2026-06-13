import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SalonService } from '../../services/salon-service.service';
import { ToastService } from '../../services/toast.service';
import { ConfirmService } from '../../services/confirm.service';

@Component({
  selector: 'app-service-menu',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-container fade-in">
      <div class="page-header">
        <h2>Service Portfolio</h2>
        <button class="btn btn-primary" (click)="openNew()">
          <span class="material-symbols-outlined">add_circle</span>
          ADD NEW CURATION
        </button>
      </div>

      <div class="filter-bar">
        <span class="material-symbols-outlined filter-icon">search</span>
        <input type="text" class="filter-input" [(ngModel)]="filterText" placeholder="Search by name...">
        <select class="filter-select" [(ngModel)]="categoryFilter">
          <option value="">All Categories</option>
          <option value="Hair">Hair</option>
          <option value="Skin">Skin</option>
          <option value="Nails">Nails</option>
          <option value="Massage">Massage</option>
        </select>
      </div>

      <div class="luxury-form-overlay" *ngIf="showForm">
        <div class="luxury-form-card">
          <h3>{{editMode ? 'REFINE' : 'NEW'}} SERVICE CURATION</h3>
          <form (ngSubmit)="save()">
            <div class="grid-form">
              <div class="form-group">
                <label>SERVICE NAME</label>
                <input type="text" [(ngModel)]="current.name" name="name" required placeholder="Ex. Royal Gold Facial">
              </div>
              <div class="form-group">
                <label>PRICE (FEE)</label>
                <input type="number" [(ngModel)]="current.price" name="price" required>
              </div>
              <div class="form-group">
                <label>DURATION</label>
                <input type="text" [(ngModel)]="current.duration" name="duration" placeholder="Ex. 45 mins">
              </div>
              <div class="form-group">
                <label>CATEGORY</label>
                <select [(ngModel)]="current.category" name="category">
                  <option value="Hair">Hair</option>
                  <option value="Skin">Skin</option>
                  <option value="Nails">Nails</option>
                  <option value="Massage">Massage</option>
                </select>
              </div>
            </div>
            <div class="actions">
              <button type="submit" class="btn btn-primary">SAVE SERVICE</button>
              <button type="button" class="btn btn-secondary" (click)="showForm=false">DISCARD</button>
            </div>
          </form>
        </div>
      </div>

      <div class="table-container" *ngIf="serviceList.length">
        <table class="table">
          <thead>
            <tr>
              <th>CURATION</th>
              <th>CATEGORY</th>
              <th>DURATION</th>
              <th>FEE</th>
              <th style="text-align: right;">ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let s of filteredList">
              <td style="font-family: var(--font-heading); font-weight: 700;">{{s.name}}</td>
              <td><span class="mastery-tag">{{s.category}}</span></td>
              <td style="color: #888; font-size: 0.8rem;">{{s.duration}}</td>
              <td style="font-weight: 700; color: var(--gold-hover);">₹{{s.price}}</td>
              <td style="text-align: right;">
                <div style="display: flex; gap: 1rem; justify-content: flex-end;">
                  <button class="btn btn-secondary" style="padding: 0.5rem;" (click)="openEdit(s)">
                    <span class="material-symbols-outlined">edit_note</span>
                  </button>
                  <button class="btn btn-danger" style="padding: 0.5rem;" (click)="delete(s._id)">
                    <span class="material-symbols-outlined">delete_forever</span>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <div *ngIf="!serviceList.length && !showForm" class="empty-state">
        <span class="material-symbols-outlined">flatware</span>
        <p>THE PORTFOLIO IS CURRENTLY EMPTY</p>
      </div>
    </div>
  `
})
export class ServiceMenuComponent implements OnInit {
  serviceList: any[] = [];
  filterText = '';
  categoryFilter = '';
  showForm = false;
  editMode = false;
  current: any = { name: '', price: 0, duration: '60 mins', category: 'Hair' };

  get filteredList() {
    const q = this.filterText.toLowerCase().trim();
    let list = this.serviceList;
    if (q) {
      list = list.filter(s => s.name?.toLowerCase().includes(q));
    }
    if (this.categoryFilter) {
      list = list.filter(s => s.category === this.categoryFilter);
    }
    return list;
  }

  constructor(
    private salonService: SalonService,
    private toastService: ToastService,
    private confirmService: ConfirmService
  ) {}

  ngOnInit() { this.loadServices(); }

  loadServices() { this.salonService.getServices().subscribe(data => this.serviceList = data); }

  openNew() {
    this.editMode = false;
    this.current = { name: '', price: 0, duration: '60 mins', category: 'Hair' };
    this.showForm = true;
  }

  openEdit(s: any) {
    this.editMode = true;
    this.current = { ...s };
    this.showForm = true;
  }

  save() {
    if (this.editMode) {
      this.salonService.updateService(this.current._id, this.current).subscribe({
        next: () => {
          this.toastService.show('PORTFOLIO UPDATED');
          this.loadServices();
          this.showForm = false;
        },
        error: (err) => this.toastService.show(err.error?.message || 'ERROR', 'error')
      });
    } else {
      this.salonService.createService(this.current).subscribe({
        next: () => {
          this.toastService.show('NEW CURATION ADDED');
          this.loadServices();
          this.showForm = false;
        },
        error: (err) => this.toastService.show(err.error?.message || 'ERROR', 'error')
      });
    }
  }

  delete(id: string) {
    this.confirmService.confirm('Are you sure you want to delete this? This cannot be undone.').subscribe(result => {
      if (result) {
        this.salonService.deleteService(id).subscribe({
          next: () => {
            this.toastService.show('SERVICE REMOVED', 'info');
            this.loadServices();
          }
        });
      }
    });
  }
}
