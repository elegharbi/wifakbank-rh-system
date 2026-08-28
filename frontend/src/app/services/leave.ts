import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Leave {
  id?: number;
  employeeId?: number;
  nom?: string;
  prenom?: string;
  employee?: { id: number; name?: string };
  startDate: string;
  endDate: string;
  reason: string;
  status: string;
}

@Injectable({
  providedIn: 'root'
})
export class LeaveService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8081/api/leaves';

  // Used by RH to see all pending leaves
  getLeaves(): Observable<Leave[]> {
    return this.http.get<Leave[]>(`${this.apiUrl}/pending`);
  }

  // Get all leaves (pending, approved, rejected)
  getAll(): Observable<Leave[]> {
    return this.http.get<Leave[]>(this.apiUrl);
  }

  approve(id: number): Observable<Leave> {
    return this.http.put<Leave>(`${this.apiUrl}/${id}/approve`, {});
  }

  reject(id: number): Observable<Leave> {
    return this.http.put<Leave>(`${this.apiUrl}/${id}/reject`, {});
  }

  // Used by employee to submit a new leave request
  // Sends flat payload: { employeeId, nom, prenom, startDate, endDate, reason }
  createLeave(leave: any): Observable<Leave> {
    return this.http.post<Leave>(`${this.apiUrl}/submit`, leave);
  }

  deleteLeave(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`, { responseType: 'text' });
  }
}
