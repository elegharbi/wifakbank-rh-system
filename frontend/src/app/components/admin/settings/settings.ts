import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThemeService } from '../../../services/theme.service';

@Component({
  selector: 'app-admin-settings',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './settings.html',
  styleUrls: ['./settings.css']
})
export class Settings implements OnInit {
  private themeService = inject(ThemeService);

  activeTab: 'general' | 'security' | 'notifications' | 'appearance' = 'general';
  darkMode = false;

  /** Message de confirmation affiche dans la page (plus d'alerte systeme). */
  saved = '';
  private savedTimer?: ReturnType<typeof setTimeout>;

  ngOnInit() {
    this.darkMode = this.themeService.isDarkMode;
    // Le theme peut changer depuis l'entete : on reste aligne.
    this.themeService.darkMode$.subscribe(v => this.darkMode = v);
  }

  toggleDarkMode(event: any) {
    this.themeService.setDarkMode(!!event.target.checked);
  }

  saveSettings() {
    this.saved = 'Vos préférences ont été enregistrées.';
    clearTimeout(this.savedTimer);
    this.savedTimer = setTimeout(() => (this.saved = ''), 4000);
  }
}
