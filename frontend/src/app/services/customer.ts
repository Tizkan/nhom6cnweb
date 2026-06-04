import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class CustomerService {
  api = 'http://localhost:3000/customers';

  constructor(private http: HttpClient) {}

  getCustomers() {
    return this.http.get<any[]>(this.api);
  }
}
