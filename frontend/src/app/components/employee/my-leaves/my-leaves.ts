import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { LeaveService, LeaveResponse } from '../../../services/leave.service';

@Component({
  selector: 'app-my-leaves',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './my-leaves.html',
  styleUrls: ['./my-leaves.css']
})
export class MyLeaves implements OnInit {
  leaves: LeaveResponse[] = [];
  loading = true;
  activeView: 'new' | 'history' = 'new';
  filterStatus: 'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED' = 'ALL';
  remainingDays = 30;
  minDate = new Date().toISOString().split('T')[0];

  // Formulaire de demande
  form = { startDate: '', endDate: '', reason: '', leaveType: '' };
  submitting = false;
  formSuccess = '';
  formError = '';

  constructor(private leaveService: LeaveService) {}

  ngOnInit(): void {
    this.loadLeaves();
  }

  loadLeaves() {
    this.loading = true;
    this.leaveService.getMyLeaves().subscribe({
      next: (data) => {
        this.leaves = data;
        this.loading = false;
        // Calculer le solde restant (base 30j - jours approuvés)
        const usedDays = data
          .filter(l => l.status === 'APPROVED')
          .reduce((sum, l) => sum + this.getDuration(l.startDate, l.endDate), 0);
        this.remainingDays = Math.max(0, 30 - usedDays);
      },
      error: () => { this.loading = false; }
    });
  }

  submitForm() {
    this.formSuccess = '';
    this.formError = '';

    if (!this.form.leaveType || !this.form.startDate || !this.form.endDate) {
      this.formError = 'Veuillez remplir tous les champs obligatoires.';
      return;
    }
    if (this.form.endDate < this.form.startDate) {
      this.formError = 'La date de fin doit être après la date de début.';
      return;
    }

    this.submitting = true;
    this.leaveService.submitLeave(this.form).subscribe({
      next: () => {
        this.formSuccess = '✅ Demande soumise avec succès ! Vous recevrez un email de confirmation.';
        this.submitting = false;
        this.form = { startDate: '', endDate: '', reason: '', leaveType: '' };
        this.loadLeaves();
        setTimeout(() => { this.activeView = 'history'; this.formSuccess = ''; }, 2500);
      },
      error: (err) => {
        this.submitting = false;
        this.formError = err.error?.error || 'Erreur lors de la soumission. Réessayez.';
      }
    });
  }

  getDuration(startStr?: string, endStr?: string): number {
    const s = startStr ?? this.form.startDate;
    const e = endStr ?? this.form.endDate;
    if (!s || !e) return 0;
    const start = new Date(s);
    const end = new Date(e);
    const diff = Math.ceil((end.getTime() - start.getTime()) / 86400000) + 1;
    return diff > 0 ? diff : 0;
  }

  get filteredLeaves(): LeaveResponse[] {
    if (this.filterStatus === 'ALL') return this.leaves;
    return this.leaves.filter(l => l.status === this.filterStatus);
  }

  get pendingCount(): number  { return this.leaves.filter(l => l.status === 'PENDING').length; }
  get approvedCount(): number { return this.leaves.filter(l => l.status === 'APPROVED').length; }
  get rejectedCount(): number { return this.leaves.filter(l => l.status === 'REJECTED').length; }

  statusLabel(status: string): string {
    switch (status) {
      case 'PENDING':  return 'En attente';
      case 'APPROVED': return 'Accepté';
      case 'REJECTED': return 'Refusé';
      default: return status;
    }
  }
}

