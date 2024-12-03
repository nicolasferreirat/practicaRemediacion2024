import { Component, OnInit } from '@angular/core';
import { CommonModule, NgClass, NgIf } from '@angular/common';
import { ActivatedRoute } from '@angular/router';


@Component({
  standalone: true,
  imports: [NgIf, CommonModule, NgClass],
  selector: 'app-vista-marcador',
  templateUrl: './vista-marcador.component.html',
  styleUrl: './vista-marcador.component.css'
})
export class VistaMarcadorComponent implements OnInit {
  marcadorData: any;
  //string de saque
  saquea = "◉";
  saqueb = "";
  pin_compartir: string | null = null;

  marcador_finalizado = false;

  constructor(private ruta: ActivatedRoute){}

  ngOnInit(): void {
    // Obtener el parámetro 'pin_compartir' de la URL
    this.pin_compartir = this.ruta.snapshot.paramMap.get('pin_compartir');
    const socket = new WebSocket(`wss://localhost/backend/ws`);

    socket.onopen = () => {
      console.log("Conectado al servidor WebSocket");
      socket.send(this.pin_compartir!)
    };

    socket.onmessage = (event) => {
      this.marcadorData = JSON.parse(event.data)
      this.marcador_finalizado = this.marcadorData.marcador_finalizado
      const puntosElementoA = document.querySelector('.puntosA');
      const puntosElementoB = document.querySelector('.puntosB');
      if (((this.marcadorData.puntosA === 40) && (this.marcadorData.puntosB === 40)) && (!this.marcadorData.ventaja)){
        if ((puntosElementoA)&&(puntosElementoB)) {
          puntosElementoA.classList.add('oro');
          puntosElementoB.classList.add('oro');
        }
      } else {
        if ((puntosElementoA)&&(puntosElementoB)) {
          puntosElementoA.classList.remove('oro');
          puntosElementoB.classList.remove('oro');
        }
      }
    };
  }
    
}