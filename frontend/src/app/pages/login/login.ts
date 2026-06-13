import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css'],
})
export class Login implements OnInit {
  email = '';
  password = '';

  loading = false;
  errorMessage = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    if (
      typeof window !== 'undefined' &&
      this.authService.isLoggedIn()
    ) {
      this.router.navigate(['/dashboard']);
    }
  }

  login(): void {
    if (!this.email || !this.password) {
      this.errorMessage = 'Vui lòng nhập đầy đủ thông tin';
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    console.log('CLICK LOGIN');

    this.authService.login(this.email, this.password).subscribe({
      next: (res) => {
        console.log('Login success', res);

        if (typeof window !== 'undefined') {
          localStorage.setItem(
            'user',
            JSON.stringify(res.user)
          );
        }

        this.loading = false;
        this.router.navigate(['/dashboard']);
      },

      error: (err) => {
        console.error(err);

        this.loading = false;
        this.errorMessage =
          err?.error?.message || 'Đăng nhập thất bại';
      },
    });
  }
}
