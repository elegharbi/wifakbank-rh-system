import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { UserService, User } from '../../../services/user';
import { PerformanceService, PointLog } from '../../../services/performance.service';
import { EmployeeService, Employee } from '../../../services/employee';
import { LeaveService } from '../../../services/leave';
import { EventService } from '../../../services/event';
import { AvatarService } from '../../../services/avatar.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile.html',
  styleUrl: './profile.css'
})
export class Profile implements OnInit {
  private userService = inject(UserService);
  private performanceService = inject(PerformanceService);
  private employeeService = inject(EmployeeService);
  private leaveService = inject(LeaveService);
  private eventService = inject(EventService);
  private avatarService = inject(AvatarService);
  private router = inject(Router);
  
  user: User = {
    username: '',
    firstName: '',
    lastName: '',
    phone: '',
    profileImage: '',
    role: 'EMPLOYEE',
    passwordChanged: false
  };

  // Statistiques avec valeurs de fallback par défaut
  stats = {
    leavesBalance: 18,
    leavesPending: 2,
    upcomingEvents: 1,
    performanceScore: 1000,
    usedLeaves: 3 // Fallback par défaut de congés consommés
  };

  // Historique des points et leaderboard
  pointLogs: any[] = [];
  leaderboard: any[] = [];
  matchedEmployee: Employee | null = null;

  isEditing = false;
  originalUser: User | null = null;

  // ---- Photo de profil (stockage navigateur) ----
  // La colonne `profile_image` est un varchar(255) : une image encodee en base64
  // n'y tient pas. La photo importee est donc conservee dans ce navigateur,
  // tandis que le champ URL reste synchronise avec le serveur.
  avatarDataUrl: string | null = null;
  avatarError = '';
  isDraggingPhoto = false;
  private readonly AVATAR_MAX_BYTES = 5 * 1024 * 1024;
  private readonly AVATAR_PX = 320;

  passwordForm = {
    newPassword: '',
    confirmPassword: ''
  };
  passwordError = '';
  passwordSuccess = '';
  isChangingPassword = false;

  ngOnInit() {
    // 1. Récupérer l'utilisateur actuellement connecté
    this.userService.getMe().subscribe({
      next: (currentUser) => {
        if (currentUser) {
          this.user = currentUser;
          this.loadStoredAvatar();
          
          // 2. Charger les événements à venir (indépendamment de l'employé)
          this.loadEvents();

          // 3. Charger le leaderboard général
          this.loadLeaderboard();

          // 4. Récupérer la liste des employés pour trouver celui lié à cet utilisateur
          this.employeeService.getEmployees().subscribe({
            next: (employees) => {
              // Recherche par e-mail ou par id utilisateur lié
              const emp = employees.find(e => 
                (e.email && e.email === currentUser.email) || 
                (e.user && e.user.id === currentUser.id)
              );

              if (emp) {
                this.matchedEmployee = emp;
                
                // Mettre à jour le score de performance réel
                this.stats.performanceScore = emp.performanceScore ?? 1000;
                
                // Charger le véritable historique des points et congés
                if (emp.id) {
                  this.loadLogs(emp.id);
                  this.loadLeaves(emp.id);
                }
              } else {
                console.warn("Aucun profil Employee associé à cet utilisateur n'a été trouvé.");
              }
            },
            error: (err) => console.error('Erreur lors du chargement des employés :', err)
          });
        }
      },
      error: (err) => console.error('Erreur lors de la récupération de l\'utilisateur :', err)
    });
  }

  loadLeaderboard() {
    this.performanceService.getLeaderboard().subscribe({
      next: (data) => {
        this.leaderboard = data.slice(0, 5); // Top 5
      },
      error: (err) => console.error('Erreur lors du chargement du leaderboard :', err)
    });
  }

  loadLogs(employeeId: number) {
    this.performanceService.getEmployeeLogs(employeeId).subscribe({
      next: (logs: PointLog[]) => {
        this.pointLogs = logs;
      },
      error: (err) => console.error('Erreur lors du chargement de l\'historique des points :', err)
    });
  }

  loadLeaves(employeeId: number) {
    this.leaveService.getLeaves().subscribe({
      next: (leaves) => {
        // Filtrer les congés de cet employé spécifique
        const empLeaves = leaves.filter(l => l.employee && l.employee.id === employeeId);
        
        // Calculer les demandes en attente
        this.stats.leavesPending = empLeaves.filter(l => l.status === 'PENDING').length;
        
        // Calculer les congés approuvés pour déduire du solde de base (30 jours par défaut)
        const approvedLeaves = empLeaves.filter(l => l.status === 'APPROVED');
        const usedDays = approvedLeaves.reduce((sum, l) => {
          return sum + this.getDaysBetween(l.startDate, l.endDate);
        }, 0);
        
        // Mettre à jour les indicateurs
        this.stats.usedLeaves = usedDays;
        this.stats.leavesBalance = Math.max(0, 30 - usedDays);
      },
      error: (err) => console.error('Erreur lors du chargement des congés :', err)
    });
  }

