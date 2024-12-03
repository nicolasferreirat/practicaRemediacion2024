import { Component, inject } from '@angular/core';
import { DatosUsuarioComponent } from './components/datos-usuario/datos-usuario.component';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-ver-usuario',
  standalone: true,
  imports: [DatosUsuarioComponent],
  templateUrl: './ver-usuario.page.html',
  styleUrl: './ver-usuario.page.css'
})
export class VerUsuarioPage {
  authService: AuthService = inject(AuthService);
  router: Router = inject(Router);
}
