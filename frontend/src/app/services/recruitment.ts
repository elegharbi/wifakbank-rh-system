import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface JobPosition {
  id?: number;
  title: string;
  department: string;
  description: string;
  requirements: string;
  status: string;
  postedDate?: string;
}

export interface Candidate {
  id?: number;
  fullName: string;
  email: string;
  phone: string;
  cvUrl: string;
  status: string;
  jobPosition?: JobPosition;
  evaluationScore?: number;
  hrComment?: string;
}

@Injectable({
  providedIn: 'root'
})
export class RecruitmentService {
  private http = inject(HttpClient);
  private jobsUrl = '/api/job-positions';
  private candidatesUrl = '/api/candidates';

  // Job Positions
  getJobs(): Observable<JobPosition[]> {
    return this.http.get<JobPosition[]>(this.jobsUrl);
  }

  createJob(job: JobPosition): Observable<JobPosition> {
    return this.http.post<JobPosition>(this.jobsUrl, job);
  }

  // Candidates
  getCandidates(): Observable<Candidate[]> {
    return this.http.get<Candidate[]>(this.candidatesUrl);
  }

  createCandidate(candidate: Candidate): Observable<Candidate> {
    return this.http.post<Candidate>(this.candidatesUrl, candidate);
  }

  updateCandidate(id: number, candidate: Partial<Candidate>): Observable<Candidate> {
    return this.http.put<Candidate>(`${this.candidatesUrl}/${id}`, candidate);
  }
}
