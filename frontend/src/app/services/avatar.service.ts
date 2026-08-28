import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

/**
 * Photo de profil importee par l'utilisateur.
 *
 * La colonne `profile_image` du serveur est un varchar(255) : une image encodee
 * en base64 n'y tient pas. La photo est donc conservee dans ce navigateur et
 * diffusee ici pour que l'entete, le menu lateral et le profil affichent
 * la meme image, immediatement.
 */
@Injectable({ providedIn: 'root' })
export class AvatarService {
  private readonly subject = new BehaviorSubject<string | null>(null);

  /** Flux de la photo courante (null = pas de photo importee). */
  readonly avatar$: Observable<string | null> = this.subject.asObservable();

  constructor() {
    this.reload();
  }

  private key(): string | null {
    try {
      const raw = sessionStorage.getItem('currentUser');
      if (!raw) return null;
      const id = JSON.parse(raw)?.id;
      return id != null ? `wifak.avatar.${id}` : null;
    } catch {
      return null;
    }
  }

  /** Relit le stockage : a appeler apres une connexion. */
  reload(): void {
    const k = this.key();
    if (!k) { this.subject.next(null); return; }
    try {
      this.subject.next(localStorage.getItem(k));
    } catch {
      this.subject.next(null);
    }
  }

  get current(): string | null {
    return this.subject.value;
  }

  /** Enregistre la photo. Renvoie false si le stockage est plein. */
  set(dataUrl: string): boolean {
    const k = this.key();
    if (!k) return false;
    try {
      localStorage.setItem(k, dataUrl);
      this.subject.next(dataUrl);
      return true;
    } catch {
      return false;
    }
  }

  clear(): void {
    const k = this.key();
    if (k) {
      try { localStorage.removeItem(k); } catch { /* rien a nettoyer */ }
    }
    this.subject.next(null);
  }
}
