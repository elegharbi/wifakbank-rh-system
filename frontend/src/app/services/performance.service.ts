import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from './user';

export interface PointLog {
  id: number;
  pointsChanged: number;
  reason: string;
  date: string;
}

@Injectable({
  providedIn: 'root'
})
export class PerformanceService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8081/api/performance';

  getLeaderboard(): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/leaderboard`);
  }

  getAllRankings(): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/rankings`);
  }

  getEmployeeLogs(employeeId: number): Observable<PointLog[]> {
    return this.http.get<PointLog[]>(`${this.apiUrl}/logs/${employeeId}`);
  }

  adjustPoints(employeeId: number, points: number, reason: string): Observable<void> {
    const params = { employeeId, points, reason };
    return this.http.post<void>(`${this.apiUrl}/adjust`, null, { params });
  }
}
