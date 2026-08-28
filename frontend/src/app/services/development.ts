import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Training {
  id?: number;
  title: string;
  organization: string;
  description: string;
  durationHours: number;
  status: string;
  trainingType?: string;   // ONLINE | PRESENTIEL
  trainingLink?: string;   // URL si en ligne
  trainerName?: string;    // Chef de formation
  trainingDate?: string;   // Date de la formation (ISO)
}

export interface Evaluation {
  id?: number;
  score: number;
  feedback: string;
  strengthPoints: string;
  improvementAreas: string;
  evaluationDate?: string;
  employee?: any;
}

@Injectable({
  providedIn: 'root'
})
export class DevelopmentService {
  private http = inject(HttpClient);
  private trainingsUrl = '/api/trainings';
  private evaluationsUrl = '/api/evaluations';

  // Trainings
  getTrainings(): Observable<Training[]> {
    return this.http.get<Training[]>(this.trainingsUrl);
  }

  createTraining(training: Training): Observable<Training> {
    return this.http.post<Training>(this.trainingsUrl, training);
  }

  deleteTraining(id: number): Observable<void> {
    return this.http.delete<void>(`${this.trainingsUrl}/${id}`);
  }

  updateTraining(id: number, training: Training): Observable<Training> {
    return this.http.put<Training>(`${this.trainingsUrl}/${id}`, training);
  }

  // Performance
  getEvaluations(): Observable<Evaluation[]> {
    return this.http.get<Evaluation[]>(this.evaluationsUrl);
  }

  createEvaluation(evaluation: Evaluation): Observable<Evaluation> {
    return this.http.post<Evaluation>(this.evaluationsUrl, evaluation);
  }
}
