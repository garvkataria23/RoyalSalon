import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { HomeComponent } from './components/home/home.component';
import { CalendarComponent } from './components/calendar/calendar.component';
import { AppointmentFormComponent } from './components/appointment-form/appointment-form.component';
import { BillingComponent } from './components/billing/billing.component';
import { BillingListComponent } from './components/billing/billing-list.component';
import { StaffComponent } from './components/staff/staff.component';
import { ClientsComponent } from './components/clients/clients.component';
import { SettingsComponent } from './components/settings/settings.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { ServiceMenuComponent } from './components/service-menu/service-menu.component';
import { DiscountsComponent } from './components/discounts/discounts.component';
import { HistoryComponent } from './components/history/history.component';
import { AppointmentsListComponent } from './components/appointments-list/appointments-list.component';
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { 
    path: 'home', 
    component: HomeComponent,
    canActivate: [AuthGuard],
    children: [
      { path: '', component: DashboardComponent },
      { path: 'calendar', component: CalendarComponent },
      { path: 'services', component: ServiceMenuComponent },
      { path: 'discounts', component: DiscountsComponent },
      { path: 'history', component: HistoryComponent },
      { path: 'appointments', component: AppointmentsListComponent },
      { path: 'book', component: AppointmentFormComponent },
      { path: 'edit/:id', component: AppointmentFormComponent },
      { path: 'billing', component: BillingListComponent },
      { path: 'billing/:id', component: BillingComponent },
      { path: 'staff', component: StaffComponent },
      { path: 'clients', component: ClientsComponent },
      { path: 'settings', component: SettingsComponent }
    ]
  }
];
