import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DevelopmentService, Training } from '../../../services/development';
import { TrainingRegistrationService, TrainingRegistration } from '../../../services/training-registration.service';
import { ConfirmDialog } from '../../shared/confirm-dialog/confirm-dialog';

@Component({
  selector: 'app-employee-trainings',
  standalone: true,
  imports: [CommonModule, ConfirmDialog],
  templateUrl: './employee-trainings.html',
  styleUrls: ['./employee-trainings.css']
})
export class EmployeeTrainingsComponent implements OnInit {
  trainings: Training[] = [];
  myRegistrations: TrainingRegistration[] = [];
  loading = true;
  message = '';
  error = false;

  firstName = '';

  /** Formation en attente de confirmation (null = pas de boite ouverte). */
  pendingId: number | null = null;
  pendingTitle = '';

  constructor(
    private developmentService: DevelopmentService,
    private registrationService: TrainingRegistrationService
  ) {}

  ngOnInit(): void {
    const stored = sessionStorage.getItem('currentUser');
    if (stored) {
      const u = JSON.parse(stored);
      this.firstName = (u.firstName || '').trim() || u.username || '';
    }
    this.loadData();
  }

  /** Nombre d'inscriptions actives, affiche dans le bandeau. */
  get myActiveCount(): number {
    return this.myRegistrations.filter(r => r.status === 'PENDING' || r.status === 'APPROVED').length;
  }

  loadData() {
    this.loading = true;
    this.developmentService.getTrainings().subscribe({
      next: (tRes: Training[]) => {
        this.trainings = tRes;
        this.registrationService.getMyRegistrations().subscribe({
          next: (rRes: TrainingRegistration[]) => {
            this.myRegistrations = rRes;
            this.loading = false;
          },
          error: (err: any) => {
            console.error(err);
            this.loading = false;
          }
        });
      },
      error: (err: any) => {
        console.error(err);
        this.error = true;
        this.message = "Erreur lors du chargement des formations.";
        this.loading = false;
      }
    });
  }

  getRegistrationStatus(trainingId: number): string | null {
    if (!trainingId) return null;
    const reg = this.myRegistrations.find(r => r.training && r.training.id === trainingId);
    return reg ? reg.status : null;
  }

  /** Ouvre la confirmation ; l'envoi se fait dans confirmRegister(). */
  register(trainingId: number, title = '') {
    if (!trainingId) return;
    this.pendingId = trainingId;
    this.pendingTitle = title;
  }

  cancelRegister() {
    this.pendingId = null;
    this.pendingTitle = '';
  }

  confirmRegister() {
    const trainingId = this.pendingId;
    this.pendingId = null;
    this.pendingTitle = '';
    if (!trainingId) return;

    this.registrationService.registerForTraining(trainingId).subscribe({
      next: (_res: any) => {
        this.message = 'Inscription enregistrée avec succès. En attente de validation RH.';
        this.error = false;
        this.loadData(); // Reload to update status
      },
      error: (err: any) => {
        this.message = err.error?.error || 'Erreur lors de l\'inscription.';
        this.error = true;
      }
    });
  }
}
