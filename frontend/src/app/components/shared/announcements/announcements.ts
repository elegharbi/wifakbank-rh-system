import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-announcements',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container-fluid py-4">
      <div class="card shadow-sm border-0">
        <div class="card-header bg-white py-3">
          <h5 class="mb-0 text-primary">
            <i class="fa-solid fa-bullhorn me-2"></i> Annonces internes
          </h5>
        </div>
        <div class="card-body">
          <p class="text-muted">Module en cours de développement...</p>
        </div>
      </div>
    </div>
  `
})
export class Announcements {}
