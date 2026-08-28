import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Department {
  id?: number;
  name: string;
  description: string;
  headOfDepartment?: string;
}

@Injectable({
  providedIn: 'root'
})
export class DepartmentService {
  private http = inject(HttpClient);
  private apiUrl = '/api/departments';

  getAll(): Observable<Department[]> {
    return this.http.get<Department[]>(this.apiUrl);
  }

  create(dept: Department): Observable<Department> {
    return this.http.post<Department>(this.apiUrl, dept);
  }

  update(id: number, dept: Department): Observable<Department> {
    return this.http.put<Department>(`${this.apiUrl}/${id}`, dept);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
