import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-settings',
  standalone: true,
  templateUrl: './settings.html',
  styleUrls: ['./settings.css'],
})
export class Settings {
  currentUser: any;

  constructor(private router: Router) {
    this.currentUser = JSON.parse(localStorage.getItem('user') || '{}');
  }

  logout() {
    localStorage.removeItem('user');

    this.router.navigate(['/login']);
  }
}
