import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ReportService {

  // API Backend
  private apiUrl = 'http://localhost:3000/api/reports/dashboard';

  constructor(private http: HttpClient) { }

  getDashboardData(): Observable<any> {
    return this.http.get<any>(this.apiUrl).pipe(
      catchError(error => {
        console.error('Lỗi kết nối Backend:', error);

        // Không nên trả về success:false nếu component không kiểm tra
        return of(null);
      })
    );
  }
}
