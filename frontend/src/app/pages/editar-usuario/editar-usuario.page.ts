import { Component } from '@angular/core';
import { EditarFormularioComponent } from './components/editar-formulario/editar-formulario.component';

@Component({
  selector: 'app-editar-usuario',
  standalone: true,
  imports: [EditarFormularioComponent],
  templateUrl: './editar-usuario.page.html',
  styleUrl: './editar-usuario.page.css'
})
export class EditarUsuarioPage {

}
