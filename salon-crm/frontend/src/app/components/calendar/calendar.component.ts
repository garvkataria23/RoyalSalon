import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { StaffService } from '../../services/staff.service';
import { AppointmentService } from '../../services/appointment.service';
import { Router } from '@angular/router';

interface Day {
  label: string;
  date: string;
  full: Date;
  isToday: boolean;
  isSelected: boolean;
}

interface CellAppt {
  _id: string;
  clientName: string;
  service: string;
  timeSlot: string;
  status: string;
  minutes: number;
}

const PAGE_SIZE = 4;

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './calendar.component.html',
  styleUrl: './calendar.component.css'
})
export class CalendarComponent implements OnInit {
  staffList: any[] = [];
  appointments: any[] = [];
  selectedDate: string = new Date().toISOString().split('T')[0];
  weekDays: Day[] = [];
  weekStart: Date = this.getWeekStart(new Date());

  selectedStaffId: string | null = null;
  staffPage = 0;

  START_HOUR = 9;
  END_HOUR = 18;

  constructor(
    private staffService: StaffService,
    private appointmentService: AppointmentService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.buildWeek();
    this.loadData();
  }

  get weekRange(): string {
    const start = this.weekDays[0];
    const end = this.weekDays[6];
    if (!start || !end) return '';
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const s = `${months[start.full.getMonth()]} ${start.full.getDate()}`;
    const e = `${months[end.full.getMonth()]} ${end.full.getDate()}, ${end.full.getFullYear()}`;
    return `${s} — ${e}`;
  }

  get hours(): number[] {
    const h: number[] = [];
    for (let i = this.START_HOUR; i < this.END_HOUR; i++) h.push(i);
    return h;
  }

  getWeekStart(d: Date): Date {
    const date = new Date(d);
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1);
    date.setDate(diff);
    date.setHours(0, 0, 0, 0);
    return date;
  }

  buildWeek() {
    const todayStr = new Date().toISOString().split('T')[0];
    this.weekDays = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(this.weekStart);
      d.setDate(this.weekStart.getDate() + i);
      const dateStr = d.toISOString().split('T')[0];
      this.weekDays.push({
        label: d.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase(),
        date: dateStr,
        full: d,
        isToday: dateStr === todayStr,
        isSelected: dateStr === this.selectedDate
      });
    }
  }

  selectDay(day: Day) {
    this.selectedDate = day.date;
    this.weekDays.forEach(d => d.isSelected = d.date === day.date);
    this.staffPage = 0;
    this.loadData();
  }

  navigateWeek(delta: number) {
    this.weekStart.setDate(this.weekStart.getDate() + delta * 7);
    this.weekStart = this.getWeekStart(this.weekStart);
    this.selectedDate = this.weekStart.toISOString().split('T')[0];
    this.buildWeek();
    this.loadData();
  }

  goToday() {
    const today = new Date();
    this.weekStart = this.getWeekStart(today);
    this.selectedDate = today.toISOString().split('T')[0];
    this.buildWeek();
    this.loadData();
  }

  loadData() {
    forkJoin({
      staff: this.staffService.getStaff(),
      apps: this.appointmentService.getAppointments()
    }).subscribe(({ staff, apps }) => {
      this.staffList = staff || [];
      this.appointments = (apps || []).filter((app: any) => {
        const appDate = new Date(app.date).toISOString().split('T')[0];
        return appDate === this.selectedDate;
      });
    });
  }

  get maxPage(): number {
    return Math.max(0, Math.ceil(this.staffList.length / PAGE_SIZE) - 1);
  }

  get visibleStaff(): any[] {
    if (this.selectedStaffId) {
      const s = this.staffList.find(s => s._id === this.selectedStaffId);
      return s ? [s] : [];
    }
    const start = this.staffPage * PAGE_SIZE;
    return this.staffList.slice(start, start + PAGE_SIZE);
  }

  get showPagination(): boolean {
    return !this.selectedStaffId && this.staffList.length > PAGE_SIZE;
  }

  get filterStaffList(): any[] {
    return this.staffList;
  }

  staffApptCount(staffId: string): number {
    return this.appointments.filter(a => String(a.staffId) === String(staffId)).length;
  }

  selectStaffFilter(staffId: string | null) {
    this.selectedStaffId = staffId;
    this.staffPage = 0;
  }

  prevPage() {
    if (this.staffPage > 0) this.staffPage--;
  }

  nextPage() {
    if (this.staffPage < this.maxPage) this.staffPage++;
  }

  getCellAppointments(staffId: string, hour: number): CellAppt[] {
    return this.appointments
      .filter(app => {
        const matchStaff = String(app.staffId) === String(staffId);
        const mins = this.timeToMinutes(app.timeSlot);
        return matchStaff && mins >= hour * 60 && mins < (hour + 1) * 60;
      })
      .map(app => ({
        _id: app._id,
        clientName: app.clientName,
        service: app.service,
        timeSlot: app.timeSlot,
        status: app.status,
        minutes: this.timeToMinutes(app.timeSlot)
      }));
  }

  timeToMinutes(time: string): number {
    const parts = time.split(' ');
    if (parts.length < 2) return 0;
    const [t, ampm] = parts;
    let [h, m] = t.split(':').map(Number);
    if (ampm === 'PM' && h !== 12) h += 12;
    if (ampm === 'AM' && h === 12) h = 0;
    return h * 60 + (m || 0);
  }

  formatHour(hour: number): string {
    const h = hour > 12 ? hour - 12 : hour;
    const ampm = hour >= 12 ? 'PM' : 'AM';
    return `${h} ${ampm}`;
  }

  formatTime(time: string): string {
    const parts = time.split(' ');
    if (parts.length < 2) return time;
    let [h, m] = parts[0].split(':').map(Number);
    const ampm = parts[1];
    if (ampm === 'PM' && h !== 12) h += 12;
    if (ampm === 'AM' && h === 12) h = 0;
    const h12 = h > 12 ? h - 12 : h;
    const suffix = h >= 12 ? 'PM' : 'AM';
    return `${h12}:${m.toString().padStart(2, '0')} ${suffix}`;
  }

  isPastHour(hour: number): boolean {
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    if (this.selectedDate < today) return true;
    if (this.selectedDate > today) return false;
    return hour < now.getHours();
  }

  onCellClick(staff: any, hour: number) {
    const h12 = hour > 12 ? hour - 12 : hour;
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const time = `${h12.toString().padStart(2, '0')}:00 ${ampm}`;
    this.router.navigate(['/home/book'], {
      queryParams: { staffId: staff._id, staffName: staff.name, time, date: this.selectedDate }
    });
  }

  onApptClick(appt: CellAppt) {
    if (appt.status === 'Cancelled') return;
    this.router.navigate(['/home/edit', appt._id]);
  }

  getStats(status: string): number {
    return this.appointments.filter(a => a.status === status).length;
  }

  goToStaff() {
    this.router.navigate(['/home/staff']);
  }
}
