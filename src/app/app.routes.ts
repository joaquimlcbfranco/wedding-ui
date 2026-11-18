import { Routes } from '@angular/router';
import { Home } from './pages/home/home';
import { Rsvp } from './pages/rsvp/rsvp';

export const routes: Routes = [
  { path: '', component: Home },
  { path: 'rsvp', component: Rsvp },
  { path: '**', redirectTo: '' },
];
