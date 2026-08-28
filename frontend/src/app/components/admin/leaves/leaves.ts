import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LeaveService, LeaveResponse } from '../../../services/leave.service';

@Component({
  selector: 'app-admin-leaves',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './leaves.html',
  styleUrls: ['./leaves.css']
})
export class AdminLeaves implements OnInit {
  allLeaves: LeaveResponse[] = [];
  loading = false;
  error = '';
  successMsg = '';
  activeFilter: 'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED' = 'PENDING';
  processingId: number | null = null;

  constructor(private leaveService: LeaveService) {}

  ngOnInit(): void {
    this.fetchAll();
  }

  fetchAll(): void {
    this.loading = true;
    this.error = '';
    this.leaveService.getAllLeaves().subscribe({
      next: data => {
        this.allLeaves = data;
        this.loading = false;
      },
      error: () => {
        this.error = 'Impossible de charger les demandes de congé.';
        this.loading = false;
      }
    });
  }

  get filtered(): LeaveResponse[] {
    if (this.activeFilter === 'ALL') return this.allLeaves;
    return this.allLeaves.filter(l => l.status === this.activeFilter);
  }

  get pendingCount(): number  { return this.allLeaves.filter(l => l.status === 'PENDING').length; }
  get approvedCount(): number { return this.allLeaves.filter(l => l.status === 'APPROVED').length; }
  get rejectedCount(): number { return this.allLeaves.filter(l => l.status === 'REJECTED').length; }

  approve(id: number): void {
    this.processingId = id;
    this.successMsg = '';
    this.leaveService.approveLeave(id).subscribe({
      next: () => {
        this.successMsg = '✅ Congé approuvé avec succès.';
        this.processingId = null;
        this.fetchAll();
        setTimeout(() => this.successMsg = '', 3000);
      },
      error: () => { this.error = 'Erreur lors de l\'approbation.'; this.processingId = null; }
    });
  }

  reject(id: number): void {
    if (!confirm('Voulez-vous vraiment refuser cette demande de congé ?')) return;
    this.processingId = id;
    this.successMsg = '';
    this.leaveService.rejectLeave(id).subscribe({
      next: () => {
        this.successMsg = '❌ Congé refusé.';
        this.processingId = null;
        this.fetchAll();
        setTimeout(() => this.successMsg = '', 3000);
      },
      error: () => { this.error = 'Erreur lors du refus.'; this.processingId = null; }
    });
  }

  deleteLeave(id: number): void {
    if (!confirm('Supprimer cette demande ?')) return;
    this.leaveService.deleteLeave(id).subscribe({
      next: () => this.fetchAll(),
      error: () => this.error = 'Suppression échouée'
    });
  }

  getDays(start: string, end: string): number {
    if (!start || !end) return 0;
    const diff = new Date(end).getTime() - new Date(start).getTime();
    return Math.ceil(diff / 86400000) + 1;
  }
}
