import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, NavigationEnd } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { UserService, User } from '../../services/user';
import { LeaveService } from '../../services/leave';
import { CandidateService } from '../../services/candidate.service';
import { Chatbot } from '../../components/shared/chatbot/chatbot';

@Component({
  selector: 'app-hr-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, Chatbot],
  templateUrl: './hr-layout.component.html',
  styleUrls: ['./hr-layout.component.scss']
})
export class HrLayoutComponent implements OnInit {
  private router = inject(Router);
  private userService = inject(UserService);
  private authService = inject(AuthService);
  private leaveService = inject(LeaveService);
  private candidateService = inject(CandidateService);

  pageTitle = 'Tableau de bord Directeur Ressources Humaines';
  search = '';
  currentUser: User | null = null;
  pendingLeaves = 0;
  pendingCandidates = 0;

  ngOnInit() {
    this.loadCurrentUser();
    this.loadStats();
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.updateTitle(event.urlAfterRedirects);
      }
    });
    this.updateTitle(this.router.url);
  }

  loadCurrentUser() {
    this.userService.getMe().subscribe({
      next: (user) => { this.currentUser = user; },
      error: () => { this.currentUser = null; }
    });
  }

  loadStats() {
    this.leaveService.getAll().subscribe({
      next: (leaves) => {
        this.pendingLeaves = leaves.filter((l: any) => l.status === 'PENDING').length;
      },
      error: () => {}
    });
    this.candidateService.getAll().subscribe({
      next: (candidates) => {
        this.pendingCandidates = candidates.filter((c: any) => c.status === 'PENDING').length;
      },
      error: () => {}
    });
  }

  logout() {
    this.authService.logout();
  }

  get userInitials(): string {
    if (!this.currentUser) return 'DRH';
    const first = this.currentUser.firstName?.trim().charAt(0) ?? '';
    const last = this.currentUser.lastName?.trim().charAt(0) ?? '';
    return `${first}${last}`.toUpperCase() || 'DRH';
  }

  updateTitle(url: string) {
    const path = url.replace(/^\/+/, '').split('/');
    const routeKey = path[0] === 'hr' ? path[1] : path[0];
    const titles: Record<string, string> = {
      dashboard: 'Tableau de bord Directeur Ressources Humaines',
      jobs: 'Offres d\'emploi',
      candidates: 'Candidatures',
      leaves: 'Gestion des Congés',
      trainings: 'Formations',
      performance: 'Évaluations & Performance',
      participations: 'Points & Participation',
      announcements: 'Annonces',
      events: 'Événements',
      profile: 'Mon profil'
    };
    this.pageTitle = titles[routeKey] ?? 'Espace Directeur Ressources Humaines';
  }
}
