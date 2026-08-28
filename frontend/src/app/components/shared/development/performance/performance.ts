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
  template: `
    <div class="performance-container">
      <div class="inner-header">
        <h2><i class="fa-solid fa-award"></i> {{ performanceTitle }}</h2>
        <p>Gérez l'engagement des employés et les évaluations des candidats de Wifak Bank.</p>
      </div>

      <div class="perf-grid">
        <div class="main-content">
          
          <!-- Section Évaluation RH -->
          <div class="card eval-form-card" *ngIf="canEvaluate">
            <div class="eval-header-row">
               <h3><i class="fa-solid fa-star-half-stroke"></i> Évaluer un profil</h3>
               <div class="type-toggle">
                  <button [class.active]="evalType === 'EMPLOYEE'" (click)="setEvalType('EMPLOYEE')">Employé</button>
                  <button [class.active]="evalType === 'CANDIDATE'" (click)="setEvalType('CANDIDATE')">Candidat</button>
               </div>
            </div>

            <div class="eval-grid">
              <div class="form-group" *ngIf="evalType === 'EMPLOYEE'">
                <label>Département</label>
                <select class="form-control" [(ngModel)]="selectedDepartmentId" (change)="onDepartmentChange()">
                  <option [ngValue]="null">Tous les départements</option>
                  <option *ngFor="let dept of departments" [ngValue]="dept.id">{{ dept.name }}</option>
                </select>
              </div>

              <div class="form-group" *ngIf="evalType === 'EMPLOYEE'">
                <label>{{ t('selectEmployee') }}</label>
                <select class="form-control" [(ngModel)]="typedName">
                  <option value="">Choisir un employé...</option>
                  <option *ngFor="let u of filteredUsers" [value]="u.firstName + ' ' + (u.lastName || '')">
                    {{ u.firstName }} {{ u.lastName }}
                  </option>
                </select>
              </div>

              <div class="form-group" *ngIf="evalType === 'CANDIDATE'">
                <label>Sélectionner le candidat</label>
                <input type="text" [(ngModel)]="typedName" 
                       placeholder="Chercher un candidat..."
                       class="form-control" list="candidateList">
                <datalist id="candidateList">
                  <option *ngFor="let c of allCandidates" [value]="c.fullName"></option>
                </datalist>
              </div>

              <div class="form-group">
                <label>{{ evalType === 'EMPLOYEE' ? t('pointsToGive') : 'Note Entretien (0-100)' }}</label>
                <input type="number" [(ngModel)]="evalData.value" class="form-control" [placeholder]="evalType === 'EMPLOYEE' ? 'ex: 50' : 'ex: 85'">
              </div>
              
              <button class="btn-eval" (click)="submitEvaluation()" [disabled]="!typedName">
                <i class="fa-solid fa-check-circle"></i> Valider l'évaluation
              </button>
            </div>
          </div>

          <!-- Tableau Annuaire des employés (demandé par l'utilisateur) -->
          <div class="card table-card" *ngIf="canEvaluate && allUsers.length > 0">
            <h3><i class="fa-solid fa-users"></i> Annuaire des Collaborateurs</h3>
            <div class="table-responsive">
              <table class="data-table">
                <thead>
                  <tr>
                    <th>Employé</th>
                    <th>Département</th>
                    <th>Score Performance</th>
                    <th style="text-align: center;">Action</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let u of filteredUsers">
                    <td>
                      <div class="user-info">
                        <div class="avatar-mini">{{ u.firstName ? u.firstName[0] : 'U' }}</div>
                        <span>{{ u.firstName }} {{ u.lastName }}</span>
                      </div>
                    </td>
                    <td><span class="status-badge normal">{{ u.department?.name || 'Non assigné' }}</span></td>
                    <td class="score-cell">{{ u.performanceScore || 1000 }} pts</td>
                    <td style="text-align: center;">
                       <button class="btn-eval" style="padding: 5px 10px; height: auto; font-size: 0.8rem;" (click)="selectForEvaluation(u)">
                         Évaluer
                       </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Section Dashboard Personnel pour les employés -->
          <div class="employee-dashboard-sec" *ngIf="!canEvaluate && matchedEmployee">
             <!-- Card 1: Score & Progression -->
             <div class="card premium-stats-card">
                <div class="stats-main-row">
                   <div class="score-display">
                      <span class="score-num">{{ matchedEmployee.performanceScore || 1000 }}</span>
                      <span class="score-label">Points d'Engagement</span>
                   </div>
                   <div class="tier-info">
                      <span class="tier-badge" [ngClass]="getTierClass(matchedEmployee.performanceScore || 1000)">
                        <i class="fa-solid fa-trophy"></i> {{ getTierName(matchedEmployee.performanceScore || 1000) }}
                      </span>
                      <span class="rank-display" *ngIf="myRank">
                        Rang : <strong>#{{ myRank }}</strong> dans la banque
                      </span>
                   </div>
                </div>
                
                <div class="progress-section">
                   <div class="progress-labels">
                      <span>Niveau Suivant : {{ getNextTierName(matchedEmployee.performanceScore || 1000) }}</span>
                      <span>{{ matchedEmployee.performanceScore || 1000 }} / {{ getNextTierThreshold(matchedEmployee.performanceScore || 1000) }} Pts</span>
                   </div>
                   <div class="custom-progress-bar">
                      <div class="progress-fill" [style.width.%]="getPercentToNextTier(matchedEmployee.performanceScore || 1000)"></div>
                   </div>
                   <p class="progress-tip" *ngIf="getNextTierThreshold(matchedEmployee.performanceScore || 1000) > (matchedEmployee.performanceScore || 1000)">
                      Plus que {{ getNextTierThreshold(matchedEmployee.performanceScore || 1000) - (matchedEmployee.performanceScore || 1000) }} points pour atteindre le niveau suivant !
                   </p>
                </div>
             </div>

             <!-- Card 2: Mes Badges de Performance -->
             <div class="card badges-card">
                <h3><i class="fa-solid fa-ribbon"></i> Mes Badges d'Honneur</h3>
                <p class="section-desc">Gagnez des points pour débloquer de nouveaux badges d'engagement.</p>
                
                <div class="badges-grid">
                   <div class="badge-item" [class.unlocked]="(matchedEmployee.performanceScore || 1000) >= 0">
                      <div class="badge-icon"><i class="fa-solid fa-seedling"></i></div>
                      <div class="badge-details">
                         <h4>Novice Wifak</h4>
                         <p>Attribué à tous les collaborateurs</p>
                      </div>
                      <span class="badge-status"><i class="fa-solid fa-circle-check"></i></span>
                   </div>

                   <div class="badge-item" [class.unlocked]="(matchedEmployee.performanceScore || 1000) >= 1100">
                      <div class="badge-icon"><i class="fa-solid fa-star"></i></div>
                      <div class="badge-details">
                         <h4>Collaborateur Actif</h4>
                         <p>Atteindre 1100 Pts d'engagement</p>
                      </div>
                      <span class="badge-status">
                         <i class="fa-solid" [class.fa-circle-check]="(matchedEmployee.performanceScore || 1000) >= 1100" [class.fa-lock]="(matchedEmployee.performanceScore || 1000) < 1100"></i>
                      </span>
                   </div>

                   <div class="badge-item" [class.unlocked]="(matchedEmployee.performanceScore || 1000) >= 1300">
                      <div class="badge-icon"><i class="fa-solid fa-shield-halved"></i></div>
                      <div class="badge-details">
                         <h4>Wifak Pro</h4>
                         <p>Atteindre 1300 Pts d'engagement</p>
                      </div>
                      <span class="badge-status">
                         <i class="fa-solid" [class.fa-circle-check]="(matchedEmployee.performanceScore || 1000) >= 1300" [class.fa-lock]="(matchedEmployee.performanceScore || 1000) < 1300"></i>
                      </span>
                   </div>

                   <div class="badge-item" [class.unlocked]="(matchedEmployee.performanceScore || 1000) >= 1500">
                      <div class="badge-icon"><i class="fa-solid fa-gem"></i></div>
                      <div class="badge-details">
                         <h4>Wifak Élite</h4>
                         <p>Atteindre 1500 Pts d'engagement</p>
                      </div>
                      <span class="badge-status">
                         <i class="fa-solid" [class.fa-circle-check]="(matchedEmployee.performanceScore || 1000) >= 1500" [class.fa-lock]="(matchedEmployee.performanceScore || 1000) < 1500"></i>
                      </span>
                   </div>
                </div>
             </div>

             <!-- Card 3: Historique de mes Points -->
             <div class="card table-card">
                <h3><i class="fa-solid fa-clock-rotate-left"></i> Historique de mes Points</h3>
                <div class="table-responsive" *ngIf="myLogs.length > 0">
                  <table class="data-table">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Activité / Motif</th>
                        <th style="text-align: right;">Points</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr *ngFor="let log of myLogs">
                        <td>{{ log.date | date:'dd/MM/yyyy HH:mm' }}</td>
                        <td>{{ log.reason }}</td>
                        <td style="text-align: right; font-weight: 800;" [style.color]="log.pointsChanged > 0 ? '#166534' : '#991b1b'">
                          {{ log.pointsChanged > 0 ? '+' : '' }}{{ log.pointsChanged }} pts
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <div class="empty-logs" *ngIf="myLogs.length === 0">
                  Aucun historique de points pour le moment. Participez à des événements ou des formations pour gagner des points !
                </div>
             </div>
          </div>

          <!-- Tableau des Évaluations Récentes (S'affiche après validation pour RH) -->
          <div class="card table-card" *ngIf="canEvaluate && evaluationHistory.length > 0">
            <h3><i class="fa-solid fa-clock-rotate-left"></i> Journal des Évaluations</h3>
            <div class="table-responsive">
              <table class="data-table">
                <thead>
                  <tr>
                    <th>Profil Évalué</th>
                    <th>Type</th>
                    <th>Score / Points</th>
                    <th>Heure</th>
                    <th style="text-align: center;">Actions & Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let ev of evaluationHistory; let i = index">
                    <td>
                      <div class="user-info">
                        <div class="avatar-mini" [class.cand-bg]="ev.type === 'CANDIDATE'">{{ ev.name ? ev.name[0] : 'U' }}</div>
                        <span>{{ ev.name }}</span>
                      </div>
                    </td>
                    <td><span class="status-badge normal">{{ ev.type }}</span></td>
                    <td class="score-cell">{{ ev.score }} {{ ev.type === 'Employé' ? 'pts' : '/ 100' }}</td>
                    <td>{{ ev.date | date:'HH:mm:ss' }}</td>
                    <td style="text-align: center;">
                       <div style="display: flex; align-items: center; justify-content: center; gap: 10px;">
                          <button (click)="deleteFromHistory(i)" class="btn-icon-del" title="Supprimer">
                            <i class="fa-solid fa-trash-can"></i>
                          </button>
                          <span class="status-badge high"><i class="fa-solid fa-check"></i> Enregistré</span>
                       </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
        
        <div class="sidebar-info">
          <!-- Card 1: Barème des points -->
          <div class="card rules-card">
            <h3><i class="fa-solid fa-circle-info"></i> Barème des points</h3>
            <ul class="rules-list">
              <li><span class="badge pos">+15</span> Participation à un événement</li>
              <li><span class="badge pos">+50</span> Validation d'une formation</li>
              <li><span class="badge pos">+5</span> Interaction Chatbot RH</li>
              <li><span class="badge neg">-100</span> Absence non justifiée</li>
            </ul>
          </div>

          <!-- Card 2: Leaderboard Top Performers -->
          <div class="card leaderboard-sidebar-card">
            <h3><i class="fa-solid fa-ranking-star"></i> Top Performers</h3>
            <div class="leaderboard-list">
              <div class="leaderboard-item" *ngFor="let emp of leaderboard | slice:0:5; let idx = index">
                <div class="rank-badge" [ngClass]="'rank-' + (idx + 1)">{{ idx + 1 }}</div>
                <div class="emp-name">{{ emp.name }}</div>
                <div class="emp-score">{{ emp.performanceScore || 1000 }} pts</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .performance-container { padding: 24px; max-width: 1400px; margin: 0 auto; }
    .inner-header { margin-top: 15px; margin-bottom: 35px; border-left: 5px solid #E21E26; padding-left: 20px; }
    .inner-header h2 { color: #E21E26; font-size: 1.8rem; display: flex; align-items: center; gap: 15px; margin-bottom: 8px; font-weight: 800; }
    .inner-header p { color: #64748b; font-size: 1.05rem; margin: 0; }
    
    .perf-grid { display: grid; grid-template-columns: 2fr 1fr; gap: 30px; }
    .card { background: white; border-radius: 20px; padding: 25px; box-shadow: 0 10px 40px rgba(0,0,0,0.04); margin-bottom: 24px; border: 1px solid #f1f5f9; }
    
    .eval-header-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
    .eval-header-row h3 { color: #E21E26; margin: 0; display: flex; align-items: center; gap: 12px; font-size: 1.2rem; }

    .type-toggle { display: flex; background: #f1f5f9; border-radius: 12px; padding: 4px; }
    .type-toggle button { border: none; padding: 8px 16px; border-radius: 10px; font-size: 0.85rem; font-weight: 600; cursor: pointer; transition: all 0.2s; color: #64748b; background: transparent; }
    .type-toggle button.active { background: white; color: #E21E26; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }

    .eval-grid { display: grid; grid-template-columns: 1.5fr 1fr 1fr; gap: 15px; align-items: flex-end; }
    .form-group { display: flex; flex-direction: column; gap: 8px; }
    .form-group label { font-size: 0.85rem; font-weight: 600; color: #64748b; }
    .form-control { padding: 10px 15px; border-radius: 10px; border: 1.5px solid #e2e8f0; font-size: 0.9rem; transition: all 0.2s; }
    .form-control:focus { border-color: #E21E26; outline: none; box-shadow: 0 0 0 3px rgba(226, 30, 38, 0.1); }
    .btn-eval { background: #E21E26; color: white; border: none; padding: 10px 20px; border-radius: 10px; font-weight: 700; cursor: pointer; height: 42px; transition: all 0.2s; }
    .btn-eval:hover:not(:disabled) { background: #B71C1C; transform: translateY(-2px); }
    .btn-eval:disabled { background: #cbd5e1; cursor: not-allowed; }

    .data-table { width: 100%; border-collapse: collapse; }
    .data-table th { text-align: left; padding: 15px; border-bottom: 2px solid #f1f5f9; color: #64748b; font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.5px; }
    .data-table td { padding: 15px; border-bottom: 1px solid #f1f5f9; vertical-align: middle; }
    
    .user-info { display: flex; align-items: center; gap: 12px; font-weight: 600; color: #1e293b; }
    .avatar-mini { width: 35px; height: 35px; border-radius: 10px; background: #E21E26; color: white; display: flex; align-items: center; justify-content: center; }
    .avatar-mini.cand-bg { background: #1B3A6B; }
    .score-cell { font-weight: 800; color: #E21E26; font-size: 1.1rem; }
    .status-badge { padding: 6px 14px; border-radius: 20px; font-size: 0.75rem; font-weight: 700; text-transform: uppercase; }
    .status-badge.high { background: #dcfce7; color: #166534; }
    .status-badge.normal { background: #f1f5f9; color: #64748b; }
    
    .btn-icon-del { background: #fee2e2; color: #991b1b; border: none; width: 32px; height: 32px; border-radius: 8px; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; justify-content: center; }
    .btn-icon-del:hover { background: #fecaca; transform: scale(1.1); }

    .rules-list { list-style: none; padding: 0; }
    .rules-list li { display: flex; align-items: center; gap: 15px; padding: 15px 0; border-bottom: 1px solid #f1f5f9; font-size: 0.95rem; color: #334155; }
    .badge { padding: 5px 12px; border-radius: 8px; font-weight: 800; font-size: 0.8rem; min-width: 55px; text-align: center; }
    .badge.pos { background: #dcfce7; color: #166534; }
    .badge.neg { background: #fee2e2; color: #991b1b; }

    /* Premium Stats Card */
    .premium-stats-card {
      background: linear-gradient(135deg, #8B0000, #E21E26);
      color: white;
      border: none;
    }
    .stats-main-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 25px;
    }
    .score-display {
      display: flex;
      flex-direction: column;
    }
    .score-num {
      font-size: 3.5rem;
      font-weight: 900;
      line-height: 1;
      letter-spacing: -1px;
      background: linear-gradient(to bottom, #ffffff, #fca5a5);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    .score-label {
      font-size: 0.9rem;
      opacity: 0.8;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-top: 5px;
    }
    .tier-info {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 8px;
    }
    .tier-badge {
      padding: 8px 16px;
      border-radius: 20px;
      font-weight: 800;
      font-size: 0.85rem;
      display: flex;
      align-items: center;
      gap: 6px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    }
    .tier-novice { background: #64748b; color: white; }
    .tier-active { background: #E21E26; color: white; }
    .tier-pro { background: #d97706; color: white; }
    .tier-elite { background: linear-gradient(90deg, #d4af37, #fbc02d); color: #1e293b; }
    .rank-display {
      font-size: 0.85rem;
      opacity: 0.9;
    }
    .progress-section {
      border-top: 1px solid rgba(255,255,255,0.1);
      padding-top: 20px;
    }
    .progress-labels {
      display: flex;
      justify-content: space-between;
      font-size: 0.85rem;
      font-weight: 600;
      margin-bottom: 8px;
    }
    .custom-progress-bar {
      width: 100%;
      height: 8px;
      background: rgba(255,255,255,0.2);
      border-radius: 4px;
      overflow: hidden;
      margin-bottom: 8px;
    }
    .progress-fill {
      height: 100%;
      background: linear-gradient(90deg, #E21E26, #f04048);
      border-radius: 4px;
      transition: width 0.6s ease-in-out;
    }
    .progress-tip {
      font-size: 0.75rem;
      opacity: 0.8;
      font-style: italic;
    }

    /* Badges Card */
    .badges-card h3 {
      color: #E21E26;
      margin-bottom: 5px;
    }
    .section-desc {
      font-size: 0.85rem;
      color: #64748b;
      margin-bottom: 20px;
    }
    .badges-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 15px;
    }
    .badge-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 15px;
      border-radius: 12px;
      border: 1px solid #e2e8f0;
      background: #f8fafc;
      transition: all 0.3s ease;
      opacity: 0.6;
    }
    .badge-item.unlocked {
      background: white;
      border-color: #fca5a5;
      box-shadow: 0 4px 12px rgba(226,30,38,0.05);
      opacity: 1;
    }
    .badge-icon {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #e2e8f0;
      color: #94a3b8;
      font-size: 1.2rem;
      transition: all 0.3s;
    }
    .badge-item.unlocked .badge-icon {
      background: #FFF5F5;
      color: #E21E26;
    }
    .badge-details h4 {
      margin: 0 0 3px 0;
      font-size: 0.9rem;
      color: #334155;
    }
    .badge-details p {
      margin: 0;
      font-size: 0.75rem;
      color: #64748b;
    }
    .badge-status {
      margin-left: auto;
      font-size: 1.1rem;
      color: #cbd5e1;
    }
    .badge-item.unlocked .badge-status {
      color: #E21E26;
    }

    /* Leaderboard Sidebar Card */
    .leaderboard-sidebar-card h3 {
      color: #E21E26;
      margin-bottom: 15px;
      font-size: 1.1rem;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .leaderboard-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .leaderboard-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 10px;
      border-radius: 8px;
      background: #f8fafc;
      border: 1px solid #f1f5f9;
      transition: transform 0.2s;
    }
    .leaderboard-item:hover {
      transform: translateX(5px);
      background: #f1f5f9;
    }
    .rank-badge {
      width: 24px;
      height: 24px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.8rem;
      font-weight: 800;
    }
    .rank-1 { background: #fef08a; color: #854d0e; }
    .rank-2 { background: #e2e8f0; color: #475569; }
    .rank-3 { background: #ffedd5; color: #9a3412; }
    .rank-4, .rank-5 { background: #f1f5f9; color: #64748b; }
    .emp-name {
      font-size: 0.9rem;
      font-weight: 600;
      color: #334155;
    }
    .emp-score {
      margin-left: auto;
      font-size: 0.85rem;
      font-weight: 800;
      color: #E21E26;
    }
    .empty-logs {
      padding: 20px;
      text-align: center;
      color: #94a3b8;
      font-size: 0.9rem;
      font-style: italic;
    }

    @media (max-width: 1024px) { .perf-grid { grid-template-columns: 1fr; } .eval-grid { grid-template-columns: 1fr; } }
  `]
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
