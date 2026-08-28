import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PointsService } from '../../../services/points.service';

interface LeaderboardItem {
  username: string;
  totalPoints: number;
}

interface PointLogItem {
  id: number;
  pointsChanged: number;
  reason: string;
  date: string;
}

@Component({
  selector: 'app-employee-points',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './employee-points.html',
  styleUrls: ['./employee-points.css']
})
export class EmployeePointsComponent implements OnInit {
  totalPoints = 0;
  history: PointLogItem[] = [];
  leaderboard: LeaderboardItem[] = [];
  loading = true;
  errorMessage = '';

  constructor(private pointsService: PointsService) {}

  ngOnInit(): void {
    this.loadPointsData();
  }

  loadPointsData() {
    this.loading = true;
    this.errorMessage = '';
    this.pointsService.getMyPoints().subscribe({
      next: (res: any) => {
        this.totalPoints = res.totalPoints;
        
        // Fetch history
        this.pointsService.getPointsHistory().subscribe({
          next: (histRes: PointLogItem[]) => {
            this.history = histRes;
          },
          error: () => {
            this.errorMessage = 'Erreur lors du chargement de l\'historique des points.';
          }
        });

        // Fetch leaderboard
        this.pointsService.getLeaderboard().subscribe({
          next: (leadRes: LeaderboardItem[]) => {
            this.leaderboard = leadRes;
            this.loading = false;
          },
          error: () => {
            this.loading = false;
          }
        });
      },
      error: (err: any) => {
        this.errorMessage = 'Erreur lors du chargement de vos points.';
        this.loading = false;
      }
    });
  }
}

