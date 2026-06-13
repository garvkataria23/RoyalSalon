import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AppointmentService {
  private apiUrl = 'https://royalsalon.onrender.com/api/appointments';

  constructor(private http: HttpClient) { }

  getAppointments(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl).pipe(
      catchError(() => {
        const local = localStorage.getItem('offlineAppointments');
        return of(local ? JSON.parse(local) : []);
      })
    );
  }

  createAppointment(appointment: any): Observable<any> {
    return this.http.post(this.apiUrl, appointment).pipe(
      catchError(() => {
        const local = JSON.parse(localStorage.getItem('offlineAppointments') || '[]');
        appointment._id = 'local_' + Date.now();
        local.push(appointment);
        localStorage.setItem('offlineAppointments', JSON.stringify(local));
        return of(appointment);
      })
    );
  }

  updateAppointment(id: string, appointment: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, appointment).pipe(
      catchError(() => {
        const local = JSON.parse(localStorage.getItem('offlineAppointments') || '[]');
        const idx = local.findIndex((a: any) => a._id === id);
        if (idx >= 0) local[idx] = { ...local[idx], ...appointment };
        localStorage.setItem('offlineAppointments', JSON.stringify(local));
        return of(appointment);
      })
    );
  }

  updateStatus(id: string, status: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${id}/status`, { status }).pipe(
      catchError(() => {
        const local = JSON.parse(localStorage.getItem('offlineAppointments') || '[]');
        const idx = local.findIndex((a: any) => a._id === id);
        if (idx >= 0) local[idx].status = status;
        localStorage.setItem('offlineAppointments', JSON.stringify(local));
        return of({});
      })
    );
  }

  deleteAppointment(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`).pipe(
      catchError(() => {
        const local = JSON.parse(localStorage.getItem('offlineAppointments') || '[]');
        const filtered = local.filter((a: any) => a._id !== id);
        localStorage.setItem('offlineAppointments', JSON.stringify(filtered));
        return of({});
      })
    );
  }
}
