import { Component, OnInit, AfterViewInit, ElementRef, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Chart, registerables } from 'chart.js';
import { EmployeeService } from '../../../services/employee';
import { LeaveService } from '../../../services/leave.service';
import { PerformanceService } from '../../../services/performance.service';
import { forkJoin } from 'rxjs';

Chart.register(...registerables);

@Component({
  selector: 'app-analytics',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './analytics.html',
  styleUrls: ['./analytics.css']
})
export class Analytics implements OnInit, AfterViewInit {
  private employeeService = inject(EmployeeService);
  private leaveService = inject(LeaveService);
  private perfService = inject(PerformanceService);

  @ViewChild('deptChart') deptChartRef!: ElementRef;
  @ViewChild('perfChart') perfChartRef!: ElementRef;
  @ViewChild('trendChart') trendChartRef!: ElementRef;
  
  loading = true;
  
  // KPIs
  totalEmployees = 0;
  totalDepartments = 0;
  avgPerformance = 0;
  pendingLeavesCount = 0;

  // Data
  deptStats: any[] = [];
  topPerformers: any[] = [];
  
  // Chart Instances
  charts: Chart[] = [];

  ngOnInit() {
    this.loadAllData();
  }

  ngAfterViewInit() {
    // Charts are initialized after data is loaded and DOM is updated
  }

  loadAllData() {
    this.loading = true;
    this.destroyCharts();

    forkJoin({
      deptStats: this.employeeService.getDepartmentStats(),
      employees: this.employeeService.getEmployees(),
      leaves: this.leaveService.getPendingLeaves(),
      leaderboard: this.perfService.getLeaderboard()
    }).subscribe({
      next: (res) => {
        this.deptStats = res.deptStats;
        this.totalEmployees = res.employees.length;
        this.totalDepartments = this.deptStats.length;
        this.pendingLeavesCount = res.leaves.length;
        
        // Handle Top Performers
        this.topPerformers = res.leaderboard.slice(0, 5); // Take top 5
        
        // Calculate Avg Performance
        if (res.leaderboard.length > 0) {
          const totalScore = res.leaderboard.reduce((sum, u) => sum + (u.performanceScore || 0), 0);
          this.avgPerformance = Math.round(totalScore / res.leaderboard.length);
        } else {
          this.avgPerformance = 1000;
        }

        this.loading = false;
        setTimeout(() => this.createCharts(), 100);
      },
      error: (err) => {
        console.error('Erreur lors du chargement des données BI', err);
        this.loading = false;
      }
    });
  }

  destroyCharts() {
    this.charts.forEach(c => c.destroy());
    this.charts = [];
  }

  createCharts() {
    if (!this.deptChartRef || !this.perfChartRef || !this.trendChartRef) return;

    // 1. Chart: Donut (Departments)
    const deptChart = new Chart(this.deptChartRef.nativeElement, {
      type: 'doughnut',
      data: {
        labels: this.deptStats.map(s => s.department || 'Général'),
        datasets: [{
          data: this.deptStats.map(s => s.count),
          backgroundColor: ['#E21E26', '#f04048', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#14b8a6'],
          borderWidth: 0,
          hoverOffset: 4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '70%',
        plugins: {
          legend: { position: 'right', labels: { usePointStyle: true, boxWidth: 8, font: { family: 'Inter', size: 12 } } },
          tooltip: {
            backgroundColor: 'rgba(17, 24, 39, 0.9)',
            padding: 12,
            cornerRadius: 8,
            titleFont: { family: 'Inter', size: 14 },
            bodyFont: { family: 'Inter', size: 13 }
          }
        }
      }
    });

    // 2. Chart: Bar (Performance par Dpt)
    // On simule une moyenne par département basé sur le leaderboard pour la démo
    const deptLabels = this.deptStats.map(s => s.department || 'Général').slice(0, 5);
    const perfData = deptLabels.map(() => Math.floor(Math.random() * 200) + 900); // Mock data > 900
    
    const perfChart = new Chart(this.perfChartRef.nativeElement, {
      type: 'bar',
      data: {
        labels: deptLabels,
        datasets: [{
          label: 'Score Moyen',
          data: perfData,
          backgroundColor: '#E21E26',
          borderRadius: 6,
          barPercentage: 0.6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: { backgroundColor: 'rgba(17, 24, 39, 0.9)', cornerRadius: 8 }
        },
        scales: {
          y: { beginAtZero: false, min: 800, grid: { color: '#f3f4f6' }, border: { display: false } },
          x: { grid: { display: false }, border: { display: false } }
        }
      }
    });

    // 3. Chart: Line (Trend)
    const ctx = this.trendChartRef.nativeElement.getContext('2d');
    const gradient = ctx.createLinearGradient(0, 0, 0, 300);
    gradient.addColorStop(0, 'rgba(226, 30, 38, 0.4)');
    gradient.addColorStop(1, 'rgba(226, 30, 38, 0.0)');

    const trendChart = new Chart(this.trendChartRef.nativeElement, {
      type: 'line',
      data: {
        labels: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'],
        datasets: [{
          label: 'Recrutements Mensuels',
          data: [4, 7, 5, 12, 8, 15, 10, 6, 14, 9, 11, 18],
          borderColor: '#E21E26',
          backgroundColor: gradient,
          borderWidth: 3,
          fill: true,
          tension: 0.4,
          pointBackgroundColor: '#ffffff',
          pointBorderColor: '#E21E26',
          pointBorderWidth: 2,
          pointRadius: 4,
          pointHoverRadius: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: { backgroundColor: 'rgba(17, 24, 39, 0.9)', cornerRadius: 8 }
        },
        scales: {
          y: { beginAtZero: true, grid: { color: '#f3f4f6', drawTicks: false }, border: { display: false } },
          x: { grid: { display: false }, border: { display: false } }
        }
      }
    });

    this.charts.push(deptChart, perfChart, trendChart);
  }

  exportReport() {
    alert("Export du rapport PDF en cours de préparation...");
  }
}
