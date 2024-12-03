import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { UsuarioService } from '../../../../services/usuario.service';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-password-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './password-form.component.html',
  styleUrl: './password-form.component.css'
})
export class PasswordFormComponent implements OnInit {
  passwordActualVisible: boolean = false;
  passwordNuevaVisible: boolean = false;
  passwordNuevaRepVisible: boolean = false;
  passwordForm!: FormGroup;
  errorBotonRegistro: string = '';

  constructor(private usuarioService: UsuarioService, private router: Router) {}

  ngOnInit(): void {
    this.passwordForm = new FormGroup({
      actualPassword: new FormControl('', [Validators.required]),
      newPassword: new FormControl('', [
        Validators.required,
        Validators.minLength(8),
        Validators.maxLength(12),
        this.passwordValidator()
      ]),
      repetirPassword: new FormControl('', [Validators.required])
    }, { validators: this.passwordsIguales() });
  }
  passwordValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;

      if (!value) {
        return null;
      }

      const hasUpperCase = /[A-Z]/.test(value);
      const hasLowerCase = /[a-z]/.test(value);
      const hasNumeric = /[0-9]/.test(value);
      const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(value);
      const isValidLength = value.length >= 8 && value.length <= 12;

      const passwordValid = hasUpperCase && hasLowerCase && hasNumeric && hasSpecialChar && isValidLength;

      return !passwordValid ? { passwordStrength: true } : null;
    };
  }

  passwordsIguales(): ValidatorFn {
    return (group: AbstractControl): ValidationErrors | null => {
      const newPassword = group.get('newPassword')?.value || '';
      const repetirPassword = group.get('repetirPassword')?.value || '';
      return newPassword === repetirPassword ? null : { noCoinciden: true };
    };
  }

  async onSubmit() {
    if (this.passwordForm.invalid) {
      this.errorBotonRegistro = 'El formulario tiene errores.';
      return;
    }

    const actualPassword = this.passwordForm.get('actualPassword')?.value;
    const newPassword = this.passwordForm.get('newPassword')?.value;

    if (actualPassword === newPassword) {
      this.errorBotonRegistro = 'La nueva contraseña no puede ser igual a la contraseña actual.';
      return;
    }

    // Validar la contraseña actual
    try {
      const response = this.usuarioService.validarPassword(actualPassword)
      console.log('Validación de contraseña exitosa:', response);

      // Si la validación es exitosa, realizar la solicitud de cambio de contraseña
      const updateResponse = await this.usuarioService.cambiarPassword(actualPassword,newPassword);

      console.log('Contraseña actualizada:', updateResponse);
      this.errorBotonRegistro = 'Se ha actualizado la contraseña correctamente';
      setTimeout(() => {
        this.router.navigate(['/verUsuario']);
      }, 1500);
    } catch (error) {
      console.error('Error al validar o actualizar la contraseña:', error);
      this.errorBotonRegistro = 'Error al validar o actualizar la contraseña.';
    }
  }

  togglePasswordActualVisibility() {
    this.passwordActualVisible = !this.passwordActualVisible;
  }
  togglePasswordNuevaVisibility() {
    this.passwordNuevaVisible = !this.passwordNuevaVisible;
  }
  togglePasswordNuevaRepVisibility() {
    this.passwordNuevaRepVisible = !this.passwordNuevaRepVisible;
  }
}
