import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class RoomService {

  private apiUrl = 'http://localhost:3000/rooms';

  constructor(private http: HttpClient) {}

  getRooms() {
    return this.http.get<any[]>(this.apiUrl);
  }

  getRoomById(id: number) {
    return this.http.get<any>(`${this.apiUrl}/${id}`);  // ← thêm
  }

  createRoom(data: any) {
    return this.http.post(this.apiUrl, data);
  }

  updateRoom(id: number, data: any) {
    return this.http.put(`${this.apiUrl}/${id}`, data);
  }

  deleteRoom(id: number) {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
