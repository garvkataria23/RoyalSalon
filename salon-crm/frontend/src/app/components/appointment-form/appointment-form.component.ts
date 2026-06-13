import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { AppointmentService } from '../../services/appointment.service';
import { StaffService } from '../../services/staff.service';
import { SalonService } from '../../services/salon-service.service';
import { ToastService } from '../../services/toast.service';
import { ConfirmService } from '../../services/confirm.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { jsPDF } from 'jspdf';

@Component({
  selector: 'app-appointment-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './appointment-form.component.html',
  styleUrl: './appointment-form.component.css'
})
export class AppointmentFormComponent implements OnInit {
  appointment: any = {
    clientName: '',
    clientPhone: '',
    staffId: '',
    staffName: '',
    date: '',
    timeSlot: '',
    service: '',
    price: 0,
    discount: 0,
    notes: '',
    status: 'Booked'
  };
  isEdit: boolean = false;
  id: string | null = null;
  services: any[] = [];
  staffList: any[] = [];
  statuses: string[] = ['Booked', 'Completed', 'Cancelled'];
  isStatusChanging: boolean = false;

  allTimeSlots: string[] = AppointmentFormComponent.generateTimeSlots();
  showTimePicker = false;

  static generateTimeSlots(): string[] {
    return [
      '09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
      '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM',
      '05:00 PM', '06:00 PM'
    ];
  }
  showRescheduleModal: boolean = false;
  rescheduleDate: string = '';
  rescheduleTime: string = '';
  availableTimeSlots: string[] = [];
  isRescheduling: boolean = false;
  isSaving: boolean = false;
  minDate: string = new Date().toISOString().split('T')[0];

  showShareModal: boolean = false;
  shareMessage: string = '';

