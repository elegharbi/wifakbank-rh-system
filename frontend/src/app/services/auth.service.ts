import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, of, BehaviorSubject } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';

export interface LoginResponse {
  token?: string;
  message?: string;
  user?: any;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = '/api/auth';
  private loggedIn = false;

  // Observable exposing the currently logged‑in user (decoded from JWT)
  private userSubject = new BehaviorSubject<any>(null);
  public currentUser$ = this.userSubject.asObservable();

  constructor(private http: HttpClient, private router: Router) {}

  /** Alias used by layout & components */
  isLoggedIn(): boolean {
    return this.isAuthenticated();
  }

  /** Auth check: cookie OR sessionStorage OR in-memory flag */
  isAuthenticated(): boolean {
    if (this.loggedIn) return true;
    // Check sessionStorage
    const user = sessionStorage.getItem('currentUser');
    if (user) return true;
    // Check cookie
    if (typeof document !== 'undefined' && document.cookie) {
      return document.cookie.split(';').some(c => c.trim().startsWith('Authorization='));
    }
    return false;
  }

  /** Get role from sessionStorage or cookie */
  getRole(): string | null {
    const stored = sessionStorage.getItem('currentUser');
    if (stored) {
      try {
        return JSON.parse(stored).role ?? null;
      } catch { /* fall through */ }
    }

    const token = typeof localStorage !== 'undefined'
      ? localStorage.getItem('token')
      : null;
    if (token) {
      try {
        const payload = token.split('.')[1];
        let base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
        while (base64.length % 4) {
          base64 += '=';
        }
        return JSON.parse(atob(base64)).role ?? null;
      } catch {
        return null;
      }
    }

    if (typeof document !== 'undefined' && document.cookie) {
      const cookieToken = document.cookie
        .split(';')
        .find(c => c.trim().startsWith('Authorization='));
      if (!cookieToken) return null;
      const payload = cookieToken.split('=')[1].split('.')[1];
      try {
        let base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
        while (base64.length % 4) {
          base64 += '=';
        }
        return JSON.parse(atob(base64)).role ?? null;
      } catch {
        return null;
      }
    }

    return null;
  }

  /** Push decoded user payload to the observable stream */
  private updateCurrentUser(token?: string): void {
    if (!token) {
      this.userSubject.next(null);
      return;
    }
    const payload = token.split('.')[1];
    try {
      let base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
      while (base64.length % 4) {
        base64 += '=';
      }
      this.userSubject.next(JSON.parse(atob(base64)));
    } catch {
      this.userSubject.next(null);
    }
  }

  login(username: string, password: string): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>(`${this.apiUrl}/login`, { username, password }, { withCredentials: true })
      .pipe(
        tap(res => {
          if (res.token) {
            localStorage.setItem('token', res.token);
            this.loggedIn = true;
            this.updateCurrentUser(res.token);
          }
          if (res.user) {
            sessionStorage.setItem('currentUser', JSON.stringify(res.user));
          }
        })
      );
  }

  refresh(): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>(`${this.apiUrl}/refresh`, {}, { withCredentials: true })
      .pipe(
        tap(res => {
          if (res.token) {
            localStorage.setItem('token', res.token);
            this.loggedIn = true;
            this.updateCurrentUser(res.token);
          }
        }),
        catchError(err => {
          console.error('Refresh error', err);
          this.loggedIn = false;
          return of({ message: 'Refresh failed' } as LoginResponse);
        })
      );
  }

  resetPassword(email: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/reset-password`, { email });
  }

  logout(): void {
    document.cookie = 'Authorization=;path=/;max-age=0';
    localStorage.removeItem('token');
    sessionStorage.removeItem('currentUser');
    this.loggedIn = false;
    this.updateCurrentUser();
    this.router.navigate(['/login']);
  }

  // ----- Additional helper methods used by UI -----
  changePassword(username: string, newPassword: string): Observable<any> {
    return this.http
      .post<any>(`${this.apiUrl}/change-password`, { username, newPassword }, { withCredentials: true })
      .pipe(catchError(err => of(err)));
  }

  registerCandidate(user: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/register/candidate`, user, { withCredentials: true });
  }

  registerHR(user: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/register/hr`, user, { withCredentials: true });
  }
}
