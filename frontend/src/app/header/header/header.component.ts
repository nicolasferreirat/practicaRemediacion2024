import { Component, inject } from '@angular/core';
import { FetchService } from '../../services/fetch.service';
import { AuthService } from '../../services/auth.service';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { NgIf } from '@angular/common';
import { Router, RouterLink, RouterModule } from '@angular/router';
import { UsuarioService } from '../../services/usuario.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [NgIf, MatToolbarModule, MatButtonModule, RouterModule, RouterLink],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
})
export class HeaderComponent {
  authService: AuthService = inject(AuthService);
  fetchService: FetchService = inject(FetchService);
  router: Router = inject(Router);
  
  logueado = this.authService.isLoggedIn;
  userName = this.authService.userName;
  userImage = this.authService.userImage;
  userId = this.authService.userId;

  logout(): void {
    this.fetchService.logout();
    this.authService.logout();
    this.router.navigate(['/']);
  }
}
