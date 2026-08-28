import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { RecruitmentService, Candidate, JobPosition } from '../../../../services/recruitment';
import { TranslationService } from '../../../../services/translation';

@Component({
  selector: 'app-candidates',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './candidates.html',
  styleUrl: './candidates.css'
})
export class Candidates implements OnInit {
  private recruitmentService = inject(RecruitmentService);
  private translationService = inject(TranslationService);

  candidates: Candidate[] = [];
  jobs: JobPosition[] = [];
  newCandidate: Candidate = { fullName: '', email: '', phone: '', cvUrl: '', status: 'APPLIED' };
  selectedJobId: number | null = null;
  
  evaluatingCandId: number | null = null;
  evalScore: number = 0;
  evalComment: string = '';

  // Drag and Drop properties
  isDragging = false;
  selectedFileName: string | null = null;

  ngOnInit() {
    this.loadCandidates();
    this.loadJobs();
  }

  loadJobs() {
    this.recruitmentService.getJobs().subscribe(res => this.jobs = res);
  }

  loadCandidates() {
    this.recruitmentService.getCandidates().subscribe(res => this.candidates = res);
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
    this.isDragging = true;
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    this.isDragging = false;
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    this.isDragging = false;
    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.handleFile(files[0]);
    }
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.handleFile(file);
    }
  }

  private handleFile(file: File) {
    // Dans un vrai projet PFE, on uploade le fichier ici via FormData
    this.selectedFileName = file.name;
    this.newCandidate.cvUrl = file.name; // On simule l'URL pour la démo
  }

  removeFile() {
    this.selectedFileName = null;
    this.newCandidate.cvUrl = '';
  }

  addCandidate() {
    if (!this.newCandidate.fullName || !this.selectedJobId) return;
    
    const job = this.jobs.find(j => j.id === Number(this.selectedJobId));
    if (job) {
      this.newCandidate.jobPosition = job;
      this.recruitmentService.createCandidate(this.newCandidate).subscribe(() => {
        this.newCandidate = { fullName: '', email: '', phone: '', cvUrl: '', status: 'APPLIED' };
        this.selectedJobId = null;
        this.selectedFileName = null;
        this.loadCandidates();
      });
    }
  }

  startEvaluation(cand: Candidate) {
    this.evaluatingCandId = cand.id || null;
    this.evalScore = cand.evaluationScore || 0;
    this.evalComment = cand.hrComment || '';
  }

  saveEvaluation() {
    if (!this.evaluatingCandId) return;
    
    this.recruitmentService.updateCandidate(this.evaluatingCandId, {
      evaluationScore: this.evalScore,
      hrComment: this.evalComment
    }).subscribe(() => {
      alert(this.t('evaluationSaved'));
      this.evaluatingCandId = null;
      this.loadCandidates();
    });
  }

  t(key: string): string {
    return this.translationService.t(key);
  }
}
