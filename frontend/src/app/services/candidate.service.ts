import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Candidate {
  id?: number;
  fullName: string;
  email: string;
  phone: string;
  cvUrl?: string;
  status?: string;
  jobPosition?: any;
  evaluationScore?: number;
  hrComment?: string;
}

@Injectable({
  providedIn: 'root'
})
export class CandidateService {
  private http = inject(HttpClient);
  private apiUrl = '/api/candidates';

  getAll(): Observable<Candidate[]> {
    return this.http.get<Candidate[]>(this.apiUrl);
  }
}
