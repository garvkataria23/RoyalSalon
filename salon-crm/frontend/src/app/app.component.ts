import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ToastComponent } from './components/toast/toast.component';
import { ConfirmDialogComponent } from './components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, ToastComponent, ConfirmDialogComponent],
  template: `
    <app-toast></app-toast>
    <app-confirm-dialog></app-confirm-dialog>
    <router-outlet></router-outlet>
  `
})
export class AppComponent {
  title = 'frontend';
}
