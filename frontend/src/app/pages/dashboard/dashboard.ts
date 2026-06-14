import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css'],
})
export class Dashboard implements OnInit {
  private api = 'http://localhost:3000';

  totalRooms = 0;
  totalBookings = 0;
  totalCustomers = 0;
  totalRevenue = 0;

  recentActivities: any[] = [];
  availableRooms: any[] = [];

  isLoading = true;

  constructor(
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.isLoading = true;
    forkJoin({
      rooms: this.http.get<any[]>(`${this.api}/rooms`),
      bookings: this.http.get<any[]>(`${this.api}/bookings`),
      customers: this.http.get<any[]>(`${this.api}/customers`),
    }).subscribe({
      next: ({ rooms, bookings, customers }) => {
        this.totalRooms = rooms.length;
        this.totalBookings = bookings.length;
        this.totalCustomers = customers.length;

        // Lấy tổng doanh thu từ total_spent của customers (giống trang Khách hàng)
        this.totalRevenue = customers.reduce(
          (sum: number, c: any) => sum + (Number(c.total_spent) || 0),
          0
        );

        // Phòng trống
        this.availableRooms = rooms
          .filter((r: any) =>
            r.status === 'available' ||
            r.status === 'Trống' ||
            r.trang_thai === 'Trống'
          )
          .slice(0, 7);

        // Hoạt động gần đây
        this.recentActivities = bookings
          .sort((a: any, b: any) => b.id - a.id)
          .slice(0, 8)
          .map((b: any) => ({
            id: b.id,
            time: this.formatDate(b.check_in),
            title: `Đặt phòng #${b.id}`,
            customer: b.full_name ?? b.customer_name ?? '—',
          }));

        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.isLoading = false;
        this.cdr.detectChanges();
      },
    });
  }

  formatDate(dateStr?: string): string {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('vi-VN');
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('vi-VN').format(amount);
  }

  getRoomType(room: any): string {
    return room.type ?? room.room_type ?? room.loai_phong ?? 'Standard';
  }

  getRoomNumber(room: any): string {
    return room.room_number ?? room.so_phong ?? room.number ?? room.id;
  }
}
