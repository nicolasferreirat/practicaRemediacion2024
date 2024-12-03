import { Component } from '@angular/core';
import { PinesComponent } from './components/pines/pines.component';

@Component({
  selector: 'app-menu-principal',
  standalone: true,
  imports: [PinesComponent],
  templateUrl: './menu-principal.page.html',
  styleUrl: './menu-principal.page.css'
})
export class MenuPrincipalPage {

}
