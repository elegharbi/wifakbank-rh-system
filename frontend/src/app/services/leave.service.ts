import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface LeaveResponse {
  id: number;
  employee: { id: number; name?: string; email?: string };
  employeeId: number;
  prenom: string;
  nom: string;
  startDate: string;
  endDate: string;
  reason: string;
  leaveType: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'VALIDATED';
}

export interface LeaveRequest {
  startDate: string;
  endDate: string;
  reason?: string;
  leaveType?: string;
}

@Injectable({
  providedIn: 'root'
})
export class LeaveService {
  private baseUrl = '/api/leaves'; // proxy will forward to backend

  constructor(private http: HttpClient) {}

  // ---------- Employee endpoints ----------
  /** Get leaves of the currently authenticated employee */
  getMyLeaves(): Observable<LeaveResponse[]> {
    return this.http.get<LeaveResponse[]>(`${this.baseUrl}/my`, { withCredentials: true });
  }

  /** Submit a new leave request */
  submitLeave(request: LeaveRequest): Observable<LeaveResponse> {
    return this.http.post<LeaveResponse>(`${this.baseUrl}/submit`, request, { withCredentials: true });
  }

  // ---------- HR endpoints ----------
  /** Get all pending leaves for HR review */
  getPendingLeaves(): Observable<LeaveResponse[]> {
    return this.http.get<LeaveResponse[]>(`${this.baseUrl}/pending`, { withCredentials: true });
  }

  /** Get all leaves for HR review */
  getAllLeaves(): Observable<LeaveResponse[]> {
    return this.http.get<LeaveResponse[]>(this.baseUrl, { withCredentials: true });
  }

  /** Change status of a leave (approve / reject) */
  changeStatus(id: number, status: 'APPROVED' | 'REJECTED'): Observable<LeaveResponse> {
    const params = new HttpParams().set('status', status);
    return this.http.put<LeaveResponse>(`${this.baseUrl}/${id}/status`, null, { params, withCredentials: true });
  }

  /** Validate a leave (used by RH approval component) */
  validateLeave(id: number): Observable<string> {
    return this.http.put<string>(`${this.baseUrl}/${id}/validate`, {}, { responseType: 'text' as 'json', withCredentials: true });
  }

  /** Approve a leave */
  approveLeave(id: number): Observable<string> {
    return this.http.put<string>(`${this.baseUrl}/${id}/approve`, {}, { responseType: 'text' as 'json', withCredentials: true });
  }

  /** Reject a leave */
  rejectLeave(id: number): Observable<string> {
    return this.http.put<string>(`${this.baseUrl}/${id}/reject`, {}, { responseType: 'text' as 'json', withCredentials: true });
  }

  /** Delete a leave */
  deleteLeave(id: number): Observable<string> {
    return this.http.delete<string>(`${this.baseUrl}/${id}`, { responseType: 'text' as 'json', withCredentials: true });
  }
}

