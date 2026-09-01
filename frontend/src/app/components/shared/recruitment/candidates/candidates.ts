import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

interface CandidateRow {
  id: number;
  fullName: string;
  email: string;
  phone?: string;
  status: string;
  address?: string;
  birthDate?: string;
  educationLevel?: string;
  speciality?: string;
  desiredPosition?: string;
  cvFileName?: string;
  hasCv: boolean;
  createdAt?: string;
  jobPosition?: string;
  motivationLetter?: string;
  hrComment?: string;
  evaluationScore?: number;
}

@Component({
  selector: 'app-candidates',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './candidates.html',
  styleUrl: './candidates.css'
})
export class Candidates implements OnInit {
  private http = inject(HttpClient);

  candidates: CandidateRow[] = [];
  loading = true;

  /** Candidature ouverte dans le panneau de détail. */
  selected: CandidateRow | null = null;
  detailLoading = false;

  search = '';
  statusFilter = 'ALL';

  message = '';
  error = false;

  readonly STATUSES = [
    { key: 'APPLIED',     label: 'Reçue' },
    { key: 'INTERVIEWED', label: 'Entretien' },
    { key: 'SELECTED',    label: 'Retenue' },
    { key: 'REJECTED',    label: 'Écartée' }
  ];

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.http.get<CandidateRow[]>('/api/candidates').subscribe({
      next: (list) => { this.candidates = list ?? []; this.loading = false; },
      error: () => {
        this.candidates = [];
        this.loading = false;
        this.error = true;
        this.message = 'Le chargement des candidatures a échoué.';
      }
    });
  }

  get visible(): CandidateRow[] {
    const q = this.search.trim().toLowerCase();
    return this.candidates.filter(c => {
      const okStatus = this.statusFilter === 'ALL' || (c.status || 'APPLIED') === this.statusFilter;
      if (!okStatus) return false;
      if (!q) return true;
      return [c.fullName, c.email, c.desiredPosition, c.speciality]
        .filter(Boolean)
        .some(v => (v as string).toLowerCase().includes(q));
    });
  }

  countBy(status: string): number {
    if (status === 'ALL') return this.candidates.length;
    return this.candidates.filter(c => (c.status || 'APPLIED') === status).length;
  }

  statusLabel(key: string | undefined): string {
    return this.STATUSES.find(s => s.key === (key || 'APPLIED'))?.label ?? 'Reçue';
  }

  /** Ouvre la fiche complète (la lettre de motivation n'est pas dans la liste). */
  open(c: CandidateRow): void {
    this.selected = c;
    this.detailLoading = true;
    this.http.get<CandidateRow>(`/api/candidates/${c.id}`).subscribe({
      next: (full) => { this.selected = full; this.detailLoading = false; },
      error: () => { this.detailLoading = false; }
    });
  }

  close(): void {
    this.selected = null;
  }

  cvUrl(c: CandidateRow): string {
    return `/api/candidates/${c.id}/cv`;
  }

  setStatus(c: CandidateRow, status: string): void {
    this.http.put(`/api/candidates/${c.id}/status`, { status }).subscribe({
      next: () => {
        c.status = status;
        if (this.selected && this.selected.id === c.id) this.selected.status = status;
        const row = this.candidates.find(x => x.id === c.id);
        if (row) row.status = status;
        this.error = false;
        this.message = `Candidature de ${c.fullName} : ${this.statusLabel(status).toLowerCase()}.`;
        setTimeout(() => this.message = '', 4000);
      },
      error: () => {
        this.error = true;
        this.message = 'La mise à jour du statut a échoué.';
      }
    });
  }

  initials(name: string): string {
    if (!name) return 'C';
    const parts = name.trim().split(/\s+/);
    const a = parts[0]?.charAt(0) ?? '';
    const b = parts.length > 1 ? parts[parts.length - 1].charAt(0) : '';
    return (a + b).toUpperCase() || 'C';
  }

  ago(iso?: string): string {
    if (!iso) return '';
    const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);
    if (days <= 0) return "aujourd'hui";
    if (days === 1) return 'hier';
    if (days < 7) return `il y a ${days} jours`;
    return new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
  }

  trackById(_: number, c: CandidateRow): number {
    return c.id;
  }
}
