import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * Guard de rôles — vérifie que l'utilisateur connecté possède l'un des rôles autorisés.
 * Usage dans les routes : canActivate: [roleGuard(['ADMIN', 'HR'])]
 */
export function roleGuard(allowedRoles: string[]): CanActivateFn {
  return () => {
    const authService = inject(AuthService);
    const router      = inject(Router);

    const role = authService.getRole();

    if (role && allowedRoles.includes(role)) {
      return true;
    }

    // Rôle non autorisé → rediriger vers le dashboard de l'acteur courant
    if (role === 'ADMIN' || role === 'HR') router.navigate(['/admin/dashboard']);
    else if (role === 'EMPLOYEE')  router.navigate(['/employee-dashboard']);
    else if (role === 'CANDIDATE')  router.navigate(['/candidate-dashboard']);
    else router.navigate(['/login']);

    return false;
  };
}
