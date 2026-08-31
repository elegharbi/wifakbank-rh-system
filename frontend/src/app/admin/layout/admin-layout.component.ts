import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, NavigationEnd } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { UserService, User } from '../../services/user';
import { AdminService } from '../../services/admin';
import { ThemeService } from '../../services/theme.service';
import { AvatarService } from '../../services/avatar.service';
import { NotificationService } from '../../services/notification.service';
import { Chatbot } from '../../components/shared/chatbot/chatbot';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, Chatbot],
  templateUrl: './admin-layout.component.html',
  styleUrls: ['./admin-layout.component.scss']
})
export class AdminLayoutComponent implements OnInit {
  private router = inject(Router);
  private userService = inject(UserService);
  private authService = inject(AuthService);
  private adminService = inject(AdminService);
  themeService = inject(ThemeService);
  avatarService = inject(AvatarService);
  notificationService = inject(NotificationService);

  pageTitle = 'Tableau de bord';
  search = '';
  currentUser: User | null = null;
  statsLoaded = false;
  totalUsers = 0;
  pendingLeaves = 0;
  pendingCandidates = 0;

  ngOnInit() {
    this.avatarService.reload();
    this.notificationService.refreshCount();
    setInterval(() => this.notificationService.refreshCount(), 60000);
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
      next: (user) => {
        this.currentUser = user;
      },
      error: () => {
        this.currentUser = null;
      }
    });
  }

  loadStats() {
    this.adminService.getDashboardStats().subscribe({
      next: (stats) => {
        this.totalUsers = stats.totalUsers;
        this.pendingLeaves = stats.pendingLeaves;
        this.pendingCandidates = stats.candidates;
        this.statsLoaded = true;
      },
      error: () => {
        this.statsLoaded = true;
      }
    });
  }

  logout() {
    this.authService.logout();
  }

  get userInitials(): string {
    if (!this.currentUser) {
      return 'WB';
    }
    const first = this.currentUser.firstName?.trim().charAt(0) ?? '';
    const last = this.currentUser.lastName?.trim().charAt(0) ?? '';
    return `${first}${last}`.toUpperCase() || 'WB';
  }

  updateTitle(url: string) {
    const path = url.replace(/^\/+/, '').split('/');
    const routeKey = path[0] === 'admin' ? path[1] : path[0];
    const titles: Record<string, string> = {
      dashboard:     'Tableau de bord',
      users:         'Gestion Utilisateurs',
      departments:   'Départements',
      payroll:       'Salaires',
      analytics:     'Analytics & Rapports',
      announcements: 'Annonces',
      profile:       'Mon profil',
      settings:      'Paramètres'
    };
    this.pageTitle = titles[routeKey] ?? 'Administration';
  }
}
