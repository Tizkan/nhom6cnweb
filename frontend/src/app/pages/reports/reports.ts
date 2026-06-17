import {
  Component,
  OnInit,
  AfterViewInit,
  ViewChild,
  ElementRef,
  OnDestroy,
  ChangeDetectorRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReportService } from '../../services/report';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './reports.html',
  styleUrl: './reports.css',
})
export class Reports implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('barChart')
  barChartRef!: ElementRef<HTMLCanvasElement>;

  @ViewChild('pieChart')
  pieChartRef!: ElementRef<HTMLCanvasElement>;

  dashboardData: any = null;
  loading = true;

  private barChartInstance: Chart | null = null;
  private pieChartInstance: Chart | null = null;

  // FIX: Inject ChangeDetectorRef đúng cách vào constructor
  constructor(
    private reportService: ReportService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.loadDashboard();
  }

  ngAfterViewInit(): void {
    // Nếu data đã load xong trước khi view init (hiếm gặp), render luôn
    if (this.dashboardData) {
      this.renderAllCharts();
    }
  }

  loadDashboard(): void {
    this.reportService.getDashboardData().subscribe({
      next: (res) => {
        console.log('API Response:', res);

        if (res.success) {
          this.dashboardData = res.data;
          this.loading = false;

          // FIX: Trigger change detection trước, sau đó render chart
          this.cdr.detectChanges();

          setTimeout(() => {
            this.renderAllCharts();
          }, 0);
        } else {
          console.error('API lỗi:', res.message);
          this.loading = false;
          this.cdr.detectChanges();
        }
      },

      error: (err) => {
        console.error('Lỗi gọi API:', err);
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }

  private renderAllCharts(): void {
    if (this.dashboardData?.revenueChart?.length) {
      this.initDoubleBarChart();
    }

    if (this.dashboardData?.roomDistribution?.length) {
      this.initPieChart();
    }
  }

  initDoubleBarChart(): void {
    if (!this.barChartRef) return;

    if (this.barChartInstance) {
      this.barChartInstance.destroy();
    }

    const ctx = this.barChartRef.nativeElement.getContext('2d');

    if (!ctx) return;

    const labels = this.dashboardData.revenueChart.map((item: any) => item.month);

    const revenueData = this.dashboardData.revenueChart.map((item: any) => item.revenue);

    const bookingsData = this.dashboardData.revenueChart.map((item: any) => item.bookings);

    this.barChartInstance = new Chart(ctx, {
      type: 'bar',

      data: {
        labels,

        datasets: [
          {
            label: 'Doanh thu (triệu đ)',
            data: revenueData,
            backgroundColor: '#3b82f6',
            yAxisID: 'y',
          },

          {
            label: 'Số đặt phòng',
            data: bookingsData,
            backgroundColor: '#10b981',
            yAxisID: 'y1',
          },
        ],
      },

      options: {
        responsive: true,
        maintainAspectRatio: false,

        scales: {
          y: {
            type: 'linear',
            position: 'left',
          },

          y1: {
            type: 'linear',
            position: 'right',

            grid: {
              drawOnChartArea: false,
            },
          },
        },

        plugins: {
          legend: {
            position: 'bottom',
          },
        },
      },
    });
  }

  initPieChart(): void {
    if (!this.pieChartRef) return;

    if (this.pieChartInstance) {
      this.pieChartInstance.destroy();
    }

    const ctx = this.pieChartRef.nativeElement.getContext('2d');

    if (!ctx) return;

    const labels = this.dashboardData.roomDistribution.map(
      (item: any) => `${item.type} ${item.percentage}%`,
    );

    const values = this.dashboardData.roomDistribution.map((item: any) => item.percentage);

    this.pieChartInstance = new Chart(ctx, {
      type: 'pie',

      data: {
        labels,

        datasets: [
          {
            data: values,

            backgroundColor: ['#3b82f6', '#10b981', '#f59e0b'],
          },
        ],
      },

      options: {
        responsive: true,
        maintainAspectRatio: false,

        plugins: {
          legend: {
            position: 'bottom',
          },
        },
      },
    });
  }

  ngOnDestroy(): void {
    if (this.barChartInstance) {
      this.barChartInstance.destroy();
    }

    if (this.pieChartInstance) {
      this.pieChartInstance.destroy();
    }
  }
}
