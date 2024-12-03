import { Component } from '@angular/core';
import { MarcadorComponent } from './components/marcador/marcador.component';

@Component({
  selector: 'app-edicion-marcador',
  standalone: true,
  imports: [MarcadorComponent],
  templateUrl: './edicion-marcador.page.html',
  styleUrl: './edicion-marcador.page.css'
})
export class EdicionMarcadorPage {

}