  loadEvents() {
    this.eventService.getEvents().subscribe({
      next: (events) => {
        // Obtenir la date d'aujourd'hui sous format YYYY-MM-DD
        const todayStr = new Date().toISOString().split('T')[0];
        // Compter les événements programmés aujourd'hui ou dans le futur
        this.stats.upcomingEvents = events.filter(e => e.eventDate >= todayStr).length;
      },
      error: (err) => console.error('Erreur lors du chargement des événements :', err)
    });
  }

  getDaysBetween(startStr: string, endStr: string): number {
    if (!startStr || !endStr) return 0;
    const start = new Date(startStr);
    const end = new Date(endStr);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // inclusif
    return diffDays;
  }

  toggleEdit() {
    this.isEditing = true;
    this.originalUser = JSON.parse(JSON.stringify(this.user));
  }

  cancelEdit() {
    if (this.originalUser) {
      this.user = JSON.parse(JSON.stringify(this.originalUser));
    }
    this.isEditing = false;
  }

  saveProfile() {
    if (this.user.id !== undefined) {
      this.userService.update(this.user.id, this.user).subscribe({
        next: () => {
          alert('Profil mis à jour avec succès !');
          this.isEditing = false;
        },
        error: () => alert('Erreur lors de la mise à jour')
      });
    } else {
      alert('Erreur: ID utilisateur manquant');
    }
  }

  changePassword() {
    this.passwordError = '';
    this.passwordSuccess = '';

    if (this.passwordForm.newPassword !== this.passwordForm.confirmPassword) {
      this.passwordError = 'Les mots de passe ne correspondent pas.';
      return;
    }

    if (this.passwordForm.newPassword.length < 6) {
      this.passwordError = 'Le mot de passe doit contenir au moins 6 caractères.';
      return;
    }

    this.isChangingPassword = true;

    // Use fetch or httpclient to post to /api/auth/change-password
    // Because authService might not be injected, let's inject HttpClient at the top of the file if needed, or use fetch.
    const token = localStorage.getItem('token');
    
    fetch('/api/auth/change-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        newPassword: this.passwordForm.newPassword
      })
    })
    .then(res => {
      if (!res.ok) throw new Error('Erreur lors du changement de mot de passe');
      return res.text();
    })
    .then(data => {
      this.passwordSuccess = 'Mot de passe mis à jour avec succès.';
      this.passwordForm.newPassword = '';
      this.passwordForm.confirmPassword = '';
    })
    .catch(err => {
      this.passwordError = err.message;
    })
    .finally(() => {
      this.isChangingPassword = false;
    });
  }

  // ================= Photo de profil =================

  private loadStoredAvatar() {
    this.avatarService.reload();
    this.avatarDataUrl = this.avatarService.current;
  }

  /** Source affichee : photo importee, sinon URL enregistree, sinon initiales. */
  get avatarSrc(): string | null {
    return this.avatarDataUrl || this.user.profileImage || null;
  }

  get initials(): string {
    const a = this.user.firstName?.trim().charAt(0) || '';
    const b = this.user.lastName?.trim().charAt(0) || '';
    return ((a + b) || this.user.username?.charAt(0) || 'U').toUpperCase();
  }

  onPhotoDragOver(event: DragEvent) {
    event.preventDefault();
    this.isDraggingPhoto = true;
  }

  onPhotoDragLeave() {
    this.isDraggingPhoto = false;
  }

  onPhotoDrop(event: DragEvent) {
    event.preventDefault();
    this.isDraggingPhoto = false;
    const file = event.dataTransfer?.files?.[0];
    if (file) this.handlePhoto(file);
  }

  onPhotoSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) this.handlePhoto(file);
    input.value = '';
  }

  private handlePhoto(file: File) {
    this.avatarError = '';

    if (!file.type.startsWith('image/')) {
      this.avatarError = 'Choisissez un fichier image (JPG, PNG ou WebP).';
      return;
    }
    if (file.size > this.AVATAR_MAX_BYTES) {
      this.avatarError = 'Cette image depasse 5 Mo. Choisissez-en une plus legere.';
      return;
    }

    const reader = new FileReader();
    reader.onerror = () => { this.avatarError = 'La lecture du fichier a echoue. Reessayez.'; };
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => { this.avatarError = "Ce fichier n'est pas une image valide."; };
      img.onload = () => this.storeResized(img);
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  }

  /** Recadre au centre en carre puis reduit a 320 px : tient dans le stockage local. */
  private storeResized(img: HTMLImageElement) {
    const side = Math.min(img.width, img.height);
    const sx = (img.width - side) / 2;
    const sy = (img.height - side) / 2;

    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = this.AVATAR_PX;
    const ctx = canvas.getContext('2d');
    if (!ctx) { this.avatarError = "Le navigateur n'a pas pu preparer l'image."; return; }

    ctx.drawImage(img, sx, sy, side, side, 0, 0, this.AVATAR_PX, this.AVATAR_PX);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.85);

    if (this.avatarService.set(dataUrl)) {
      this.avatarDataUrl = dataUrl;
    } else {
      this.avatarError = "Le stockage du navigateur est plein. Liberez de l'espace et reessayez.";
    }
  }

  removePhoto() {
    this.avatarError = '';
    this.avatarDataUrl = null;
    this.avatarService.clear();
  }

  goToChangePassword() {
    this.router.navigate(['/change-password']);
  }
}
