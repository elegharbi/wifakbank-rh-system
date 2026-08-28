import { Routes } from '@angular/router';
import { AuthGuard as authGuard } from './guards/auth.guard';
import { roleGuard } from './guards/role.guard';
import { Layout } from './components/shared/layout/layout';
import { AdminLayoutComponent } from './admin/layout/admin-layout.component';
import { HrLayoutComponent } from './hr/layout/hr-layout.component';

// Raccourcis pour les rôles (strictement séparés)
const ADMIN_ONLY  = ['ADMIN'];
const HR_ONLY     = ['HR'];
const EMPLOYEE    = ['EMPLOYEE'];
const CANDIDAT    = ['CANDIDATE'];
const ADMIN_HR    = ['ADMIN', 'HR'];
const ALL         = ['ADMIN', 'HR', 'EMPLOYEE', 'CANDIDATE'];

export const routes: Routes = [
  // Redirection globale
  { path: '', redirectTo: 'home', pathMatch: 'full' },

  // ── Page d'accueil publique ──────────────────────────────────────────────
  { path: 'home', loadComponent: () => import('./components/core/home/home').then(m => m.Home) },

  // ── Routes PUBLIQUES (sans layout) ──────────────────────────────────────
  { path: 'login',           loadComponent: () => import('./components/core/login/login').then(m => m.Login) },
  { path: 'register',        loadComponent: () => import('./components/core/register/register').then(m => m.Register) },
  { path: 'change-password', loadComponent: () => import('./components/core/change-password/change-password').then(m => m.ChangePassword) },

  // ── Visionneuses plein écran (sans layout) ───────────────────────────────
  { path: 'viewer/cv/:id',      loadComponent: () => import('./components/core/cv-viewer/cv-viewer').then(m => m.CvViewer),           canActivate: [authGuard] },
  { path: 'viewer/payslip/:id', loadComponent: () => import('./components/core/payslip-viewer/payslip-viewer').then(m => m.PayslipViewer), canActivate: [authGuard] },

  // ── Routes PRIVÉES EMPLOYEE / CANDIDATE (sous Layout partagé) ───────────
  {
    path: '',
    component: Layout,
    canActivate: [authGuard],
    children: [

      // 🔀 Redirecteur automatique vers le bon dashboard selon le rôle
      { path: 'dashboard', loadComponent: () => import('./components/dashboard/dashboard').then(m => m.DashboardRedirect), canActivate: [authGuard] },

      // ──────────────────────────────────────────────────────────────────
      // DASHBOARDS
      // ──────────────────────────────────────────────────────────────────
      { path: 'employee-dashboard',  loadComponent: () => import('./components/employee/employee-dashboard/employee-dashboard').then(m => m.EmployeeDashboard), canActivate: [authGuard, roleGuard(EMPLOYEE)] },
      { path: 'candidate-dashboard', loadComponent: () => import('./components/candidate/candidate-dashboard/candidate-dashboard').then(m => m.CandidateDashboard), canActivate: [authGuard, roleGuard(CANDIDAT)] },

      // ──────────────────────────────────────────────────────────────────
      // PROFIL — accessible à tous
      // ──────────────────────────────────────────────────────────────────
      { path: 'profile', loadComponent: () => import('./components/core/profile/profile').then(m => m.Profile), canActivate: [authGuard, roleGuard(ALL)] },

      // ──────────────────────────────────────────────────────────────────
      // EMPLOYEE UNIQUEMENT
      // ──────────────────────────────────────────────────────────────────
      { path: 'my-leaves',          loadComponent: () => import('./components/employee/my-leaves/my-leaves').then(m => m.MyLeaves),                                         canActivate: [authGuard, roleGuard(EMPLOYEE)] },
      { path: 'leave-request',      loadComponent: () => import('./components/employee/leave-request/leave-request').then(m => m.LeaveRequestComponent),                    canActivate: [authGuard, roleGuard(EMPLOYEE)] },
      { path: 'employee-points',    loadComponent: () => import('./components/employee/employee-points/employee-points').then(m => m.EmployeePointsComponent),              canActivate: [authGuard, roleGuard(EMPLOYEE)] },
      { path: 'employee-trainings', loadComponent: () => import('./components/employee/employee-trainings/employee-trainings').then(m => m.EmployeeTrainingsComponent),    canActivate: [authGuard, roleGuard(EMPLOYEE)] },
      { path: 'performance',        loadComponent: () => import('./components/shared/development/performance/performance').then(m => m.Performance),                        canActivate: [authGuard, roleGuard(EMPLOYEE)] },

      { path: 'events',             loadComponent: () => import('./components/shared/development/events/events').then(m => m.Events),                                       canActivate: [authGuard, roleGuard([...EMPLOYEE, ...CANDIDAT])] },

      // ──────────────────────────────────────────────────────────────────
      // CANDIDAT UNIQUEMENT
      // ──────────────────────────────────────────────────────────────────
      { path: 'jobs', loadComponent: () => import('./components/shared/recruitment/jobs/jobs').then(m => m.Jobs), canActivate: [authGuard, roleGuard(CANDIDAT)] },
      { path: 'postulations', loadComponent: () => import('./components/candidate/postulations/postulations').then(m => m.PostulationsComponent), canActivate: [authGuard, roleGuard(CANDIDAT)] },

      // Route par défaut
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
    ]
  },

  // ──────────────────────────────────────────────────────────────────────────
  // ADMIN — Layout dédié (rouge/navy) — ADMIN uniquement
  // ──────────────────────────────────────────────────────────────────────────
  {
    path: 'admin',
    component: AdminLayoutComponent,
    canActivate: [authGuard, roleGuard(ADMIN_ONLY)],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard',    loadComponent: () => import('./components/admin/admin-dashboard/admin-dashboard').then(m => m.AdminDashboard) },
      { path: 'users',        loadComponent: () => import('./components/admin/users/users').then(m => m.Users) },
      { path: 'departments',  loadComponent: () => import('./components/shared/hr/departments/departments').then(m => m.Departments) },




      { path: 'profile',      loadComponent: () => import('./components/core/profile/profile').then(m => m.Profile) },
      { path: 'settings',     loadComponent: () => import('./components/admin/settings/settings').then(m => m.Settings) }
    ]
  },

  // ──────────────────────────────────────────────────────────────────────────
  // RH — Layout dédié (vert) — HR uniquement
  // ──────────────────────────────────────────────────────────────────────────
  {
    path: 'hr',
    component: HrLayoutComponent,
    canActivate: [authGuard, roleGuard(HR_ONLY)],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard',     loadComponent: () => import('./components/hr/hr-dashboard/hr-dashboard').then(m => m.HrDashboard) },

      { path: 'candidates',    loadComponent: () => import('./components/shared/recruitment/candidates/candidates').then(m => m.Candidates) },
      { path: 'leaves',        loadComponent: () => import('./components/admin/leaves/leaves').then(m => m.AdminLeaves) },
      { path: 'trainings',     loadComponent: () => import('./components/shared/development/trainings/trainings').then(m => m.Trainings) },
      { path: 'performance',   loadComponent: () => import('./components/shared/development/performance/performance').then(m => m.Performance) },
      { path: 'participations',loadComponent: () => import('./components/shared/participations/participations').then(m => m.Participations) },

      { path: 'events',        loadComponent: () => import('./components/shared/development/events/events').then(m => m.Events) },
      { path: 'profile',       loadComponent: () => import('./components/core/profile/profile').then(m => m.Profile) }
    ]
  },

  // Redirection globale pour les routes inconnues
  { path: '**', redirectTo: 'home' }
];
