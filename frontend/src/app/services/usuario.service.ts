import { Injectable } from '@angular/core';
import { FetchService } from './fetch.service';
import { AuthService } from './auth.service';
import { ImagenService } from './imagen.service';

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {
  constructor(private fetchService: FetchService, private authService: AuthService, private imagenService: ImagenService) {}

  validarNombreUsuario(nombreUsuario: string): Promise<any> {
    return this.fetchService.post('usuarios/validarNombreUsuario', JSON.stringify({ nombre_usuario: nombreUsuario }));
  }

  obtenerDatosUsuario(userId: number): Promise<any> {
    return this.fetchService.get(`usuarios/${userId}`); 
  }

  async obtenerImagen(userId: number): Promise<any>{
    return await this.fetchService.getUserImage(userId).then(image => {
      if (image) {
        let base64StringWithPrefix = image;
        const base64String = base64StringWithPrefix.replace(/^dataimage\/jpegbase64/, '');
        return this.imagenService.convertBase64ToBlob(base64String, 'image/jpeg');
      }
      return null;
    });
  }

  validarCorreo(mail: string): Promise<any> {
    return this.fetchService.post('usuarios/validarCorreo', JSON.stringify({ mail }));
  }

  validarPassword(password: string): Promise<any>{
    return this.fetchService.post(`usuarios/validarPassword`, JSON.stringify({ password }))
  }

  cambiarPassword(actualPassword: string, newPassword: string): Promise<any>{
    return this.fetchService.put(`usuarios/cambiarPassword`, JSON.stringify({actualPassword: actualPassword, nuevaPassword: newPassword}))
  }

  async subirImagen(id_usuario: number, imagen: string): Promise<any> {
    return this.fetchService.post(`usuarioImagen/${id_usuario}`, JSON.stringify({ imagen }));
  }
}
