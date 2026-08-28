import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { UserService, User } from '../../../services/user';
import { LeaveService, Leave } from '../../../services/leave';
import { CandidateService, Candidate } from '../../../services/candidate.service';
import { TrainingService, Training } from '../../../services/training.service';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-hr-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './hr-dashboard.html',
  styleUrls: ['./hr-dashboard.scss']
})
export class HrDashboard implements OnInit {
  private userService = inject(UserService);
  private leaveService = inject(LeaveService);
  private candidateService = inject(CandidateService);
  private trainingService = inject(TrainingService);

  loading = true;
  totalEmployees = 0;
  pendingLeavesCount = 0;
  pendingCandidatesCount = 0;
  totalTrainings = 0;

  pendingLeaves: Leave[] = [];
  recentCandidates: Candidate[] = [];
  recentTrainings: Training[] = [];

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.loading = true;
    forkJoin({
      users: this.userService.getAll(),
      leaves: this.leaveService.getAll(),
      candidates: this.candidateService.getAll(),
      trainings: this.trainingService.getAll()
    }).subscribe({
      next: (res) => {
        // Employees
        this.totalEmployees = res.users.filter((u: User) => u.role === 'EMPLOYEE').length;

        // Leaves
        const pending = res.leaves.filter((l: Leave) => l.status === 'PENDING');
        this.pendingLeavesCount = pending.length;
        this.pendingLeaves = pending.slice(0, 5);

        // Candidates
        this.pendingCandidatesCount = res.candidates.filter((c: Candidate) => c.status === 'PENDING').length;
        this.recentCandidates = res.candidates.slice(Math.max(res.candidates.length - 5, 0)).reverse();

        // Trainings
        this.totalTrainings = res.trainings.length;
        this.recentTrainings = res.trainings.slice(Math.max(res.trainings.length - 4, 0)).reverse();

        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading HR dashboard data', err);
        this.loading = false;
      }
    });
  }

  getInitials(leave: Leave): string {
    const nom = (leave as any).nom ?? (leave.employee as any)?.name ?? '';
    return nom.trim().charAt(0).toUpperCase() || 'E';
  }

  approveLeave(id: number | undefined) {
    if (!id) return;
    this.leaveService.approve(id).subscribe(() => this.loadData());
  }

  rejectLeave(id: number | undefined) {
    if (!id) return;
    this.leaveService.reject(id).subscribe(() => this.loadData());
  }
}
