import { Component, OnInit, OnDestroy, inject, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { Chatbot } from '../chatbot/chatbot';
import { UserService, User } from '../../../services/user';
import { TranslationService } from '../../../services/translation';
import { AuthService } from '../../../services/auth.service';
import { AvatarService } from '../../../services/avatar.service';
import { NotificationService } from '../../../services/notification.service';

import { AdminSidebar } from '../../admin/admin-sidebar/admin-sidebar';
import { HrSidebar } from '../../hr/hr-sidebar/hr-sidebar';
import { EmployeeSidebar } from '../../employee/employee-sidebar/employee-sidebar';
import { CandidateSidebar } from '../../candidate/candidate-sidebar/candidate-sidebar';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    Chatbot,
    AdminSidebar,
    HrSidebar,
    EmployeeSidebar,
    CandidateSidebar
  ],
  templateUrl: './layout.html',
  styleUrl: './layout.css',
  encapsulation: ViewEncapsulation.None
})
export class Layout implements OnInit, OnDestroy {
  private userService = inject(UserService);
  private router = inject(Router);
  translation = inject(TranslationService);
  authService = inject(AuthService);
  avatarService = inject(AvatarService);
  notificationService = inject(NotificationService);

  isDropdownOpen = false;
  isSettingsDropdownOpen = false;
  isDarkMode = false;
  user: User | null = null;

  // Role is driven by the reactive stream — updated on login/logout/reload
  currentRole: string | null = null;
  private roleSub!: Subscription;
  private notifTimer: any = null;

  ngOnInit() {
    // Subscribe to user changes
    this.roleSub = this.authService.currentUser$.subscribe(user => {
      this.currentRole = user ? user.role : this.authService.getRole();
    });

    // Edge case: page reload — restore from sessionStorage immediately
    if (!this.currentRole) {
      this.currentRole = this.authService.getRole();
    }

    this.loadUser();

    // Compteur de la cloche : rafraichi a l'ouverture puis toutes les 60 s.
    if (this.authService.isLoggedIn()) {
      this.notificationService.refreshCount();
      this.notifTimer = setInterval(() => this.notificationService.refreshCount(), 60000);
    }

    const savedTheme = localStorage.getItem('theme');
    const savedLang = localStorage.getItem('lang') as 'fr' | 'ar' | null;
    // Aucun choix enregistre : on suit le reglage du systeme.
    if (savedTheme === 'dark') {
      this.enableDark();
    } else if (savedTheme !== 'light' && window.matchMedia?.('(prefers-color-scheme: dark)').matches) {
      this.enableDark(false);
    }
    if (savedLang) this.translation.setLang(savedLang);
  }

  ngOnDestroy() {
    if (this.notifTimer) { clearInterval(this.notifTimer); }
    this.roleSub?.unsubscribe();
  }

  loadUser() {
    this.userService.getMe().subscribe({
      next: (res) => {
        this.user = res;
      },
      error: (err) => {
        console.error('Error loading user profile in layout:', err);
        // Optionally redirect to login if unauthorized
        if (err.status === 401 || err.status === 403) {
          this.authService.logout();
          this.router.navigate(['/login']);
        }
      }
    });
  }

  toggleDropdown() {
    this.isDropdownOpen = !this.isDropdownOpen;
    if (this.isDropdownOpen) this.isSettingsDropdownOpen = false;
  }

  toggleSettingsDropdown() {
    this.isSettingsDropdownOpen = !this.isSettingsDropdownOpen;
    if (this.isSettingsDropdownOpen) this.isDropdownOpen = false;
  }

  toggleDarkMode() {
    this.isDarkMode = !this.isDarkMode;
    if (this.isDarkMode) this.enableDark();
    else this.disableDark();
  }

  /** `remember` a false : on suit le systeme sans figer le choix. */
  enableDark(remember = true) {
    this.isDarkMode = true;
    document.body.classList.add('dark-mode');
    if (remember) localStorage.setItem('theme', 'dark');
  }

  disableDark() {
    this.isDarkMode = false;
    document.body.classList.remove('dark-mode');
    localStorage.setItem('theme', 'light');
  }

  switchLang(lang: 'fr' | 'ar') {
    this.translation.setLang(lang);
    localStorage.setItem('lang', lang);
  }

  t(key: string): string {
    return this.translation.t(key);
  }

  // ── Strict role checks — each maps to exactly ONE sidebar ──
  get isAdmin(): boolean {
    return this.currentRole === 'ADMIN';
  }

  get isHR(): boolean {
    return this.currentRole === 'HR';
  }

  get isEmployee(): boolean {
    return this.currentRole === 'EMPLOYEE';
  }

  get isCandidat(): boolean {
    return this.currentRole === 'CANDIDATE';
  }

  get isManager(): boolean {
    return this.currentRole === 'ADMIN' || this.currentRole === 'HR';
  }
}
