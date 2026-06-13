import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { NgForm, FormsModule } from '@angular/forms';
import { RoomService } from '../../../services/room';

@Component({
  selector: 'app-create-room',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './create-room.html',
  styleUrls: ['./create-room.css']
})
export class CreateRoom {

  constructor(
    private roomService: RoomService,
    private router: Router
  ) {}

  onSubmit(form: NgForm) {
    if (form.valid) {
      const { price_per_night, ...roomData } = form.value;

      this.roomService.createRoom(roomData).subscribe({
        next: (res: any) => {
          const newId = res?.id;
          if (newId && price_per_night) {
            localStorage.setItem(`room_price_${newId}`, String(price_per_night));
          }
          alert('Thêm phòng mới thành công!');
          this.router.navigate(['/rooms']);
        },
        error: (err: any) => {
          console.error(err);
          alert('Có lỗi xảy ra khi thêm phòng. Vui lòng kiểm tra lại Backend!');
        }
      });
    }
  }

  goBack() {
    this.router.navigate(['/rooms']);
  }
}
