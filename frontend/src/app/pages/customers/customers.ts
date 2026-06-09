import { Component, ChangeDetectorRef, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, NavigationEnd } from '@angular/router';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { CustomerService } from '../../services/customer';
import { Customer } from '../../models/customer.model';

@Component({
  selector: 'app-customers',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './customers.html',
  styleUrls: ['./customers.css'],
})
export class CustomersComponent implements OnInit {
  customers: Customer[] = [];
  filteredCustomers: Customer[] = [];
  searchQuery = '';
  isLoading = false;

  // Stats
  totalCustomers = 0;
  vipCustomers = 0;
  totalRevenue = 0;

  // Modal thêm / sửa
  showModal = false;
  isEditMode = false;
  formError = '';
  form: Partial<Customer> = {};

  // Modal xem chi tiết
  showDetailModal = false;
  selectedCustomer: Customer | null = null;

  // Modal xác nhận xoá
  showDeleteModal = false;
  deleteTargetId: number | null = null;

  private routerSubscription: Subscription | null = null;

  constructor(
    private customerService: CustomerService,
    private router: Router,
    private cdRef: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadCustomers();
    this.routerSubscription = this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        if (event.urlAfterRedirects === '/customers') {
          this.loadCustomers();
        }
      });
  }

  ngOnDestroy(): void {
    this.routerSubscription?.unsubscribe();
  }

  // ── LOAD ──────────────────────────────────────
  loadCustomers(): void {
    this.customers = [];
    this.filteredCustomers = [];
    this.totalCustomers = 0;
    this.vipCustomers = 0;
    this.totalRevenue = 0;
    this.isLoading = true;

    this.customerService.getCustomers().subscribe({
      next: (data: Customer[]) => {
        this.customers = data;
        this.totalCustomers = data.length;
        this.vipCustomers = data.filter((c) => {
          const amount = Number(c.total_spent ?? 0);
          const bookings = Number(c.booking_count ?? 0);
          return bookings >= 5 || amount >= 10000000;
        }).length;
        this.totalRevenue = data.reduce((sum, c) => sum + Number(c.total_spent ?? 0), 0);
        this.applyFilter();
        this.isLoading = false;
        this.cdRef.detectChanges();
      },
      error: () => {
        this.isLoading = false;
        this.cdRef.detectChanges();
      },
    });
  }

  // ── TÌM KIẾM ──────────────────────────────────
  applyFilter(): void {
    const q = (this.searchQuery ?? '').toLowerCase().trim();
    if (!q) {
      this.filteredCustomers = [...this.customers];
    } else {
      this.filteredCustomers = this.customers.filter(
        (c) =>
          (c.full_name ?? '').toLowerCase().includes(q) ||
          (c.phone ?? '').includes(q) ||
          (c.email ?? '').toLowerCase().includes(q)
      );
    }
  }

  formatRevenue(amount: number | string | undefined): string {
    const value = Number(amount ?? 0);
    return '₫' + new Intl.NumberFormat('vi-VN').format(value);
  }

  // ── THÊM ──────────────────────────────────────
  openCreateModal(): void {
    this.isEditMode = false;
    this.form = {};
    this.formError = '';
    this.showModal = true;
  }

  // ── SỬA ───────────────────────────────────────
  openEditModal(customer: Customer): void {
    this.isEditMode = true;
    this.form = { ...customer };
    this.formError = '';
    this.showModal = true;
  }

  // ── LƯU (THÊM / SỬA) ──────────────────────────
  saveCustomer(): void {
    if (!this.form.full_name || !this.form.phone) {
      this.formError = 'Vui lòng điền ít nhất Họ tên và Số điện thoại.';
      return;
    }
    this.formError = '';

    if (this.isEditMode && this.form.id) {
      this.customerService.updateCustomer(this.form.id, this.form).subscribe({
        next: () => {
          this.closeModal();
          this.loadCustomers();
        },
        error: () => {
          this.formError = 'Cập nhật thất bại. Vui lòng thử lại.';
        },
      });
    } else {
      this.customerService.createCustomer(this.form).subscribe({
        next: () => {
          this.closeModal();
          this.loadCustomers();
        },
        error: () => {
          this.formError = 'Thêm khách hàng thất bại. Vui lòng thử lại.';
        },
      });
    }
  }

  closeModal(): void {
    this.showModal = false;
    this.form = {};
    this.formError = '';
  }

  // ── XEM CHI TIẾT ──────────────────────────────
  openDetail(customer: Customer): void {
    this.selectedCustomer = customer;
    this.showDetailModal = true;
  }

  closeDetail(): void {
    this.showDetailModal = false;
    this.selectedCustomer = null;
  }

  // ── XOÁ ───────────────────────────────────────
  confirmDelete(id: number): void {
    this.deleteTargetId = id;
    this.showDeleteModal = true;
  }

  executeDelete(): void {
    if (this.deleteTargetId === null) return;
    this.customerService.deleteCustomer(this.deleteTargetId).subscribe({
      next: () => {
        this.showDeleteModal = false;
        this.deleteTargetId = null;
        this.loadCustomers();
      },
      error: () => {
        this.showDeleteModal = false;
      },
    });
  }

  cancelDelete(): void {
    this.showDeleteModal = false;
    this.deleteTargetId = null;
  }

  // ── UTILS ─────────────────────────────────────
  getInitial(name: string): string {
    if (!name) return '?';
    return name.trim().charAt(0).toUpperCase();
  }

  formatDate(dateStr?: string | null): string {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('vi-VN');
  }

  formatCurrency(amount: number | string | undefined): string {
    const value = Number(amount ?? 0);
    return '₫' + new Intl.NumberFormat('vi-VN').format(value);
  }
}
