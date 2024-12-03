import { Injectable } from '@angular/core';
import { FetchService } from '../../../services/fetch.service';

@Injectable({
  providedIn: 'root',
})
export class MarcadorService {
  private marcadorUrl = 'marcador'; 
  private clubesUrl = 'clubes'; 
  private setUrl = 'set';

  constructor(private fetchService: FetchService) {}

  obtenerUserId(){
    return this.fetchService.getUserId()
  }
  // Crear un marcador
  async crearMarcador(data: any): Promise<any> {
    return this.fetchService.post(`${this.marcadorUrl}`, JSON.stringify(data));
  }

  // Actualizar un marcador (en cada punto y al finalizar el partido)
  async actualizarMarcador(pin_editar: number, data: any): Promise<any> {
    return this.fetchService.put(`${this.marcadorUrl}/${pin_editar}`, JSON.stringify(data));
  }

  async iniciarMarcador(pin_editar: number, data: any) {
    this.fetchService.put(`${this.marcadorUrl}/iniciar/${pin_editar}`, JSON.stringify(data));
  }

  async finalizarMarcador(pin_editar: number, data: any): Promise<any> {
    return this.fetchService.put(`${this.marcadorUrl}/finalizar/${pin_editar}`, JSON.stringify(data));
  }

  // Obtener clubes para el selector
  async obtenerClubes(): Promise<any[]> {
    const clubes = await this.fetchService.get<any[]>(`${this.clubesUrl}`);
    return clubes
  }

  // Obtener marcador por ID
  async obtenerMarcador(pin_editar: number): Promise<any> {
    return this.fetchService.get<any>(`${this.marcadorUrl}/${pin_editar}`);
  }


  
  async agregarAlHistorial(historialData: { id_marcador: number; id_club: number; fecha_registro: string }): Promise<any> {
    const fechaRegistro = new Date().toISOString().slice(0, 19).replace('T', ' ');

    const historial = {
      id_marcador: historialData.id_marcador,
      id_club: historialData.id_club,
      fecha_registro: fechaRegistro,
    };
    console.log(historial)
    try {
      // Insertar en el historial de todos los partidos
      await this.fetchService.post(`partidosHistorial/`, JSON.stringify(historial));
      console.log("Se agrego partido al historial")
      console.log("Marcador agregado al historial");
    } catch (error) {
      console.error("Error al agregar marcador al historial:", error);
    }
  }

  async crearSet(data: any): Promise<any>{
    return this.fetchService.post(`${this.setUrl}`, JSON.stringify(data));
  }

  // Generar un PIN de 4 dígitos para el marcador
  generarPin(): string {
    return Math.floor(1000 + Math.random() * 9000).toString();
  }
}
