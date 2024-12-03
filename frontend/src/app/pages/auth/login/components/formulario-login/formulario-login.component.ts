import { Component, inject } from '@angular/core';
import { FetchService } from '../../../../../services/fetch.service';
import { Router } from '@angular/router';
import { FormsModule, NgForm } from '@angular/forms';
import { NgClass, NgIf } from '@angular/common';
import { AuthService } from '../../../../../services/auth.service';

@Component({
  selector: 'app-formulario-login',
  standalone: true,
  imports: [FormsModule, NgIf, NgClass],
  templateUrl: './formulario-login.component.html',
  styleUrls: ['./formulario-login.component.css'],
})
export class FormularioLoginComponent {
  passwordVisible = false;

  private fetchService: FetchService = inject(FetchService);
  private authService: AuthService = inject(AuthService);
  private router: Router = inject(Router);

  credenciales = {
    nombre_usuario: '',
    password: '',
  };
  errorMessage: string = '';

  async onLogin() {
    try {
      const response = await this.fetchService.post(
        'auth/login',
        JSON.stringify(this.credenciales)
      );
      this.fetchService.setToken(response.token);
      this.authService.setLoginState(true);
      this.router.navigate(['/menuPrincipal']);
    } catch (error: any) {
      console.error('Error de autenticación:', error);
      if (error.status === 401 || error.status === 404) {
        this.errorMessage = 'Las credenciales son incorrectas.';
      } else if (error instanceof Error) {
        this.errorMessage =
          'Hubo un problema con la autenticación. Por favor, intenta de nuevo.';
      } else {
        this.errorMessage =
          'Hubo un problema inesperado. Por favor, intenta de nuevo.';
      }
    }
  }

  loginWithGoogle() {
    window.location.href = 'https://localhost/backend/auth/login/google';
    //this.router.navigate(['/auth/login/google']);
  }

  onRegister() {
    this.router.navigate(['/registro']);
  }

  navigateToAboutUs() {
    this.router.navigate(['/sobre-nosotros']);
  }

  togglePasswordVisibility() {
    this.passwordVisible = !this.passwordVisible;
  }
}
