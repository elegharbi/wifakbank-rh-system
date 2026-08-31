import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { HttpClient } from '@angular/common/http';
import { ThemeService } from '../../../services/theme.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class Home implements OnInit {
  authService = inject(AuthService);
  private http = inject(HttpClient);
  theme = inject(ThemeService);
  router = inject(Router);
  
  ngOnInit() {
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/dashboard']);
    }
  }

  contactForm = {
    nomComplet: '',
    email: '',
    sujet: '',
    message: ''
  };
  contactSubmitted = false;
  isContactSubmitting = false;
  contactError = '';

  stats = [
    { value: '250+', label: 'Collaborateurs', icon: 'fa-users' },
    { value: '98%', label: 'Satisfaction', icon: 'fa-face-smile' },
    { value: '40+', label: 'Formations/an', icon: 'fa-graduation-cap' },
    { value: '15', label: 'Départements', icon: 'fa-building' }
  ];

  programmes = [
    {
      icon: 'fa-chalkboard-teacher',
      title: 'Formation Interne',
      description: 'Programmes de développement professionnel continu pour renforcer vos compétences métiers bancaires.',
      color: '#0B5CA8'
    },
    {
      icon: 'fa-user-graduate',
      title: 'Stage Professionnel',
      description: 'Opportunités de stage en immersion dans un environnement bancaire participatif et dynamique.',
      color: '#16265C'
    },
    {
      icon: 'fa-calendar-star',
      title: 'Événements RH',
      description: 'Séminaires, team buildings et conférences pour favoriser la cohésion et l\'innovation.',
      color: '#D62B24'
    },
    {
      icon: 'fa-trophy',
      title: 'Programme Points',
      description: 'Système de gamification et reconnaissance pour récompenser l\'engagement et la performance.',
      color: '#8E9295'
    }
  ];

  onSubmitContact() {
    if (!this.contactForm.nomComplet || !this.contactForm.email || !this.contactForm.sujet || !this.contactForm.message) {
      return;
    }
    this.isContactSubmitting = true;
    this.contactError = '';

    // Envoi réel : le message est enregistré et le RH est notifié.
    this.http.post<{ success: boolean; message: string }>('/api/contact', {
      fullName: this.contactForm.nomComplet,
      email: this.contactForm.email,
      subject: this.contactForm.sujet,
      message: this.contactForm.message
    }).subscribe({
      next: () => {
        this.isContactSubmitting = false;
        this.contactSubmitted = true;
        this.contactForm = { nomComplet: '', email: '', sujet: '', message: '' };
        setTimeout(() => this.contactSubmitted = false, 8000);
      },
      error: (err) => {
        this.isContactSubmitting = false;
        this.contactError = err?.error?.error
          || "L'envoi a échoué. Vérifiez votre connexion et réessayez.";
      }
    });
  }

  scrollTo(sectionId: string) {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }
}
