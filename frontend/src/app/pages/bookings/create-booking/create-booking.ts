import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { CustomerService } from '../../../services/customer';
import { RoomService } from '../../../services/room';
import { BookingService } from '../../../services/booking';

@Component({
  selector: 'app-create-booking',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './create-booking.html',
  styleUrls: ['./create-booking.css'],
})
export class CreateBooking implements OnInit {
  customers: any[] = [];
  rooms: any[] = [];

  booking = {
    customer_id: '',
    room_id: '',
    check_in: '',
    check_out: '',
  };

  constructor(
    private customerService: CustomerService,
    private roomService: RoomService,
    private cdr: ChangeDetectorRef,
    private bookingService: BookingService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.loadCustomers();
    this.loadRooms();
  }

  loadCustomers() {
    this.customerService.getCustomers().subscribe((data) => {
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
  saveBooking() {
    this.bookingService.createBooking(this.booking).subscribe({
      next: () => {
        alert('Tạo đặt phòng thành công');

        this.router.navigate(['/bookings']);
      },

      error: (err) => {
        console.log(err);

        alert('Có lỗi xảy ra');
      },
    });
  }
}
