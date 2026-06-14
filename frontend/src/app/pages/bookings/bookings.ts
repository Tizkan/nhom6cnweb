import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { BookingService } from '../../services/booking';
import { RoomService } from '../../services/room';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-bookings',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './bookings.html',
  styleUrls: ['./bookings.css'],
})
export class Bookings implements OnInit {
  bookings: any[] = [];
  selectedIds: Set<number> = new Set();
  paying = false;

  constructor(
    private bookingService: BookingService,
    private cdr: ChangeDetectorRef,
    private roomService: RoomService,
    private route: ActivatedRoute,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.loadBookings();

    // Nhận kết quả sau khi VNPAY redirect về
    this.route.queryParams.subscribe((params) => {
      if (params['payment'] === 'success') {
        alert('✅ Thanh toán thành công! Booking đã được xác nhận.');
        // Xoá query param trên URL sau khi đọc xong
        this.router.navigate([], { queryParams: {}, replaceUrl: true });
      } else if (params['payment'] === 'fail') {
        alert('❌ Thanh toán thất bại hoặc bị huỷ!');
        this.router.navigate([], { queryParams: {}, replaceUrl: true });
      }
    });
  }

  loadBookings() {
    forkJoin([this.bookingService.getBookings(), this.roomService.getRooms()]).subscribe({
      next: ([bookings, rooms]: [any[], any[]]) => {
        this.bookings = bookings.map((b: any) => {
          const room = rooms.find((r: any) => r.room_number === b.room_number);
          const pricePerNight = Number(room?.price_per_night) || 0;

          const checkIn = new Date(b.check_in);
          const checkOut = new Date(b.check_out);
          const nights = Math.max(
            1,
            Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24)),
          );

          return { ...b, total_amount: pricePerNight * nights };
        });
        this.cdr.markForCheck();
      },
      error: (err) => console.log('lỗi:', err),
    });
  }

  // Chỉ cho chọn booking "Chờ xác nhận"
  isSelectable(b: any): boolean {
    return b.status === 'Chờ Xác Nhận';
  }

  toggleSelect(id: number) {
    this.selectedIds.has(id) ? this.selectedIds.delete(id) : this.selectedIds.add(id);
  }

  isSelected(id: number): boolean {
    return this.selectedIds.has(id);
  }

  // Tổng tiền các booking đã chọn
  get selectedTotal(): number {
    return this.bookings
      .filter((b) => this.selectedIds.has(b.id))
      .reduce((sum, b) => sum + (b.total_amount || 0), 0);
  }

  pay() {
    if (!this.selectedIds.size) return;
    this.paying = true;

    const ids = Array.from(this.selectedIds);

    this.bookingService.createPayment(ids, this.selectedTotal).subscribe({
      next: (res) => {
        window.location.href = res.paymentUrl;
      },
      error: (err) => {
        this.paying = false;
        alert('Lỗi tạo thanh toán!');
      },
    });
  }

  deleteBooking(id: number) {
    if (!confirm('Bạn có chắc muốn xóa?')) return;
    this.bookingService.deleteBooking(id).subscribe({
      next: () => this.loadBookings(),
      error: (err) => console.log(err),
    });
  }

  getBookingCount(status: string): number {
    return this.bookings.filter((b: any) => b.status === status).length;
  }
  getStatusClass(status: string): string {
    switch (status) {
      case 'Chờ Xác Nhận':
        return 'waiting-status';
      case 'Đã Xác Nhận':
        return 'confirmed-status';
      case 'Đã Check-in':
        return 'checkin-status';
      case 'Đã Check-out':
        return 'checkout-status';
      default:
        return '';
    }
  }
}
