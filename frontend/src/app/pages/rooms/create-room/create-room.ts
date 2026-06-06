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
      const newRoom = form.value;

      // Giữ nguyên logic gửi form ban đầu của bạn
      this.roomService.createRoom(newRoom).subscribe({
        next: (res: any) => {
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
