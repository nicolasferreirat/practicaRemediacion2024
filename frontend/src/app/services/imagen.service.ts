import { Injectable } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { FetchService } from './fetch.service';

@Injectable({
  providedIn: 'root'
})
export class ImagenService {

  constructor(private sanitizer: DomSanitizer, private fetch: FetchService) { }

  extraerBase64 = async ($event: any): Promise<{ base: string | null }> => {
    return new Promise((resolve) => {
      try {
        const unsafeImg = window.URL.createObjectURL($event);
        const image = this.sanitizer.bypassSecurityTrustUrl(unsafeImg);
        const reader = new FileReader();

        reader.readAsDataURL($event);
        reader.onload = () => {
          resolve({
            base: reader.result as string,
          });
        };

        reader.onerror = () => {
          resolve({
            base: null,
          });
        };
      } catch (e) {
        resolve({
          base: null,
        });
      }
    });
  };

  async obtenerImagenBase64DesdeURL(url: string): Promise<string | null> {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const resultado = await this.extraerBase64(blob);
      return resultado.base; // Extrae el valor de 'base' del objeto
    } catch (error) {
      console.error('Error al obtener imagen desde URL:', error);
      return null;
    }
  }

  convertBase64ToBlob(base64String: string, contentType: string): string {
    // Convertir base64 a binario
    const byteCharacters = atob(base64String);
    const byteNumbers = new Array(byteCharacters.length);
  
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
  
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: contentType });
    
    // Crear URL para el blob
    return URL.createObjectURL(blob);
  }
}
