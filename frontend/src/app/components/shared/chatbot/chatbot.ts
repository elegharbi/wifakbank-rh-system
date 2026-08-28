import { Component, ElementRef, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatService } from '../../../services/chat';
import { ChatHistoryService, ChatMessage, Conversation } from '../../../services/chat-history.service';

@Component({
  selector: 'app-chatbot',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chatbot.html',
  styleUrl: './chatbot.css'
})
export class Chatbot {
  private chatService = inject(ChatService);
  private history = inject(ChatHistoryService);

  @ViewChild('scrollContainer') private scrollContainer?: ElementRef<HTMLElement>;
  @ViewChild('chatInput') private chatInput?: ElementRef<HTMLInputElement>;

  isOpen = false;
  showHistory = false;
  userInput = '';
  isLoading = false;

  conversationId = '';
  messages: ChatMessage[] = [];
  conversations: Conversation[] = [];

  readonly suggestions = [
    'Mon solde de congés',
    'Demander un congé',
    'Mes formations'
  ];

  private static readonly WELCOME =
    "Bonjour. Je suis l'assistant RH de Wifak Bank. Posez votre question sur vos congés, vos formations ou votre fiche de paie.";

  constructor() {
    this.startNew(false);
  }

  private static now(): string {
    return new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  }

  /** Vrai des que l'utilisateur a pose une question. */
  get hasConversation(): boolean {
    return this.messages.some(m => m.isUser);
  }

  get hasSaved(): boolean {
    return this.conversations.length > 0;
  }

  // ---------------- Ouverture ----------------

  toggleChat() {
    this.isOpen = !this.isOpen;
    if (this.isOpen) {
      this.conversations = this.history.list();
      setTimeout(() => { this.chatInput?.nativeElement.focus(); this.scrollToBottom(); }, 80);
    } else {
      this.showHistory = false;
    }
  }

  closeChat() {
    this.isOpen = false;
    this.showHistory = false;
  }

  // ---------------- Conversations ----------------

  toggleHistory() {
    this.showHistory = !this.showHistory;
    if (this.showHistory) this.conversations = this.history.list();
  }

  /** Ouvre une conversation vierge. L'echange en cours reste enregistre. */
  startNew(focus = true) {
    this.conversationId = this.history.newId();
    this.messages = [{ text: Chatbot.WELCOME, isUser: false, time: Chatbot.now() }];
    this.showHistory = false;
    this.userInput = '';
    this.conversations = this.history.list();
    if (focus) setTimeout(() => this.chatInput?.nativeElement.focus(), 60);
  }

  open(conv: Conversation) {
    this.conversationId = conv.id;
    this.messages = [...conv.messages];
    this.showHistory = false;
    this.scrollToBottom();
  }

  remove(conv: Conversation, event: Event) {
    event.stopPropagation();
    this.history.remove(conv.id);
    this.conversations = this.history.list();
    if (conv.id === this.conversationId) this.startNew(false);
  }

  labelFor(ts: number): string {
    return this.history.labelFor(ts);
  }

  /** N'enregistre que les echanges reels, pas un accueil laisse tel quel. */
  private persist() {
    if (!this.hasConversation) return;
    const first = this.messages.find(m => m.isUser);
    const existing = this.history.get(this.conversationId);
    const now = Date.now();
    this.history.save({
      id: this.conversationId,
      title: this.history.titleFrom(first?.text ?? ''),
      createdAt: existing?.createdAt ?? now,
      updatedAt: now,
      messages: this.messages
    });
    this.conversations = this.history.list();
  }

  // ---------------- Envoi ----------------

  useSuggestion(text: string) {
    this.userInput = text;
    this.sendMessage();
  }

  sendMessage() {
    const text = this.userInput.trim();
    if (!text || this.isLoading) return;

    this.messages.push({ text, isUser: true, time: Chatbot.now() });
    this.userInput = '';
    this.isLoading = true;
    this.persist();
    this.scrollToBottom();

    this.chatService.sendMessage(text).subscribe({
      next: (res) => {
        this.messages.push({ text: res.response, isUser: false, time: Chatbot.now() });
        this.isLoading = false;
        this.persist();
        this.scrollToBottom();
      },
      error: () => {
        this.messages.push({
          text: "La connexion à l'assistant a échoué. Réessayez dans un instant.",
          isUser: false,
          time: Chatbot.now()
        });
        this.isLoading = false;
        this.persist();
        this.scrollToBottom();
      }
    });
  }

  private scrollToBottom() {
    setTimeout(() => {
      const el = this.scrollContainer?.nativeElement;
      if (el) el.scrollTop = el.scrollHeight;
    }, 40);
  }
}
