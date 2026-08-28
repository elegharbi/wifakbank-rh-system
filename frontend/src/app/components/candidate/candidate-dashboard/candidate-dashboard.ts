import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { EventService } from '../../../services/event'; // Note: Should probably be jobService in the future, using eventService for counts.events for now as original code

@Component({
  selector: 'app-candidate-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './candidate-dashboard.html',
  styleUrls: ['../../dashboard/dashboard.css']
})
export class CandidateDashboard implements OnInit {
  private eventService = inject(EventService);

  counts = {
    events: 0
  };

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.eventService.getEvents().subscribe({
      next: (res) => {
        this.counts.events = res.length;
      },
      error: (err) => console.error('Error loading candidate dashboard data', err)
    });
  }
}
