import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.css'
})
export class SettingsComponent implements OnInit {
  salonName = 'Royal Salon';
  currency = 'INR';
  taxRate = 18;

  oldPassword = '';
  newPassword = '';
  confirmPassword = '';
  showOld = false;
  showNew = false;
  showConfirm = false;

  constructor(private toastService: ToastService) {}

  ngOnInit(): void {
    const saved = localStorage.getItem('settings');
    if (saved) {
      const data = JSON.parse(saved);
      this.salonName = data.salonName;
      this.currency = data.currency;
      this.taxRate = data.taxRate;
    }
  }

  save() {
    const settings = { salonName: this.salonName, currency: this.currency, taxRate: this.taxRate };
    localStorage.setItem('settings', JSON.stringify(settings));
    this.toastService.show('CONFIGURATION APPLIED', 'success');
  }

  private get storedPassword(): string {
    return localStorage.getItem('adminPassword') || 'aurashineinfotech';
  }

  private set storedPassword(pwd: string) {
    localStorage.setItem('adminPassword', pwd);
  }

  changePassword() {
    if (!this.oldPassword || !this.newPassword || !this.confirmPassword) {
      this.toastService.show('FILL ALL PASSWORD FIELDS', 'error');
      return;
    }
    if (this.oldPassword !== this.storedPassword) {
      this.toastService.show('CURRENT PASSWORD IS INCORRECT', 'error');
      return;
    }
    if (this.newPassword.length < 6) {
      this.toastService.show('NEW PASSWORD MUST BE AT LEAST 6 CHARACTERS', 'error');
      return;
    }
    if (this.newPassword !== this.confirmPassword) {
      this.toastService.show('NEW PASSWORDS DO NOT MATCH', 'error');
      return;
    }
    if (this.newPassword === this.oldPassword) {
      this.toastService.show('NEW PASSWORD MUST DIFFER FROM CURRENT', 'error');
      return;
    }
    this.storedPassword = this.newPassword;
    this.oldPassword = '';
    this.newPassword = '';
    this.confirmPassword = '';
    this.toastService.show('PASSWORD UPDATED SUCCESSFULLY', 'success');
  }
}
