import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class DiscountService {
  private apiUrl = 'https://royalsalon.onrender.com/api/discounts';

  constructor(private http: HttpClient) { }

  getDiscounts(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl).pipe(
      catchError(() => {
        const local = localStorage.getItem('offlineDiscounts');
        return of(local ? JSON.parse(local) : []);
      })
    );
  }

  createDiscount(d: any): Observable<any> {
    return this.http.post(this.apiUrl, d).pipe(
      catchError(() => {
        const local = JSON.parse(localStorage.getItem('offlineDiscounts') || '[]');
        d._id = 'local_' + Date.now();
        local.push(d);
        localStorage.setItem('offlineDiscounts', JSON.stringify(local));
        return of(d);
      })
    );
  }

  updateDiscount(id: string, d: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, d).pipe(
      catchError(() => {
        const local = JSON.parse(localStorage.getItem('offlineDiscounts') || '[]');
        const idx = local.findIndex((x: any) => x._id === id);
        if (idx >= 0) local[idx] = { ...local[idx], ...d };
        localStorage.setItem('offlineDiscounts', JSON.stringify(local));
        return of(d);
      })
    );
  }

  deleteDiscount(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`).pipe(
      catchError(() => {
        const local = JSON.parse(localStorage.getItem('offlineDiscounts') || '[]');
        const filtered = local.filter((x: any) => x._id !== id);
        localStorage.setItem('offlineDiscounts', JSON.stringify(filtered));
        return of({});
      })
    );
  }
}
