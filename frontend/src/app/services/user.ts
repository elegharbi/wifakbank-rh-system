import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';

export interface User {
  id?: number;
  username: string;
  password?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  profileImage?: string;
  role: string;
  email?: string;
  department?: any;
  performanceScore?: number;
  passwordChanged: boolean;
  active?: boolean;
  deleted?: boolean;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8081/api/users';

  getMe(): Observable<User> {
    const userStr = sessionStorage.getItem('currentUser');
    if (userStr) {
      const u = JSON.parse(userStr);
      if (u && u.id) {
        return this.http.get<User>(`${this.apiUrl}/${u.id}`);
      }
    }
    return throwError(() => new Error("No current user ID found"));
  }

  updateMe(user: Partial<User>): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/${user.id}`, user);
  }

  getAllUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/all`);
  }
  
  getPaginatedUsers(search: string = '', page: number = 0, size: number = 10): Observable<PageResponse<User>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    
    if (search) {
      params = params.set('search', search);
    }
    return this.http.get<PageResponse<User>>(this.apiUrl, { params });
  }

  createUser(user: User): Observable<User> {
    return this.http.post<User>(this.apiUrl, user);
  }

  updateUser(id: number, user: User): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/${id}`, user);
  }

  deleteUser(id: number): Observable<void> { // Soft delete
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
  
  hardDeleteUser(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}/hard`);
  }
  
  toggleBlockStatus(id: number): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/${id}/toggle-status`, {});
  }

  // Generic methods requested for Admin module
  getAll(): Observable<User[]> {
    return this.getAllUsers();
  }

  getById(id: number): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/${id}`);
  }

  update(id: number, data: Partial<User>): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/${id}`, data);
  }

  delete(id: number): Observable<void> {
    return this.deleteUser(id);
  }
}
