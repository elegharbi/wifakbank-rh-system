import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-change-password',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="change-password-container">
      <div class="password-card">
        <div class="header">
          <i class="fa-solid fa-shield-halved lock-icon"></i>
          <h2>Sécurité de votre compte</h2>
          <p>Pour votre première connexion, veuillez changer votre mot de passe généré par un mot de passe personnel.</p>
        </div>

        <form (submit)="onSubmit()" #pwdForm="ngForm">
          <div class="form-group">
            <label>Nouveau mot de passe</label>
            <div class="input-with-icon">
              <i class="fa-solid fa-key"></i>
              <input 
                type="password" 
                [(ngModel)]="passwords.new" 
                name="newPassword" 
                required 
                minlength="6"
                placeholder="Au moins 6 caractères"
                #newPwd="ngModel">
            </div>
            <div *ngIf="newPwd.invalid && newPwd.touched" class="error-text">
              Le mot de passe doit faire au moins 6 caractères.
            </div>
          </div>

          <div class="form-group">
            <label>Confirmer le mot de passe</label>
            <div class="input-with-icon">
              <i class="fa-solid fa-check-double"></i>
              <input 
                type="password" 
                [(ngModel)]="passwords.confirm" 
                name="confirmPassword" 
                required
                placeholder="Répétez le mot de passe">
            </div>
            <div *ngIf="passwords.new !== passwords.confirm && passwords.confirm" class="error-text">
              Les mots de passe ne correspondent pas.
            </div>
          </div>

          <div *ngIf="errorMessage" class="alert alert-danger">
            {{ errorMessage }}
          </div>

          <button type="submit" class="btn-submit" [disabled]="pwdForm.invalid || passwords.new !== passwords.confirm || isLoading">
            <span *ngIf="!isLoading">Mettre à jour et continuer</span>
            <i *ngIf="isLoading" class="fa-solid fa-spinner fa-spin"></i>
          </button>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .change-password-container {
      height: 100vh;
      width: 100vw;
      display: flex;
      justify-content: center;
      align-items: center;
      background: linear-gradient(135deg, #1a4721 0%, #2d5a27 100%);
      font-family: 'Inter', sans-serif;
    }
    .password-card {
      background: white;
      padding: 40px;
      border-radius: 20px;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
      width: 100%;
      max-width: 450px;
    }
    .header {
      text-align: center;
      margin-bottom: 30px;
    }
    .lock-icon {
      font-size: 48px;
      color: #1a4721;
      margin-bottom: 15px;
    }
    h2 {
      color: #1e293b;
      font-size: 24px;
      margin-bottom: 10px;
    }
    p {
      color: #64748b;
      font-size: 14px;
      line-height: 1.5;
    }
    .form-group {
      margin-bottom: 20px;
    }
    label {
      display: block;
      margin-bottom: 8px;
      font-size: 14px;
      font-weight: 500;
      color: #475569;
    }
    .input-with-icon {
      position: relative;
    }
    .input-with-icon i {
      position: absolute;
      left: 12px;
      top: 50%;
      transform: translateY(-50%);
      color: #94a3b8;
    }
    input {
      width: 100%;
      padding: 12px 12px 12px 40px;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      outline: none;
      transition: border-color 0.2s;
    }
    input:focus {
      border-color: #1a4721;
    }
    .error-text {
      color: #ef4444;
      font-size: 12px;
      margin-top: 5px;
    }
    .alert {
      padding: 12px;
      border-radius: 8px;
      margin-bottom: 20px;
      font-size: 14px;
    }
    .alert-danger {
      background: #fef2f2;
      color: #b91c1c;
      border: 1px solid #fee2e2;
    }
    .btn-submit {
      width: 100%;
      padding: 14px;
      background: #1a4721;
      color: white;
      border: none;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
      transition: background 0.2s;
    }
    .btn-submit:hover {
      background: #14361a;
    }
    .btn-submit:disabled {
      background: #94a3b8;
      cursor: not-allowed;
    }
  `]
})
export class ChangePassword {
  private authService = inject(AuthService);
  private router = inject(Router);

  passwords = { new: '', confirm: '' };
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
