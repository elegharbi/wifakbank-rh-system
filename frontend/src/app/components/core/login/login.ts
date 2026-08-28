import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { TranslationService } from '../../../services/translation';
import { ThemeService } from '../../../services/theme.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  public translation = inject(TranslationService);
  public theme = inject(ThemeService);

  credentials = { username: '', password: '' };
  errorMessage = '';
  isLoading = false;
  showForgotPasswordModal = false;
  resetEmail = '';
  resetMessage = '';
  resetError = '';
  isResetSubmitting = false;
  showPassword = false;

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }
  ngOnInit() {

    if (this.authService.isLoggedIn()) {
      const role = this.authService.getRole();
      
      // Verification for HR password change if needed (could rely on user object but role is safer for routing)
      const user = JSON.parse(sessionStorage.getItem('currentUser') || '{}');
      if (role === 'HR' && user && user.passwordChanged === false) {
        this.router.navigate(['/change-password']);
        return;
      }

      this.router.navigate(['/dashboard']);
    }
  }

  onSubmit() {
    if (!this.credentials.username || !this.credentials.password) {
      this.errorMessage = 'Veuillez remplir tous les champs.';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.authService.login(this.credentials.username, this.credentials.password).subscribe({
      next: (res) => {
        this.isLoading = false;
        const user = res.user;
        
        // Redirection forcée si changement MDP requis
        if (user.role === 'HR' && !user.passwordChanged) {
          this.router.navigate(['/change-password']);
          return;
        }

        const role = user.role;
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.isLoading = false;
        if (err.status === 401) {
          this.errorMessage = 'Nom d\'utilisateur ou mot de passe incorrect.';
        } else {
          this.errorMessage = 'Erreur de connexion au serveur.';
        }
        console.error('Login error', err);
      }
    });
  }

  forgotPasswordLegacy() {
    const email = prompt("Entrez votre adresse email pour réinitialiser votre mot de passe :");
    if (email) {
      this.authService.resetPassword(email).subscribe({
        next: (res) => {
          alert(res.message || "Un mot de passe temporaire a été envoyé par email.");
        },
        error: (err) => {
          alert(err.error?.error || "Erreur lors de la réinitialisation du mot de passe.");
        }
      });
    }
  }

  forgotPassword() {
    this.showForgotPasswordModal = true;
    this.resetEmail = '';
    this.resetMessage = '';
    this.resetError = '';
  }

  closeForgotPasswordModal() {
    if (!this.isResetSubmitting) this.showForgotPasswordModal = false;
  }

  submitPasswordReset() {
    if (!this.resetEmail || this.isResetSubmitting) return;
    this.isResetSubmitting = true;
    this.resetMessage = '';
    this.resetError = '';

    this.authService.resetPassword(this.resetEmail).subscribe({
      next: (res) => {
        this.isResetSubmitting = false;
        this.resetMessage = res.message || 'Un lien de réinitialisation a été envoyé à votre adresse e-mail.';
      },
      error: (err) => {
        this.isResetSubmitting = false;
        this.resetError = err.error?.error || 'Une erreur est survenue. Veuillez réessayer.';
      }
    });
  }

  t(key: string): string {
    return this.translation.t(key);
  }
}
