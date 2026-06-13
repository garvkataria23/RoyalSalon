import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ClientService {
  private apiUrl = 'http://localhost:5000/api/clients';

  constructor(private http: HttpClient) { }

  getClients(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl).pipe(
      catchError(() => {
        const local = localStorage.getItem('offlineClients');
        return of(local ? JSON.parse(local) : []);
      })
    );
  }

  createClient(client: any): Observable<any> {
    return this.http.post(this.apiUrl, client).pipe(
      catchError(() => {
        const local = JSON.parse(localStorage.getItem('offlineClients') || '[]');
        client._id = 'local_' + Date.now();
        local.push(client);
        localStorage.setItem('offlineClients', JSON.stringify(local));
        return of(client);
      })
    );
  }

  updateClient(id: string, client: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, client).pipe(
      catchError(() => {
        const local = JSON.parse(localStorage.getItem('offlineClients') || '[]');
        const idx = local.findIndex((c: any) => c._id === id);
        if (idx >= 0) local[idx] = { ...local[idx], ...client };
        localStorage.setItem('offlineClients', JSON.stringify(local));
        return of(client);
      })
    );
  }

  deleteClient(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`).pipe(
      catchError(() => {
        const local = JSON.parse(localStorage.getItem('offlineClients') || '[]');
        const filtered = local.filter((c: any) => c._id !== id);
        localStorage.setItem('offlineClients', JSON.stringify(filtered));
        return of({});
      })
    );
  }
}
