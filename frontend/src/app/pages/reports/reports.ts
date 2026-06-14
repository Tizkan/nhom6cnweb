import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-reports',
  standalone: true,
  templateUrl: './reports.html',
  styleUrl: './reports.css'
})
export class Reports {

  data:any = {
    totalCustomers:0,
    totalRooms:0,
    totalBookings:0,
    totalRevenue:0
  };

  constructor(
    private http:HttpClient,
    private cd:ChangeDetectorRef   // 👈 thêm cái này
  ){}

  ngOnInit(){
    this.load();
  }

  load(){
    this.http.get<any>('http://localhost:3000/reports/overview')
    .subscribe(res => {

      console.log("DATA:", res);

      this.data = res;

      this.cd.detectChanges(); // 👈 FIX NHẤN 1 LẦN HIỆN NGAY

    });
  }
}
