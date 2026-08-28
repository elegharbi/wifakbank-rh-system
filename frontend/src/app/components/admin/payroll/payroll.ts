import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { FinanceService, Salary } from '../../../services/finance';
import { EmployeeService, Employee } from '../../../services/employee';
import { UserService, User } from '../../../services/user';

@Component({
  selector: 'app-payroll',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './payroll.html',
  styleUrl: './payroll.css'
})
export class Payroll implements OnInit {
  private financeService = inject(FinanceService);
  private employeeService = inject(EmployeeService);
  private userService = inject(UserService);

  salaries: Salary[] = [];
  employees: any[] = [];
  newSalary: Salary = { baseAmount: 3000, bonusAmount: 0, deductions: 0, month: 'Avril', year: '2024' };
  selectedEmployeeId: number | null = null;

  months = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];

  // ── Modal Ajouter Employé ──────────────────────────────────────────────
  showAddEmployeeModal = false;
  savingEmployee = false;
  employeeAdded = false;
  submitted = false;
  
  // Use User model fields for the modal
  newEmployeeForm = { firstName: '', lastName: '', email: '', phone: '', department: '' };

  ngOnInit() {
    this.loadSalaries();
    this.loadEmployees();
  }

  loadEmployees() {
    this.userService.getAllUsers().subscribe(res => {
      // Filter only employees, or map to the format expected by the dropdown
      this.employees = res.filter(u => u.role === 'EMPLOYEE' || u.role === 'HR' || u.role === 'ADMIN').map(u => ({
        id: u.id,
        name: u.firstName ? `${u.firstName} ${u.lastName}` : u.username,
        department: u.department
      }));
    });
  }

  loadSalaries() {
    this.financeService.getSalaries().subscribe(res => this.salaries = res);
  }

  addSalary() {
    if (!this.selectedEmployeeId) return;
    const emp = this.employees.find(e => e.id === Number(this.selectedEmployeeId));
    if (emp) {
      this.newSalary.user = { id: emp.id }; // Pass only ID to avoid detached entity issues
      this.financeService.createSalary(this.newSalary).subscribe({
        next: () => {
          this.newSalary = { baseAmount: 3000, bonusAmount: 0, deductions: 0, month: 'Avril', year: '2024' };
          this.selectedEmployeeId = null;
          this.loadSalaries();
        },
        error: (err) => {
          console.error(err);
          alert("Erreur lors de la génération de la paie. Veuillez réessayer.");
        }
      });
    }
  }

  calculateNet(salary: Salary): number {
    return salary.baseAmount + (salary.bonusAmount || 0) - (salary.deductions || 0);
  }

  // ── Gestion Modale ─────────────────────────────────────────────────────
  openAddEmployeeModal() {
    this.newEmployeeForm = { firstName: '', lastName: '', email: '', phone: '', department: '' };
    this.submitted = false;
    this.employeeAdded = false;
    this.showAddEmployeeModal = true;
  }

  closeAddEmployeeModal() {
    this.showAddEmployeeModal = false;
    this.submitted = false;
    this.employeeAdded = false;
  }

  closeOnOverlay(event: MouseEvent) {
    if ((event.target as HTMLElement).classList.contains('modal-overlay')) {
      this.closeAddEmployeeModal();
    }
  }

  saveEmployee() {
    this.submitted = true;
    if (!this.newEmployeeForm.firstName || !this.newEmployeeForm.lastName || !this.newEmployeeForm.email || !this.newEmployeeForm.department) return;

    this.savingEmployee = true;
    
    // Construct User payload
    const newUser: User = {
      firstName: this.newEmployeeForm.firstName,
      lastName: this.newEmployeeForm.lastName,
      username: this.newEmployeeForm.email, // using email as username
      email: this.newEmployeeForm.email,
      phone: this.newEmployeeForm.phone,
      password: 'Password123!', // Required by backend validation
      role: 'EMPLOYEE',
      passwordChanged: false,
      // Pass the department as an object if required by backend, or just the string if it's mapped differently
      // Assuming department is a string or mapped in the backend
      department: null 
    };

    this.userService.createUser(newUser).subscribe({
      next: (created) => {
        this.employees.push({
          id: created.id,
          name: `${created.firstName} ${created.lastName}`,
          department: created.department
        });
        this.selectedEmployeeId = created.id ?? null;
        this.savingEmployee = false;
        this.employeeAdded = true;
        setTimeout(() => this.closeAddEmployeeModal(), 1500);
      },
      error: () => {
        this.savingEmployee = false;
        alert("Erreur lors de la création de l'employé. Veuillez réessayer.");
      }
    });
  }
}
