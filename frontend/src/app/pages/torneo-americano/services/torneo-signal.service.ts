import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class TorneoSignalService {
  public torneoDataSignal = signal<any>(null);

  constructor() {
    const torneoGuardado = localStorage.getItem('torneoData');
    if (torneoGuardado) {
      this.torneoDataSignal.set(JSON.parse(torneoGuardado));
    }
  }

  actualizarTorneoData(data: any) {
    this.torneoDataSignal.set(data);
  }

  obtenerTorneoData() {
    return this.torneoDataSignal();
  }

  resetTorneoData() {
    this.torneoDataSignal.set({
      descripcion_torneo: '',
      resultados: {},
      nombre_jugador1: '',
      nombre_jugador2: '',
      nombre_jugador3: '',
      nombre_jugador4: '',
      nombre_jugador5: '',
      nombre_jugador6: '',
      nombre_jugador7: '',
      nombre_jugador8: '',
      editarTorneoVisible: true,
    });
  }
}
