import { inject, Injectable } from '@angular/core';
import { FetchService } from '../../../services/fetch.service';

@Injectable({
  providedIn: 'root',
})
export class TorneoService {
  constructor(private fetch: FetchService) {}

  private urlBase = 'americanos'; // el post creado en el fetchService ya tiene la urlbase: https://localhost/backend/

  async crearTorneoAmericano(data: {
    descripcion_torneo: string;
    jugador1: string;
    jugador2: string;
    jugador3: string;
    jugador4: string;
    jugador5: string;
    jugador6: string;
    jugador7: string;
    jugador8: string;
  }): Promise<{ mensaje: string; id_americano: number }> {
    const body = JSON.stringify(data);
    const response = await this.fetch.post<{
      mensaje: string;
      id_americano: number;
    }>(this.urlBase, body);

    if (response && response.id_americano !== undefined) {
      return response;
    } else {
      throw new Error('Error al obtener el id_americano');
    }
  }

  async actualizarPuntos(
    id: string,
    puntos: {
      puntosJ1: number;
      puntosJ2: number;
      puntosJ3: number;
      puntosJ4: number;
      puntosJ5: number;
      puntosJ6: number;
      puntosJ7: number;
      puntosJ8: number;
      numeroRonda: number;
    }
  ): Promise<{ mensaje: string }> {
    const body = JSON.stringify(puntos);
    return this.fetch.put<{ mensaje: string }>(
      `${this.urlBase}/rondas/${id}`,
      body
    );
  }

  async finalizarTorneo(
    id: string,
    data: {
      descripcion_torneo: string;
      jugador1: string;
      jugador2: string;
      jugador3: string;
      jugador4: string;
      jugador5: string;
      jugador6: string;
      jugador7: string;
      jugador8: string;
      puesto1: string;
      puntos1: number;
      puesto2: string;
      puntos2: number;
      puesto3: string;
      puntos3: number;
    }
  ): Promise<{ mensaje: string }> {
    const body = JSON.stringify(data);
    return this.fetch.put<{ mensaje: string }>(`${this.urlBase}/${id}`, body);
  }
}
