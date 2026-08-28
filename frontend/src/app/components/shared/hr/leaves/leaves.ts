import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LeaveService, Leave } from '../../../../services/leave';
import { EmployeeService, Employee } from '../../../../services/employee';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-leaves',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './leaves.html',
  styleUrl: './leaves.css'
})
export class Leaves implements OnInit {
  private leaveService = inject(LeaveService);
  private employeeService = inject(EmployeeService);
  
  leaves: Leave[] = [];
  employees: Employee[] = [];
  
  newLeave = {
    employeeId: '',
    startDate: '',
    endDate: '',
    reason: '',
    status: 'PENDING'
  };

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    forkJoin({
      l: this.leaveService.getLeaves(),
      e: this.employeeService.getEmployees()
    }).subscribe({
      next: (res) => {
        this.leaves = res.l;
        this.employees = res.e;
      },
      error: (err) => console.error('Error loading leaves data', err)
    });
  }

  addLeave() {
    if (!this.newLeave.employeeId || !this.newLeave.startDate || !this.newLeave.endDate) return;

    const data = {
      employee: { id: parseInt(this.newLeave.employeeId) },
      startDate: this.newLeave.startDate,
      endDate: this.newLeave.endDate,
      reason: this.newLeave.reason,
      status: this.newLeave.status
    };

    this.leaveService.createLeave(data).subscribe({
      next: () => {
        this.loadData();
        this.newLeave = { employeeId: '', startDate: '', endDate: '', reason: '', status: 'PENDING' };
      },
      error: (err) => alert('Erreur lors de la demande')
    });
  }

  deleteLeave(id: number | undefined) {
    if (id && confirm('Annuler cette demande ?')) {
      this.leaveService.deleteLeave(id).subscribe(() => this.loadData());
    }
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'APPROVED': return 'status-approved';
      case 'REJECTED': return 'status-rejected';
      default: return 'status-pending';
    }
  }
}
