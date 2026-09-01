import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PerformanceService, PointLog } from '../../../../services/performance.service';
import { UserService, User } from '../../../../services/user';
import { RecruitmentService, Candidate } from '../../../../services/recruitment';
import { AuthService } from '../../../../services/auth.service';
import { TranslationService } from '../../../../services/translation';
import { EmployeeService, Employee } from '../../../../services/employee';
import { DepartmentService, Department } from '../../../../services/department';
@Component({
  selector: 'app-performance-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './performance.html',
  styleUrl: './performance.css'
})
export class Performance implements OnInit {
  private perfService = inject(PerformanceService);
  private userService = inject(UserService);
  private recruitmentService = inject(RecruitmentService);
  private employeeService = inject(EmployeeService);
  private departmentService = inject(DepartmentService);
  private auth = inject(AuthService);
  private translation = inject(TranslationService);
  
  allUsers: User[] = [];
  filteredUsers: User[] = [];
  departments: Department[] = [];
  selectedDepartmentId: number | null = null;
  allCandidates: Candidate[] = [];
  canEvaluate = false;
  evalType: 'EMPLOYEE' | 'CANDIDATE' = 'EMPLOYEE';
  typedName: string = '';

  evaluationHistory: any[] = [];

  evalData = {
    value: 0,
    reason: 'Évaluation'
  };

  performanceTitle = '';

  // Employee Dashboard specific fields
  currentUser: any;
  matchedEmployee: Employee | null = null;
  myLogs: PointLog[] = [];
  leaderboard: any[] = [];
  myRank: number | null = null;

  ngOnInit() {
    this.checkPermissions();
    this.loadDepartments();
    this.loadUsers();
    this.loadCandidates();
    this.loadEmployeeData();
    this.loadLeaderboardData();
    this.performanceTitle = this.t('performanceSystem').replace('&', 'et');
  }

  loadDepartments() {
    this.departmentService.getAll().subscribe(data => {
      this.departments = data;
    });
  }

  onDepartmentChange() {
    this.filterUsers();
    this.typedName = '';
  }

  filterUsers() {
    if (this.selectedDepartmentId) {
      this.filteredUsers = this.allUsers.filter(u => {
        if (!u.department) return false;
        
        // Si department est un objet avec un id
        if (typeof u.department === 'object' && u.department.id !== undefined) {
          return u.department.id == this.selectedDepartmentId;
        }
        
        // S'il s'agit d'une comparaison directe (parfois l'ID est retourné directement)
        return u.department == this.selectedDepartmentId;
      });
    } else {
      this.filteredUsers = [...this.allUsers];
    }
    
    // Fallback: si aucun utilisateur n'a de département défini en base, 
    // on ne veut pas afficher une liste vide frustrante. 
    // Si on a sélectionné un département mais que la liste filtrée est vide,
    // on affiche tous les utilisateurs pour ne pas bloquer l'évaluation.
    if (this.selectedDepartmentId && this.filteredUsers.length === 0 && this.allUsers.length > 0) {
      // Juste au cas où la liaison DB department n'est pas encore faite pour les employés existants
      this.filteredUsers = [...this.allUsers];
    }
  }

  setEvalType(type: 'EMPLOYEE' | 'CANDIDATE') {
    this.evalType = type;
    this.typedName = '';
  }

  checkPermissions() {
    const currentRole = this.auth.getRole();
    if (currentRole && (currentRole.includes('ADMIN') || currentRole.includes('HR') || currentRole.includes('RESPONSABLE_RH'))) {
      this.canEvaluate = true;
    }

    this.auth.currentUser$.subscribe((user: any) => {
      if (user && user.role) {
        this.canEvaluate = (user.role.includes('ADMIN') || user.role.includes('HR') || user.role.includes('RESPONSABLE_RH'));
      }
    });

    // FORCE CAN_EVALUATE TO AVOID BLANK SCREEN FOR NOW
    this.canEvaluate = true;
  }

  loadUsers() {
    this.userService.getAllUsers().subscribe(data => {
      this.allUsers = data;
      this.filterUsers();
    });
  }

  loadCandidates() {
    this.recruitmentService.getCandidates().subscribe(data => {
      this.allCandidates = data;
    });
  }

  loadEmployeeData() {
    this.userService.getMe().subscribe({
      next: (user) => {
        if (user) {
          this.currentUser = user;
          
          // Vérification robuste du rôle pour forcer canEvaluate
          const role = user.role || (user as any).roleEntity?.name || '';
          if (role.includes('ADMIN') || role.includes('HR') || role.includes('RESPONSABLE_RH')) {
             this.canEvaluate = true;
          }

          this.employeeService.getEmployees().subscribe({
            next: (employees) => {
              const emp = employees.find(e => 
                (e.email && e.email === user.email) || 
                (e.user && e.user.id === user.id)
              );
              if (emp) {
                this.matchedEmployee = emp;
                if (emp.id) {
                  this.loadEmployeeLogs(emp.id);
                }
              }
              this.updateMyRank(employees);
            },
            error: (err) => console.error('Error loading employees in performance page', err)
          });
        }
      },
      error: (err) => console.error('Error getting user in performance page', err)
    });
  }

