import { Injectable } from '@angular/core';
import { BehaviorSubject, filter } from 'rxjs';

export interface Toast {
  message: string;
  type: 'success' | 'error' | 'info';
  id: number;
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private toasts$ = new BehaviorSubject<Toast[]>([]);
  public toasts = this.toasts$.asObservable();

  show(message: string, type: 'success' | 'error' | 'info' = 'success') {
    const id = Date.now();
    const current = this.toasts$.value;
    this.toasts$.next([...current, { message, type, id }]);

    setTimeout(() => {
      this.remove(id);
    }, 4000);
  }

  remove(id: number) {
    const current = this.toasts$.value.filter(t => t.id !== id);
    this.toasts$.next(current);
  }
}
