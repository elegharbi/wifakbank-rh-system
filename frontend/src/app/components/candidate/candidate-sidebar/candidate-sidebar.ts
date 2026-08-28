import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { TranslationService } from '../../../services/translation';

@Component({
  selector: 'app-candidate-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './candidate-sidebar.html'
})
export class CandidateSidebar {
  private translation = inject(TranslationService);

  t(key: string): string {
    return this.translation.t(key);
  }
}
