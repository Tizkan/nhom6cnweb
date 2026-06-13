import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { RoomService } from '../../../services/room';

@Component({
  selector: 'app-edit-room',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './edit-room.html',
  styleUrls: ['./edit-room.css'],
})
export class EditRoom implements OnInit {

  id: number = 0;

  room: any = {
    room_number: '',
    floor_number: '',
    room_type_id: '',
    status: '',
    price_per_night: null
  };

  roomTypes = [
    { id: 1, name: 'Standard' },
    { id: 2, name: 'Deluxe' },
    { id: 3, name: 'Suite' },
  ];

  constructor(
    private roomService: RoomService,
    private route: ActivatedRoute,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.id = Number(this.route.snapshot.paramMap.get('id'));
    this.loadRoom();
  }

  loadRoom() {
    this.roomService.getRoomById(this.id).subscribe((data: any) => {
      this.room = data;

      // Đọc giá từ localStorage
      const savedPrice = localStorage.getItem(`room_price_${this.id}`);
      this.room.price_per_night = savedPrice ? Number(savedPrice) : null;

      this.cdr.detectChanges();
    });
  }

  updateRoom() {
    // Lưu giá vào localStorage
    if (this.room.price_per_night !== null && this.room.price_per_night !== undefined) {
      localStorage.setItem(`room_price_${this.id}`, String(this.room.price_per_night));
    } else {
      localStorage.removeItem(`room_price_${this.id}`);
    }

    // Gửi các field khác lên DB (không gửi price_per_night)
    const { price_per_night, ...roomData } = this.room;
    this.roomService.updateRoom(this.id, roomData).subscribe({
      next: () => {
        alert('Cập nhật thành công');
        this.router.navigate(['/rooms']);
      },
      error: (err) => console.log(err),
    });
  }
}
