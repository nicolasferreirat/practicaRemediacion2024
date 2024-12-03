import { Component, OnInit } from '@angular/core';
import { FetchService } from '../../services/fetch.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HistorialComponent } from './components/historial/historial.component';
import { HistorialAmericanoComponent } from './components/historial-americano/historial-americano.component';

@Component({
  standalone: true,
  imports: [
    HistorialComponent,
    CommonModule,
    FormsModule,
    HistorialAmericanoComponent,
  ],
  selector: 'app-historial-page',
  templateUrl: './historial.page.html',
  styleUrl: './historial.page.css',
})
export class HistorialPage implements OnInit {
  partidos: any[] = [];
  americanos: any[] = [];
  totalPartidos: number = 0;
  totalAmericanos: number = 0;
  currentPage: number = 1;
  limit: number = 10;
  filtros = {
    club: '',
    jugador: '',
    fechaInicio: '',
    fechaFin: '',
    descripcionTorneo: '',
  };
  mostrarPartidos: boolean = true;

  constructor(private fetch: FetchService) {}

  ngOnInit() {
    this.cargarHistorialConFiltros();
  }

  async cargarHistorialConFiltros(page: number = this.currentPage) {
    if (this.mostrarPartidos) {
      await this.cargarHistorial(page);
    } else {
      await this.cargarHistorialAmericanos(page);
    }
  }

  async cargarHistorial(page: number = this.currentPage) {
    try {
      const queryParams = this.buildQueryParams();

      queryParams.append('page', page.toString());
      queryParams.append('limit', this.limit.toString());

      const response = await this.fetch.get<any>(
        `partidosHistorial/ssf?${queryParams.toString()}`
      );
      this.partidos = response.partidos;
      this.totalPartidos = response.total;
      console.log('total partidos historial: ', this.totalPartidos);
      this.currentPage = page;
    } catch (error) {
      console.error('Error al cargar el historial de partidos:', error);
    }
  }

  async cargarHistorialAmericanos(page: number = this.currentPage) {
    try {
      const queryParams = this.buildQueryParams();
      queryParams.append('page', page.toString());
      queryParams.append('limit', this.limit.toString());

      const response = await this.fetch.get<any>(
        `americanos/americanosSSF?${queryParams.toString()}`
      );
      this.americanos = response.americanos;
      this.totalAmericanos = response.total;
      console.log('total americanos: ', this.totalAmericanos);
      console.log(this.americanos);
      this.currentPage = page;
    } catch (error) {
      console.error(
        'Error al cargar el historial de torneos americanos:',
        error
      );
    }
  }

  buildQueryParams() {
    const queryParams = new URLSearchParams();

    if (this.filtros.club) queryParams.append('club', this.filtros.club);
    if (this.filtros.jugador)
      queryParams.append('jugador', this.filtros.jugador);
    if (this.filtros.fechaInicio)
      queryParams.append('fechaInicio', this.filtros.fechaInicio);
    if (this.filtros.fechaFin)
      queryParams.append('fechaFin', this.filtros.fechaFin);
    if (this.filtros.descripcionTorneo)
      queryParams.append('descripcionTorneo', this.filtros.descripcionTorneo);

    return queryParams;
  }

  cambiarHistorial(tipo: string) {
    this.mostrarPartidos = tipo === 'partidos';
    this.cargarHistorialConFiltros();
  }
}
