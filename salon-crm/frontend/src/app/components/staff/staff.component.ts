import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StaffService } from '../../services/staff.service';
import { ToastService } from '../../services/toast.service';
import { AppointmentService } from '../../services/appointment.service';
import { ConfirmService } from '../../services/confirm.service';

@Component({
  selector: 'app-staff',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './staff.component.html',
  styleUrl: './staff.component.css'
})
export class StaffComponent implements OnInit {
  staffList: any[] = [];
  filterText = '';
  specFilter = '';
  showForm = false;
  editMode = false;
  current: any = { name: '', specialization: '' };

  get uniqueSpecs() {
    return [...new Set(this.staffList.map(s => s.specialization).filter(Boolean))];
  }

  get filteredList() {
    const q = this.filterText.toLowerCase().trim();
    let list = this.staffList;
    if (q) {
      list = list.filter(s =>
        s.name?.toLowerCase().includes(q) ||
        s.specialization?.toLowerCase().includes(q)
      );
    }
    if (this.specFilter) {
      list = list.filter(s => s.specialization === this.specFilter);
    }
    return list;
  }

  showScheduleModal = false;
  selectedStaff: any = null;
  staffSchedule: any[] = [];

  constructor(
    private staffService: StaffService,
    private toastService: ToastService,
    private appointmentService: AppointmentService,
    private confirmService: ConfirmService
  ) {}

  ngOnInit(): void {
    this.loadStaff();
  }

  loadStaff() {
    this.staffService.getStaff().subscribe(data => this.staffList = data);
  }

  openNew() {
    this.editMode = false;
    this.current = { name: '', specialization: '' };
    this.showForm = true;
  }

  openEdit(s: any) {
    this.editMode = true;
    this.current = { ...s };
    this.showForm = true;
  }

  save() {
    if (this.editMode) {
      this.staffService.updateStaff(this.current._id, this.current).subscribe({
        next: () => {
          this.toastService.show('SPECIALIST PROFILE REFINED');
          this.loadStaff();
          this.showForm = false;
        },
        error: (err) => this.toastService.show(err.error?.message || err.message || 'UPDATE FAILED', 'error')
      });
    } else {
      this.staffService.createStaff(this.current).subscribe({
        next: () => {
          this.toastService.show('NEW SPECIALIST ENROLLED');
          this.loadStaff();
          this.showForm = false;
        },
        error: (err) => this.toastService.show(err.error?.message || err.message || 'ENROLLMENT FAILED', 'error')
      });
    }
  }

  viewSchedule(s: any) {
    this.selectedStaff = s;
    const now = new Date();
    const dayOfWeek = now.getDay();
    const diffToMon = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const monday = new Date(now);
    monday.setDate(now.getDate() + diffToMon);
    monday.setHours(0, 0, 0, 0);
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    sunday.setHours(23, 59, 59, 999);

    this.appointmentService.getAppointments().subscribe(apps => {
      this.staffSchedule = apps.filter(a => {
        if (!a.date) return false;
        const aDate = new Date(a.date);
        return String(a.staffId) === String(s._id) && aDate >= monday && aDate <= sunday;
      }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    });
    this.showScheduleModal = true;
  }

  closeScheduleModal() {
    this.showScheduleModal = false;
    this.selectedStaff = null;
    this.staffSchedule = [];
  }

  getDayName(dateStr: string): string {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[new Date(dateStr).getDay()];
  }

  getStatusClass(status: string): string {
    const s = (status || 'Booked').toLowerCase();
    return s === 'completed' ? 'status-completed' : s === 'cancelled' ? 'status-cancelled' : 'status-booked';
  }

  delete(id: string) {
    this.confirmService.confirm('Are you sure you want to delete this? This cannot be undone.').subscribe(result => {
      if (result) {
        this.staffService.deleteStaff(id).subscribe({
          next: () => {
            this.toastService.show('SPECIALIST REMOVED', 'info');
            this.loadStaff();
          },
          error: () => this.toastService.show('DELETION FAILED', 'error')
        });
      }
    });
  }

  closeModalOnOverlay(event: MouseEvent) {
    if ((event.target as HTMLElement).classList.contains('luxury-form-overlay')) {
      this.closeScheduleModal();
    }
  }
}
