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
  selectedIds: Set<number> = new Set(); // Dùng Set để không trùng lặp
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

  // Dùng forkJoin để gọi 2 API cùng lúc, chờ cả 2 xong mới xử lý
  loadBookings() {
    forkJoin([this.bookingService.getBookings(), this.roomService.getRooms()]).subscribe({
      next: ([bookings, rooms]: [any[], any[]]) => {
        this.bookings = bookings.map((b: any) => {
          const room = rooms.find((r: any) => r.room_number === b.room_number);
          const pricePerNight = Number(room?.price_per_night) || 0;
          const nights = this.getNights(b.check_in, b.check_out);

          return { ...b, total_amount: pricePerNight * nights };
        });
        this.cdr.markForCheck();// này chung với forkjoin là UI cập nhất đúng sau khi data về
      },
      error: (err) => console.log('lỗi:', err),
    });
  }

  // Chỉ cho chọn booking "Chờ xác nhận"
  isSelectable(b: any): boolean {
    return b.status === 'Chờ Xác Nhận';
  }

  //theo dõi thao tâc với id chọn, xóa, thêm
  toggleSelect(id: number) {
    this.selectedIds.has(id) ? this.selectedIds.delete(id) : this.selectedIds.add(id);
  }

  //chứa các id đang chọn checkbox
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

    const ids = Array.from(this.selectedIds);// Set → Array chứa các id đã chọn để thanh toán

    //Khi nhấn thanh toán sẽ Redirect sang URL VNpay
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

  //hàm tính số đêm
  getNights(checkIn: string, checkOut: string): number {
    const msPerDay = 1000 * 60 * 60 * 24;
    return Math.ceil((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / msPerDay);
  }

  //hàm xóa theo id
  deleteBooking(id: number) {
    if (!confirm('Bạn có chắc muốn xóa?')) return;
    this.bookingService.deleteBooking(id).subscribe({
      next: () => this.loadBookings(),
      error: (err) => console.log(err),
    });
  }

  //hàm tính tổng trạng booking theo từng trạng thái
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
