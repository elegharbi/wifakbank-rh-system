import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Training {
  id?: number;
  title: string;
  organization?: string;
  description?: string;
  durationHours?: number;
  status?: string;
}

@Injectable({
  providedIn: 'root'
})
export class TrainingService {
  private http = inject(HttpClient);
  private apiUrl = '/api/trainings';

  getAll(): Observable<Training[]> {
    return this.http.get<Training[]>(this.apiUrl);
  }
}
