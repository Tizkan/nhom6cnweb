import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = 'http://localhost:3000/auth';

  constructor(private http: HttpClient) {}

  login(email: string, password: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, {
      email,
      password,
    });
  }

  isLoggedIn(): boolean {
    if (typeof window === 'undefined') {
      return false;
    }

    return !!localStorage.getItem('user');
  }

  logout(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('user');
    }
  }
}
