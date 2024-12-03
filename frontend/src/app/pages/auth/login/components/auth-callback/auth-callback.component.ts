import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../../../../services/auth.service';
import { firstValueFrom } from 'rxjs';
import { FetchService } from '../../../../../services/fetch.service';

@Component({
  selector: 'app-auth-callback',
  standalone: true,
  imports: [],
  templateUrl: './auth-callback.component.html',
  styleUrl: './auth-callback.component.css',
})
export class AuthCallbackComponent implements OnInit {
  route: ActivatedRoute = inject(ActivatedRoute);
  router: Router = inject(Router);
  authService: AuthService = inject(AuthService);
  fetchService: FetchService = inject(FetchService);

  async ngOnInit(): Promise<void> {
    try {
      const params = await firstValueFrom(this.route.queryParams);
      console.log('Full query params:', params);
      const token = params['token'];
      console.log('Token recibido:', token);
      this.fetchService.setToken(token);

      if (token) {
        const isValid = await this.authService.validarToken(token);
        console.log('getuserid: ', this.fetchService.getUserId());

        if (isValid) {
            this.router.navigate(['/menuPrincipal']);
        } else {
          console.error('Token inválido, redirigiendo a login.');
          this.router.navigate(['/auth/login']);
        }
      } else {
        console.error('No se recibió ningún token.');
        this.router.navigate(['/auth/login']);
      }
    } catch (error) {
      console.error('Error en el proceso de autenticación:', error);
      this.router.navigate(['/auth/login']);
    }
  }
}
