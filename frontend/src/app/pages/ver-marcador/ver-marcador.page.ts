import { Component } from '@angular/core';
import { VistaMarcadorComponent } from './components/vista-marcador/vista-marcador.component';

@Component({
  selector: 'app-ver-marcador',
  standalone: true,
  imports: [VistaMarcadorComponent],
  templateUrl: './ver-marcador.page.html',
  styleUrl: './ver-marcador.page.css'
})
export class VerMarcadorPage {

}
