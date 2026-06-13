import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class StaffService {
  private apiUrl = 'http://localhost:5000/api/staff';

  constructor(private http: HttpClient) { }

  getStaff(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl).pipe(
      catchError(() => {
        const local = localStorage.getItem('offlineStaff');
        return of(local ? JSON.parse(local) : []);
      })
    );
  }

  createStaff(staff: any): Observable<any> {
    return this.http.post(this.apiUrl, staff).pipe(
      catchError(() => {
        const local = JSON.parse(localStorage.getItem('offlineStaff') || '[]');
        staff._id = 'local_' + Date.now();
        local.push(staff);
        localStorage.setItem('offlineStaff', JSON.stringify(local));
        return of(staff);
      })
    );
  }

  updateStaff(id: string, staff: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, staff).pipe(
      catchError(() => {
        const local = JSON.parse(localStorage.getItem('offlineStaff') || '[]');
        const idx = local.findIndex((s: any) => s._id === id);
        if (idx >= 0) local[idx] = { ...local[idx], ...staff };
        localStorage.setItem('offlineStaff', JSON.stringify(local));
        return of(staff);
      })
    );
  }

  deleteStaff(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`).pipe(
      catchError(() => {
        const local = JSON.parse(localStorage.getItem('offlineStaff') || '[]');
        const filtered = local.filter((s: any) => s._id !== id);
        localStorage.setItem('offlineStaff', JSON.stringify(filtered));
        return of({});
      })
    );
  }
}
