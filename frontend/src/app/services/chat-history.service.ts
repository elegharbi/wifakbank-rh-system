import { Injectable } from '@angular/core';

export interface ChatMessage {
  text: string;
  isUser: boolean;
  time: string;
}

export interface Conversation {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  messages: ChatMessage[];
}

/**
 * Conversations de l'assistant RH, conservees dans ce navigateur.
 * Le serveur ne stocke pas l'historique : chaque compte garde le sien
 * localement, sous une cle propre a son identifiant.
 */
@Injectable({ providedIn: 'root' })
export class ChatHistoryService {
  private readonly MAX_CONVERSATIONS = 30;

  private key(): string | null {
    try {
      const raw = sessionStorage.getItem('currentUser');
      if (!raw) return null;
      const id = JSON.parse(raw)?.id;
      return id != null ? `wifak.chat.${id}` : null;
    } catch {
      return null;
    }
  }

  /** Conversations, de la plus recente a la plus ancienne. */
  list(): Conversation[] {
    const k = this.key();
    if (!k) return [];
    try {
      const raw = localStorage.getItem(k);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return [];
      return parsed.sort((a, b) => b.updatedAt - a.updatedAt);
    } catch {
      return [];
    }
  }

  get(id: string): Conversation | null {
    return this.list().find(c => c.id === id) ?? null;
  }

  /** Cree ou met a jour une conversation. Renvoie false si le stockage refuse. */
  save(conv: Conversation): boolean {
    const k = this.key();
    if (!k) return false;
    const all = this.list().filter(c => c.id !== conv.id);
    all.unshift(conv);
    try {
      localStorage.setItem(k, JSON.stringify(all.slice(0, this.MAX_CONVERSATIONS)));
      return true;
    } catch {
      // Stockage plein : on retente en ne gardant que les plus recentes.
      try {
        localStorage.setItem(k, JSON.stringify(all.slice(0, 8)));
        return true;
      } catch {
        return false;
      }
    }
  }

  remove(id: string): void {
    const k = this.key();
    if (!k) return;
    try {
      localStorage.setItem(k, JSON.stringify(this.list().filter(c => c.id !== id)));
    } catch { /* rien a faire */ }
  }

  clearAll(): void {
    const k = this.key();
    if (k) {
      try { localStorage.removeItem(k); } catch { /* rien a faire */ }
    }
  }

  newId(): string {
    return `c${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;
  }

  /** Titre tire de la premiere question posee. */
  titleFrom(text: string): string {
    const clean = text.trim().replace(/\s+/g, ' ');
    if (!clean) return 'Nouvelle conversation';
    return clean.length > 42 ? clean.slice(0, 42).trimEnd() + '…' : clean;
  }

  /** "Aujourd'hui, 14:05" / "Hier, 09:12" / "12 mars" */
  labelFor(ts: number): string {
    const d = new Date(ts);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    const sameDay = (a: Date, b: Date) =>
      a.getDate() === b.getDate() && a.getMonth() === b.getMonth() && a.getFullYear() === b.getFullYear();

    const hm = d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    if (sameDay(d, today)) return `Aujourd'hui, ${hm}`;
    if (sameDay(d, yesterday)) return `Hier, ${hm}`;
    return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' });
  }
}
