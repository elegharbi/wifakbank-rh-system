import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-cv-viewer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cv-viewer.html',
  styleUrl: './cv-viewer.css'
})
export class CvViewer implements OnInit {
  private route = inject(ActivatedRoute);
  
  candidateId: string | null = null;
  candidate: any = null;

  ngOnInit() {
    this.candidateId = this.route.snapshot.paramMap.get('id');
    // Simulation du fetch d'un candidat pour le PFE
    this.candidate = {
      id: this.candidateId,
      name: "Ahmed Ben Salem",
      email: "ahmed.bensalem@email.com",
      phone: "+216 98 765 432",
      position: "Ingénieur d'Études et Développement",
      address: "Avenue Habib Bourguiba, Tunis",
      summary: "Ingénieur logiciel passionné avec plus de 5 ans d'expérience dans le développement d'applications bancaires sécurisées. Expertise en Java/Spring Boot et Angular.",
      experience: [
        {
          title: "Développeur Fullstack Senior",
          company: "Banque Nationale",
          period: "2020 - Présent",
          description: "Conception et développement de la plateforme de gestion des prêts. Réduction du temps de traitement de 30%."
        },
        {
          title: "Ingénieur Logiciel",
          company: "Tech Solutions",
          period: "2018 - 2020",
          description: "Développement d'APIs REST sécurisées et intégration de systèmes de paiement."
        }
      ],
      education: [
        {
          degree: "Diplôme National d'Ingénieur en Informatique",
          school: "École Nationale des Sciences de l'Informatique (ENSI)",
          year: "2018"
        }
      ],
      skills: ["Java", "Spring Boot", "Angular", "PostgreSQL", "Docker", "Agile/Scrum"]
    };
  }

  printCV() {
    window.print();
  }
}
