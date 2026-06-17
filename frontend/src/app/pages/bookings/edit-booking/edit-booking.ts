import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { BookingService } from '../../../services/booking';
import { CustomerService } from '../../../services/customer';
import { RoomService } from '../../../services/room';
import { forkJoin } from 'rxjs';

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
  bookings: any[] = [];

  booking: any = {
    customer_id: '',
    room_id: '',
    check_in: '',
    check_out: '',
    status: '',
    total_price: 0,
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

  loadBooking() {
    this.bookingService.getBookingById(this.id).subscribe((data) => {
      this.booking = data;
      this.booking.check_in = this.booking.check_in ? this.booking.check_in.split('T')[0] : '';
      this.booking.check_out = this.booking.check_out ? this.booking.check_out.split('T')[0] : '';
      this.cdr.detectChanges();
    });
  }

  // Tính total_price = số đêm × giá room_type
  calcTotalPrice(): number {
    const room = this.rooms.find(
      (r: any) => r.id?.toString() === this.booking.room_id?.toString()
    );
    // room.price_per_night lấy từ getRooms() đã JOIN với room_types (field: price_per_night)
    if (!room || !room.price_per_night) return 0;

    const checkIn = new Date(this.booking.check_in).getTime();
    const checkOut = new Date(this.booking.check_out).getTime();
    const nights = Math.round((checkOut - checkIn) / (1000 * 60 * 60 * 24));// đc làm tròn

    // trả về 0 nếu không tìm thấy phòng hoặc ngày không hợp lệ
    return nights > 0 ? nights * room.price_per_night : 0;
  }

  //kiểm tra xung đột
  isRoomConflict(roomId: string, checkIn: string, checkOut: string): boolean {
    const newIn = new Date(checkIn).getTime();
    const newOut = new Date(checkOut).getTime();
    const selectedRoom = this.rooms.find((r: any) => r.id?.toString() === roomId?.toString());

    return this.bookings.some((b: any) => {
      if (b.id === this.id) return false;
      // Chỉ block phòng đã xác nhận hoặc đang check-in là đang giữ
      // còn đang chờ xác nhận hoặc checkout thì ko block
      const blockedStatuses = ['Đã Xác Nhận', 'Đã Check-in'];
      if (!blockedStatuses.includes(b.status)) return false;
       // Chỉ kiểm tra cùng phòng
      if (b.room_number?.toString() !== selectedRoom?.room_number?.toString()) return false;

      const bIn = new Date(b.check_in).getTime();
      const bOut = new Date(b.check_out).getTime();

      return newIn < bOut && newOut > bIn;
    });
  }

  //kiểm tra các trường nhập trước khi lưu
  updateBooking() {
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

    // Tính lại tiền rồi mới lưu
    this.booking.total_price = this.calcTotalPrice();

    this.bookingService.updateBooking(this.id, this.booking).subscribe({
      next: () => {
        alert('Cập nhật thành công');
        this.router.navigate(['/bookings']);
      },
      error: (err) => console.log(err),
    });
  }
}
