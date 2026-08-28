import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RecruitmentService, Candidate } from '../../../services/recruitment';

@Component({
  selector: 'app-postulations',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="postulations">
      <h1>Mes postulations</h1>
      <p *ngIf="loading">Chargement des postulations…</p>
      <p *ngIf="!loading && candidates.length === 0">Aucune postulation pour le moment.</p>
      <article *ngFor="let candidate of candidates" class="application">
        <h2>{{ candidate.jobPosition?.title || 'Poste non précisé' }}</h2>
        <p>{{ candidate.jobPosition?.department }}</p>
        <span>{{ candidate.status }}</span>
      </article>
    </section>
  `,
  styles: [`
    .postulations { max-width: 900px; margin: 2rem auto; padding: 0 1rem; }
    .application { padding: 1rem; margin: .75rem 0; background: #fff; border: 1px solid #e2e8f0; border-radius: .5rem; }
    h2 { margin: 0; font-size: 1.1rem; }
    p { color: #64748b; }
    span { color: #2563eb; font-weight: 600; }
  `]
})
export class PostulationsComponent implements OnInit {
  private recruitmentService = inject(RecruitmentService);
  candidates: Candidate[] = [];
  loading = true;

  ngOnInit(): void {
    this.recruitmentService.getCandidates().subscribe({
      next: candidates => { this.candidates = candidates; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }
}
