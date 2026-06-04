import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { BookingService } from '../../services/booking';

@Component({
  selector: 'app-bookings',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './bookings.html',
  styleUrls: ['./bookings.css'],
})
export class Bookings implements OnInit {
  bookings: any[] = [];

  constructor(
    private bookingService: BookingService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    console.log('BOOKINGS INIT');
    this.loadBookings();
  }

  loadBookings() {
    console.log('CALL API');

    this.bookingService.getBookings().subscribe({
      next: (data) => {
        console.log('DATA', data);
        this.bookings = data;
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.log(err);
      },
    });
  }
  deleteBooking(id: number) {
    if (!confirm('Bạn có chắc muốn xóa?')) {
      return;
    }

    this.bookingService.deleteBooking(id).subscribe({
      next: () => {
        this.loadBookings();
      },

      error: (err) => {
        console.log(err);
      },
    });
  }
  getBookingCount(status: string): number {
    return this.bookings.filter((booking: any) => booking.status === status).length;
  }
}
