import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService, User, PageResponse } from '../../../services/user';
import { DepartmentService, Department } from '../../../services/department';
import { TranslationService } from '../../../services/translation';
import { ConfirmDialog } from '../../shared/confirm-dialog/confirm-dialog';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, FormsModule, ConfirmDialog],
  templateUrl: './users.html',
  styleUrl: './users.css'
})
export class Users implements OnInit {
  private userService = inject(UserService);
  private translationService = inject(TranslationService);
  private deptService = inject(DepartmentService);

  users: User[] = [];
  departments: Department[] = [];
  filteredUsers: User[] = [];
  newUser: User = { username: '', password: '', firstName: '', lastName: '', phone: '', role: 'EMPLOYEE', passwordChanged: false };
  selectedUser: User | null = null;

  /** Compte en attente de suppression (null = pas de boite ouverte). */
  pendingDelete: { id: number; name: string } | null = null;
  query = '';
  roleFilter = '';
  statusFilter = '';
  page = 0;
  size = 10;
  totalPages = 0;
  totalElements = 0;
  loading = false;
  actionLog: string[] = [];
  showAddModal = false;

  ngOnInit() {
    this.loadUsers();
    this.loadDepartments();
  }

  loadDepartments() {
    this.deptService.getAll().subscribe({
      next: (res) => this.departments = res,
      error: (err) => console.error('Erreur chargement départements', err)
    });
  }

  loadUsers(page = 0) {
    this.page = page;
    this.loading = true;
    this.userService.getPaginatedUsers(this.query, this.page, this.size).subscribe({
      next: (res: PageResponse<User>) => {
        this.users = res.content;
        this.totalPages = res.totalPages;
        this.totalElements = res.totalElements;
        this.applyFilters();
        this.loading = false;
      },
      error: (err) => {
        console.error('Erreur chargement utilisateurs', err);
        this.loading = false;
      }
    });
  }

  applyFilters() {
    this.filteredUsers = this.users.filter(user => {
      const matchesRole = this.roleFilter ? user.role === this.roleFilter : true;
      const matchesStatus = this.statusFilter
        ? (this.statusFilter === 'ACTIVE' ? user.active !== false : user.active === false)
        : true;
      return matchesRole && matchesStatus;
    });
  }

  searchUsers() {
    this.loadUsers(0);
  }

  resetFilters() {
    this.query = '';
    this.roleFilter = '';
    this.statusFilter = '';
    this.loadUsers(0);
  }

  openAddModal() {
    this.showAddModal = true;
  }

  closeAddModal() {
    this.showAddModal = false;
    this.newUser = { username: '', password: '', firstName: '', lastName: '', phone: '', role: 'EMPLOYEE', passwordChanged: false };
  }

  addUser() {
    if (!this.newUser.username || !this.newUser.password || !this.newUser.firstName || !this.newUser.lastName) {
      return;
    }
    this.userService.createUser(this.newUser).subscribe({
      next: () => {
        this.actionLog.unshift(`Utilisateur ${this.newUser.username} créé`);
        this.closeAddModal();
        this.loadUsers(this.page);
      },
      error: (err) => console.error('Erreur création utilisateur', err)
    });
  }

  startEdit(user: User) {
    this.selectedUser = { ...user };
  }

  cancelEdit() {
    this.selectedUser = null;
  }

  saveUser() {
    if (!this.selectedUser?.id) return;
    this.userService.updateUser(this.selectedUser.id, this.selectedUser).subscribe({
      next: () => {
        this.actionLog.unshift(`Utilisateur ${this.selectedUser?.username} mis à jour`);
        this.selectedUser = null;
        this.loadUsers(this.page);
      },
      error: (err) => console.error('Erreur mise à jour utilisateur', err)
    });
  }

  /** Ouvre la confirmation ; la suppression se fait dans confirmDelete(). */
  deleteUser(id?: number, name = '') {
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

    this.userService.deleteUser(target.id).subscribe({
      next: () => {
        this.actionLog.unshift(`Utilisateur ${target.name || target.id} supprimé`);
        this.loadUsers(this.page);
      },
      error: (err) => console.error('Erreur suppression utilisateur', err)
    });
  }

  toggleStatus(user: User) {
    if (!user.id) return;
    this.userService.toggleBlockStatus(user.id).subscribe({
      next: () => {
        const status = user.active ? 'bloqué' : 'débloqué';
        this.actionLog.unshift(`Utilisateur ${user.username} ${status}`);
        this.loadUsers(this.page);
      },
      error: (err) => console.error('Erreur changement de statut', err)
    });
  }

  changePage(pageIndex: number) {
    if (pageIndex < 0 || pageIndex >= this.totalPages) return;
    this.loadUsers(pageIndex);
  }

  t(key: string): string {
    return this.translationService.t(key);
  }
}
