import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class WebSocketService {
  private socket: WebSocket | null = null;

  connect(pin: string): void {
    // Conectar al servidor de WebSocket
    this.socket = new WebSocket(`ws://localhost:3000/ws/${pin}`);

    this.socket.onopen = () => {
      console.log('Conexión de WebSocket establecida');
    };

    this.socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log('Mensaje recibido:', data);
    };

    this.socket.onclose = () => {
      console.log('Conexión de WebSocket cerrada');
      this.socket = null;
    };

    this.socket.onerror = (error) => {
      console.error('Error en la conexión de WebSocket:', error);
    };
  }

  sendMessage(message: any): void {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(message));
    } else {
      console.error('La conexión de WebSocket no está abierta');
    }
  }

  close(): void {
    if (this.socket) {
      this.socket.close();
    }
  }
}