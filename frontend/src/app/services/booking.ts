import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
@Injectable({
  providedIn: 'root',
})
export class BookingService {
  api = 'http://localhost:3000/bookings';

  constructor(private http: HttpClient) {}

  getBookings(): Observable<any[]> {
    return this.http.get<any[]>(this.api);
  }
  createBooking(data: any) {
    return this.http.post(this.api, data);
  }
  deleteBooking(id: number) {
    return this.http.delete(`${this.api}/${id}`);
  }

  getBookingById(id: number) {
    return this.http.get(`${this.api}/${id}`);
  }

  updateBooking(id: number, data: any) {
    return this.http.put(`${this.api}/${id}`, data);
  }
}
