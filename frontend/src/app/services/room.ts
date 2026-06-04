import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class RoomService {
  api = 'http://localhost:3000/rooms';

  constructor(private http: HttpClient) {}

  getRooms() {
    return this.http.get<any[]>(this.api);
  }
}
