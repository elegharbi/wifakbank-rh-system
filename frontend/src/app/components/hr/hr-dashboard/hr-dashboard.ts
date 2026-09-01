import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { UserService, User } from '../../../services/user';
import { LeaveService, Leave } from '../../../services/leave';
import { CandidateService, Candidate } from '../../../services/candidate.service';
import { TrainingService, Training } from '../../../services/training.service';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

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

  /** Valeurs affichees : montent progressivement jusqu'au chiffre reel. */
  shown = { employees: 0, leaves: 0, candidates: 0, trainings: 0 };

  /** Message affiche si une source de donnees n'a pas repondu. */
  loadError = '';

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.loading = true;
    // Chaque source est isolee : si l'une echoue, les autres restent
    // affichees. Auparavant une seule erreur remettait tout le tableau
    // a zero, y compris les listes.
    this.loadError = '';
    const failed: string[] = [];
    const guard = (src: any, label: string) =>
      (src as any).pipe(catchError(() => { failed.push(label); return of([] as any[]); })) as any;

    forkJoin({
      users: guard(this.userService.getAll(), 'employés'),
      leaves: guard(this.leaveService.getAll(), 'congés'),
      candidates: guard(this.candidateService.getAll(), 'candidatures'),
      trainings: guard(this.trainingService.getAll(), 'formations')
    }).subscribe({
      next: (res: any) => {
        // Employees
        this.totalEmployees = res.users.filter((u: User) => u.role === 'EMPLOYEE').length;

        // Leaves
        const pending = res.leaves.filter((l: Leave) => l.status === 'PENDING');
        this.pendingLeavesCount = pending.length;
        this.pendingLeaves = pending.slice(0, 5);

        // Candidates
        // Les candidatures utilisent APPLIED, jamais PENDING : le compteur
        // restait donc bloque a zero.
        this.pendingCandidatesCount = res.candidates
          .filter((c: any) => !c.status || c.status === 'APPLIED').length;
        this.recentCandidates = res.candidates.slice(Math.max(res.candidates.length - 5, 0)).reverse();

        // Trainings
        this.totalTrainings = res.trainings.length;
        this.recentTrainings = res.trainings.slice(Math.max(res.trainings.length - 4, 0)).reverse();

        this.loading = false;
        if (failed.length) {
          this.loadError = 'Impossible de charger : ' + failed.join(', ') + '.';
        }
        this.runCounters();
      },
      error: (err) => {
        console.error('Error loading HR dashboard data', err);
        this.loading = false;
        this.loadError = "Le chargement du tableau de bord a échoué.";
      }
    });
  }

  /**
   * Nom du demandeur.
   *
   * La demande porte un `user` : les champs `employee`, `nom` et `prenom`
   * n'existent pas côté serveur, d'où le « undefined undefined » affiché.
   */
  employeeName(leave: Leave): string {
    const u: any = (leave as any).user ?? (leave as any).employee ?? null;
    if (!u) return 'Collaborateur';
    const full = `${u.firstName ?? ''} ${u.lastName ?? ''}`.trim();
    return full || u.name || u.username || 'Collaborateur';
  }

  getInitials(leave: Leave): string {
    const u: any = (leave as any).user ?? (leave as any).employee ?? null;
    if (u) {
      const a = (u.firstName ?? '').trim().charAt(0);
      const b = (u.lastName ?? '').trim().charAt(0);
      const pair = (a + b).toUpperCase();
      if (pair) return pair;
    }
    return this.employeeName(leave).trim().charAt(0).toUpperCase() || 'E';
  }

  approveLeave(id: number | undefined) {
    if (!id) return;
    this.leaveService.approve(id).subscribe(() => this.loadData());
  }

  rejectLeave(id: number | undefined) {
    if (!id) return;
    this.leaveService.reject(id).subscribe(() => this.loadData());
  }

  /** Compte de 0 jusqu'a la valeur, en respectant "animations reduites". */
  private runCounters() {
    const targets = {
      employees: this.totalEmployees,
      leaves: this.pendingLeavesCount,
      candidates: this.pendingCandidatesCount,
      trainings: this.totalTrainings
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
        employees: Math.round(targets.employees * eased),
        leaves: Math.round(targets.leaves * eased),
        candidates: Math.round(targets.candidates * eased),
        trainings: Math.round(targets.trainings * eased)
      };
      if (t < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }
}
