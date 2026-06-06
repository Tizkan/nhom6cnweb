import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { RoomService } from '../../services/room';

@Component({
  selector: 'app-rooms',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './rooms.html',
  styleUrls: ['./rooms.css'],
})
export class Rooms implements OnInit {

  rooms: any[] = [];

  constructor(
    private roomService: RoomService,
    private cdr: ChangeDetectorRef,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadRooms();
  }

  loadRooms() {
    this.roomService.getRooms().subscribe({
      next: (data) => {
        this.rooms = data.map((r: any) => {
          let rawStatus = (r.status || '').toLowerCase().trim();
          let status = 'available';
          if (rawStatus === 'occupied') status = 'occupied';
          else if (rawStatus === 'booked') status = 'booked';
          else if (rawStatus === 'cleaning') status = 'cleaning';
          return { ...r, floor: r.floor || r.floor_number || 0, status };
        });
        this.cdr.markForCheck();
      },
      error: (err) => console.log(err),
    });
  }

  goToEdit(id: number) {
    this.router.navigate(['/rooms/edit', id]);
  }

  deleteRoom(id: number) {
    if (!confirm('Bạn có chắc muốn xóa?')) return;
    this.roomService.deleteRoom(id).subscribe({
      next: () => this.loadRooms(),
      error: (err) => {
        if (err.status === 400) {
          alert(err.error.message);
        } else {
          console.log(err);
        }
      },
    });
  }
}
