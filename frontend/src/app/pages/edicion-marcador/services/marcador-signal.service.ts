import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class MarcadorSignalService {
  public marcadorDataSignal = signal<any>(null);

  constructor() {
    const marcadorGuardado = sessionStorage.getItem('marcadorData');
    if (marcadorGuardado) {
      this.marcadorDataSignal.set(JSON.parse(marcadorGuardado));
    }
  }

  actualizarMarcadorData(data: any) {
    this.marcadorDataSignal.set(data);
    //localStorage.setItem('marcadorData', JSON.stringify(data));
  }
}
