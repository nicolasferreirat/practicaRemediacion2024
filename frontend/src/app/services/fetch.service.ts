import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class FetchService {
  urlBase = 'https://localhost/backend/';
  private token: string | null;

  loggedUser(): boolean {
    return !!this.token;
  }

  logout(): void {
    this.token = null;
    localStorage.removeItem('jwt');
  }

  setToken(token: string) {
    localStorage.setItem('jwt', token), (this.token = token);
  }

  getUserId(): number | null {
    if (this.token) {
      try {
        const payload = this.token.split('.')[1];

        const decodedPayload = JSON.parse(
          atob(payload.replace(/-/g, '+').replace(/_/g, '/'))
        );

        return decodedPayload.id || null;
      } catch (error) {
        console.error('Error al decodificar el token manualmente:', error);
        return null;
      }
    }
    console.log('no token');
    return null;
  }

  getUserName(): string | null {
    if (this.token) {
      try {
        const payload = this.token.split('.')[1];

        const decodedPayload = JSON.parse(
          atob(payload.replace(/-/g, '+').replace(/_/g, '/'))
        );

        return decodedPayload.nombre_usuario || null;
      } catch (error) {
        console.error('Error al decodificar el token manualmente:', error);
        return null;
      }
    }
    return null;
  }

  async getUserImage(userId: number): Promise<string | null> {
    const response = await this.get(`usuarioImagen/${userId}`);
    return response.imagen ? `${response.imagen}` : null;
  }

  async verificarPinCompartir(pin: string): Promise<boolean> {
    try {
      const response = await this.get(`marcador/verificar-pinC/${pin}`);
      return response.valido;
    } catch (error) {
      console.error('Error al verificar el PIN:', error);
      return false;
    }
  }

  async verificarPinEditar(pin: string): Promise<boolean> {
    try {
      const response = await this.get(`marcador/verificar-pinE/${pin}`);
      return response.valido;
    } catch (error) {
      console.error('Error al verificar el PIN:', error);
      return false;
    }
  }

  private getHeaders(): HeadersInit {
    if (!this.token) {
      // Intenta cargar el token desde localStorage si no está definido en la instancia
      this.token = localStorage.getItem('jwt') || null;
    }
    if (this.token) {
      return {
        Authorization: `Bearer ${this.token}`,
        'Content-Type': 'application/json',
      };
    } else {
      return {
        'Content-Type': 'application/json',
      };
    }
  }

  ///////////////////////////GET///////////////////////////
  async get<T = any>(url: string): Promise<T> {
    try {
      const response = await fetch(`${this.urlBase}${url}`, {
        method: 'GET',
        headers: this.getHeaders(),
      });
      const data = await response.json();
      if (response.ok) {
        return data;
      } else {
        console.error('Error en la respuesta del servidor:', data);
        throw new Error(data);
      }
    } catch (error) {
      throw error;
    }
  }

  ///////////////////////////POST///////////////////////////
  async post<T = any>(url: string, body: string): Promise<T> {
    try {
      const response = await fetch(`${this.urlBase}${url}`, {
        method: 'POST',
        body: body,
        headers: this.getHeaders(),
      });
      // Parsear el cuerpo de la respuesta como JSON
      const data = await response.json();
      if (response.ok) {
        return data;
      } else {
        const error: any = new Error(
          data.error || response.statusText || 'Error en la solicitud'
        );
        error.status = response.status;
        throw error;
      }
    } catch (error) {
      throw error;
    }
  }

  ///////////////////////////PUT///////////////////////////
  async put<T = any>(url: string, body: string): Promise<T> {
    try {
      const response = await fetch(`${this.urlBase}${url}`, {
        method: 'PUT',
        body: body,
        headers: this.getHeaders(),
      });
      const data = await response.json();
      if (response.ok) {
        return data;
      } else {
        throw new Error(data);
      }
    } catch (error) {
      throw error;
    }
  }

  ///////////////////////////DELETE///////////////////////////
  async delete<T = any>(url: string): Promise<T> {
    try {
      const response = await fetch(`${this.urlBase}${url}`, {
        method: 'DELETE',
        headers: this.getHeaders(),
      });
      const data = await response.json();
      if (response.ok) {
        return data;
      } else {
        throw new Error(data);
      }
    } catch (error) {
      throw error;
    }
  }
  constructor() {
    this.token = localStorage.getItem('jwt') || null;
  }
}
