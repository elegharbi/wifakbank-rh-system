import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-dashboard-redirect',
  standalone: true,
  template: ''
})
export class DashboardRedirect implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);

  ngOnInit() {
    const role = this.authService.getRole();
    if (role === 'ADMIN') {
      this.router.navigate(['/admin/dashboard']);
    } else if (role === 'HR') {
      this.router.navigate(['/hr/dashboard']);
    } else if (role === 'CANDIDATE') {
      this.router.navigate(['/candidate-dashboard']);
    } else {
      this.router.navigate(['/employee-dashboard']);
    }
  }
}
