import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class SalonService {
  private apiUrl = 'https://royalsalon.onrender.com/api/services';

  constructor(private http: HttpClient) { }

  getServices(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl).pipe(
      catchError(() => {
        const local = localStorage.getItem('offlineServices');
        return of(local ? JSON.parse(local) : []);
      })
    );
  }

  createService(service: any): Observable<any> {
    return this.http.post(this.apiUrl, service).pipe(
      catchError(() => {
        const local = JSON.parse(localStorage.getItem('offlineServices') || '[]');
        service._id = 'local_' + Date.now();
        local.push(service);
        localStorage.setItem('offlineServices', JSON.stringify(local));
        return of(service);
      })
    );
  }

  updateService(id: string, service: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, service).pipe(
      catchError(() => {
        const local = JSON.parse(localStorage.getItem('offlineServices') || '[]');
        const idx = local.findIndex((s: any) => s._id === id);
        if (idx >= 0) local[idx] = { ...local[idx], ...service };
        localStorage.setItem('offlineServices', JSON.stringify(local));
        return of(service);
      })
    );
  }

  deleteService(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`).pipe(
      catchError(() => {
        const local = JSON.parse(localStorage.getItem('offlineServices') || '[]');
        const filtered = local.filter((s: any) => s._id !== id);
        localStorage.setItem('offlineServices', JSON.stringify(filtered));
        return of({});
      })
    );
  }
}
