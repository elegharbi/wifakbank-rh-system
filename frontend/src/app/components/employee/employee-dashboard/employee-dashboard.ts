import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { EmployeeService } from '../../../services/employee';
import { LeaveService } from '../../../services/leave.service';

@Component({
  selector: 'app-employee-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './employee-dashboard.html',
  styleUrls: ['./employee-dashboard.css']
})
export class EmployeeDashboard implements OnInit {
  private employeeService = inject(EmployeeService);
  private leaveService = inject(LeaveService);

  stats: any = null;
  loading = true;
  userName = '';
  firstName = '';
  today = '';
  greeting = '';
  recentNotif = '';

  /** Valeurs affichees : montent progressivement jusqu'au chiffre reel. */
  shown = { leaves: 0, points: 0, events: 0, trainings: 0 };

  readonly LEAVE_ALLOWANCE = 30;

  get leavePercent(): number {
    const v = this.stats?.remainingLeaves ?? 0;
    return Math.max(0, Math.min(100, (v / this.LEAVE_ALLOWANCE) * 100));
  }

  ngOnInit(): void {
    const stored = sessionStorage.getItem('currentUser');
    if (stored) {
      const u = JSON.parse(stored);
      this.userName = ((u.firstName || '') + ' ' + (u.lastName || '')).trim() || u.username || 'Collaborateur';
      this.firstName = (u.firstName || '').trim() || this.userName.split(' ')[0];
    }

    this.today = new Date().toLocaleDateString('fr-FR', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
    });
    this.greeting = this.greetingFor(new Date().getHours());

    this.employeeService.getDashboardStats().subscribe({
      next: (res) => {
        this.stats = res;
        this.loading = false;
        this.runCounters();
      },
      error: () => {
        this.stats = { remainingLeaves: 0, totalPoints: 0, upcomingEvents: 0, availableTrainings: 0 };
        this.loading = false;
        this.runCounters();
      }
    });

    this.leaveService.getMyLeaves().subscribe({
      next: (leaves) => {
        const recent = leaves.find(l => l.status === 'APPROVED' || l.status === 'REJECTED');
        if (recent) {
          const label = recent.status === 'APPROVED' ? 'approuvée' : 'refusée';
          this.recentNotif = `Votre demande de congé du ${recent.startDate} a été ${label}. Un email vous a été envoyé.`;
        }
      },
      error: () => {}
    });
  }

  private greetingFor(hour: number): string {
    if (hour < 12) return 'Bonjour';
    if (hour < 18) return 'Bon après-midi';
    return 'Bonsoir';
  }

  /** Compte de 0 jusqu'a la valeur, en respectant "animations reduites". */
  private runCounters() {
    const targets = {
      leaves:    this.stats?.remainingLeaves ?? 0,
      points:    this.stats?.totalPoints ?? 0,
      events:    this.stats?.upcomingEvents ?? 0,
      trainings: this.stats?.availableTrainings ?? 0
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
        leaves:    Math.round(targets.leaves * eased),
        points:    Math.round(targets.points * eased),
        events:    Math.round(targets.events * eased),
        trainings: Math.round(targets.trainings * eased)
      };
      if (t < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }
}
