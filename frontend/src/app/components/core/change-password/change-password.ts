import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { ThemeService } from '../../../services/theme.service';

@Component({
  selector: 'app-change-password',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './change-password.html',
  styleUrl: './change-password.css'
})
export class ChangePassword {
  private authService = inject(AuthService);
  private router = inject(Router);

  theme = inject(ThemeService);

  passwords = { new: '', confirm: '' };
  showNew = false;
  showConfirm = false;

  /** 1 faible, 2 moyen, 3 solide. */
  get strength(): number {
    const v = this.passwords.new || '';
    if (v.length < 6) return 1;
    let score = 0;
    if (v.length >= 10) score++;
    if (/[A-Z]/.test(v) && /[a-z]/.test(v)) score++;
    if (/[0-9]/.test(v)) score++;
    if (/[^A-Za-z0-9]/.test(v)) score++;
    if (score >= 3) return 3;
    if (score >= 1) return 2;
    return 1;
  }

  get strengthLabel(): string {
    switch (this.strength) {
      case 3:  return 'Solide';
      case 2:  return 'Moyen';
      default: return 'Faible';
    }
  }
  errorMessage = '';
  isLoading = false;

  onSubmit() {
    if (this.passwords.new !== this.passwords.confirm) {
      this.errorMessage = 'Les mots de passe ne correspondent pas.';
      return;
    }

    this.isLoading = true;
    const user = JSON.parse(sessionStorage.getItem('currentUser') || '{}');
    
    this.authService.changePassword(user.username, this.passwords.new).subscribe({
      next: (res) => {
        this.isLoading = false;
        // Mettre à jour le statut dans le sessionStorage
        user.passwordChanged = true;
        sessionStorage.setItem('currentUser', JSON.stringify(user));
        // Rediriger vers le dashboard
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = 'Une erreur est survenue lors du changement de mot de passe.';
        console.error(err);
      }
    });
  }
}
