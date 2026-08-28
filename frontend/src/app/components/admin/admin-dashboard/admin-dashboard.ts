import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { UserService, User } from '../../../services/user';
import { DepartmentService } from '../../../services/department';
import { CandidateService } from '../../../services/candidate.service';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './admin-dashboard.html',
  styleUrls: ['./admin-dashboard.scss']
})
export class AdminDashboard implements OnInit {
  private userService = inject(UserService);
  private departmentService = inject(DepartmentService);
  private candidateService = inject(CandidateService);

  loading = true;
  totalUsers = 0;
  totalCandidates = 0;
  totalDepartments = 0;

  roleDistribution = {
    admin: 0,
    hr: 0,
    employee: 0,
    candidate: 0
  };

  recentUsers: User[] = [];

  /** Valeurs affichees : montent progressivement jusqu'au chiffre reel. */
  shown = { users: 0, candidates: 0, departments: 0 };

  recentActivities = [
    { text: 'Nouveau compte créé par l\'Administrateur', time: 'Il y a 10 min', icon: 'fa-solid fa-user-plus', color: 'blue' },
    { text: 'Département mis à jour', time: 'Il y a 1 heure', icon: 'fa-solid fa-sitemap', color: 'green' },
    { text: 'Attribution de rôle effectuée', time: 'Il y a 3 heures', icon: 'fa-solid fa-shield-halved', color: 'gray' },
    { text: 'Compte utilisateur désactivé', time: 'Il y a 1 jour', icon: 'fa-solid fa-user-slash', color: 'red' }
  ];

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.loading = true;
    forkJoin({
      users: this.userService.getAll(),
      departments: this.departmentService.getAll(),
      candidates: this.candidateService.getAll()
    }).subscribe({
      next: (res) => {
        const users = res.users;
        this.totalUsers = users.length;
        this.totalCandidates = res.candidates.length;
        this.totalDepartments = res.departments.length;

        // Role Distribution
        this.roleDistribution.admin = users.filter(u => u.role === 'ADMIN').length;
        this.roleDistribution.hr = users.filter(u => u.role === 'HR').length;
        this.roleDistribution.employee = users.filter(u => u.role === 'EMPLOYEE').length;
        this.roleDistribution.candidate = users.filter(u => u.role === 'CANDIDATE').length;

        // Recent users
        this.recentUsers = users.slice(Math.max(users.length - 5, 0)).reverse();

        this.loading = false;
        this.runCounters();
      },
      error: (err) => {
        console.error('Error loading dashboard data', err);
        this.loading = false;
      }
    });
  }

  /** Part de l'effectif pour un role, en pourcentage. */
  sharePercent(count: number): number {
    if (!this.totalUsers) return 0;
    return Math.max(0, Math.min(100, (count / this.totalUsers) * 100));
  }

  /** Compte de 0 jusqu'a la valeur, en respectant "animations reduites". */
  private runCounters() {
    const targets = {
      users: this.totalUsers,
      candidates: this.totalCandidates,
      departments: this.totalDepartments
    };

    const reduced = typeof window !== 'undefined'
      && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

    if (reduced) { this.shown = { ...targets }; return; }

    const DURATION = 900;
    const start = performance.now();
    const step = (now: number) => {
      const t = Math.min(1, (now - start) / DURATION);
      const eased = 1 - Math.pow(1 - t, 3);
      this.shown = {
        users: Math.round(targets.users * eased),
        candidates: Math.round(targets.candidates * eased),
        departments: Math.round(targets.departments * eased)
      };
      if (t < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }
}
