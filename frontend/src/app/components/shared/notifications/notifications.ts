import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AppNotification, NotificationService } from '../../../services/notification.service';

type Filter = 'all' | 'unread' | 'requests';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notifications.html',
  styleUrl: './notifications.css'
})
export class Notifications implements OnInit {
  private notificationService = inject(NotificationService);
  private router = inject(Router);

  all: AppNotification[] = [];
  loading = true;
  filter: Filter = 'all';

  /** Demande en cours de traitement : évite un double clic. */
  busyId: number | null = null;
  feedback = '';
  feedbackError = false;

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.notificationService.refresh().subscribe({
      next: list => { this.all = list; this.loading = false; },
      error: () => { this.all = []; this.loading = false; }
    });
  }

  get visible(): AppNotification[] {
    if (this.filter === 'unread') return this.all.filter(n => !n.read);
    if (this.filter === 'requests') return this.all.filter(n => n.actionable);
    return this.all;
  }

  get unreadTotal(): number {
    return this.all.filter(n => !n.read).length;
  }

  get pendingTotal(): number {
    return this.all.filter(n => n.actionable).length;
  }

  setFilter(f: Filter): void {
    this.filter = f;
  }

  /** Pictogramme et teinte, selon la nature de la notification. */
  icon(n: AppNotification): string {
    switch (n.type) {
      case 'TRAINING_REQUEST':  return 'fa-graduation-cap';
      case 'EVENT_REQUEST':     return 'fa-calendar-plus';
      case 'CONTACT_REQUEST':   return 'fa-envelope-open-text';
      case 'TRAINING_SUBMITTED':
      case 'EVENT_SUBMITTED':   return 'fa-hourglass-half';
      case 'TRAINING_APPROVED':
      case 'EVENT_APPROVED':    return 'fa-circle-check';
      case 'TRAINING_REJECTED':
      case 'EVENT_REJECTED':    return 'fa-circle-xmark';
      case 'CONTACT_ACK':       return 'fa-paper-plane';
      default:                  return 'fa-bell';
    }
  }

  tone(n: AppNotification): string {
    if (n.type.endsWith('_APPROVED')) return 'ok';
    if (n.type.endsWith('_REJECTED')) return 'ko';
    if (n.type.endsWith('_SUBMITTED')) return 'wait';
    if (n.actionable) return 'todo';
    return 'info';
  }

  /** Accepter ou refuser, directement depuis la notification. */
  decide(n: AppNotification, status: 'APPROVED' | 'REJECTED'): void {
    if (!n.relatedId || this.busyId !== null) return;

    const call = n.relatedType === 'TRAINING_REGISTRATION'
      ? this.notificationService.decideTraining(n.relatedId, status)
      : this.notificationService.decideParticipation(n.relatedId, status);

    this.busyId = n.id;
    this.feedback = '';

    call.subscribe({
      next: () => {
        this.busyId = null;
        this.feedbackError = false;
        this.feedback = status === 'APPROVED'
          ? 'Demande acceptée. Le collaborateur a été prévenu.'
          : 'Demande refusée. Le collaborateur a été prévenu.';
        this.load();
        setTimeout(() => this.feedback = '', 5000);
      },
      error: (err) => {
        this.busyId = null;
        this.feedbackError = true;
        this.feedback = err?.error?.error || "L'opération a échoué. Réessayez.";
      }
    });
  }

  open(n: AppNotification): void {
    if (!n.read) {
      this.notificationService.markRead(n.id).subscribe({ next: () => {}, error: () => {} });
      n.read = true;
    }
    if (n.link) {
      this.router.navigateByUrl(n.link);
    }
  }

  markAllRead(): void {
    this.notificationService.markAllRead().subscribe({
      next: () => this.all = this.all.map(n => ({ ...n, read: true })),
      error: () => {}
    });
  }

  /** « il y a 5 min », « hier »… plus lisible qu'une date brute. */
  ago(iso: string): string {
    if (!iso) return '';
    const then = new Date(iso).getTime();
    const mins = Math.floor((Date.now() - then) / 60000);
    if (mins < 1) return "à l'instant";
    if (mins < 60) return `il y a ${mins} min`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `il y a ${hours} h`;
    const days = Math.floor(hours / 24);
    if (days === 1) return 'hier';
    if (days < 7) return `il y a ${days} jours`;
    return new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' });
  }

  trackById(_: number, n: AppNotification): number {
    return n.id;
  }
}
