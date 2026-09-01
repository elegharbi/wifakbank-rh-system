import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DevelopmentService, Training } from '../../../../services/development';

@Component({
  selector: 'app-trainings',
  standalone: true,
  imports: [CommonModule, FormsModule, DatePipe],
  templateUrl: './trainings.html',
  styleUrl: './trainings.css'
})
export class Trainings implements OnInit {
  private devService = inject(DevelopmentService);

  trainings: Training[] = [];
  newTraining: Training = { title: '', organization: '', description: '', durationHours: 0, status: 'PLANNED', trainingType: 'PRESENTIEL', trainingLink: '', trainerName: '', trainingDate: '' };
  
  isEditing = false;
  editingId: number | null = null;

  ngOnInit() {
    this.loadTrainings();
  }

  loadTrainings() {
    this.devService.getTrainings().subscribe(res => this.trainings = res);
  }

  addTraining() {
    if (!this.newTraining.title) return;
    this.devService.createTraining(this.newTraining).subscribe({
      next: () => {
        alert('Formation ajoutée avec succès !');
        this.newTraining = { title: '', organization: '', description: '', durationHours: 0, status: 'PLANNED', trainingType: 'PRESENTIEL', trainingLink: '', trainerName: '', trainingDate: '' };
        this.loadTrainings();
      },
      error: (err) => {
        console.error('Erreur lors de l\'ajout:', err);
        alert('Erreur lors de l\'ajout: ' + (err.error?.message || err.message || 'Erreur serveur'));
      }
    });
  }

  editTraining(tr: any) {
    console.log('Editing training:', tr);
    this.isEditing = true;
    this.editingId = tr.id;
    this.newTraining = { ...tr };
    window.scrollTo({ top: 0, behavior: 'smooth' }); // Remonte en haut pour voir le formulaire
  }

  cancelEdit() {
    this.isEditing = false;
    this.editingId = null;
    this.newTraining = { title: '', organization: '', description: '', durationHours: 0, status: 'PLANNED', trainingType: 'PRESENTIEL', trainingLink: '', trainerName: '', trainingDate: '' };
  }

  saveEdit() {
    if (!this.editingId) return;
    this.devService.updateTraining(this.editingId, this.newTraining).subscribe({
      next: () => {
        alert('Formation modifiée avec succès !');
        this.cancelEdit();
        this.loadTrainings();
      },
      error: (err) => alert('Erreur lors de la modification. Vérifiez le serveur.')
    });
  }

  deleteTraining(id: any) {
    if (!id) return;
    
    if (confirm('Voulez-vous vraiment supprimer cette formation ?')) {
      this.devService.deleteTraining(id).subscribe({
        next: () => {
          alert('Formation supprimée !');
          this.loadTrainings();
        },
        error: (err) => {
          console.error(err);
          const msg = err.error?.message || 'Le serveur a refuse la suppression. Verifiez le port 8081.';
          alert('Erreur ' + err.status + ' : ' + msg);
        }
      });
    }
  }

  /** Nombre de formations pour un format donne. */
  countByType(type: string): number {
    if (type === 'PRESENTIEL') {
      // Le presentiel est le format par defaut des anciennes entrees.
      return this.trainings.filter(t => !t.trainingType || t.trainingType === 'PRESENTIEL').length;
    }
    return this.trainings.filter(t => t.trainingType === type).length;
  }

  /** Libelle lisible du statut. */
  statusLabel(status: string | undefined | null): string {
    switch ((status || 'PLANNED').toUpperCase()) {
      case 'COMPLETED':
      case 'TERMINEE':  return 'Terminée';
      case 'CANCELLED':
      case 'ANNULEE':   return 'Annulée';
      case 'ONGOING':
      case 'EN_COURS':  return 'En cours';
      default:          return 'Planifiée';
    }
  }
}
