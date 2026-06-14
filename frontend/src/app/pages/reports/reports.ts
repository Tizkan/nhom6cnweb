import { Component } from '@angular/core';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [],
  templateUrl: './reports.html',
  styleUrl: './reports.css'
})
export class Reports {

  // === THÊM BIẾN DATA VÀO ĐÂY ===
  data: any = {
    totalCustomers: 0,  // Bạn có thể sửa số 0 này thành số bất kỳ để test giao diện
    totalRooms: 0,
    totalBookings: 0,
    totalRevenue: 0
  };

}
