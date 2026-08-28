import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { LeaveService } from '../../../services/leave.service';

@Component({
  selector: 'app-leave-request',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './leave-request.html',
  styleUrls: ['./leave-request.css']
})
export class LeaveRequestComponent {
  request = {
    startDate: '',
    endDate: '',
    reason: '',
    leaveType: ''
  };
  submitting = false;
  message = '';
  isSuccess = false;

  constructor(private leaveService: LeaveService, private router: Router) {}

  submit() {
    if (!this.request.startDate || !this.request.endDate || !this.request.leaveType) {
      this.message = 'Veuillez remplir tous les champs obligatoires.';
      this.isSuccess = false;
      return;
    }
    if (this.request.endDate < this.request.startDate) {
      this.message = 'La date de fin doit être après la date de début.';
      this.isSuccess = false;
      return;
    }
    this.submitting = true;
    this.message = '';

    this.leaveService.submitLeave(this.request).subscribe({
      next: (res) => {
        this.message = 'Votre demande de congé a été soumise avec succès ! Un email de confirmation vous a été envoyé.';
        this.isSuccess = true;
        this.submitting = false;
        setTimeout(() => this.router.navigate(['/my-leaves']), 2000);
      },
      error: (err) => {
        this.submitting = false;
        this.isSuccess = false;
        if (err.error?.error) {
          this.message = 'Erreur : ' + err.error.error;
        } else if (err.status === 0) {
          this.message = 'Impossible de contacter le serveur. Vérifiez que le backend est démarré.';
        } else {
          this.message = 'Erreur lors de la soumission (code ' + err.status + '). Réessayez.';
        }
      }
    });
  }
}
