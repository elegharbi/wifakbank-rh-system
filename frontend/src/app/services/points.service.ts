import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface PointsResponse {
  totalPoints: number;
}

@Injectable({
  providedIn: 'root'
})
export class PointsService {
  private baseUrl = '/api/points';

  constructor(private http: HttpClient) {}

  /** Get points of the logged‑in employee */
  getMyPoints(): Observable<PointsResponse> {
    return this.http.get<PointsResponse>(`${this.baseUrl}/me`, { withCredentials: true });
  }

  /** History of points */
  getPointsHistory(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/history`, { withCredentials: true });
  }

  /** Leaderboard */
  getLeaderboard(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/leaderboard`, { withCredentials: true });
  }
}
