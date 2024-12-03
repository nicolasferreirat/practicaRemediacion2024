import { Component } from '@angular/core';
import { VerTorneoComponent } from './components/ver-torneo/ver-torneo.component';

@Component({
  selector: 'app-torneo-americano',
  standalone: true,
  imports: [VerTorneoComponent],
  templateUrl: './torneo-americano.page.html',
  styleUrl: './torneo-americano.page.css'
})
export class TorneoAmericanoPage {

}
