import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { ActivatedRoute, Router } from '@angular/router';

import { BookingService } from '../../../services/booking';
import { CustomerService } from '../../../services/customer';
import { RoomService } from '../../../services/room';

@Component({
  selector: 'app-edit-booking',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './edit-booking.html',
  styleUrls: ['./edit-booking.css'],
})
export class EditBooking implements OnInit {
  id: number = 0;

  customers: any[] = [];
  rooms: any[] = [];

  booking: any = {
    customer_id: '',
    room_id: '',
    check_in: '',
    check_out: '',
    status: '',
  };

  constructor(
    private bookingService: BookingService,
    private customerService: CustomerService,
    private roomService: RoomService,
    private route: ActivatedRoute,
    private router: Router,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.id = Number(this.route.snapshot.paramMap.get('id'));

    this.loadCustomers();
    this.loadRooms();
    this.loadBooking();
  }

  loadCustomers() {
    this.customerService.getCustomers().subscribe((data: any[]) => {
      this.customers = data;
      this.cdr.detectChanges();
    });
  }

  loadRooms() {
    this.roomService.getRooms().subscribe((data) => {
      this.rooms = data;
      this.cdr.detectChanges();
    });
  }

  loadBooking() {
    this.bookingService.getBookingById(this.id).subscribe((data) => {
      this.booking = data;
      this.cdr.detectChanges();
      this.booking.check_in = this.booking.check_in ? this.booking.check_in.split('T')[0] : '';

      this.booking.check_out = this.booking.check_out ? this.booking.check_out.split('T')[0] : '';
    });
  }

  updateBooking() {
    this.bookingService.updateBooking(this.id, this.booking).subscribe({
      next: () => {
        alert('Cập nhật thành công');

        this.router.navigate(['/bookings']);
      },

      error: (err) => {
        console.log(err);
      },
    });
  }
}
