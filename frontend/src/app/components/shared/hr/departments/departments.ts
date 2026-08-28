import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DepartmentService, Department } from '../../../../services/department';
import { ConfirmDialog } from '../../confirm-dialog/confirm-dialog';

@Component({
  selector: 'app-departments',
  standalone: true,
  imports: [CommonModule, FormsModule, ConfirmDialog],
  templateUrl: './departments.html',
  styleUrl: './departments.css'
})
export class Departments implements OnInit {
  private deptService = inject(DepartmentService);
  
  departments: Department[] = [];
  newDept: Department = { name: '', description: '', headOfDepartment: '' };
  editingDept: Department | null = null;

  /** Departement en attente de suppression (null = pas de boite ouverte). */
  pendingDelete: { id: number; name: string } | null = null;

  ngOnInit() {
    this.loadDepartments();
  }

  loadDepartments() {
    this.deptService.getAll().subscribe({
      next: (res) => this.departments = res,
      error: (err) => console.error('Erreur chargement départements', err)
    });
  }

  saveDepartment() {
    if (!this.newDept.name) return;
    if (this.editingDept?.id) {
      this.deptService.update(this.editingDept.id, this.newDept).subscribe({
        next: () => {
          this.editingDept = null;
          this.newDept = { name: '', description: '', headOfDepartment: '' };
          this.loadDepartments();
        },
        error: (err) => console.error('Erreur mise à jour département', err)
      });
    } else {
      this.deptService.create(this.newDept).subscribe({
        next: () => {
          this.newDept = { name: '', description: '', headOfDepartment: '' };
          this.loadDepartments();
        },
        error: (err) => console.error('Erreur création département', err)
      });
    }
  }

  editDepartment(dept: Department) {
    this.editingDept = dept;
    this.newDept = { ...dept };
  }

  cancelEdit() {
    this.editingDept = null;
    this.newDept = { name: '', description: '', headOfDepartment: '' };
  }

  /** Ouvre la confirmation ; la suppression se fait dans confirmDelete(). */
  deleteDepartment(id: number | undefined, name = '') {
    if (!id) return;
    this.pendingDelete = { id, name };
  }

  cancelDelete() {
    this.pendingDelete = null;
  }

  confirmDelete() {
    const target = this.pendingDelete;
    this.pendingDelete = null;
    if (!target) return;
    this.deptService.delete(target.id).subscribe({
      next: () => this.loadDepartments(),
      error: (err) => console.error('Erreur suppression département', err)
    });
  }
}
