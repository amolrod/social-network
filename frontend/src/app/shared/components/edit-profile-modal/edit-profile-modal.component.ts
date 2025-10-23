import { Component, OnInit, inject, signal, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { UserService } from '../../../core/services/user.service';
import { AuthService } from '../../../core/services/auth.service';
import { UploadService } from '../../../core/services/upload.service';
import { User, UpdateProfileDto } from '../../../core/models/user.model';

/**
 * Modal para editar el perfil del usuario
 */
@Component({
  selector: 'app-edit-profile-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './edit-profile-modal.component.html',
  styleUrls: ['./edit-profile-modal.component.scss']
})
export class EditProfileModalComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly userService = inject(UserService);
  private readonly authService = inject(AuthService);
  private readonly uploadService = inject(UploadService);

  // Outputs
  readonly closeModal = output<void>();
  readonly profileUpdated = output<User>();

  // Signals
  readonly isOpen = signal(true);
  readonly isLoading = signal(false);
  readonly currentUser = this.authService.currentUser;
  readonly avatarPreview = signal<string | null>(null);
  readonly coverPreview = signal<string | null>(null);
  readonly error = signal<string | null>(null);

  profileForm!: FormGroup;
  selectedAvatarFile: File | null = null;
  selectedCoverFile: File | null = null;

  ngOnInit(): void {
    this.initForm();
    this.loadCurrentUserData();
  }

  private initForm(): void {
    this.profileForm = this.fb.group({
      fullName: ['', [Validators.maxLength(100)]],
      bio: ['', [Validators.maxLength(500)]],
      location: ['', [Validators.maxLength(100)]],
      website: ['', [Validators.maxLength(200)]],
      isPrivate: [false]
    });
  }

  private loadCurrentUserData(): void {
    const user = this.currentUser();
    if (user) {
      this.profileForm.patchValue({
        fullName: user.fullName || '',
        bio: user.bio || '',
        location: (user as any).location || '',
        website: (user as any).website || '',
        isPrivate: user.isPrivate || false
      });
      
      // DESHABILITADO: Carga de imágenes de perfil
      // if (user.avatarUrl) {
      //   this.avatarPreview.set(user.avatarUrl);
      // }
      // if (user.coverUrl) {
      //   this.coverPreview.set(user.coverUrl);
      // }
    }
  }

  // FUNCIONES DE IMÁGENES DESHABILITADAS TEMPORALMENTE
  /*
  async onAvatarSelected(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    
    if (!file) return;

    // Validaciones
    if (!this.uploadService.isValidImage(file)) {
      this.error.set('Por favor selecciona una imagen válida (JPG, PNG, GIF, WEBP)');
      return;
    }

    if (!this.uploadService.isValidSize(file, 5)) {
      this.error.set('La imagen no debe superar los 5MB');
      return;
    }

    this.error.set(null);
    this.selectedAvatarFile = file;
    
    // Preview
    const preview = await this.uploadService.fileToBase64(file);
    this.avatarPreview.set(preview);
  }

  async onCoverSelected(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    
    if (!file) return;

    // Validaciones
    if (!this.uploadService.isValidImage(file)) {
      this.error.set('Por favor selecciona una imagen válida (JPG, PNG, GIF, WEBP)');
      return;
    }

    if (!this.uploadService.isValidSize(file, 10)) {
      this.error.set('La imagen no debe superar los 10MB');
      return;
    }

    this.error.set(null);
    this.selectedCoverFile = file;
    
    // Preview
    const preview = await this.uploadService.fileToBase64(file);
    this.coverPreview.set(preview);
  }

  removeAvatar(): void {
    this.selectedAvatarFile = null;
    this.avatarPreview.set(null);
  }

  removeCover(): void {
    this.selectedCoverFile = null;
    this.coverPreview.set(null);
  }
  */

  async onSubmit(): Promise<void> {
    if (this.profileForm.invalid || this.isLoading()) {
      return;
    }

    this.isLoading.set(true);
    this.error.set(null);

    try {
      const formData: UpdateProfileDto = {
        fullName: this.profileForm.value.fullName || undefined,
        bio: this.profileForm.value.bio || undefined,
        location: this.profileForm.value.location || undefined,
        website: this.profileForm.value.website || undefined,
        isPrivate: this.profileForm.value.isPrivate
      };

      // Limpiar campos vacíos
      Object.keys(formData).forEach(key => {
        if (formData[key as keyof UpdateProfileDto] === '' || 
            formData[key as keyof UpdateProfileDto] === null) {
          delete formData[key as keyof UpdateProfileDto];
        }
      });

      console.log('📤 Enviando datos de perfil (sin imágenes):', formData);

      this.userService.updateMyProfile(formData).subscribe({
        next: (updatedUser) => {
          console.log('✅ Perfil actualizado:', updatedUser);
          
          // Actualizar el usuario en AuthService
          this.authService.getCurrentUser().subscribe({
            next: () => {
              this.profileUpdated.emit(updatedUser);
              this.close();
            },
            error: (err) => {
              console.error('Error al actualizar usuario en cache:', err);
              this.profileUpdated.emit(updatedUser);
              this.close();
            }
          });
        },
        error: (err) => {
          console.error('❌ Error al actualizar perfil:', err);
          this.error.set(err.error?.message || 'Error al actualizar el perfil');
          this.isLoading.set(false);
        }
      });
    } catch (err) {
      console.error('❌ Error inesperado:', err);
      this.error.set('Error inesperado. Por favor intenta nuevamente.');
      this.isLoading.set(false);
    }
  }

  close(): void {
    this.isOpen.set(false);
    // Pequeño delay para la animación de cierre
    setTimeout(() => {
      this.closeModal.emit();
    }, 200);
  }

  onBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.close();
    }
  }
}
