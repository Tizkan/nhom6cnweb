import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { CustomerService } from '../../../services/customer';
import { RoomService } from '../../../services/room';
import { BookingService } from '../../../services/booking';
import { forkJoin } from 'rxjs';

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
  bookings: any[] = [];

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
    this.customerService.getCustomers().subscribe((data: any[]) => {
      this.customers = data;
      this.cdr.detectChanges();
    });
  }

  loadRooms() {
    forkJoin([this.roomService.getRooms(), this.bookingService.getBookings()]).subscribe(
      ([rooms, bookings]: [any[], any[]]) => {
        this.bookings = bookings;
        this.rooms = rooms.filter(
          (r: any) => r.status !== 'maintenance' && r.status !== 'Đang Bảo Trì',
        );
        this.cdr.detectChanges();
      },
    );
  }

  isRoomConflict(roomId: string, checkIn: string, checkOut: string): boolean {
    const newIn = new Date(checkIn).getTime();
    const newOut = new Date(checkOut).getTime();
    const selectedRoom = this.rooms.find((r: any) => r.id?.toString() === roomId?.toString());

    return this.bookings.some((b: any) => {
      // Chỉ block nếu đã xác nhận hoặc đang check-in
      const blockedStatuses = ['Đã Xác Nhận', 'Đã Check-in'];
      if (!blockedStatuses.includes(b.status)) return false;

      if (b.room_number?.toString() !== selectedRoom?.room_number?.toString()) return false;

      const bIn = new Date(b.check_in).getTime();
      const bOut = new Date(b.check_out).getTime();

      return newIn < bOut && newOut > bIn;
    });
  }

  saveBooking() {
    if (!this.booking.room_id || !this.booking.check_in || !this.booking.check_out) {
      alert('Vui lòng điền đầy đủ thông tin');
      return;
    }

    if (new Date(this.booking.check_out) <= new Date(this.booking.check_in)) {
      alert('Ngày check-out phải sau ngày check-in!');
      return;
    }

    if (this.isRoomConflict(this.booking.room_id, this.booking.check_in, this.booking.check_out)) {
      alert('Phòng này đã có người đặt trong khoảng thời gian đó!');
      return;
    }

    const payload = { ...this.booking, status: 'Chờ Xác Nhận' };
    this.bookingService.createBooking(payload).subscribe({
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
