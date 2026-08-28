import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { AvatarService } from '../../../services/avatar.service';

@Component({
  selector: 'app-employee-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './employee-sidebar.html',
  styleUrls: ['./employee-sidebar.css']
})
export class EmployeeSidebar implements OnInit {
  private authService = inject(AuthService);
  avatarService = inject(AvatarService);
  userName = '';

  ngOnInit() {
    const stored = sessionStorage.getItem('currentUser');
    if (stored) {
      const u = JSON.parse(stored);
      this.userName = (u.firstName || '') + ' ' + (u.lastName || '');
      if (!this.userName.trim()) this.userName = u.username || 'Employé';
    }
    this.avatarService.reload();
  }

  logout() {
    this.authService.logout();
  }
}
