import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

export interface AppNotification {
  id: number;
  type: string;
  title: string;
  message: string;
  link?: string | null;
  relatedType?: string | null;
  relatedId?: number | null;
  actionable: boolean;
  read: boolean;
  createdAt: string;
  actor?: {
    id: number;
    username: string;
    firstName?: string;
    lastName?: string;
    email?: string;
  } | null;
}

/**
 * Notifications de l'utilisateur connecté.
 *
 * Tout vient du serveur : rien n'est fabriqué côté navigateur. Le compteur
 * est diffusé pour que la pastille de l'en-tête se mette à jour partout
 * en même temps.
 */
@Injectable({ providedIn: 'root' })
export class NotificationService {
  private http = inject(HttpClient);
  private readonly api = '/api/notifications';

  private readonly unread = new BehaviorSubject<number>(0);
  readonly unreadCount$ = this.unread.asObservable();

  private readonly items = new BehaviorSubject<AppNotification[]>([]);
  readonly notifications$ = this.items.asObservable();

  /** Recharge la liste et le compteur. */
  refresh(): Observable<AppNotification[]> {
    return this.http.get<AppNotification[]>(this.api).pipe(
      tap(list => {
        this.items.next(list ?? []);
        this.unread.next((list ?? []).filter(n => !n.read).length);
      }),
      catchError(() => {
        // Non connecté ou serveur indisponible : on n'affiche rien plutôt qu'une erreur.
        this.items.next([]);
        this.unread.next(0);
        return of([]);
      })
    );
  }

  refreshCount(): void {
    this.http.get<{ count: number }>(`${this.api}/unread-count`).pipe(
      catchError(() => of({ count: 0 }))
    ).subscribe(r => this.unread.next(r?.count ?? 0));
  }

  markRead(id: number): Observable<unknown> {
    return this.http.put(`${this.api}/${id}/read`, {}).pipe(
      tap(() => {
        const updated = this.items.value.map(n => n.id === id ? { ...n, read: true } : n);
        this.items.next(updated);
        this.unread.next(updated.filter(n => !n.read).length);
      })
    );
  }

  markAllRead(): Observable<unknown> {
    return this.http.put(`${this.api}/read-all`, {}).pipe(
      tap(() => {
        this.items.next(this.items.value.map(n => ({ ...n, read: true })));
        this.unread.next(0);
      })
    );
  }

  // ---- Décisions du RH, prises depuis la notification ----

  decideTraining(registrationId: number, status: 'APPROVED' | 'REJECTED'): Observable<unknown> {
    return this.http.put(`/api/trainings/registrations/${registrationId}/status`, { status });
  }

  decideParticipation(participationId: number, status: 'APPROVED' | 'REJECTED'): Observable<unknown> {
    return this.http.put(`/api/participations/${participationId}/status`, { status });
  }
}
