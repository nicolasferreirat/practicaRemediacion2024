import { Component } from '@angular/core';
import { PasswordFormComponent } from './components/password-form/password-form.component';

@Component({
  selector: 'app-editar-password',
  standalone: true,
  imports: [PasswordFormComponent],
  templateUrl: './editar-password.page.html',
  styleUrl: './editar-password.page.css'
})
export class EditarPasswordPage {

}
