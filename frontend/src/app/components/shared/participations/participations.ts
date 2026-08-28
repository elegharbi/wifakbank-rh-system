import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ParticipationService } from '../../../services/participation';
import { EmployeeService, Employee } from '../../../services/employee';
import { EventService, Event } from '../../../services/event';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-participations',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './participations.html',
  styleUrl: './participations.css'
})
export class Participations implements OnInit {
  private participationService = inject(ParticipationService);
  private employeeService = inject(EmployeeService);
  private eventService = inject(EventService);
  
  participations: any[] = [];
  employees: Employee[] = [];
  events: Event[] = [];
  
  newParticipation = {
    employeeId: '',
    eventId: ''
  };

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    forkJoin({
      p: this.participationService.getParticipations(),
      e: this.employeeService.getEmployees(),
      ev: this.eventService.getEvents()
    }).subscribe({
      next: (res) => {
        this.participations = res.p;
        this.employees = res.e;
        this.events = res.ev;
      },
      error: (err) => console.error('Error loading data', err)
    });
  }

  addParticipation() {
    if (!this.newParticipation.employeeId || !this.newParticipation.eventId) return;

    const data = {
      employee: { id: parseInt(this.newParticipation.employeeId) },
      event: { id: parseInt(this.newParticipation.eventId) },
      registrationDate: new Date().toISOString()
    };

    this.participationService.createParticipation(data).subscribe({
      next: () => {
        this.loadData();
        this.newParticipation = { employeeId: '', eventId: '' };
      },
      error: (err) => alert('Erreur lors de l\'inscription')
    });
  }

  deleteParticipation(id: number) {
    if (confirm('Annuler cette participation ?')) {
      this.participationService.deleteParticipation(id).subscribe(() => this.loadData());
    }
  }
}
