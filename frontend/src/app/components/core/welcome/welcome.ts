import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-welcome',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './welcome.html',
  styleUrl: './welcome.css'
})
export class Welcome {
  modules = [
    { title: 'Tableau de Bord', desc: 'Vériifer les statistiques de la banque', icon: 'fa-chart-line', link: '/dashboard', color: '#2e7d32' },
    { title: 'Gestion Employés', desc: 'Gérer la base de données du personnel', icon: 'fa-users', link: '/employees', color: '#43a047' },
    { title: 'Gestion Congés', desc: 'Suivre les demandes et absences', icon: 'fa-umbrella-beach', link: '/leaves', color: '#66bb6a' },
    { title: 'Événements', desc: 'Planifier les activités internes', icon: 'fa-calendar-days', link: '/events', color: '#81c784' },
    { title: 'Participations', desc: 'Inscriptions aux activités', icon: 'fa-clipboard-check', link: '/participations', color: '#a5d6a7' }
  ];
}
