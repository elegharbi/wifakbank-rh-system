import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PerformanceService } from '../../../services/performance.service';
import { User } from '../../../services/user';
import { TranslationService } from '../../../services/translation';

@Component({
  selector: 'app-leaderboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="leaderboard-card">
      <div class="card-header">
        <h3><i class="fa-solid fa-chart-simple"></i> {{ t('leaderboardTitle') || 'Classement Performance' }}</h3>
        <p>{{ t('leaderboardSubtitle') || 'Les employés les plus engagés ce mois-ci' }}</p>
      </div>
      
      <div class="leaderboard-list">
        <div *ngFor="let emp of topEmployees; let i = index" class="leaderboard-item" [class.top-three]="i < 3">
          <div class="rank">{{ i + 1 }}</div>
          <div class="emp-info">
            <div class="avatar-sm">
              <img *ngIf="emp.profileImage" [src]="emp.profileImage" alt="">
              <span *ngIf="!emp.profileImage">{{ emp.firstName?.charAt(0) }}</span>
            </div>
            <div class="details">
              <span class="name">{{ emp.name || (emp.firstName + ' ' + (emp.lastName || '')) }}</span>
              <span class="role">{{ emp.role }}</span>
            </div>
          </div>
          <div class="score">
            <span class="value">{{ emp.performanceScore }}</span>
            <span class="pts">pts</span>
          </div>
          <div class="badge-icon gold" *ngIf="i === 0"><i class="fa-solid fa-medal"></i></div>
          <div class="badge-icon silver" *ngIf="i === 1"><i class="fa-solid fa-medal"></i></div>
          <div class="badge-icon bronze" *ngIf="i === 2"><i class="fa-solid fa-medal"></i></div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .leaderboard-card {
      background: white;
      border-radius: 20px;
      padding: 24px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.05);
      height: 100%;
    }
    .card-header {
      margin-bottom: 24px;
    }
    .card-header h3 {
      color: #E21E26;
      font-size: 1.25rem;
      font-weight: 700;
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 4px;
    }
    .card-header h3 i { color: #E21E26; }
    .card-header p {
      color: #64748b;
      font-size: 0.875rem;
    }
    .leaderboard-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .leaderboard-item {
      display: flex;
      align-items: center;
      padding: 12px 16px;
      border-radius: 16px;
      background: #f8fafc;
      transition: all 0.3s ease;
    }
    .leaderboard-item:hover {
      transform: translateX(5px);
      background: #f1f5f9;
    }
    .leaderboard-item.top-three {
      background: linear-gradient(to right, #FFF5F5, #f8fafc);
      border: 1px solid #fca5a5;
    }
    .rank {
      font-weight: 800;
      color: #94a3b8;
      width: 24px;
      font-size: 1rem;
    }
    .top-three .rank { color: #E21E26; }
    .emp-info {
      display: flex;
      align-items: center;
      gap: 12px;
      flex: 1;
    }
    .avatar-sm {
      width: 40px;
      height: 40px;
      border-radius: 12px;
      background: #E21E26;
      color: white;
      display: flex;
      justify-content: center;
      align-items: center;
      font-weight: 600;
      overflow: hidden;
    }
    .details {
      display: flex;
      flex-direction: column;
    }
    .name {
      font-weight: 600;
      color: #1e293b;
      font-size: 0.935rem;
    }
    .role {
      font-size: 0.75rem;
      color: #64748b;
    }
    .score {
      text-align: right;
      display: flex;
      flex-direction: column;
      align-items: flex-end;
    }
    .value {
      font-weight: 700;
      color: #E21E26;
      font-size: 1.1rem;
    }
    .pts {
      font-size: 0.7rem;
      color: #94a3b8;
      text-transform: uppercase;
      font-weight: 600;
    }
    .badge-icon {
      font-size: 1.25rem;
      margin-left: 10px;
    }
    .badge-icon.gold i { color: #fbbf24; }
    .badge-icon.silver i { color: #94a3b8; }
    .badge-icon.bronze i { color: #b45309; }
  `]
})
export class Leaderboard implements OnInit {
  private perfService = inject(PerformanceService);
  private translation = inject(TranslationService);
  
  topEmployees: any[] = [];

  ngOnInit() {
    this.perfService.getLeaderboard().subscribe({
      next: (data) => {
        this.topEmployees = data;
      },
      error: (err) => {
        console.error('Error loading leaderboard:', err);
        // Fail gracefully without crashing the whole dashboard
      }
    });
  }

  t(key: string): string {
    return this.translation.t(key);
  }
}
