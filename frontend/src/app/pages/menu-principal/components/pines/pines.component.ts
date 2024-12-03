import { Component } from '@angular/core';
import { FormsModule, NgModel } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { FetchService } from '../../../../services/fetch.service';
import { MarcadorService } from '../../../edicion-marcador/services/marcador.service';

@Component({
  selector: 'app-pines',
  standalone: true,
  imports: [RouterLink, FormsModule],
  templateUrl: './pines.component.html',
  styleUrl: './pines.component.css',
})
export class PinesComponent {
  pinCompartir = '';
  pinEditar = '';

  constructor(
    private router: Router,
    private fetch: FetchService,
    private marService: MarcadorService
  ) {}

  async verMarcador() {
    const esValido = await this.fetch.verificarPinCompartir(this.pinCompartir);
    if (esValido) {
      this.router.navigate([`verMarcador/${this.pinCompartir}`]);
    } else {
      alert('PIN inválido o marcador no disponible.');
    }
  }

  async editarMarcador() {
    const esValido = await this.fetch.verificarPinEditar(this.pinEditar);
    if (esValido) {
      this.router.navigate([`edicionMarcador/${this.pinEditar}`], {
        queryParams: { menu: 'true' },
      });
    } else {
      alert('PIN inválido o marcador no disponible.');
    }
  }

  async crearMarcador() {
    this.pinEditar = this.marService.generarPin();
    this.router.navigate([`/edicionMarcador/${this.pinEditar}`]);
  }

  async crearTorneo(){
    this.router.navigate(['/torneo'])
  }
}
