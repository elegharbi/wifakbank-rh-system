import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Salary {
  id?: number;
  baseAmount: number;
  bonusAmount: number;
  deductions: number;
  month: string;
  year: string;
  paymentDate?: string;
  employee?: any; // Deprecated backend mapping
  user?: any; // Correct backend mapping
}


@Injectable({
  providedIn: 'root'
})
export class FinanceService {
  private http = inject(HttpClient);
  private apiUrl = '/api/salaries';

  getSalaries(): Observable<Salary[]> {
    return this.http.get<Salary[]>(this.apiUrl);
  }

  createSalary(salary: Salary): Observable<Salary> {
    return this.http.post<Salary>(this.apiUrl, salary);
  }
}
