import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ConfirmService {
  showConfirm = false;
  message = '';
  private pending = new Subject<boolean>();

  confirm(message: string) {
    this.message = message;
    this.showConfirm = true;
    return this.pending.asObservable();
  }

  resolve(val: boolean) {
    this.showConfirm = false;
    this.pending.next(val);
    this.pending = new Subject();
  }
}
