import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { RecruitmentService, JobPosition } from '../../../../services/recruitment';
import { TranslationService } from '../../../../services/translation';
import { UserService, User } from '../../../../services/user';

@Component({
  selector: 'app-jobs',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './jobs.html',
  styleUrl: './jobs.css'
})
export class Jobs implements OnInit {
  private recruitmentService = inject(RecruitmentService);
  private translationService = inject(TranslationService);
  private userService = inject(UserService);
  private router = inject(Router);

  jobs: JobPosition[] = [];
  currentUser: User | null = null;

  // Application Modal state
  showApplyModal = false;
  selectedJob: JobPosition | null = null;
  applyFullName = '';
  applyEmail = '';
  applyPhone = '';
  applyCvUrl = '';
  selectedFileName = '';
  isSubmitting = false;

  ngOnInit() {
    this.loadJobs();
    this.loadCurrentUser();
  }

  loadJobs() {
    this.recruitmentService.getJobs().subscribe({
      next: (res) => {
        this.jobs = res.filter(job => job.status === 'OPEN');
      },
      error: (err) => console.error('Error loading jobs:', err)
    });
  }

  loadCurrentUser() {
    this.userService.getMe().subscribe({
      next: (user) => {
        this.currentUser = user;
        this.populateUserData();
      },
      error: (err) => console.error('Error loading current user:', err)
    });
  }

  populateUserData() {
    if (this.currentUser) {
      const name = `${this.currentUser.firstName || ''} ${this.currentUser.lastName || ''}`.trim() || this.currentUser.username || '';
      if (!this.applyFullName && name) this.applyFullName = name;
      if (!this.applyEmail && this.currentUser.email) this.applyEmail = this.currentUser.email;
      if (!this.applyPhone && this.currentUser.phone) this.applyPhone = this.currentUser.phone;
    }
  }

  openApplyModal(job: JobPosition) {
    this.selectedJob = job;
    this.showApplyModal = true;
    this.applyCvUrl = '';
    this.selectedFileName = '';
    this.populateUserData();
  }

  closeApplyModal() {
    this.showApplyModal = false;
    this.selectedJob = null;
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFileName = file.name;
      this.applyCvUrl = file.name; // Simulating file upload URL
    }
  }

  submitApplication() {
    if (!this.selectedJob) return;
    if (!this.applyFullName || !this.applyEmail || !this.applyPhone || !this.applyCvUrl) {
      alert('Veuillez renseigner tous les champs obligatoires.');
      return;
    }

    this.isSubmitting = true;

    const candidateData = {
      fullName: this.applyFullName,
      email: this.applyEmail,
      phone: this.applyPhone,
      cvUrl: this.applyCvUrl,
      status: 'APPLIED',
      jobPosition: this.selectedJob
    };

    this.recruitmentService.createCandidate(candidateData).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.closeApplyModal();
        alert('Votre candidature a été enregistrée avec succès !');
        this.router.navigate(['/postulations']);
      },
      error: (err) => {
        this.isSubmitting = false;
        console.error('Error applying for job:', err);
        alert('Erreur lors de la soumission de votre candidature.');
      }
    });
  }

  t(key: string): string {
    return this.translationService.t(key);
  }
}
