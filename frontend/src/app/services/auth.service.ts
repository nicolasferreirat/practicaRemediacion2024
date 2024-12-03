import { Injectable, signal, computed, inject } from '@angular/core';
import { FetchService } from './fetch.service';
import { ImagenService } from './imagen.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  fetchService: FetchService = inject(FetchService);
  imagenService: ImagenService = inject(ImagenService);

  private isLoggedInSignal = signal(false);
  private userNameSignal = signal<string | null>(null);
  private userImageSignal = signal<string | null>(null);
  private userIdSignal = signal<number | null>(null);

  readonly isLoggedIn = computed(() => this.isLoggedInSignal());
  readonly userName = computed(() => this.userNameSignal());
  readonly userImage = computed(() => this.userImageSignal());
  readonly userId = computed(() => this.userIdSignal());

  constructor() {
    this.iniciarAuthState();
  }

  // Método para inicializar el estado de autenticación al cargar la aplicación
  private async iniciarAuthState(): Promise<void> {
    const token = localStorage.getItem('jwt');
    if (token) {
      const isValid = await this.validarToken(token);
      this.setLoginState(isValid);
    }
  }

  async isAuthenticated(): Promise<boolean> {
    const token = localStorage.getItem('jwt');
    if (!token) return false;
    return await this.validarToken(token);
  }

  setLoginState(isLoggedIn: boolean): void {
    this.isLoggedInSignal.set(isLoggedIn);

    if (isLoggedIn) {
      const userName = this.fetchService.getUserName();
      const userId = this.fetchService.getUserId();

      this.userNameSignal.set(userName);
      this.userIdSignal.set(userId);

      if (userId) {
        this.fetchService.getUserImage(userId).then((image) => {
          if (image) {
            let base64StringWithPrefix = image;
            const base64String = base64StringWithPrefix.replace(
              /^dataimage\/jpegbase64/,
              ''
            );
            this.userImageSignal.set(
              this.imagenService.convertBase64ToBlob(base64String, 'image/jpeg')
            );
          }
        });
      }
    } else {
      this.userNameSignal.set(null);
      this.userImageSignal.set(null);
    }
  }

  actualizarToken(nuevoToken: string) {
    localStorage.setItem('jwt', nuevoToken);
  }

  async validarToken(token: string): Promise<boolean> {
    try {
      const response = await this.fetchService.post<{ valid: boolean }>(
        '/auth/login/google/validarToken',
        JSON.stringify({ token })
      );

      if (response.valid) {
        this.actualizarToken(token);
        this.setLoginState(true);
        return true;
      } else {
        console.error('Token no válido.');
        return false;
      }
    } catch (error) {
      console.error('Error al validar el token:', error);
      return false;
    }
  }

  logout(): void {
    this.setLoginState(false);
    localStorage.removeItem('jwt');
  }
}
