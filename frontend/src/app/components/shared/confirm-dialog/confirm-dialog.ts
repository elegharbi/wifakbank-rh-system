import { Component, EventEmitter, Input, Output, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * Boite de dialogue de confirmation, en remplacement de `confirm()`.
 * Le navigateur affiche sinon une fenetre systeme non stylable.
 */
@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './confirm-dialog.html',
  styleUrl: './confirm-dialog.css'
})
export class ConfirmDialog {
  @Input() open = false;
  @Input() title = 'Confirmer';
  @Input() message = '';
  @Input() detail = '';
  @Input() confirmLabel = 'Confirmer';
  @Input() cancelLabel = 'Annuler';
  @Input() icon = 'fa-circle-question';
  /** 'danger' pour une action irreversible (suppression). */
  @Input() tone: 'default' | 'danger' = 'default';

  @Output() confirmed = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();

  @HostListener('document:keydown.escape')
  onEscape() {
    if (this.open) this.cancel();
  }

  confirm() { this.confirmed.emit(); }
  cancel()  { this.cancelled.emit(); }
}
