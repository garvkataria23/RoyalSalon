import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AppointmentService } from '../../services/appointment.service';
import { ToastService } from '../../services/toast.service';
import { CommonModule } from '@angular/common';
import { jsPDF } from 'jspdf';

@Component({
  selector: 'app-billing',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './billing.component.html',
  styleUrl: './billing.component.css'
})
export class BillingComponent implements OnInit {
  appointment: any;
  tax: number = 0;
  editDiscount: number = 0;
  total: number = 0;
  taxRate: number = 18;
  isUpdating: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private appointmentService: AppointmentService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadSettings();
      this.appointmentService.getAppointments().subscribe(apps => {
        this.appointment = apps.find(a => a._id === id);
        if (this.appointment) {
          this.editDiscount = this.appointment.discount || 0;
          this.calculateTotal();
        }
      });
    }
  }

  get invoiceNumber(): string {
    if (!this.appointment) return '';
    const storedKey = `invoice_${this.appointment._id}`;
    const stored = localStorage.getItem(storedKey);
    if (stored) return stored;

    if (this.isPaid) {
      const today = new Date();
      const y = today.getFullYear();
      const m = String(today.getMonth() + 1).padStart(2, '0');
      const d = String(today.getDate()).padStart(2, '0');
      const dateStr = `${y}${m}${d}`;
      const counterKey = `invoice_counter_${dateStr}`;
      let counter = parseInt(localStorage.getItem(counterKey) || '0', 10);
      counter++;
      localStorage.setItem(counterKey, String(counter));
      const num = `INV-${dateStr}-${String(counter).padStart(3, '0')}`;
      localStorage.setItem(storedKey, num);
      return num;
    }
    return 'INV-PENDING';
  }

  get isPaid(): boolean {
    return this.appointment?.status === 'Completed';
  }

  loadSettings() {
    const saved = localStorage.getItem('settings');
    if (saved) {
      const settings = JSON.parse(saved);
      this.taxRate = settings.taxRate || 18;
    }
  }

  calculateTotal() {
    const base = this.appointment.price || 0;
    const disc = this.editDiscount || 0;
    this.tax = (base - disc) * (this.taxRate / 100);
    this.total = base - disc + this.tax;
  }

  onDiscountChange() {
    this.calculateTotal();
  }

  markAsPaid() {
    if (this.isUpdating || this.isPaid) return;
    this.isUpdating = true;
    this.saveDiscountFirst(() => {
      this.appointmentService.updateStatus(this.appointment._id, 'Completed').subscribe({
        next: () => {
          this.appointment.status = 'Completed';
          this.isUpdating = false;
          this.toastService.show('Invoice marked as paid');
        },
        error: () => {
          this.isUpdating = false;
          this.toastService.show('FAILED TO MARK AS PAID', 'error');
        }
      });
    });
  }

  private saveDiscountFirst(callback: () => void) {
    if (this.editDiscount !== (this.appointment.discount || 0)) {
      this.appointmentService.updateAppointment(this.appointment._id, { discount: this.editDiscount }).subscribe({
        next: () => {
          this.appointment.discount = this.editDiscount;
          callback();
        },
        error: () => {
          this.toastService.show('DISCOUNT SAVE FAILED, PROCEEDING', 'error');
          callback();
        }
      });
    } else {
      callback();
    }
  }

  get salonName(): string {
    const saved = localStorage.getItem('settings');
    if (saved) {
      const settings = JSON.parse(saved);
      return settings.salonName || 'Royal Salon';
    }
    return 'Royal Salon';
  }

  showShareModal: boolean = false;
  shareMessage: string = '';

  openShareModal() {
    this.shareMessage = 
`Invoice from ${this.salonName}
Client: ${this.appointment.clientName}
Service: ${this.appointment.service}
Date: ${this.appointment.date}
Amount: ₹${this.appointment.price}
Discount: ₹${this.editDiscount}
Tax: ₹${this.tax}
Total: ₹${this.total}
Thank you!`;
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

  shareWhatsApp() {
    const encoded = encodeURIComponent(this.shareMessage);
    window.open(`https://wa.me/?text=${encoded}`, '_blank');
    this.closeShareModal();
  }

  shareEmail() {
    const subject = encodeURIComponent(`Invoice from ${this.salonName}`);
    const body = encodeURIComponent(this.shareMessage);
    window.open(`mailto:?subject=${subject}&body=${body}`, '_blank');
    this.closeShareModal();
  }

  private generatePdf(): jsPDF {
    const doc = new jsPDF({ format: 'a4', unit: 'mm' });
    const pageW = 190;
    let y = 20;

    // Header
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text(this.salonName.toUpperCase(), pageW / 2, y, { align: 'center' });
    y += 8;
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text('INVOICE', pageW / 2, y, { align: 'center' });
    y += 12;

    // Divider
    doc.setDrawColor(197, 160, 89);
    doc.setLineWidth(0.5);
    doc.line(10, y, 200, y);
    y += 8;

    // Details
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('Bill To:', 10, y);
    doc.setFont('helvetica', 'normal');
    doc.text(`Client: ${this.appointment.clientName}`, 10, y + 6);
    doc.text(`Service: ${this.appointment.service}`, 10, y + 12);
    doc.text(`Date: ${this.appointment.date}`, 10, y + 18);

    doc.setFont('helvetica', 'bold');
    doc.text('Invoice #', pageW, y);
    doc.setFont('helvetica', 'normal');
    doc.text(this.appointment._id.slice(-8).toUpperCase(), pageW, y + 6, { align: 'right' });
    y += 30;

    // Table header
    doc.setFillColor(197, 160, 89);
    doc.setTextColor(255);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.rect(10, y, 130, 8, 'F');
    doc.text('DESCRIPTION', 14, y + 5.5);
    doc.rect(140, y, 25, 8, 'F');
    doc.text('AMOUNT', 143, y + 5.5);
    doc.rect(165, y, 35, 8, 'F');
    doc.text('TOTAL', 168, y + 5.5);
    y += 8;

    // Table row
    doc.setTextColor(50);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.rect(10, y, 130, 8);
    doc.text(this.appointment.service, 14, y + 5.5);
    doc.rect(140, y, 25, 8);
    doc.text(`₹${this.appointment.price}`, 143, y + 5.5);
    doc.rect(165, y, 35, 8);
    doc.text(`₹${this.appointment.price}`, 168, y + 5.5);
    y += 12;

    // Discount
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text('Discount:', pageW - 40, y, { align: 'right' });
    doc.text(`- ₹${this.editDiscount}`, pageW, y, { align: 'right' });
    y += 6;

    // Subtotal
    doc.text('Subtotal:', pageW - 40, y, { align: 'right' });
    doc.text(`₹${(this.appointment.price - this.editDiscount).toFixed(2)}`, pageW, y, { align: 'right' });
    y += 6;

    // Tax
    doc.text(`Tax (${this.taxRate}%):`, pageW - 40, y, { align: 'right' });
    doc.text(`₹${this.tax.toFixed(2)}`, pageW, y, { align: 'right' });
    y += 6;

    // Divider
    doc.setDrawColor(200);
    doc.line(120, y, 200, y);
    y += 6;

    // Total
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('TOTAL:', pageW - 40, y, { align: 'right' });
    doc.text(`₹${this.total.toFixed(2)}`, pageW, y, { align: 'right' });
    y += 6;

    // Paid stamp
    if (this.isPaid) {
      y += 4;
      doc.setTextColor(22, 163, 74);
      doc.setFontSize(10);
      doc.text('✓ PAID', pageW, y, { align: 'right' });
    }

    // Footer
    doc.setTextColor(150);
    doc.setFontSize(7);
    y = 280;
    doc.text('Thank you for choosing ' + this.salonName, pageW / 2, y, { align: 'center' });
    doc.text('Generated by Royal Salon CRM', pageW / 2, y + 4, { align: 'center' });

    return doc;
  }

  printBill() {
    window.print();
  }

  downloadPdf() {
    const doc = this.generatePdf();
    doc.save(`invoice-${this.appointment.clientName.replace(/\s+/g, '_')}.pdf`);
    this.toastService.show('INVOICE PDF DOWNLOADED');
    this.closeShareModal();
  }

  sharePdf() {
    const doc = this.generatePdf();
    const pdfBlob = doc.output('blob');
    const file = new File([pdfBlob], `invoice-${this.appointment.clientName.replace(/\s+/g, '_')}.pdf`, { type: 'application/pdf' });

    if (navigator.share && navigator.canShare?.({ files: [file] })) {
      navigator.share({ files: [file], title: 'Invoice', text: `Invoice from ${this.salonName}` }).catch(() => {});
      this.closeShareModal();
    } else {
      const url = URL.createObjectURL(pdfBlob);
      window.open(url, '_blank');
      setTimeout(() => URL.revokeObjectURL(url), 10000);
      this.toastService.show('PDF OPENED — SAVE & SHARE VIA WHATSAPP');
      this.closeShareModal();
    }
  }
}
