import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { RoomService } from '../../services/room';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-rooms',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './rooms.html',
  styleUrls: ['./rooms.css'],
})
export class Rooms implements OnInit {

  rooms: any[] = [];
  filteredRooms: any[] = [];
  searchText: string = '';

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
          else if (rawStatus === 'maintenance') status = 'maintenance';

          return { ...r, floor: r.floor_number || 0, status };
        });
        this.filteredRooms = [...this.rooms];
        this.cdr.markForCheck();
      },
      error: (err) => console.log(err),
    });
  }

  onSearch() {
    const keyword = this.searchText.toLowerCase().trim();
    if (!keyword) {
      this.filteredRooms = [...this.rooms];
      return;
    }
    this.filteredRooms = this.rooms.filter(r =>
      r.room_number?.toString().toLowerCase().includes(keyword)
    );
  }

  getTypeName(room_type_id: number): string {
    const types: any = { 1: 'Standard', 2: 'Deluxe', 3: 'Suite' };
    return types[room_type_id] || 'Standard';
  }

  getStatusLabel(status: string): string {
    const map: any = {
<<<<<<< HEAD
      available:   'Trống',
      occupied:    'Đang ở',
      booked:      'Đã đặt',
      cleaning:    'Đã trả phòng',
      maintenance: 'Đang bảo trì'
=======
      available: 'Trống',
      occupied: 'Đang ở',
      booked: 'Đã Đặt',
      cleaning: 'Đã Trả Phòng',
      maintenance: 'Đang Bảo Trì'
>>>>>>> 93f509095af8f670502e65a72dd5c1ac0edda0b8
    };
    return map[status] || 'Trống';
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
