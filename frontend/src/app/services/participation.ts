import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Employee } from './employee';
import { Event } from './event';

export interface Participation {
  id?: number;
  employee?: { id: number; name?: string };
  event?: { id: number; title?: string };
  registrationDate?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ParticipationService {
  private http = inject(HttpClient);
  private apiUrl = '/api/participations'; // Use proxy!

  getParticipations(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl, { withCredentials: true });
  }

  getMyParticipations(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/my`, { withCredentials: true });
  }

  registerForEvent(eventId: number): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/register/${eventId}`, {}, { withCredentials: true });
  }

  createParticipation(participation: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, participation, { withCredentials: true });
  }

  deleteParticipation(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, { withCredentials: true });
  }
}
