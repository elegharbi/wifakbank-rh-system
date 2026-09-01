import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EventService, Event } from '../../../../services/event';
import { AuthService } from '../../../../services/auth.service';
import { ParticipationService } from '../../../../services/participation';
import { ConfirmDialog } from '../../confirm-dialog/confirm-dialog';

@Component({
  selector: 'app-events',
  standalone: true,
  imports: [CommonModule, FormsModule, ConfirmDialog],
  templateUrl: './events.html',
  styleUrl: './events.css'
})
export class Events implements OnInit {
  private eventService = inject(EventService);
  private authService = inject(AuthService);
  private participationService = inject(ParticipationService);
  
  events: Event[] = [];
  newEvent: Event = { title: '', description: '', eventDate: '', location: '' };
  
  isAdminOrRH = false;
  isEmployee = false;
  myParticipations: any[] = [];
  message = '';
  error = false;

  /** Action en attente de confirmation (null = aucune boite ouverte). */
  pending: { kind: 'join' | 'leave' | 'delete'; id: number; title: string } | null = null;

  ngOnInit() {
    const role = this.authService.getRole();
    this.isAdminOrRH = role === 'HR';
    this.isEmployee = role === 'EMPLOYEE';
    
    this.loadEvents();
    if (this.isEmployee) {
      this.loadMyParticipations();
    }
  }

  loadEvents() {
    this.eventService.getEvents().subscribe({
      next: (data) => this.events = data,
      error: (err) => console.error('Error loading events', err)
    });
  }

  loadMyParticipations() {
    this.participationService.getMyParticipations().subscribe({
      next: (data) => this.myParticipations = data,
      error: (err) => console.error('Error loading participations', err)
    });
  }

  hasParticipated(eventId: number | undefined): boolean {
    if (!eventId) return false;
    return this.myParticipations.some(p => p.event && p.event.id === eventId);
  }

  /**
   * Statut de la demande : PENDING, APPROVED ou REJECTED.
   *
   * Renvoie null si l'utilisateur n'a rien demandé. Une inscription
   * enregistrée avant l'ajout du statut est considérée approuvée.
   */
  participationStatus(eventId: number | undefined): string | null {
    if (!eventId) return null;
    const p = this.myParticipations.find(x => x.event && x.event.id === eventId);
    if (!p) return null;
    return p.status || 'APPROVED';
  }

  /** Une demande refusée peut être redéposée. */
  canRequest(eventId: number | undefined): boolean {
    const s = this.participationStatus(eventId);
    return s === null || s === 'REJECTED';
  }

  /** Identifiant de l'inscription de l'utilisateur pour cet evenement. */
  private participationIdFor(eventId: number): number | null {
    const p = this.myParticipations.find(x => x.event && x.event.id === eventId);
    return p?.id ?? null;
  }

  askParticipate(eventId: number | undefined, title = '') {
    if (!eventId) return;
    this.pending = { kind: 'join', id: eventId, title };
  }

  askCancelParticipation(eventId: number | undefined, title = '') {
    if (!eventId) return;
    this.pending = { kind: 'leave', id: eventId, title };
  }

  askDelete(eventId: number | undefined, title = '') {
    if (!eventId) return;
    this.pending = { kind: 'delete', id: eventId, title };
  }

  dismissDialog() {
    this.pending = null;
  }

  /** Execute l'action confirmee. */
  runPending() {
    const action = this.pending;
    this.pending = null;
    if (!action) return;

    if (action.kind === 'join') {
      this.participationService.registerForEvent(action.id).subscribe({
        next: () => {
          this.message = "Demande envoyée. L'équipe RH doit la valider ; vous serez notifié.";
          this.error = false;
          this.loadMyParticipations();
        },
        error: () => {
          this.message = "L'inscription a échoué. Réessayez.";
          this.error = true;
        }
      });
      return;
    }

    if (action.kind === 'leave') {
      const participationId = this.participationIdFor(action.id);
      if (!participationId) {
        this.message = "Inscription introuvable. Rechargez la page.";
        this.error = true;
        return;
      }
      this.participationService.deleteParticipation(participationId).subscribe({
        next: () => {
          this.message = "Votre demande a été retirée.";
          this.error = false;
          this.loadMyParticipations();
        },
        error: () => {
          this.message = "L'annulation a échoué. Réessayez.";
          this.error = true;
        }
      });
      return;
    }

    this.eventService.deleteEvent(action.id).subscribe({
      next: () => {
        this.message = "Événement supprimé.";
        this.error = false;
        this.loadEvents();
      },
      error: () => {
        this.message = "La suppression a échoué.";
        this.error = true;
      }
    });
  }

  addEvent() {
    this.eventService.createEvent(this.newEvent).subscribe({
      next: () => {
        this.message = "Événement publié.";
        this.error = false;
        this.loadEvents();
        this.newEvent = { title: '', description: '', eventDate: '', location: '' };
      },
      error: () => {
        this.message = "La création de l'événement a échoué.";
        this.error = true;
      }
    });
  }

  triggerAdd() {
    this.newEvent = { title: '', description: '', eventDate: '', location: '' };
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  editEvent(ev: Event) {
    this.newEvent = { ...ev };
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

}
