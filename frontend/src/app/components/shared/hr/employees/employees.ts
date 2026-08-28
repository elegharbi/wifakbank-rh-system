import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DepartmentService, Department } from '../../../../services/department';
import { UserService, User } from '../../../../services/user';

@Component({
  selector: 'app-employees',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './employees.html',
  styleUrl: './employees.css'
})
export class Employees implements OnInit {
  private deptService = inject(DepartmentService);
  private userService = inject(UserService);

  departments: Department[] = [];
  employees: User[] = [];
  selectedEmployee: User | null = null;
  newEmployee: User = { username: '', password: '', firstName: '', lastName: '', phone: '', role: 'EMPLOYEE', department: '', passwordChanged: false };
  query = '';
  filteredEmployees: User[] = [];

  ngOnInit() {
    this.loadDepartments();
    this.loadEmployees();
  }

  loadDepartments() {
    this.deptService.getAll().subscribe({
      next: (data) => this.departments = data,
      error: (err) => console.error('Erreur chargement départements', err)
    });
  }

  loadEmployees() {
    this.userService.getAllUsers().subscribe({
      next: (users) => {
        this.employees = users.filter(u => u.role === 'EMPLOYEE');
        this.applyFilter();
      },
      error: (err) => console.error('Erreur chargement employés', err)
    });
  }

  applyFilter() {
    const lower = this.query.toLowerCase();
    this.filteredEmployees = this.employees.filter(emp =>
      emp.firstName?.toLowerCase().includes(lower) ||
      emp.lastName?.toLowerCase().includes(lower) ||
      emp.username?.toLowerCase().includes(lower) ||
      emp.email?.toLowerCase().includes(lower) ||
      (typeof emp.department === 'string' ? emp.department.toLowerCase().includes(lower) : emp.department?.name?.toLowerCase().includes(lower))
    );
  }

  startEdit(employee: User) {
    this.selectedEmployee = { ...employee };
  }

  cancelEdit() {
    this.selectedEmployee = null;
  }

  saveEmployee() {
    if (!this.selectedEmployee?.id) return;
    this.userService.updateUser(this.selectedEmployee.id, this.selectedEmployee).subscribe({
      next: () => {
        this.cancelEdit();
        this.loadEmployees();
      },
      error: (err) => console.error('Erreur mise à jour employé', err)
    });
  }

  addEmployee() {
    if (!this.newEmployee.username || !this.newEmployee.password || !this.newEmployee.firstName || !this.newEmployee.lastName) {
      alert('Veuillez remplir les informations essentielles de l\'employé.');
      return;
    }
    this.userService.createUser(this.newEmployee).subscribe({
      next: () => {
        this.newEmployee = { username: '', password: '', firstName: '', lastName: '', phone: '', role: 'EMPLOYEE', department: '', passwordChanged: false };
        this.loadEmployees();
      },
      error: (err) => console.error('Erreur création employé', err)
    });
  }

  deleteEmployee(id: number | undefined) {
    if (!id) return;
    if (confirm('Voulez-vous supprimer cet employé ?')) {
      this.userService.deleteUser(id).subscribe({
        next: () => this.loadEmployees(),
        error: (err) => console.error('Erreur suppression employé', err)
      });
    }
  }

  toggleStatus(employee: User) {
    if (!employee.id) return;
    this.userService.toggleBlockStatus(employee.id).subscribe({
      next: () => this.loadEmployees(),
      error: (err) => console.error('Erreur changement de statut', err)
    });
  }
}
