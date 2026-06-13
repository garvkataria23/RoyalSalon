import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class SmsService {
  private apiUrl = 'http://localhost:5000/api/sms';

  constructor(private http: HttpClient) { }

  sendSMS(data: { phone: string; name: string; message: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/send`, data).pipe(
      catchError(() => {
        const sent = JSON.parse(localStorage.getItem('smsCampaigns') || '[]');
        sent.push({ ...data, sentAt: new Date().toISOString() });
        localStorage.setItem('smsCampaigns', JSON.stringify(sent));
        return of({ message: 'SMS campaign recorded (offline)' });
      })
    );
  }

  getCampaigns(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/campaigns`).pipe(
      catchError(() => {
        const local = localStorage.getItem('smsCampaigns');
        return of(local ? JSON.parse(local) : []);
      })
    );
  }
}
