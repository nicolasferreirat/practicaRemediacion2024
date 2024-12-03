import { Component } from '@angular/core';
import { FormularioLoginComponent } from './components/formulario-login/formulario-login.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormularioLoginComponent],
  templateUrl: './login.page.html',
  styleUrl: './login.page.css',
})
export class LoginPage {}
