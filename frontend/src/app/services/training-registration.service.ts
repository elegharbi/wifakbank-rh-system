import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface TrainingRegistration {
  id?: number;
  employee?: any;
  training?: any;
  status: string;
  registrationDate: string;
}

@Injectable({
  providedIn: 'root'
})
export class TrainingRegistrationService {
  private http = inject(HttpClient);
  private baseUrl = '/api/trainings/registrations'; // Relies on proxy

  registerForTraining(trainingId: number): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/register/${trainingId}`, {}, { withCredentials: true });
  }

  getMyRegistrations(): Observable<TrainingRegistration[]> {
    return this.http.get<TrainingRegistration[]>(`${this.baseUrl}/my`, { withCredentials: true });
  }

  getAllRegistrations(): Observable<TrainingRegistration[]> {
    return this.http.get<TrainingRegistration[]>(this.baseUrl, { withCredentials: true });
  }

  updateStatus(id: number, status: 'APPROVED' | 'REJECTED'): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/${id}/status`, { status }, { withCredentials: true });
  }
}
