import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { TranslationService } from '../../../services/translation';
import { ThemeService } from '../../../services/theme.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './register.html',
  styleUrl: './register.css'
})
export class Register {
  private authService = inject(AuthService);
  public translation = inject(TranslationService);
  public theme = inject(ThemeService);
  private router = inject(Router);

  cvFile: File | null = null;
  cvError = '';

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        this.cvError = 'Seuls les fichiers PDF sont acceptés.';
        this.cvFile = null;
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        this.cvError = 'Le fichier ne doit pas dépasser 5 Mo.';
        this.cvFile = null;
        return;
      }
      this.cvError = '';
      this.cvFile = file;
      this.candidature.cvFileName = file.name;
    }
  }

  candidature = {
    nom: '',
    prenom: '',
    email: '',
    telephone: '',
    adresse: '',
    dateNaissance: '',
    niveauEtude: '',
    specialite: '',
    lettreMotivation: '',
    poste: '',
    password: '',
    confirmPassword: '',
    cvFileName: ''
  };

  passwordError = '';
  showPassword = false;
  showConfirmPassword = false;

  submitted = false;
  isSubmitting = false;

  togglePasswordVisibility(field: 'password' | 'confirmPassword'): void {
    if (field === 'password') {
      this.showPassword = !this.showPassword;
    } else {
      this.showConfirmPassword = !this.showConfirmPassword;
    }
  }

  t(key: string): string {
    return this.translation.t(key);
  }



  resetCandidature() {
    this.candidature = { nom: '', prenom: '', email: '', telephone: '', adresse: '', dateNaissance: '', niveauEtude: '', specialite: '', lettreMotivation: '', poste: '', password: '', confirmPassword: '', cvFileName: '' };
    this.passwordError = '';
    this.cvFile = null;
    this.cvError = '';
  }

  onSubmitCandidature() {
    this.passwordError = '';
    
    if (!this.candidature.nom || !this.candidature.prenom || !this.candidature.email || !this.candidature.telephone || !this.candidature.adresse || !this.candidature.dateNaissance || !this.candidature.niveauEtude || !this.candidature.specialite || !this.candidature.poste || !this.candidature.password || !this.candidature.confirmPassword) {
      return;
    }

    if (this.candidature.password !== this.candidature.confirmPassword) {
      this.passwordError = 'Les mots de passe ne correspondent pas.';
      return;
    }

    if (this.candidature.password.length < 8) {
      this.passwordError = 'Le mot de passe doit contenir au moins 8 caractères.';
      return;
    }

    this.isSubmitting = true;

    // Generate username from first and last name
    const username = (this.candidature.prenom.toLowerCase() + this.candidature.nom.toLowerCase()).replace(/\s+/g, '');

    // Tout ce que le candidat a saisi part au serveur : ces champs
    // etaient collectes puis abandonnes, et le RH ne voyait rien.
    const registerData: any = {
      username: username,
      firstName: this.candidature.prenom,
      lastName: this.candidature.nom,
      email: this.candidature.email,
      password: this.candidature.password,
      phone: this.candidature.telephone,
      address: this.candidature.adresse,
      birthDate: this.candidature.dateNaissance,
      educationLevel: this.candidature.niveauEtude,
      speciality: this.candidature.specialite,
      desiredPosition: this.candidature.poste,
      motivationLetter: this.candidature.lettreMotivation,
      cvFileName: this.candidature.cvFileName
    };

    // Le CV part avec la candidature, encode en base64.
    if (this.cvFile) {
      this.readFileAsBase64(this.cvFile).then(
        (base64) => {
          registerData.cvBase64 = base64;
          registerData.cvContentType = this.cvFile!.type || 'application/pdf';
          this.sendRegistration(registerData);
        },
        () => {
          // Un CV illisible ne doit pas bloquer la candidature.
          this.sendRegistration(registerData);
        }
      );
      return;
    }

    this.sendRegistration(registerData);
  }

  /** Lit le fichier et renvoie son contenu encode en base64. */
  private readFileAsBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject();
      reader.readAsDataURL(file);
    });
  }

  private sendRegistration(registerData: any) {
    this.authService.registerCandidate(registerData).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.submitted = true;
        this.resetCandidature();
        setTimeout(() => {
          this.submitted = false;
          this.router.navigate(['/login']);
        }, 2000);
      },
      error: (err) => {
        this.isSubmitting = false;
        this.passwordError = err?.error?.error || err?.error?.message || 'Erreur lors de l\'enregistrement. Veuillez réessayer.';
        console.error('Registration error:', err);
      }
    });
  }
}