  get salonName(): string {
    const saved = localStorage.getItem('settings');
    if (saved) {
      const settings = JSON.parse(saved);
      return settings.salonName || 'Royal Salon';
    }
    return 'Royal Salon';
  }

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private appointmentService: AppointmentService,
    private staffService: StaffService,
    private salonService: SalonService,
    private toastService: ToastService,
    private confirmService: ConfirmService
  ) {}

  ngOnInit(): void {
    forkJoin({
      services: this.salonService.getServices(),
      staff: this.staffService.getStaff()
    }).subscribe(({ services, staff }) => {
      this.services = services;
      this.staffList = staff;
    });

    this.id = this.route.snapshot.paramMap.get('id');
    if (this.id) {
      this.isEdit = true;
      this.appointmentService.getAppointments().subscribe(apps => {
        const found = apps.find(a => a._id === this.id);
        if (found) {
          this.appointment = { ...found };
          this.appointment.date = new Date(this.appointment.date).toISOString().split('T')[0];
        }
      });
    } else {
      this.route.queryParams.subscribe(params => {
        if (params['staffId']) {
            this.appointment.staffId = params['staffId'];
            this.appointment.staffName = params['staffName'];
            this.appointment.timeSlot = params['time'];
            this.appointment.date = params['date'];
        }
      });
    }
  }

  onStaffChange() {
    const selected = this.staffList.find(s => s._id === this.appointment.staffId);
    if (selected) {
      this.appointment.staffName = selected.name;
    }
  }

  onServiceChange() {
    const selected = this.services.find(s => s.name === this.appointment.service);
    if (selected) {
      this.appointment.price = selected.price;
    }
  }

  save() {
    if (this.isSaving) return;
    this.isSaving = true;
    if (this.isEdit) {
      this.appointmentService.updateAppointment(this.id!, this.appointment).subscribe({
        next: () => {
          this.isSaving = false;
          this.toastService.show('RESERVATION UPDATED SUCCESSFULLY');
          this.router.navigate(['/home/calendar']);
        },
        error: () => {
          this.isSaving = false;
          this.toastService.show('FAILED TO UPDATE RESERVATION', 'error');
        }
      });
    } else {
      this.appointmentService.createAppointment(this.appointment).subscribe({
        next: () => {
          this.isSaving = false;
          this.toastService.show('RESERVATION CONFIRMED');
          this.router.navigate(['/home/calendar']);
        },
        error: () => {
          this.isSaving = false;
          this.toastService.show('BOOKING FAILED', 'error');
        }
      });
    }
  }

  goBack() {
    this.router.navigate(['/home/calendar']);
  }

  cancelAppointment() {
    this.confirmService.confirm('Are you sure you want to delete this? This cannot be undone.').subscribe(result => {
      if (result) {
        this.appointmentService.deleteAppointment(this.id!).subscribe({
          next: () => {
            this.toastService.show('RESERVATION CANCELLED', 'info');
            this.router.navigate(['/home/calendar']);
          },
          error: () => this.toastService.show('CANCELLATION FAILED', 'error')
        });
      }
    });
  }

  openRescheduleModal() {
    this.rescheduleDate = this.appointment.date;
    this.rescheduleTime = this.appointment.timeSlot;
    this.showRescheduleModal = true;
    this.loadAvailableTimeSlots();
  }

  closeRescheduleModal() {
    this.showRescheduleModal = false;
    this.rescheduleDate = '';
    this.rescheduleTime = '';
    this.availableTimeSlots = [];
  }

  onRescheduleDateChange() {
    this.rescheduleTime = '';
    this.loadAvailableTimeSlots();
  }

  loadAvailableTimeSlots() {
    if (!this.rescheduleDate || !this.appointment.staffId) {
      this.availableTimeSlots = [];
      return;
    }
    this.appointmentService.getAppointments().subscribe(apps => {
      const staffId = String(this.appointment.staffId);
      const booked = apps.filter(app => {
        const appDate = new Date(app.date).toISOString().split('T')[0];
        const matchDate = appDate === this.rescheduleDate;
        const matchStaff = app.staffId && String(app.staffId) === staffId;
        const isActive = app.status !== 'Cancelled';
        const isDifferentApp = String(app._id) !== String(this.id);
        return matchDate && matchStaff && isActive && isDifferentApp;
      }).map(app => app.timeSlot);
      this.availableTimeSlots = this.allTimeSlots.filter(slot => !booked.includes(slot));
    });
  }

  selectTimeSlot(slot: string) {
    this.rescheduleTime = slot;
  }

  selectSlot(slot: string) {
    this.appointment.timeSlot = slot;
    this.showTimePicker = false;
  }

  closeTimePicker() {
    this.showTimePicker = false;
  }

  confirmReschedule() {
    if (!this.rescheduleDate || !this.rescheduleTime || this.isRescheduling) return;
    this.isRescheduling = true;
    this.appointmentService.updateAppointment(this.id!, {
      date: this.rescheduleDate,
      timeSlot: this.rescheduleTime
    }).subscribe({
      next: () => {
        this.isRescheduling = false;
        this.closeRescheduleModal();
        this.toastService.show('Appointment rescheduled successfully');
        this.router.navigate(['/home/calendar']);
      },
      error: () => {
        this.isRescheduling = false;
        this.toastService.show('RESCHEDULE FAILED', 'error');
      }
    });
  }

  updateStatus(status: string) {
    if (this.isStatusChanging || status === this.appointment.status) return;
    this.isStatusChanging = true;
    this.appointmentService.updateStatus(this.id!, status).subscribe({
      next: () => {
        this.appointment.status = status;
        this.isStatusChanging = false;
        this.toastService.show(`STATUS CHANGED TO ${status.toUpperCase()}`, 'success');
      },
      error: () => {
        this.isStatusChanging = false;
        this.toastService.show('STATUS UPDATE FAILED', 'error');
      }
    });
  }

  get canGenerateBill(): boolean {
    return this.appointment.status === 'Completed';
  }

  generateBill() {
    if (!this.canGenerateBill) {
      this.toastService.show('COMPLETE APPOINTMENT FIRST TO GENERATE BILL', 'info');
      return;
    }
    this.router.navigate(['/home/billing', this.id]);
  }

  openShareModal() {
    this.shareMessage = 
`Appointment Confirmed!
Client: ${this.appointment.clientName}
Service: ${this.appointment.service}
Staff: ${this.appointment.staffName}
Date: ${this.appointment.date} at ${this.appointment.timeSlot}
Amount: ₹${this.appointment.price}
Thank you for choosing ${this.salonName}!`;
    this.showShareModal = true;
  }

  closeShareModal() {
    this.showShareModal = false;
  }

  copyToClipboard() {
    navigator.clipboard.writeText(this.shareMessage).then(() => {
      this.toastService.show('COPIED TO CLIPBOARD');
      this.closeShareModal();
    });
  }

  private generatePdf(): jsPDF {
    const doc = new jsPDF({ format: 'a4', unit: 'mm' });
    const pageW = 190;
    let y = 20;

    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text(this.salonName.toUpperCase(), pageW / 2, y, { align: 'center' });
    y += 8;
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text('APPOINTMENT CONFIRMATION', pageW / 2, y, { align: 'center' });
    y += 12;

    doc.setDrawColor(197, 160, 89);
    doc.setLineWidth(0.5);
    doc.line(10, y, 200, y);
    y += 10;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('Details:', 10, y);
    doc.setFont('helvetica', 'normal');
    doc.text(`Client: ${this.appointment.clientName}`, 10, y + 7);
    doc.text(`Service: ${this.appointment.service}`, 10, y + 14);
    doc.text(`Staff: ${this.appointment.staffName}`, 10, y + 21);
    doc.text(`Date: ${this.appointment.date}`, 10, y + 28);
    doc.text(`Time: ${this.appointment.timeSlot}`, 10, y + 35);
    doc.text(`Amount: ₹${this.appointment.price}`, 10, y + 42);

    doc.setFont('helvetica', 'bold');
    doc.text(`Status: ${this.appointment.status?.toUpperCase() || 'BOOKED'}`, pageW, y + 42, { align: 'right' });
    y += 55;

    doc.setDrawColor(200);
    doc.line(10, y, 200, y);
    y += 8;

    doc.setTextColor(150);
    doc.setFontSize(7);
    doc.text('Thank you for choosing ' + this.salonName, pageW / 2, y, { align: 'center' });
    doc.text('Generated by Royal Salon CRM', pageW / 2, y + 4, { align: 'center' });

    return doc;
  }

  sharePdf() {
    const doc = this.generatePdf();
    const pdfBlob = doc.output('blob');
    const file = new File([pdfBlob], `appointment-${this.appointment.clientName.replace(/\s+/g, '_')}.pdf`, { type: 'application/pdf' });

    if (navigator.share && navigator.canShare?.({ files: [file] })) {
      navigator.share({ files: [file], title: 'Appointment', text: `Appointment from ${this.salonName}` }).catch(() => {});
    } else {
      const url = URL.createObjectURL(pdfBlob);
      window.open(url, '_blank');
      setTimeout(() => URL.revokeObjectURL(url), 10000);
      this.toastService.show('PDF OPENED — SAVE & SHARE VIA WHATSAPP');
    }
    this.closeShareModal();
  }

  downloadPdf() {
    const doc = this.generatePdf();
    doc.save(`appointment-${this.appointment.clientName.replace(/\s+/g, '_')}.pdf`);
    this.toastService.show('APPOINTMENT PDF DOWNLOADED');
    this.closeShareModal();
  }
}
