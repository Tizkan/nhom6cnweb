import { Routes } from '@angular/router';
import { Login } from './pages/login/login';
import { Dashboard } from './pages/dashboard/dashboard';
import { Rooms } from './pages/rooms/rooms';
import { Customers } from './pages/customers/customers';
import { Bookings } from './pages/bookings/bookings';
import { Reports } from './pages/reports/reports';
import { Settings } from './pages/settings/settings';
import { CreateBooking } from './pages/bookings/create-booking/create-booking';
import { EditBooking } from './pages/bookings/edit-booking/edit-booking';
import { EditRoom } from './pages/rooms/edit-room/edit-room';
import { CreateRoom } from './pages/rooms/create-room/create-room';
import { MainLayout } from './layout/main-layout/main-layout';
import { authGuard } from './guards/auth-guard';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },

  { path: 'login', component: Login },

  {
    path: '',
    component: MainLayout,
    canActivate: [authGuard],
    children: [
      { path: 'dashboard', component: Dashboard },

      { path: 'rooms', component: Rooms },
      { path: 'rooms/create-room', component: CreateRoom },
      { path: 'rooms/edit/:id', component: EditRoom },

      { path: 'customers', component: Customers },

      { path: 'bookings', component: Bookings },
      { path: 'bookings/create-booking', component: CreateBooking },
      { path: 'bookings/edit/:id', component: EditBooking },

      { path: 'reports', component: Reports },

      { path: 'settings', component: Settings },
    ],
  },
];
