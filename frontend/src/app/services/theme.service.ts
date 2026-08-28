import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

/**
 * Theme clair / sombre.
 *
 * Source unique : la classe `dark-mode` sur <body> et la cle `theme` du
 * stockage local. Sans choix enregistre, on suit le reglage du systeme.
 */
@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly KEY = 'theme';
  private _darkMode = new BehaviorSubject<boolean>(false);
  darkMode$ = this._darkMode.asObservable();

  constructor() {
    this.restore();
  }

  get isDarkMode(): boolean {
    return this._darkMode.value;
  }

  /** Applique le choix enregistre, sinon la preference du systeme. */
  restore(): void {
    let saved: string | null = null;
    try { saved = localStorage.getItem(this.KEY); } catch { /* stockage indisponible */ }

    if (saved === 'dark')      { this.apply(true);  return; }
    if (saved === 'light')     { this.apply(false); return; }

    const prefersDark = typeof window !== 'undefined'
      && window.matchMedia?.('(prefers-color-scheme: dark)').matches;
    this.apply(!!prefersDark);
  }

  /** Change le theme et retient le choix. */
  setDarkMode(value: boolean): void {
    this.apply(value);
    try { localStorage.setItem(this.KEY, value ? 'dark' : 'light'); } catch { /* rien a retenir */ }
  }

  toggle(): void {
    this.setDarkMode(!this.isDarkMode);
  }

  private apply(value: boolean): void {
    this._darkMode.next(value);
    const root = document.documentElement;
    const body = document.body;
    if (value) {
      root.classList.add('dark-mode');
      body.classList.add('dark-mode');
    } else {
      root.classList.remove('dark-mode');
      body.classList.remove('dark-mode');
    }
  }
}