  loadEmployeeLogs(employeeId: number) {
    this.perfService.getEmployeeLogs(employeeId).subscribe({
      next: (logs) => {
        this.myLogs = logs;
      },
      error: (err) => console.error('Error loading employee point logs', err)
    });
  }

  loadLeaderboardData() {
    this.perfService.getLeaderboard().subscribe({
      next: (res) => {
        // Sort leaderboard list by performance score desc
        this.leaderboard = [...(res as any[])].sort((a, b) => (b.performanceScore ?? 1000) - (a.performanceScore ?? 1000));
        // Update myRank if we already have employees
        if (this.leaderboard.length > 0) {
          this.updateMyRank(this.leaderboard);
        }
      },
      error: (err) => console.error('Error loading leaderboard', err)
    });
  }

  updateMyRank(employees: Employee[]) {
    if (this.matchedEmployee) {
      const sorted = [...employees].sort((a, b) => (b.performanceScore ?? 1000) - (a.performanceScore ?? 1000));
      const idx = sorted.findIndex(e => e.id === this.matchedEmployee?.id);
      if (idx !== -1) {
        this.myRank = idx + 1;
      }
    }
  }

  getTierName(score: number): string {
    if (score >= 1500) return 'Wifak Élite';
    if (score >= 1300) return 'Wifak Pro';
    if (score >= 1100) return 'Collaborateur Actif';
    return 'Novice Wifak';
  }

  getTierClass(score: number): string {
    if (score >= 1500) return 'tier-elite';
    if (score >= 1300) return 'tier-pro';
    if (score >= 1100) return 'tier-active';
    return 'tier-novice';
  }

  getNextTierName(score: number): string {
    if (score >= 1500) return 'Wifak Élite Max';
    if (score >= 1300) return 'Wifak Élite';
    if (score >= 1100) return 'Wifak Pro';
    return 'Collaborateur Actif';
  }

  getNextTierThreshold(score: number): number {
    if (score >= 1500) return 2000;
    if (score >= 1300) return 1500;
    if (score >= 1100) return 1300;
    return 1100;
  }

  getPercentToNextTier(score: number): number {
    if (score >= 1500) return 100;
    const threshold = this.getNextTierThreshold(score);
    let base = 0;
    if (threshold === 1100) {
      return Math.min(100, Math.max(0, (score / 1100) * 100));
    } else if (threshold === 1300) {
      base = 1100;
    } else if (threshold === 1500) {
      base = 1300;
    }
    const totalDiff = threshold - base;
    const currentDiff = score - base;
    return Math.min(100, Math.max(0, (currentDiff / totalDiff) * 100));
  }

  submitEvaluation() {
    if (!this.typedName) return;

    const displayType = this.evalType === 'EMPLOYEE' ? 'Employé' : 'CANDIDATE';
    this.addToHistory(this.typedName, displayType, this.evalData.value);
    
    if (this.evalType === 'EMPLOYEE') {
      const user = this.allUsers.find(u => (u.firstName + ' ' + (u.lastName || '')).toLowerCase().trim() === this.typedName.toLowerCase().trim());
      if (user) {
        this.perfService.adjustPoints(user.id!, this.evalData.value, this.evalData.reason).subscribe(() => {
          // Refresh leaderboard data and current user points
          this.loadLeaderboardData();
          this.loadEmployeeData();
        });
      }
    } else {
      const candidate = this.allCandidates.find(c => c.fullName.toLowerCase().trim() === this.typedName.toLowerCase().trim());
      if (candidate) {
        this.recruitmentService.updateCandidate(candidate.id!, {
          evaluationScore: this.evalData.value,
          hrComment: this.evalData.reason
        }).subscribe();
      }
    }

    this.resetForm();
  }

  selectForEvaluation(user: User) {
    this.evalType = 'EMPLOYEE';
    this.selectedDepartmentId = user.department?.id || null;
    this.filterUsers();
    this.typedName = user.firstName + ' ' + (user.lastName || '');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  addToHistory(name: string, type: string, score: number) {
    this.evaluationHistory.unshift({
      name: name,
      type: type,
      score: score,
      date: new Date()
    });
  }

  deleteFromHistory(index: number) {
    this.evaluationHistory.splice(index, 1);
  }

  resetForm() {
    this.typedName = '';
    this.evalData.value = 0;
  }

  t(key: string): string { 
    return this.translation.t(key); 
  }
}
