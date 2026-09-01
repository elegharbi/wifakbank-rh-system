import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Employee {
  id?: number;
  name: string;
  email: string;
  phone: string;
  department: string;
  performanceScore?: number;
  user?: { id: number; username: string };
}

@Injectable({
  providedIn: 'root'
})
export class EmployeeService {
  private http = inject(HttpClient);
  // Le contrôleur est monté sur /api/employee (singulier) et ne fournit
  // pas de liste : « les employés » sont les utilisateurs. L'ancienne
  // adresse /api/employees n'a jamais existé, d'où les erreurs 500.
  private apiUrl = '/api/employee';
  private usersUrl = '/api/users';

  getEmployees(): Observable<Employee[]> {
    return this.http.get<Employee[]>(`${this.usersUrl}/all`);
  }

  getDepartmentStats(): Observable<any[]> {
    return this.http.get<any[]>(`${this.usersUrl}/stats/by-department`);
  }

  getEmployee(id: number): Observable<Employee> {
    return this.http.get<Employee>(`${this.usersUrl}/${id}`);
  }

  createEmployee(employee: Employee): Observable<Employee> {
    return this.http.post<Employee>(this.usersUrl, employee);
  }

  deleteEmployee(id: number): Observable<void> {
    return this.http.delete<void>(`${this.usersUrl}/${id}`);
  }

  getDashboardStats(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/dashboard-stats`, { withCredentials: true });
  }
}
