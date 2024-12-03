import { Component, Input, OnInit, effect } from '@angular/core';
import { MarcadorService } from '../../services/marcador.service';
import { MarcadorSignalService } from '../../services/marcador-signal.service';
import { MarcadorEdicionComponent } from '../marcador-edicion/marcador-edicion.component';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';

@Component({
  standalone: true,
  imports: [MarcadorEdicionComponent, CommonModule, FormsModule],
  selector: 'app-marcador',
  templateUrl: './marcador.component.html',
  styleUrl: './marcador.component.css',
})
export class MarcadorComponent implements OnInit {
  pin_editar: string | null = null;
  marcador_finalizado: boolean = false;

  marcadorData: any = {
    puntosA: 0,
    puntosB: 0,
    set1A: 0,
    set2A: 0,
    set3A: 0,
    set1B: 0,
    set2B: 0,
    set3B: 0,
    pin_editar: null,
    pin_compartir: null,
    descripcion_competencia: '',
    nombre_pareja_A1: '',
    nombre_pareja_A2: '',
    nombre_pareja_B1: '',
    nombre_pareja_B2: '',
    duracion_partido: null,
    saquea: '◉',
    saqueb: '',
    //Boolean de si todavia estan en juego
    set1: true,
    set2: true,
    set3: true,

    //Boolean de ganador de set
    set1Awin: false,
    set1Bwin: false,
    set2Awin: false,
    set2Bwin: false,

    //Boolean si esta en tiebreak el set
    set1tie: false,
    set2tie: false,
    set3tie: false,

    botonInicioVisible: false,
    marcador_iniciado: false,
    marcador_finalizado: false,
    fecha_marcador: '',

    horas: 0,
    minutos: 0,
    segundos: 0,
  };

  marcadorVisible = false;

  socket!: WebSocket;
  socketEditar!: WebSocket;

  timerInterval: any;

  fromMenu = false;

  constructor(
    private router: Router,
    private marcadorService: MarcadorService,
    private marcadorSignal: MarcadorSignalService,
    private ruta: ActivatedRoute
  ) {
    effect(() => {
      this.marcadorData = this.marcadorSignal.marcadorDataSignal();
      this.marcadorVisible = this.marcadorData?.marcadorVisible;
      if (this.marcadorVisible && !this.fromMenu) {
        //Conectarse al webSocket
        this.socket = new WebSocket(`wss://localhost/backend/ws/`);
        this.socketEditar = new WebSocket(`wss://localhost/backend/ws/`); //Agregado para pin_editar

        this.socket.onopen = () => {
          console.log('Conectado al servidor WebSocket marcador');
          this.socket.send(this.marcadorData.pin_compartir);
          this.socket.send(JSON.stringify(this.marcadorData))
        };

        //Agregado para pin_editar
        this.socketEditar.onopen = () => {
          console.log('Conectado al servidor WebSocket marcador editar');
          this.socketEditar.send(this.marcadorData.pin_editar);
        };
      }
    });
    //Si viene desde el menu debe realizar la conexion de vuelta
    // Obtener el parámetro 'pin_editar' de la URL
    this.pin_editar = this.ruta.snapshot.paramMap.get('pin_editar');

    this.ruta.queryParams.subscribe(async (params) => {
      const menu = params['menu'];

      if (menu === 'true') {
        this.fromMenu = true
        //Conectarse al webSocket

        this.socketEditar = new WebSocket(`wss://localhost/backend/ws/`); //Agregado para pin_editar

        //Agregado para pin_editar
        this.socketEditar.onopen = () => {
          console.log('Conectado al servidor WebSocket marcador pineditar');
          if(this.pin_editar){
            this.socketEditar.send(this.pin_editar);
          }
          else{
            console.error('pin_editar es null')
          }
          
        };
        
        this.socketEditar.onmessage = (event) => {
          this.marcadorData = JSON.parse(event.data);
          this.marcador_finalizado = this.marcadorData.marcador_finalizado;
          sessionStorage.setItem('marcadorData', event.data);
          this.marcadorVisible = this.marcadorData?.marcadorVisible;
          console.log(this.marcadorData)
        };

        this.socket = new WebSocket(`wss://localhost/backend/ws/`);
        this.socket.onopen = () => {
          console.log('Conectado al servidor WebSocket pinmarcador');
          this.socket.send(this.marcadorData?.pin_compartir);
        };
      }
    });  
  }

  async ngOnInit() {
    // Cargar el estado del marcador desde sessionStorage al iniciar
    const marcadorGuardado = sessionStorage.getItem('marcadorData');
    if (marcadorGuardado) {
      this.marcadorSignal.marcadorDataSignal.set(JSON.parse(marcadorGuardado));
    }

    //Si no lo obtiene, que intente buscarlo en la bd (Si no finalizo deberia obtenerlo)
      if(!sessionStorage.getItem('marcadorData') && this.pin_editar && this.fromMenu){
      console.log('no hay marcador');
      const marcador = await this.marcadorService.obtenerMarcador(Number(this.pin_editar));
      console.log(marcador)
      this.marcadorData = {
        ...marcador,
        pin_editar: this.pin_editar,
        marcadorVisible: true,
        saquea: '◉',
        saqueb: '',
        horas: 0,
        minutos: 0,
        segundos: 0,
      }
      sessionStorage.setItem('marcadorData', JSON.stringify(this.marcadorData));
      window.location.reload();
    }
  }

  iniciarJuego() {
    Swal.fire({
      title: "Iniciar contador",
      text: "Deseas iniciar el contador del partido?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Si, iniciar"
    }).then((result) => {
      if (result.isConfirmed) {
        this.marcadorData.marcador_iniciado = false;
        const currentTimestamp = new Date().toISOString();
        this.marcadorData.fecha_creacion = currentTimestamp
        const data = {
          fecha_creacion: currentTimestamp,
        }
        sessionStorage.setItem('marcadorData', JSON.stringify(this.marcadorData));
        this.marcadorService.iniciarMarcador(this.marcadorData.pin_editar, data)
        this.iniciarContador();
      }
    });
  }

  calcularDuracion(): string {
    const fechaInicio = new Date(this.marcadorData?.fecha_creacion); // Fecha de creación en milisegundos
    const fechaActual = new Date(); // Fecha y hora actual en milisegundos
  
    const diferenciaMilisegundos = fechaActual.getTime() - fechaInicio.getTime();
  
    // Convertir a horas, minutos y segundos
    const horas = Math.floor(diferenciaMilisegundos / (1000 * 60 * 60));
    const minutos = Math.floor((diferenciaMilisegundos % (1000 * 60 * 60)) / (1000 * 60));
    const segundos = Math.floor((diferenciaMilisegundos % (1000 * 60)) / 1000);

    this.marcadorData.horas = horas;
    this.marcadorData.minutos = minutos;
    this.marcadorData.segundos = segundos;
  
    // Formatear como "hh:mm:ss"
    return `${horas.toString().padStart(2, '0')}:${minutos
      .toString()
      .padStart(2, '0')}:${segundos.toString().padStart(2, '0')}`;
  }

  iniciarContador() {
    this.detenerContador(); // Detener cualquier contador previo antes de iniciar uno nuevo
    this.timerInterval = setInterval(() => {
      this.calcularDuracion();
    }, 1000); // Actualiza cada segundo
  }

  detenerContador() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  sumarPuntoA() {
    //En negro los puntos
    const puntosElemento = document.querySelector('.puntosA');
    const puntosElementoB = document.querySelector('.puntosB');

    if ((puntosElemento)&&(puntosElementoB)) {
      puntosElemento.classList.remove('oro');
      puntosElementoB.classList.remove('oro');
    }

    //Si algun set esta en tiebreak
    if (
      this.marcadorData.set1tie ||
      this.marcadorData.set2tie ||
      this.marcadorData.set3tie
    ) {
      this.marcadorData.puntosA = this.sumarPuntoA_tie(
        this.marcadorData.puntosA
      );
    } else {
      //Si esta en juego el tercer set y esta activado el supertiebreak
      if (
        !this.marcadorData.set1 &&
        !this.marcadorData.set2 &&
        this.marcadorData.es_supertiebreak
      ) {
        this.marcadorData.puntosA = this.sumarPuntoA_super(
          this.marcadorData.puntosA
        );
      }
      this.marcadorData.puntosA = this.incrementarPuntoA(
        this.marcadorData.puntosA
      );
    }
    //Actualiza sessionStorage y notifica del cambio - Envia actualizacion a sockets - put a BD 
    sessionStorage.setItem('marcadorData', JSON.stringify(this.marcadorData));
    this.marcadorSignal.actualizarMarcadorData(this.marcadorData);
    this.socket.send(JSON.stringify(this.marcadorData));
    this.socketEditar.send(JSON.stringify(this.marcadorData));
    this.marcadorService.actualizarMarcador(this.marcadorData.pin_editar,this.marcadorData)

    //transicion
    if (puntosElemento) {
      puntosElemento.classList.add('sumado');
      setTimeout(() => puntosElemento.classList.remove('sumado'), 300);
    }

    //Si estan en punto de oro, cambiar los 40 a dorado
    if((((this.marcadorData.puntosA === 40) && (this.marcadorData.puntosB === 40)) && (!this.marcadorData.ventaja))){
      if ((puntosElemento)&&(puntosElementoB)) {
        puntosElemento.classList.add('oro');
        puntosElementoB.classList.add('oro');
      }
    }
  }

  sumarPuntoB() {
    //En negro los puntos
    const puntosElementoA = document.querySelector('.puntosA');
    const puntosElemento = document.querySelector('.puntosB');

    if ((puntosElemento)&&(puntosElementoA)) {
      puntosElemento.classList.remove('oro');
      puntosElementoA.classList.remove('oro');
    }

    //Si algun set esta en tiebreak
    if (
      this.marcadorData.set1tie ||
      this.marcadorData.set2tie ||
      this.marcadorData.set3tie
    ) {
      this.marcadorData.puntosB = this.sumarPuntoB_tie(
        this.marcadorData.puntosB
      );
    } else {
      //Si esta en juego el tercer set y esta activado el supertiebreak
      if (
        !this.marcadorData.set1 &&
        !this.marcadorData.set2 &&
        this.marcadorData.es_supertiebreak
      ) {
        this.marcadorData.puntosB = this.sumarPuntoB_super(
          this.marcadorData.puntosB
        );
      }
      this.marcadorData.puntosB = this.incrementarPuntoB(
        this.marcadorData.puntosB
      );
    }
    //Actualiza sessionStorage y notifica del cambio - Envia actualizacion a socket - put a BD
    sessionStorage.setItem('marcadorData', JSON.stringify(this.marcadorData));
    this.marcadorSignal.actualizarMarcadorData(this.marcadorData);
    this.socket.send(JSON.stringify(this.marcadorData));
    this.socketEditar.send(JSON.stringify(this.marcadorData));
    this.marcadorService.actualizarMarcador(this.marcadorData.pin_editar,this.marcadorData);

    //transicion
    if (puntosElemento) {
      puntosElemento.classList.add('sumado');
      setTimeout(() => puntosElemento.classList.remove('sumado'), 300);
    }

    //Si estan en punto de oro, cambiar los 40 a dorado
    if((((this.marcadorData.puntosA === 40) && (this.marcadorData.puntosB === 40)) && (!this.marcadorData.ventaja))){
      if ((puntosElemento)&&(puntosElementoA)) {
        puntosElemento.classList.add('oro');
        puntosElementoA.classList.add('oro');
      }
    }
  }

  sumarPuntoA_tie(punto: number): number {
    if (punto < 6) {
      return (punto += 1);
    } else {
      if (punto - this.marcadorData.puntosB > 0) {
        this.incrementarGameA();
        this.marcadorData.puntosB = 0;
        this.alternarSaque();
        return 0; // reiniciar puntos tras ganar game
      }
      return (punto += 1);
    }
  }

  sumarPuntoB_tie(punto: number): number {
    if (punto < 6) {
      return (punto += 1);
    } else {
      if (punto - this.marcadorData.puntosA > 0) {
        this.incrementarGameB();
        this.marcadorData.puntosA = 0;
        this.alternarSaque();
        return 0; // reiniciar puntos tras ganar game
      }
      return (punto += 1);
    }
  }

  sumarPuntoA_super(punto: number): number {
    this.incrementarGameA();
    return (punto += 1);
  }

  sumarPuntoB_super(punto: number): number {
    this.incrementarGameB();
    return (punto += 1);
  }

  incrementarPuntoA(punto: number | string): number | string {
    if (!this.marcadorData.ventaja) {
      if (punto === 0) return 15;
      if (punto === 15) return 30;
      if (punto === 30) return 40;
      if (punto === 40) {
        this.incrementarGameA();
        this.marcadorData.puntosB = 0;
        this.alternarSaque();
        return 0; // reiniciar puntos tras ganar game
      }
      return punto;
    }
    //Se juega con ventaja / 40-40 -> Adv-.
    else {
      if (punto === 0) return 15;
      if (punto === 15) return 30;
      if (punto === 30) return 40;
      if (punto === 40) {
        if (this.marcadorData.puntosB === 40) {
          this.marcadorData.puntosB = '.';
          return 'Adv.';
        }
        this.incrementarGameA();
        this.marcadorData.puntosB = 0;
        this.alternarSaque();
        return 0; // reiniciar puntos tras ganar game
      }
      if (punto === 'Adv.') {
        this.incrementarGameA();
        this.marcadorData.puntosB = 0;
        this.alternarSaque();
        return 0; // reiniciar puntos tras ganar game
      }
      if (punto === '.') {
        this.marcadorData.puntosB = 40;
        return 40;
      }
      return punto;
    }
  }

  incrementarPuntoB(punto: number | string): number | string {
    if (!this.marcadorData.ventaja) {
      if (punto === 0) return 15;
      if (punto === 15) return 30;
      if (punto === 30) return 40;
      if (punto === 40) {
        this.incrementarGameB();
        this.marcadorData.puntosA = 0;
        this.alternarSaque();
        return 0; // reiniciar puntos tras ganar game
      }
      return punto;
    } else {
      if (punto === 0) return 15;
      if (punto === 15) return 30;
      if (punto === 30) return 40;
      if (punto === 40) {
        if (this.marcadorData.puntosA === 40) {
          this.marcadorData.puntosA = '.';
          return 'Adv.';
        }
        this.incrementarGameB();
        this.marcadorData.puntosA = 0;
        this.alternarSaque();
        return 0;
      }
      if (punto === 'Adv.') {
        this.incrementarGameB();
        this.marcadorData.puntosA = 0;
        this.alternarSaque();
        return 0;
      }
      if (punto === '.') {
        this.marcadorData.puntosA = 40;
        return 40;
      }
      return punto;
    }
  }

  incrementarGameA() {
    //Si el partido es con super tiebreak, que maneje la logica de set hasta el segundo set
    if (this.marcadorData.es_supertiebreak) {
      if (this.marcadorData.set1) {
        //Si esta en tiebreak, que cierre el set
        if (this.marcadorData.set1tie) {
          this.marcadorData.set1A += 1;
          //transicion css
          const gamesElemento = document.querySelector('.gamesA1');
          if (gamesElemento) {
            gamesElemento.classList.add('sumado');
            setTimeout(() => gamesElemento.classList.remove('sumado'), 300);
          }
          this.marcadorData.set1 = false; //cierra set
          this.marcadorData.set1Awin = true; //ganador
          this.marcadorData.set1Bwin = false; //perdedor
          this.marcadorData.set1tie = false; //desactivar modo tiebreak
          //Actualiza sessionStorage y notifica del cambio - Envia actualizacion a socket - put a BD
          sessionStorage.setItem(
            'marcadorData',
            JSON.stringify(this.marcadorData)
          );
          this.marcadorSignal.actualizarMarcadorData(this.marcadorData);
          this.marcadorService.actualizarMarcador(this.marcadorData.pin_editar,this.marcadorData);
        }

        //Si el partido va 3-0, 3-1, 5-1, 4-2, 4-4, 4-5, 5-5, 5-6... y A hace un game
        if (
          this.marcadorData.set1 &&
          this.marcadorData.set1A < 7 &&
          this.marcadorData.set1B < 7
        ) {
          this.marcadorData.set1A += 1;
          //transicion css
          const gamesElemento = document.querySelector('.gamesA1');
          if (gamesElemento) {
            gamesElemento.classList.add('sumado');
            setTimeout(() => gamesElemento.classList.remove('sumado'), 300);
          }

          //Si el set no es largo y van 5-5, tiebreak
          if (
            !this.marcadorData.set_largo &&
            this.marcadorData.set1A === 5 &&
            this.marcadorData.set1B === 5
          ) {
            this.marcadorData.set1tie = true;
          }
          //Si 6-6, Tiebreak
          else if (
            this.marcadorData.set1A === 6 &&
            this.marcadorData.set1B === 6
          ) {
            this.marcadorData.set1tie = true;
          }

          //Chequea si cerro set: 6-4, 6-2, 7-5...
          if (
            (this.marcadorData.set1A === 6 && this.marcadorData.set1B < 5) ||
            (this.marcadorData.set1A === 7 && this.marcadorData.set1B < 6)
          ) {
            this.marcadorData.set1 = false; //cierra set
            this.marcadorData.set1Awin = true; //ganador
            this.marcadorData.set1Bwin = false;
            //Actualiza sessionStorage y notifica del cambio - Envia actualizacion a socket - put a BD
            sessionStorage.setItem(
              'marcadorData',
              JSON.stringify(this.marcadorData)
            );
            this.marcadorSignal.actualizarMarcadorData(this.marcadorData);
            this.marcadorService.actualizarMarcador(this.marcadorData.pin_editar,this.marcadorData);
          }
        }
      }
      //Esta en juego el set 2
      else if (!this.marcadorData.set1 && this.marcadorData.set2) {
        //Si esta en tiebreak, que cierre el set
        if (this.marcadorData.set2tie) {
          this.marcadorData.set2A += 1;
          //transicion css
          const gamesElemento = document.querySelector('.gamesA2');
          if (gamesElemento) {
            gamesElemento.classList.add('sumado');
            setTimeout(() => gamesElemento.classList.remove('sumado'), 300);
          }
          this.marcadorData.set2 = false; //cierra set
          this.marcadorData.set2Awin = true; //ganador
          this.marcadorData.set2Bwin = false; //perdedor
          this.marcadorData.set2tie = false; //desactivar modo tiebreak

          sessionStorage.setItem(
            'marcadorData',
            JSON.stringify(this.marcadorData)
          );
          this.marcadorSignal.actualizarMarcadorData(this.marcadorData);
          this.marcadorService.actualizarMarcador(this.marcadorData.pin_editar,this.marcadorData);
        }

        //Si el partido va 3-0, 3-1, 5-1, 4-2, 4-4, 4-5, 5-5, 5-6... y A hace un game
        if (
          this.marcadorData.set2 &&
          this.marcadorData.set2A < 7 &&
          this.marcadorData.set2B < 7
        ) {
          this.marcadorData.set2A += 1;
          //transicion css
          const gamesElemento = document.querySelector('.gamesA2');
          if (gamesElemento) {
            gamesElemento.classList.add('sumado');
            setTimeout(() => gamesElemento.classList.remove('sumado'), 300);
          }

          //Si el set no es largo y van 5-5, tiebreak
          if (
            !this.marcadorData.set_largo &&
            this.marcadorData.set2A === 5 &&
            this.marcadorData.set2B === 5
          ) {
            this.marcadorData.set2tie = true;
          }
          //Si 6-6, Tiebreak
          else if (
            this.marcadorData.set2A === 6 &&
            this.marcadorData.set2B === 6
          ) {
            this.marcadorData.set2tie = true;
          }

          //Chequea si cerro set: 6-4, 6-2, 7-5...
          if (
            (this.marcadorData.set2A === 6 && this.marcadorData.set2B < 5) ||
            (this.marcadorData.set2A === 7 && this.marcadorData.set2B < 6)
          ) {
            this.marcadorData.set2 = false; //cierra set
            this.marcadorData.set2Awin = true; //ganador
            this.marcadorData.set2Bwin = false;
            //Actualiza sessionStorage y notifica del cambio - Envia actualizacion a socket - put a BD
            sessionStorage.setItem(
              'marcadorData',
              JSON.stringify(this.marcadorData)
            );
            this.marcadorSignal.actualizarMarcadorData(this.marcadorData);
            this.marcadorService.actualizarMarcador(this.marcadorData.pin_editar,this.marcadorData);
          }
        }

        //ganar 2 de 3 sets es ganar
        if (this.marcadorData.set1Awin && this.marcadorData.set2Awin) {
          Swal.fire({
            title: "Partido finalizado",
            text: `La pareja ganadora es la pareja ${this.marcadorData.nombre_pareja_A1}/${this.marcadorData.nombre_pareja_A2}`,
            icon: "success",
            
          });
          return;
        }
      }

      //supertiebreak
      else {
        if (!this.marcadorData.set1 && !this.marcadorData.set2) {
          this.marcadorData.set3A += 1;
          //transicion css
          const gamesElemento = document.querySelector('.gamesA3');
          if (gamesElemento) {
            gamesElemento.classList.add('sumado');
            setTimeout(() => gamesElemento.classList.remove('sumado'), 300);
          }

          //Actualiza sessionStorage y notifica del cambio - Envia actualizacion a socket - put a BD
          sessionStorage.setItem(
            'marcadorData',
            JSON.stringify(this.marcadorData)
          );
          this.marcadorSignal.actualizarMarcadorData(this.marcadorData);
          this.marcadorService.actualizarMarcador(this.marcadorData.pin_editar,this.marcadorData);

          if (
            this.marcadorData.set3A > 10 &&
            this.marcadorData.set3A - this.marcadorData.set3B > 1
          ) {
            this.marcadorData.set3 = false;
            Swal.fire({
              title: "Partido finalizado",
              text: `La pareja ganadora es la pareja ${this.marcadorData.nombre_pareja_A1}/${this.marcadorData.nombre_pareja_A2}`,
              icon: "success",
              
            });
          }
        }
      }
    }

    //Si es sin super tiebreak, que maneje la logica los 3 sets
    else {
      if (this.marcadorData.set1) {
        //Si esta en tiebreak, que cierre el set
        if (this.marcadorData.set1tie) {
          this.marcadorData.set1A += 1;
          //transicion css
          const gamesElemento = document.querySelector('.gamesA1');
          if (gamesElemento) {
            gamesElemento.classList.add('sumado');
            setTimeout(() => gamesElemento.classList.remove('sumado'), 300);
          }

          this.marcadorData.set1 = false; //cierra set
          this.marcadorData.set1Awin = true; //ganador
          this.marcadorData.set1Bwin = false; //perdedor
          this.marcadorData.set1tie = false; //desactivar modo tiebreak

          //Actualiza sessionStorage y notifica del cambio - Envia actualizacion a socket
          sessionStorage.setItem(
            'marcadorData',
            JSON.stringify(this.marcadorData)
          );
          this.marcadorSignal.actualizarMarcadorData(this.marcadorData);
          this.marcadorService.actualizarMarcador(this.marcadorData.pin_editar,this.marcadorData);
        }

        //Si el partido va 3-0, 3-1, 5-1, 4-2, 4-4, 4-5, 5-5, 5-6... y A hace un game
        if (
          this.marcadorData.set1 &&
          this.marcadorData.set1A < 7 &&
          this.marcadorData.set1B < 7
        ) {
          this.marcadorData.set1A += 1;
          //transicion css
          const gamesElemento = document.querySelector('.gamesA1');
          if (gamesElemento) {
            gamesElemento.classList.add('sumado');
            setTimeout(() => gamesElemento.classList.remove('sumado'), 300);
          }

          //Si el set no es largo y van 5-5, tiebreak
          if (
            !this.marcadorData.set_largo &&
            this.marcadorData.set1A === 5 &&
            this.marcadorData.set1B === 5
          ) {
            this.marcadorData.set1tie = true;
          }
          //Si 6-6, Tiebreak
          else if (
            this.marcadorData.set1A === 6 &&
            this.marcadorData.set1B === 6
          ) {
            this.marcadorData.set1tie = true;
          }

          //Chequea si cerro set: 6-4, 6-2, 7-5...
          if (
            (this.marcadorData.set1A === 6 && this.marcadorData.set1B < 5) ||
            (this.marcadorData.set1A === 7 && this.marcadorData.set1B < 6)
          ) {
            this.marcadorData.set1 = false; //cierra set
            this.marcadorData.set1Awin = true; //ganador
            this.marcadorData.set1Bwin = false;

            //Actualiza sessionStorage y notifica del cambio - Envia actualizacion a socket
            sessionStorage.setItem(
              'marcadorData',
              JSON.stringify(this.marcadorData)
            );
            this.marcadorSignal.actualizarMarcadorData(this.marcadorData);
            this.marcadorService.actualizarMarcador(this.marcadorData.pin_editar,this.marcadorData);
          }
        }
      }

      //Esta en juego el set 2
      else if (!this.marcadorData.set1 && this.marcadorData.set2) {
        //Si esta en tiebreak, que cierre el set
        if (this.marcadorData.set2tie) {
          this.marcadorData.set2A += 1;
          //transicion css
          const gamesElemento = document.querySelector('.gamesA2');
          if (gamesElemento) {
            gamesElemento.classList.add('sumado');
            setTimeout(() => gamesElemento.classList.remove('sumado'), 300);
          }

          this.marcadorData.set2 = false; //cierra set
          this.marcadorData.set2Awin = true; //ganador
          this.marcadorData.set2Bwin = false; //perdedor
          this.marcadorData.set2tie = false; //desactivar modo tiebreak
        }

        //Si el partido va 3-0, 3-1, 5-1, 4-2, 4-4, 4-5, 5-5, 5-6... y A hace un game
        if (
          this.marcadorData.set2 &&
          this.marcadorData.set2A < 7 &&
          this.marcadorData.set2B < 7
        ) {
          this.marcadorData.set2A += 1;
          //transicion css
          const gamesElemento = document.querySelector('.gamesA2');
          if (gamesElemento) {
            gamesElemento.classList.add('sumado');
            setTimeout(() => gamesElemento.classList.remove('sumado'), 300);
          }

          //Si el set no es largo y van 5-5, tiebreak
          if (
            !this.marcadorData.set_largo &&
            this.marcadorData.set2A === 5 &&
            this.marcadorData.set2B === 5
          ) {
            this.marcadorData.set2tie = true;
          }
          //Si 6-6, Tiebreak
          else if (
            this.marcadorData.set2A === 6 &&
            this.marcadorData.set2B === 6
          ) {
            this.marcadorData.set2tie = true;
          }

          //Chequea si cerro set: 6-4, 6-2, 7-5...
          if (
            (this.marcadorData.set2A === 6 && this.marcadorData.set2B < 5) ||
            (this.marcadorData.set2A === 7 && this.marcadorData.set2B < 6)
          ) {
            console.log('Cerro set');
            this.marcadorData.set2 = false; //cierra set
            this.marcadorData.set2Awin = true; //ganador
            this.marcadorData.set2Bwin = false;
          }
        }
        //ganar 2 de 3 sets es ganar
        if (this.marcadorData.set1Awin && this.marcadorData.set2Awin) {
          Swal.fire({
            title: "Partido finalizado",
            text: `La pareja ganadora es la pareja ${this.marcadorData.nombre_pareja_A1}/${this.marcadorData.nombre_pareja_A2}`,
            icon: "success",
            
          });
        }
      } else {
        //Esta en juego el set 3
        if (!this.marcadorData.set1 && !this.marcadorData.set2) {
          //Si esta en tiebreak, que cierre el set
          if (this.marcadorData.set3tie) {
            this.marcadorData.set3A += 1;
            //transicion css
            const gamesElemento = document.querySelector('.gamesA3');
            if (gamesElemento) {
              gamesElemento.classList.add('sumado');
              setTimeout(() => gamesElemento.classList.remove('sumado'), 300);
            }

            this.marcadorData.set3 = false; //cierra set
            this.marcadorData.set3tie = false; //desactivar modo tiebreak
            Swal.fire({
              title: "Partido finalizado",
              text: `La pareja ganadora es la pareja ${this.marcadorData.nombre_pareja_A1}/${this.marcadorData.nombre_pareja_A2}`,
              icon: "success",
              
            });
            return;
          }

          //Si el partido va 3-0, 3-1, 5-1, 4-2, 4-4, 4-5, 5-5, 5-6... y A hace un game
          if (
            this.marcadorData.set3 &&
            this.marcadorData.set3A < 7 &&
            this.marcadorData.set3B < 7
          ) {
            this.marcadorData.set3A += 1;
            //transicion css
            const gamesElemento = document.querySelector('.gamesA3');
            if (gamesElemento) {
              gamesElemento.classList.add('sumado');
              setTimeout(() => gamesElemento.classList.remove('sumado'), 300);
            }

            //Si el set no es largo y van 5-5, tiebreak
            if (
              !this.marcadorData.set_largo &&
              this.marcadorData.set3A === 5 &&
              this.marcadorData.set3B === 5
            ) {
              this.marcadorData.set3tie = true;
            }
            //Si 6-6, Tiebreak
            else if (
              this.marcadorData.set3A === 6 &&
              this.marcadorData.set3B === 6
            ) {
              this.marcadorData.set3tie = true;
            }

            //Chequea si cerro set: 6-4, 6-2, 7-5...
            if (
              (this.marcadorData.set3A === 6 && this.marcadorData.set3B < 5) ||
              (this.marcadorData.set3A === 7 && this.marcadorData.set3B < 6)
            ) {
              this.marcadorData.set3 = false; //cierra set
              Swal.fire({
                title: "Partido finalizado",
                text: `La pareja ganadora es la pareja ${this.marcadorData.nombre_pareja_A1}/${this.marcadorData.nombre_pareja_A2}`,
                icon: "success",
                
              });
              return;
            }
          }
        }
      }
    }
  }

  incrementarGameB() {
    //Si el partido es con super tiebreak, que maneje la logica de set hasta el segundo set
    if (this.marcadorData.es_supertiebreak) {
      if (this.marcadorData.set1) {
        //Si esta en tiebreak, que cierre el set
        if (this.marcadorData.set1tie) {
          this.marcadorData.set1B += 1;
          //transicion css
          const gamesElemento = document.querySelector('.gamesB1');
          if (gamesElemento) {
            gamesElemento.classList.add('sumado');
            setTimeout(() => gamesElemento.classList.remove('sumado'), 300);
          }

          this.marcadorData.set1 = false; //cierra set
          this.marcadorData.set1Bwin = true; //ganador
          this.marcadorData.set1Awin = false; //perdedor
          this.marcadorData.set1tie = false; //desactivar modo tiebreak
          //Actualiza sessionStorage y notifica del cambio - Envia actualizacion a socket
          sessionStorage.setItem(
            'marcadorData',
            JSON.stringify(this.marcadorData)
          );
          this.marcadorSignal.actualizarMarcadorData(this.marcadorData);
          this.marcadorService.actualizarMarcador(this.marcadorData.pin_editar,this.marcadorData);
        }

        //Si el partido va 3-0, 3-1, 5-1, 4-2, 4-4, 4-5, 5-5, 5-6... y B hace un game
        if (
          this.marcadorData.set1 &&
          this.marcadorData.set1B < 7 &&
          this.marcadorData.set1A < 7
        ) {
          this.marcadorData.set1B += 1;
          //transicion css
          const gamesElemento = document.querySelector('.gamesB1');
          if (gamesElemento) {
            gamesElemento.classList.add('sumado');
            setTimeout(() => gamesElemento.classList.remove('sumado'), 300);
          }

          //Si el set no es largo y van 5-5, tiebreak
          if (
            !this.marcadorData.set_largo &&
            this.marcadorData.set1B === 5 &&
            this.marcadorData.set1A === 5
          ) {
            this.marcadorData.set1tie = true;
          }
          //Si 6-6, Tiebreak
          else if (
            this.marcadorData.set1B === 6 &&
            this.marcadorData.set1A === 6
          ) {
            this.marcadorData.set1tie = true;
          }

          //Chequea si cerro set: 6-4, 6-2, 7-5...
          if (
            (this.marcadorData.set1B === 6 && this.marcadorData.set1A < 5) ||
            (this.marcadorData.set1B === 7 && this.marcadorData.set1A < 6)
          ) {
            this.marcadorData.set1 = false; //cierra set
            this.marcadorData.set1Bwin = true; //ganador
            this.marcadorData.set1Awin = false;
            //Actualiza sessionStorage y notifica del cambio - Envia actualizacion a socket
            sessionStorage.setItem(
              'marcadorData',
              JSON.stringify(this.marcadorData)
            );
            this.marcadorSignal.actualizarMarcadorData(this.marcadorData);
            this.marcadorService.actualizarMarcador(this.marcadorData.pin_editar,this.marcadorData);
          }
        }
      }

      //Esta en juego el set 2
      else if (!this.marcadorData.set1 && this.marcadorData.set2) {
        //Si esta en tiebreak, que cierre el set
        if (this.marcadorData.set2tie) {
          this.marcadorData.set2B += 1;
          //transicion css
          const gamesElemento = document.querySelector('.gamesB2');
          if (gamesElemento) {
            gamesElemento.classList.add('sumado');
            setTimeout(() => gamesElemento.classList.remove('sumado'), 300);
          }

          this.marcadorData.set2 = false; //cierra set
          this.marcadorData.set2Bwin = true; //ganador
          this.marcadorData.set2Awin = false; //perdedor
          this.marcadorData.set2tie = false; //desactivar modo tiebreak
        }

        //Si el partido va 3-0, 3-1, 5-1, 4-2, 4-4, 4-5, 5-5, 5-6... y B hace un game
        if (
          this.marcadorData.set2 &&
          this.marcadorData.set2B < 7 &&
          this.marcadorData.set2A < 7
        ) {
          this.marcadorData.set2B += 1;
          //transicion css
          const gamesElemento = document.querySelector('.gamesB2');
          if (gamesElemento) {
            gamesElemento.classList.add('sumado');
            setTimeout(() => gamesElemento.classList.remove('sumado'), 300);
          }

          //Si el set no es largo y van 5-5, tiebreak
          if (
            !this.marcadorData.set_largo &&
            this.marcadorData.set2B === 5 &&
            this.marcadorData.set2A === 5
          ) {
            this.marcadorData.set2tie = true;
          }
          //Si 6-6, Tiebreak
          else if (
            this.marcadorData.set2B === 6 &&
            this.marcadorData.set2A === 6
          ) {
            this.marcadorData.set2tie = true;
          }

          //Chequea si cerro set: 6-4, 6-2, 7-5...
          if (
            (this.marcadorData.set2B === 6 && this.marcadorData.set2A < 5) ||
            (this.marcadorData.set2B === 7 && this.marcadorData.set2A < 6)
          ) {
            this.marcadorData.set2 = false; //cierra set
            this.marcadorData.set2Bwin = true; //ganador
            this.marcadorData.set2Awin = false;
          }
        }

        //ganar 2 de 3 sets es ganar
        if (this.marcadorData.set1Bwin && this.marcadorData.set2Bwin) {
          Swal.fire({
            title: "Partido finalizado",
            text: `La pareja ganadora es la pareja ${this.marcadorData.nombre_pareja_B1}/${this.marcadorData.nombre_pareja_B2}`,
            icon: "success",
            
          });
          return;
        }
      }

      //supertiebreak
      else {
        if (!this.marcadorData.set1 && !this.marcadorData.set2) {
          this.marcadorData.set3B += 1;
          //transicion css
          const gamesElemento = document.querySelector('.gamesB3');
          if (gamesElemento) {
            gamesElemento.classList.add('sumado');
            setTimeout(() => gamesElemento.classList.remove('sumado'), 300);
          }

          if (
            this.marcadorData.set3B > 10 &&
            this.marcadorData.set3B - this.marcadorData.set3A > 1
          ) {
            this.marcadorData.set3 = false;
            Swal.fire({
              title: "Partido finalizado",
              text: `La pareja ganadora es la pareja ${this.marcadorData.nombre_pareja_B1}/${this.marcadorData.nombre_pareja_B2}`,
              icon: "success",
              
            });
          }
        }
      }
    }

    //Si es sin super tiebreak, que maneje la logica los 3 sets
    else {
      if (this.marcadorData.set1) {
        //Si esta en tiebreak, que cierre el set
        if (this.marcadorData.set1tie) {
          this.marcadorData.set1B += 1;
          //transicion css
          const gamesElemento = document.querySelector('.gamesB1');
          if (gamesElemento) {
            gamesElemento.classList.add('sumado');
            setTimeout(() => gamesElemento.classList.remove('sumado'), 300);
          }

          this.marcadorData.set1 = false; //cierra set
          this.marcadorData.set1Bwin = true; //ganador
          this.marcadorData.set1Awin = false; //perdedor
          this.marcadorData.set1tie = false; //desactivar modo tiebreak
          //Actualiza sessionStorage y notifica del cambio - Envia actualizacion a socket
          sessionStorage.setItem(
            'marcadorData',
            JSON.stringify(this.marcadorData)
          );
          this.marcadorSignal.actualizarMarcadorData(this.marcadorData);
          this.marcadorService.actualizarMarcador(this.marcadorData.pin_editar,this.marcadorData);
        }

        //Si el partido va 3-0, 3-1, 5-1, 4-2, 4-4, 4-5, 5-5, 5-6... y B hace un game
        if (
          this.marcadorData.set1 &&
          this.marcadorData.set1B < 7 &&
          this.marcadorData.set1A < 7
        ) {
          this.marcadorData.set1B += 1;
          //transicion css
          const gamesElemento = document.querySelector('.gamesB1');
          if (gamesElemento) {
            gamesElemento.classList.add('sumado');
            setTimeout(() => gamesElemento.classList.remove('sumado'), 300);
          }

          //Si el set no es largo y van 5-5, tiebreak
          if (
            !this.marcadorData.set_largo &&
            this.marcadorData.set1B === 5 &&
            this.marcadorData.set1A === 5
          ) {
            this.marcadorData.set1tie = true;
          }
          //Si 6-6, Tiebreak
          else if (
            this.marcadorData.set1B === 6 &&
            this.marcadorData.set1A === 6
          ) {
            this.marcadorData.set1tie = true;
          }

          //Chequea si cerro set: 6-4, 6-2, 7-5...
          if (
            (this.marcadorData.set1B === 6 && this.marcadorData.set1A < 5) ||
            (this.marcadorData.set1B === 7 && this.marcadorData.set1A < 6)
          ) {
            this.marcadorData.set1 = false; //cierra set
            this.marcadorData.set1Bwin = true; //ganador
            this.marcadorData.set1Awin = false;
            //Actualiza sessionStorage y notifica del cambio - Envia actualizacion a socket
            sessionStorage.setItem(
              'marcadorData',
              JSON.stringify(this.marcadorData)
            );
            this.marcadorSignal.actualizarMarcadorData(this.marcadorData);
            this.marcadorService.actualizarMarcador(this.marcadorData.pin_editar,this.marcadorData);
          }
        }
      }

      //Esta en juego el set 2
      else if (!this.marcadorData.set1 && this.marcadorData.set2) {
        //Si esta en tiebreak, que cierre el set
        if (this.marcadorData.set2tie) {
          this.marcadorData.set2B += 1;
          //transicion css
          const gamesElemento = document.querySelector('.gamesB2');
          if (gamesElemento) {
            gamesElemento.classList.add('sumado');
            setTimeout(() => gamesElemento.classList.remove('sumado'), 300);
          }

          this.marcadorData.set2 = false; //cierra set
          this.marcadorData.set2Bwin = true; //ganador
          this.marcadorData.set2Awin = false; //perdedor
          this.marcadorData.set2tie = false; //desactivar modo tiebreak
        }

        //Si el partido va 3-0, 3-1, 5-1, 4-2, 4-4, 4-5, 5-5, 5-6... y B hace un game
        if (
          this.marcadorData.set2 &&
          this.marcadorData.set2B < 7 &&
          this.marcadorData.set2A < 7
        ) {
          this.marcadorData.set2B += 1;
          //transicion css
          const gamesElemento = document.querySelector('.gamesB2');
          if (gamesElemento) {
            gamesElemento.classList.add('sumado');
            setTimeout(() => gamesElemento.classList.remove('sumado'), 300);
          }

          //Si el set no es largo y van 5-5, tiebreak
          if (
            !this.marcadorData.set_largo &&
            this.marcadorData.set2B === 5 &&
            this.marcadorData.set2A === 5
          ) {
            this.marcadorData.set2tie = true;
          }
          //Si 6-6, Tiebreak
          else if (
            this.marcadorData.set2B === 6 &&
            this.marcadorData.set2A === 6
          ) {
            this.marcadorData.set2tie = true;
          }

          //Chequea si cerro set: 6-4, 6-2, 7-5...
          if (
            (this.marcadorData.set2B === 6 && this.marcadorData.set2A < 5) ||
            (this.marcadorData.set2B === 7 && this.marcadorData.set2A < 6)
          ) {
            console.log('Cerro set');
            this.marcadorData.set2 = false; //cierra set
            this.marcadorData.set2Bwin = true; //ganador
            this.marcadorData.set2Awin = false;
          }
        }
        //ganar 2 de 3 sets es ganar
        if (this.marcadorData.set1Bwin && this.marcadorData.set2Bwin) {
          Swal.fire({
            title: "Partido finalizado",
            text: `La pareja ganadora es la pareja ${this.marcadorData.nombre_pareja_B1}/${this.marcadorData.nombre_pareja_B2}`,
            icon: "success",
            
          });
        }
      } else {
        //Esta en juego el set 3
        if (!this.marcadorData.set1 && !this.marcadorData.set2) {
          //Si esta en tiebreak, que cierre el set
          if (this.marcadorData.set3tie) {
            this.marcadorData.set3B += 1;
            //transicion css
            const gamesElemento = document.querySelector('.gamesB3');
            if (gamesElemento) {
              gamesElemento.classList.add('sumado');
              setTimeout(() => gamesElemento.classList.remove('sumado'), 300);
            }

            this.marcadorData.set3 = false; //cierra set
            this.marcadorData.set3tie = false; //desactivar modo tiebreak
            Swal.fire({
              title: "Partido finalizado",
              text: `La pareja ganadora es la pareja ${this.marcadorData.nombre_pareja_B1}/${this.marcadorData.nombre_pareja_B2}`,
              icon: "success",
              
            });
            return;
          }

          //Si el partido va 3-0, 3-1, 5-1, 4-2, 4-4, 4-5, 5-5, 5-6... y B hace un game
          if (
            this.marcadorData.set3 &&
            this.marcadorData.set3B < 7 &&
            this.marcadorData.set3A < 7
          ) {
            this.marcadorData.set3B += 1;
            //transicion css
            const gamesElemento = document.querySelector('.gamesB3');
            if (gamesElemento) {
              gamesElemento.classList.add('sumado');
              setTimeout(() => gamesElemento.classList.remove('sumado'), 300);
            }

            //Si el set no es largo y van 5-5, tiebreak
            if (
              !this.marcadorData.set_largo &&
              this.marcadorData.set3B === 5 &&
              this.marcadorData.set3A === 5
            ) {
              this.marcadorData.set3tie = true;
            }
            //Si 6-6, Tiebreak
            else if (
              this.marcadorData.set3B === 6 &&
              this.marcadorData.set3A === 6
            ) {
              this.marcadorData.set3tie = true;
            }

            //Chequea si cerro set: 6-4, 6-2, 7-5...
            if (
              (this.marcadorData.set3B === 6 && this.marcadorData.set3A < 5) ||
              (this.marcadorData.set3B === 7 && this.marcadorData.set3A < 6)
            ) {
              this.marcadorData.set3 = false; //cierra set
              Swal.fire({
                title: "Partido finalizado",
                text: `La pareja ganadora es la pareja ${this.marcadorData.nombre_pareja_B1}/${this.marcadorData.nombre_pareja_B2}`,
                icon: "success",
                
              });
              return;
            }
          }
        }
      }
    }
  }

  restarPuntoA() {
    //Puntos en negro
    const puntosElemento = document.querySelector('.puntosA');
    const puntosElementoB = document.querySelector('.puntosB');

    if ((puntosElemento)&&(puntosElementoB)) {
      puntosElemento.classList.remove('oro');
      puntosElementoB.classList.remove('oro');
    }
    //Si algun set esta en tiebreak
    if (
      this.marcadorData.set1tie ||
      this.marcadorData.set2tie ||
      this.marcadorData.set3tie
    ) {
      this.marcadorData.puntosA = this.decrementarPunto_tie(
        this.marcadorData.puntosA
      );
    } else {
      //Si esta en juego el tercer set y esta activado el supertiebreak
      if (
        !this.marcadorData.set1 &&
        !this.marcadorData.set2 &&
        this.marcadorData.es_supertiebreak
      ) {
        this.marcadorData.puntosA = this.decrementarPunto_tie(
          this.marcadorData.puntosA
        );
      }
      this.marcadorData.puntosA = this.decrementarPunto(
        this.marcadorData.puntosA
      );
    }
    //Actualiza sessionStorage y notifica del cambio - Envia actualizacion a socket - put a BD
    sessionStorage.setItem('marcadorData', JSON.stringify(this.marcadorData));
    this.marcadorSignal.actualizarMarcadorData(this.marcadorData);
    this.socket.send(JSON.stringify(this.marcadorData));
    this.socketEditar.send(JSON.stringify(this.marcadorData));
    this.marcadorService.actualizarMarcador(this.marcadorData.pin_editar,this.marcadorData);
    //transicion
    if (puntosElemento) {
      puntosElemento.classList.add('restado');
      setTimeout(() => puntosElemento.classList.remove('restado'), 300);
    }
  }

  restarPuntoB() {
    //Puntos en negro
    const puntosElementoA = document.querySelector('.puntosA');
    const puntosElemento = document.querySelector('.puntosB');

    if ((puntosElemento)&&(puntosElementoA)) {
      puntosElemento.classList.remove('oro');
      puntosElementoA.classList.remove('oro');
    }
    //Si algun set esta en tiebreak
    if (
      this.marcadorData.set1tie ||
      this.marcadorData.set2tie ||
      this.marcadorData.set3tie
    ) {
      this.marcadorData.puntosB = this.decrementarPunto_tie(
        this.marcadorData.puntosB
      );
    } else {
      //Si esta en juego el tercer set y esta activado el supertiebreak
      if (
        !this.marcadorData.set1 &&
        !this.marcadorData.set2 &&
        this.marcadorData.es_supertiebreak
      ) {
        this.marcadorData.puntosB = this.decrementarPunto_tie(
          this.marcadorData.puntosB
        );
      }
      this.marcadorData.puntosB = this.decrementarPunto(
        this.marcadorData.puntosB
      );
    }
    //Actualiza sessionStorage y notifica del cambio - Envia actualizacion a socket - put a BD
    sessionStorage.setItem('marcadorData', JSON.stringify(this.marcadorData));
    this.marcadorSignal.actualizarMarcadorData(this.marcadorData);
    this.socket.send(JSON.stringify(this.marcadorData));
    this.socketEditar.send(JSON.stringify(this.marcadorData));
    this.marcadorService.actualizarMarcador(this.marcadorData.pin_editar,this.marcadorData); 
    //transicion
    if (puntosElemento) {
      puntosElemento.classList.add('restado');
      setTimeout(() => puntosElemento.classList.remove('restado'), 300);
    }
  }

  decrementarPunto(punto: number | string): number | string {
    if (this.marcadorData.ventaja) {
      if (punto === 'Adv.') {
        this.marcadorData.puntosA = 40;
        this.marcadorData.puntosB = 40;
        return 40;
      }
      if (punto === 40) return 30;
      if (punto === 30) return 15;
      if (punto === 15) return 0;
      return punto;
    } else {
      if (punto === 40) return 30;
      if (punto === 30) return 15;
      if (punto === 15) return 0;
      return punto;
    }
  }

  decrementarPunto_tie(punto: number): number {
    if (punto !== 0) return (punto -= 1);
    return punto;
  }

  restarGameA() {
    //Si es partido con supertiebreak
    if (this.marcadorData.es_supertiebreak) {
      //Si esta en juego el primer set, y el gameA no es 0
      if (this.marcadorData.set1 && this.marcadorData.set1A !== 0) {
        //Si estan en tiebreak del primer set
        if (this.marcadorData.set1tie) {
          //Se reinician los puntos y se desactiva el tiebreak
          this.marcadorData.puntosA = 0;
          this.marcadorData.puntosB = 0;
          this.marcadorData.set1tie = false;
        }
        //Se resta un game y se cambia el saque
        this.marcadorData.set1A -= 1;

        //transicion css
        const gamesElemento = document.querySelector('.gamesA1');
        if (gamesElemento) {
          gamesElemento.classList.add('restado');
          setTimeout(() => gamesElemento.classList.remove('restado'), 300);
        }

        //Actualiza sessionStorage y notifica del cambio - Envia actualizacion a socket - put a BD
        sessionStorage.setItem('marcadorData', JSON.stringify(this.marcadorData));
        this.marcadorSignal.actualizarMarcadorData(this.marcadorData);
        this.socket.send(JSON.stringify(this.marcadorData));
        this.socketEditar.send(JSON.stringify(this.marcadorData));
        this.marcadorService.actualizarMarcador(this.marcadorData.pin_editar,this.marcadorData); 

        this.alternarSaque();
      }
      //Si esta en juego el segundo set
      else if (this.marcadorData.set2) {
        //Y el set todavia no empezo, es decir van 0-0 y el primer set ya termino
        if (
          this.marcadorData.set2A === 0 &&
          this.marcadorData.set2B === 0 &&
          !this.marcadorData.set1
        ) {
          //Reactiva el primer set y resta un game al primer set
          this.marcadorData.set1 = true;
          this.marcadorData.set1A -= 1;

          //transicion css
          const gamesElemento = document.querySelector('.gamesA1');
          if (gamesElemento) {
            gamesElemento.classList.add('restado');
            setTimeout(() => gamesElemento.classList.remove('restado'), 300);
          }

          //Actualiza sessionStorage y notifica del cambio - Envia actualizacion a socket - put a BD
          sessionStorage.setItem('marcadorData', JSON.stringify(this.marcadorData));
          this.marcadorSignal.actualizarMarcadorData(this.marcadorData);
          this.socket.send(JSON.stringify(this.marcadorData));
          this.socketEditar.send(JSON.stringify(this.marcadorData));
          this.marcadorService.actualizarMarcador(this.marcadorData.pin_editar,this.marcadorData); 

          //Si al restar ve que iban en tiebreak, activa el tiebreak
          if (
            this.marcadorData.set_largo &&
            this.marcadorData.set1A === 6 &&
            this.marcadorData.set1B === 6
          ) {
            this.marcadorData.set1tie = true;
          } else if (
            !this.marcadorData.set_largo &&
            this.marcadorData.set1A === 5 &&
            this.marcadorData.set1B === 5
          ) {
            this.marcadorData.set1tie = true;
          }
        }
        //Si el segundo set ya empezo, y A no va 0
        else if (this.marcadorData.set2A !== 0) {
          //Si estan en tiebreak del segundo set
          if (this.marcadorData.set2tie) {
            //Se reinician los puntos y se desactiva el tiebreak
            this.marcadorData.puntosA = 0;
            this.marcadorData.puntosB = 0;
            this.marcadorData.set2tie = false;
          }
          //Se resta un game y se cambia el saque
          this.marcadorData.set2A -= 1;
          //transicion css
          const gamesElemento = document.querySelector('.gamesA2');
          if (gamesElemento) {
            gamesElemento.classList.add('restado');
            setTimeout(() => gamesElemento.classList.remove('restado'), 300);
          }
          this.alternarSaque();
          //Actualiza sessionStorage y notifica del cambio - Envia actualizacion a socket - put a BD
          sessionStorage.setItem('marcadorData', JSON.stringify(this.marcadorData));
          this.marcadorSignal.actualizarMarcadorData(this.marcadorData);
          this.socket.send(JSON.stringify(this.marcadorData));
          this.socketEditar.send(JSON.stringify(this.marcadorData));
          this.marcadorService.actualizarMarcador(this.marcadorData.pin_editar,this.marcadorData); 
        }
      }
      //Si estan en supertiebreak
      else {
        //Y van 0-0 y el segundo set ya termino
        if (
          this.marcadorData.set3A === 0 &&
          this.marcadorData.set3B === 0 &&
          !this.marcadorData.set2
        ) {
          //Reactiva el segundo set y resta un game al segundo set
          this.marcadorData.set2 = true;
          this.marcadorData.set2A -= 1;

          //transicion css
          const gamesElemento = document.querySelector('.gamesA2');
          if (gamesElemento) {
            gamesElemento.classList.add('restado');
            setTimeout(() => gamesElemento.classList.remove('restado'), 300);
          }

          //Actualiza sessionStorage y notifica del cambio - Envia actualizacion a socket - put a BD
          sessionStorage.setItem('marcadorData', JSON.stringify(this.marcadorData));
          this.marcadorSignal.actualizarMarcadorData(this.marcadorData);
          this.socket.send(JSON.stringify(this.marcadorData));
          this.socketEditar.send(JSON.stringify(this.marcadorData));
          this.marcadorService.actualizarMarcador(this.marcadorData.pin_editar,this.marcadorData); 

          //Si al restar ve que estaban en tiebreak, activa el tiebreak
          if (
            this.marcadorData.set_largo &&
            this.marcadorData.set2A === 6 &&
            this.marcadorData.set2B === 6
          ) {
            this.marcadorData.set2tie = true;
          } else if (
            !this.marcadorData.set_largo &&
            this.marcadorData.set2A === 5 &&
            this.marcadorData.set2B === 5
          ) {
            this.marcadorData.set2tie = true;
          }
        }
        //Si no va 0, que reste un punto
        else if (this.marcadorData.set3A !== 0) {
          this.marcadorData.set3A -= 1;

          //transicion css
          const gamesElemento = document.querySelector('.gamesA3');
          if (gamesElemento) {
            gamesElemento.classList.add('restado');
            setTimeout(() => gamesElemento.classList.remove('restado'), 300);
          }

          //Actualiza sessionStorage y notifica del cambio - Envia actualizacion a socket - put a BD
          sessionStorage.setItem('marcadorData', JSON.stringify(this.marcadorData));
          this.marcadorSignal.actualizarMarcadorData(this.marcadorData);
          this.socket.send(JSON.stringify(this.marcadorData));
          this.socketEditar.send(JSON.stringify(this.marcadorData));
          this.marcadorService.actualizarMarcador(this.marcadorData.pin_editar,this.marcadorData); 
        }
      }
    }
    //Si el partido es sin super tiebreak
    else {
      //Si esta en juego el primer set, y el gameA no es 0
      if (this.marcadorData.set1 && this.marcadorData.set1A !== 0) {
        //Si estan en tiebreak del primer set
        if (this.marcadorData.set1tie) {
          //Se reinician los puntos y se desactiva el tiebreak
          this.marcadorData.puntosA = 0;
          this.marcadorData.puntosB = 0;
          this.marcadorData.set1tie = false;
        }
        //Se resta un game y se cambia el saque
        this.marcadorData.set1A -= 1;

        //transicion css
        const gamesElemento = document.querySelector('.gamesA1');
        if (gamesElemento) {
          gamesElemento.classList.add('restado');
          setTimeout(() => gamesElemento.classList.remove('restado'), 300);
        }

        //Actualiza sessionStorage y notifica del cambio - Envia actualizacion a socket - put a BD
        sessionStorage.setItem('marcadorData', JSON.stringify(this.marcadorData));
        this.marcadorSignal.actualizarMarcadorData(this.marcadorData);
        this.socket.send(JSON.stringify(this.marcadorData));
        this.socketEditar.send(JSON.stringify(this.marcadorData));
        this.marcadorService.actualizarMarcador(this.marcadorData.pin_editar,this.marcadorData); 

        this.alternarSaque();
      }
      //Si esta en juego el segundo set
      else if (this.marcadorData.set2) {
        //Y el set todavia no empezo, es decir van 0-0 y el primer set ya termino
        if (
          this.marcadorData.set2A === 0 &&
          this.marcadorData.set2B === 0 &&
          !this.marcadorData.set1
        ) {
          //Reactiva el primer set y resta un game al primer set
          this.marcadorData.set1 = true;
          this.marcadorData.set1A -= 1;

          //transicion css
          const gamesElemento = document.querySelector('.gamesA1');
          if (gamesElemento) {
            gamesElemento.classList.add('restado');
            setTimeout(() => gamesElemento.classList.remove('restado'), 300);
          }

          //Actualiza sessionStorage y notifica del cambio - Envia actualizacion a socket - put a BD
          sessionStorage.setItem('marcadorData', JSON.stringify(this.marcadorData));
          this.marcadorSignal.actualizarMarcadorData(this.marcadorData);
          this.socket.send(JSON.stringify(this.marcadorData));
          this.socketEditar.send(JSON.stringify(this.marcadorData));
          this.marcadorService.actualizarMarcador(this.marcadorData.pin_editar,this.marcadorData); 

          //Si al restar ve que iban en tiebreak, activa el tiebreak
          if (
            this.marcadorData.set_largo &&
            this.marcadorData.set1A === 6 &&
            this.marcadorData.set1B === 6
          ) {
            this.marcadorData.set1tie = true;
          } else if (
            !this.marcadorData.set_largo &&
            this.marcadorData.set1A === 5 &&
            this.marcadorData.set1B === 5
          ) {
            this.marcadorData.set1tie = true;
          }
        }
        //Si el segundo set ya empezo, y A no va 0
        else if (this.marcadorData.set2A !== 0) {
          //Si estan en tiebreak del segundo set
          if (this.marcadorData.set2tie) {
            //Se reinician los puntos y se desactiva el tiebreak
            this.marcadorData.puntosA = 0;
            this.marcadorData.puntosB = 0;
            this.marcadorData.set2tie = false;
          }
          //Se resta un game y se cambia el saque
          this.marcadorData.set2A -= 1;

          //transicion css
          const gamesElemento = document.querySelector('.gamesA2');
          if (gamesElemento) {
            gamesElemento.classList.add('restado');
            setTimeout(() => gamesElemento.classList.remove('restado'), 300);
          }

          //Actualiza sessionStorage y notifica del cambio - Envia actualizacion a socket - put a BD
          sessionStorage.setItem('marcadorData', JSON.stringify(this.marcadorData));
          this.marcadorSignal.actualizarMarcadorData(this.marcadorData);
          this.socket.send(JSON.stringify(this.marcadorData));
          this.socketEditar.send(JSON.stringify(this.marcadorData));
          this.marcadorService.actualizarMarcador(this.marcadorData.pin_editar,this.marcadorData); 

          this.alternarSaque();
        }
      }
      //Si esta en juego el tercer set
      else {
        //Y el set todavia no empezo, es decir van 0-0 y el segundo set ya termino
        if (
          this.marcadorData.set3A === 0 &&
          this.marcadorData.set3B === 0 &&
          !this.marcadorData.set2
        ) {
          //Reactiva el segundo set y resta un game al segundo set
          this.marcadorData.set2 = true;
          this.marcadorData.set2A -= 1;

          //transicion css
          const gamesElemento = document.querySelector('.gamesA2');
          if (gamesElemento) {
            gamesElemento.classList.add('restado');
            setTimeout(() => gamesElemento.classList.remove('restado'), 300);
          }

          //Actualiza sessionStorage y notifica del cambio - Envia actualizacion a socket - put a BD
          sessionStorage.setItem('marcadorData', JSON.stringify(this.marcadorData));
          this.marcadorSignal.actualizarMarcadorData(this.marcadorData);
          this.socket.send(JSON.stringify(this.marcadorData));
          this.socketEditar.send(JSON.stringify(this.marcadorData));
          this.marcadorService.actualizarMarcador(this.marcadorData.pin_editar,this.marcadorData); 

          //Si al restar ve que iban en tiebreak, activa el tiebreak
          if (
            this.marcadorData.set_largo &&
            this.marcadorData.set2A === 6 &&
            this.marcadorData.set2B === 6
          ) {
            this.marcadorData.set2tie = true;
          } else if (
            !this.marcadorData.set_largo &&
            this.marcadorData.set2A === 5 &&
            this.marcadorData.set2B === 5
          ) {
            this.marcadorData.set2tie = true;
          }
        }
        //Si el tercer set ya empezo, y A no va 0
        else if (this.marcadorData.set3A !== 0) {
          //Si estan en tiebreak del tercer set
          if (this.marcadorData.set3tie) {
            //Se reinician los puntos y se desactiva el tiebreak
            this.marcadorData.puntosA = 0;
            this.marcadorData.puntosB = 0;
            this.marcadorData.set3tie = false;
          }
          //Se resta un game y se cambia el saque
          this.marcadorData.set3A -= 1;

          //transicion css
          const gamesElemento = document.querySelector('.gamesA3');
          if (gamesElemento) {
            gamesElemento.classList.add('restado');
            setTimeout(() => gamesElemento.classList.remove('restado'), 300);
          }

          //Actualiza sessionStorage y notifica del cambio - Envia actualizacion a socket - put a BD
          sessionStorage.setItem('marcadorData', JSON.stringify(this.marcadorData));
          this.marcadorSignal.actualizarMarcadorData(this.marcadorData);
          this.socket.send(JSON.stringify(this.marcadorData));
          this.socketEditar.send(JSON.stringify(this.marcadorData));
          this.marcadorService.actualizarMarcador(this.marcadorData.pin_editar,this.marcadorData); 

          this.alternarSaque();
        }
      }
    }
  }

  restarGameB() {
    //Si es partido con supertiebreak
    if (this.marcadorData.es_supertiebreak) {
      //Si esta en juego el primer set, y el gameA no es 0
      if (this.marcadorData.set1 && this.marcadorData.set1B !== 0) {
        //Si estan en tiebreak del primer set
        if (this.marcadorData.set1tie) {
          //Se reinician los puntos y se desactiva el tiebreak
          this.marcadorData.puntosA = 0;
          this.marcadorData.puntosB = 0;
          this.marcadorData.set1tie = false;
        }
        //Se resta un game y se cambia el saque
        this.marcadorData.set1B -= 1;

        //transicion css
        const gamesElemento = document.querySelector('.gamesB1');
        if (gamesElemento) {
          gamesElemento.classList.add('restado');
          setTimeout(() => gamesElemento.classList.remove('restado'), 300);
        }

        //Actualiza sessionStorage y notifica del cambio - Envia actualizacion a socket - put a BD
        sessionStorage.setItem('marcadorData', JSON.stringify(this.marcadorData));
        this.marcadorSignal.actualizarMarcadorData(this.marcadorData);
        this.socket.send(JSON.stringify(this.marcadorData));
        this.socketEditar.send(JSON.stringify(this.marcadorData));
        this.marcadorService.actualizarMarcador(this.marcadorData.pin_editar,this.marcadorData); 

        this.alternarSaque();
      }
      //Si esta en juego el segundo set
      else if (this.marcadorData.set2) {
        //Y el set todavia no empezo, es decir van 0-0 y el primer set ya termino
        if (
          this.marcadorData.set2A === 0 &&
          this.marcadorData.set2B === 0 &&
          !this.marcadorData.set1
        ) {
          //Reactiva el primer set y resta un game al primer set
          this.marcadorData.set1 = true;
          this.marcadorData.set1B -= 1;

          //transicion css
          const gamesElemento = document.querySelector('.gamesB1');
          if (gamesElemento) {
            gamesElemento.classList.add('restado');
            setTimeout(() => gamesElemento.classList.remove('restado'), 300);
          }

          //Actualiza sessionStorage y notifica del cambio - Envia actualizacion a socket - put a BD
          sessionStorage.setItem('marcadorData', JSON.stringify(this.marcadorData));
          this.marcadorSignal.actualizarMarcadorData(this.marcadorData);
          this.socket.send(JSON.stringify(this.marcadorData));
          this.socketEditar.send(JSON.stringify(this.marcadorData));
          this.marcadorService.actualizarMarcador(this.marcadorData.pin_editar,this.marcadorData); 

          //Si al restar ve que iban en tiebreak, activa el tiebreak
          if (
            this.marcadorData.set_largo &&
            this.marcadorData.set1A === 6 &&
            this.marcadorData.set1B === 6
          ) {
            this.marcadorData.set1tie = true;
          } else if (
            !this.marcadorData.set_largo &&
            this.marcadorData.set1A === 5 &&
            this.marcadorData.set1B === 5
          ) {
            this.marcadorData.set1tie = true;
          }
        }
        //Si el segundo set ya empezo, y B no va 0
        else if (this.marcadorData.set2B !== 0) {
          //Si estan en tiebreak del segundo set
          if (this.marcadorData.set2tie) {
            //Se reinician los puntos y se desactiva el tiebreak
            this.marcadorData.puntosA = 0;
            this.marcadorData.puntosB = 0;
            this.marcadorData.set2tie = false;
          }
          //Se resta un game y se cambia el saque
          this.marcadorData.set2B -= 1;

          //transicion css
          const gamesElemento = document.querySelector('.gamesB2');
          if (gamesElemento) {
            gamesElemento.classList.add('restado');
            setTimeout(() => gamesElemento.classList.remove('restado'), 300);
          }

          //Actualiza sessionStorage y notifica del cambio - Envia actualizacion a socket - put a BD
          sessionStorage.setItem('marcadorData', JSON.stringify(this.marcadorData));
          this.marcadorSignal.actualizarMarcadorData(this.marcadorData);
          this.socket.send(JSON.stringify(this.marcadorData));
          this.socketEditar.send(JSON.stringify(this.marcadorData));
          this.marcadorService.actualizarMarcador(this.marcadorData.pin_editar,this.marcadorData); 

          this.alternarSaque();
        }
      }
      //Si estan en supertiebreak
      else {
        //Y van 0-0 y el segundo set ya termino
        if (
          this.marcadorData.set3A === 0 &&
          this.marcadorData.set3B === 0 &&
          !this.marcadorData.set2
        ) {
          //Reactiva el segundo set y resta un game al segundo set
          this.marcadorData.set2 = true;
          this.marcadorData.set2B -= 1;

          //transicion css
          const gamesElemento = document.querySelector('.gamesB2');
          if (gamesElemento) {
            gamesElemento.classList.add('restado');
            setTimeout(() => gamesElemento.classList.remove('restado'), 300);
          }

          //Actualiza sessionStorage y notifica del cambio - Envia actualizacion a socket - put a BD
          sessionStorage.setItem('marcadorData', JSON.stringify(this.marcadorData));
          this.marcadorSignal.actualizarMarcadorData(this.marcadorData);
          this.socket.send(JSON.stringify(this.marcadorData));
          this.socketEditar.send(JSON.stringify(this.marcadorData));
          this.marcadorService.actualizarMarcador(this.marcadorData.pin_editar,this.marcadorData); 

          //Si al restar ve que estaban en tiebreak, activa el tiebreak
          if (
            this.marcadorData.set_largo &&
            this.marcadorData.set2A === 6 &&
            this.marcadorData.set2B === 6
          ) {
            this.marcadorData.set2tie = true;
          } else if (
            !this.marcadorData.set_largo &&
            this.marcadorData.set2A === 5 &&
            this.marcadorData.set2B === 5
          ) {
            this.marcadorData.set2tie = true;
          }
        }
        //Si no va 0, que reste un punto
        else if (this.marcadorData.set3B !== 0) {
          this.marcadorData.set3B -= 1;

          //transicion css
          const gamesElemento = document.querySelector('.gamesB3');
          if (gamesElemento) {
            gamesElemento.classList.add('restado');
            setTimeout(() => gamesElemento.classList.remove('restado'), 300);
          }

          //Actualiza sessionStorage y notifica del cambio - Envia actualizacion a socket - put a BD
          sessionStorage.setItem('marcadorData', JSON.stringify(this.marcadorData));
          this.marcadorSignal.actualizarMarcadorData(this.marcadorData);
          this.socket.send(JSON.stringify(this.marcadorData));
          this.socketEditar.send(JSON.stringify(this.marcadorData));
          this.marcadorService.actualizarMarcador(this.marcadorData.pin_editar,this.marcadorData); 
        }
      }
    }
    //Si el partido es sin super tiebreak
    else {
      //Si esta en juego el primer set, y el gameB no es 0
      if (this.marcadorData.set1 && this.marcadorData.set1B !== 0) {
        //Si estan en tiebreak del primer set
        if (this.marcadorData.set1tie) {
          //Se reinician los puntos y se desactiva el tiebreak
          this.marcadorData.puntosA = 0;
          this.marcadorData.puntosB = 0;
          this.marcadorData.set1tie = false;
        }
        //Se resta un game y se cambia el saque
        this.marcadorData.set1B -= 1;

        //transicion css
        const gamesElemento = document.querySelector('.gamesB1');
        if (gamesElemento) {
          gamesElemento.classList.add('restado');
          setTimeout(() => gamesElemento.classList.remove('restado'), 300);
        }

        //Actualiza sessionStorage y notifica del cambio - Envia actualizacion a socket - put a BD
        sessionStorage.setItem('marcadorData', JSON.stringify(this.marcadorData));
        this.marcadorSignal.actualizarMarcadorData(this.marcadorData);
        this.socket.send(JSON.stringify(this.marcadorData));
        this.socketEditar.send(JSON.stringify(this.marcadorData));
        this.marcadorService.actualizarMarcador(this.marcadorData.pin_editar,this.marcadorData); 

        this.alternarSaque();
      }
      //Si esta en juego el segundo set
      else if (this.marcadorData.set2) {
        //Y el set todavia no empezo, es decir van 0-0 y el primer set ya termino
        if (
          this.marcadorData.set2A === 0 &&
          this.marcadorData.set2B === 0 &&
          !this.marcadorData.set1
        ) {
          //Reactiva el primer set y resta un game al primer set
          this.marcadorData.set1 = true;
          this.marcadorData.set1B -= 1;

          //transicion css
          const gamesElemento = document.querySelector('.gamesB1');
          if (gamesElemento) {
            gamesElemento.classList.add('restado');
            setTimeout(() => gamesElemento.classList.remove('restado'), 300);
          }

          //Actualiza sessionStorage y notifica del cambio - Envia actualizacion a socket - put a BD
          sessionStorage.setItem('marcadorData', JSON.stringify(this.marcadorData));
          this.marcadorSignal.actualizarMarcadorData(this.marcadorData);
          this.socket.send(JSON.stringify(this.marcadorData));
          this.socketEditar.send(JSON.stringify(this.marcadorData));
          this.marcadorService.actualizarMarcador(this.marcadorData.pin_editar,this.marcadorData); 

          //Si al restar ve que iban en tiebreak, activa el tiebreak
          if (
            this.marcadorData.set_largo &&
            this.marcadorData.set1A === 6 &&
            this.marcadorData.set1B === 6
          ) {
            this.marcadorData.set1tie = true;
          } else if (
            !this.marcadorData.set_largo &&
            this.marcadorData.set1A === 5 &&
            this.marcadorData.set1B === 5
          ) {
            this.marcadorData.set1tie = true;
          }
        }
        //Si el segundo set ya empezo, y B no va 0
        else if (this.marcadorData.set2B !== 0) {
          //Si estan en tiebreak del segundo set
          if (this.marcadorData.set2tie) {
            //Se reinician los puntos y se desactiva el tiebreak
            this.marcadorData.puntosA = 0;
            this.marcadorData.puntosB = 0;
            this.marcadorData.set2tie = false;
          }
          //Se resta un game y se cambia el saque
          this.marcadorData.set2B -= 1;

          //transicion css
          const gamesElemento = document.querySelector('.gamesB2');
          if (gamesElemento) {
            gamesElemento.classList.add('restado');
            setTimeout(() => gamesElemento.classList.remove('restado'), 300);
          }

          //Actualiza sessionStorage y notifica del cambio - Envia actualizacion a socket - put a BD
          sessionStorage.setItem('marcadorData', JSON.stringify(this.marcadorData));
          this.marcadorSignal.actualizarMarcadorData(this.marcadorData);
          this.socket.send(JSON.stringify(this.marcadorData));
          this.socketEditar.send(JSON.stringify(this.marcadorData));
          this.marcadorService.actualizarMarcador(this.marcadorData.pin_editar,this.marcadorData); 

          this.alternarSaque();
        }
      }
      //Si esta en juego el tercer set
      else {
        //Y el set todavia no empezo, es decir van 0-0 y el segundo set ya termino
        if (
          this.marcadorData.set3A === 0 &&
          this.marcadorData.set3B === 0 &&
          !this.marcadorData.set2
        ) {
          //Reactiva el segundo set y resta un game al segundo set
          this.marcadorData.set2 = true;
          this.marcadorData.set2B -= 1;

          //transicion css
          const gamesElemento = document.querySelector('.gamesB2');
          if (gamesElemento) {
            gamesElemento.classList.add('restado');
            setTimeout(() => gamesElemento.classList.remove('restado'), 300);
          }

          //Actualiza sessionStorage y notifica del cambio - Envia actualizacion a socket - put a BD
          sessionStorage.setItem('marcadorData', JSON.stringify(this.marcadorData));
          this.marcadorSignal.actualizarMarcadorData(this.marcadorData);
          this.socket.send(JSON.stringify(this.marcadorData));
          this.socketEditar.send(JSON.stringify(this.marcadorData));
          this.marcadorService.actualizarMarcador(this.marcadorData.pin_editar,this.marcadorData); 

          //Si al restar ve que iban en tiebreak, activa el tiebreak
          if (
            this.marcadorData.set_largo &&
            this.marcadorData.set2A === 6 &&
            this.marcadorData.set2B === 6
          ) {
            this.marcadorData.set2tie = true;
          } else if (
            !this.marcadorData.set_largo &&
            this.marcadorData.set2A === 5 &&
            this.marcadorData.set2B === 5
          ) {
            this.marcadorData.set2tie = true;
          }
        }
        //Si el tercer set ya empezo, y B no va 0
        else if (this.marcadorData.set3B !== 0) {
          //Si estan en tiebreak del tercer set
          if (this.marcadorData.set3tie) {
            //Se reinician los puntos y se desactiva el tiebreak
            this.marcadorData.puntosA = 0;
            this.marcadorData.puntosB = 0;
            this.marcadorData.set3tie = false;
          }
          //Se resta un game y se cambia el saque
          this.marcadorData.set3B -= 1;

          //transicion css
          const gamesElemento = document.querySelector('.gamesB3');
          if (gamesElemento) {
            gamesElemento.classList.add('restado');
            setTimeout(() => gamesElemento.classList.remove('restado'), 300);
          }

          //Actualiza sessionStorage y notifica del cambio - Envia actualizacion a socket - put a BD
          sessionStorage.setItem('marcadorData', JSON.stringify(this.marcadorData));
          this.marcadorSignal.actualizarMarcadorData(this.marcadorData);
          this.socket.send(JSON.stringify(this.marcadorData));
          this.socketEditar.send(JSON.stringify(this.marcadorData));
          this.marcadorService.actualizarMarcador(this.marcadorData.pin_editar,this.marcadorData); 

          this.alternarSaque();
        }
      }
    }
  }

  alternarSaque() {
    if (this.marcadorData.saquea === '◉') {
      this.marcadorData.saquea = '';
      this.marcadorData.saqueb = '◉';
    } else {
      this.marcadorData.saqueb = '';
      this.marcadorData.saquea = '◉';
    }
    //Actualiza sessionStorage y notifica del cambio - Envia actualizacion a socket
    sessionStorage.setItem('marcadorData', JSON.stringify(this.marcadorData));
    this.marcadorSignal.actualizarMarcadorData(this.marcadorData);
    this.socket.send(JSON.stringify(this.marcadorData));
    this.socketEditar.send(JSON.stringify(this.marcadorData));
  }

  copiarAlPortapapeles(tipoPin: string) {
    if(tipoPin === 'compartir'){
      const pin = this.marcadorData.pin_compartir;
      navigator.clipboard.writeText(pin).then(() => {
        Swal.fire('PIN copiado al portapapeles');
      }).catch(err => {
        console.error('Error al copiar al portapapeles', err);
      });
    } else if (tipoPin === 'editar'){
      const pin = this.marcadorData.pin_editar;
      navigator.clipboard.writeText(pin).then(() => {
        Swal.fire('PIN copiado al portapapeles');
      }).catch(err => {
        console.error('Error al copiar al portapapeles', err);
      });
    }

  }

  compartirPorWhatsApp(tipoPin: string) {
    if(tipoPin === 'compartir'){
      const mensaje = `¡Únete al marcador! Usa el PIN: ${this.marcadorData.pin_compartir} o 
                      ingresa al siguiente link: https://localhost/verMarcador/${this.marcadorData.pin_compartir}`;
      const url = `https://wa.me/?text=${encodeURIComponent(mensaje)}`;
      window.open(url, '_blank');
    } else if (tipoPin === 'editar'){
      const mensaje = `¡Únete al marcador! Usa el PIN: ${this.marcadorData.pin_editar} o 
                      ingresa al siguiente link: https://localhost/edicionMarcador/${this.marcadorData.pin_compartir}?menu=true`;
      const url = `https://wa.me/?text=${encodeURIComponent(mensaje)}`;
      window.open(url, '_blank');
    }
  }

  compartirPorMail(tipoPin: string) {
    if(tipoPin === 'compartir'){
      const asunto = 'Invitación para unirse al marcador de pádel';
      const cuerpo = `Hola, te invito a unirte al marcador usando el siguiente PIN ${this.marcadorData.pin_compartir} o 
                      mediante el siguiente link https://localhost/verMarcador/${this.marcadorData.pin_compartir} `;
      const url = `mailto:?subject=${encodeURIComponent(asunto)}&body=${encodeURIComponent(cuerpo)}`;
      window.open(url);
      Swal.fire({
        title: "Enviando correo...",
        html: "Estamos abriendo una ventana para enviar el correo",
        icon: 'info',
        timer: 3000,
      });
    } else if (tipoPin === 'editar'){
      const asunto = 'Invitación para editar el marcador de pádel';
      const cuerpo = `Hola, te invito a editar al marcador usando el siguiente PIN: ${this.marcadorData.pin_editar} o 
                      mediante el siguiente link https://localhost/edicionMarcador/${this.marcadorData.pin_compartir}?menu=true`;
      const url = `mailto:?subject=${encodeURIComponent(asunto)}&body=${encodeURIComponent(cuerpo)}`;
      window.open(url);
      Swal.fire({
        title: "Enviando correo...",
        html: "Estamos abriendo una ventana para enviar el correo",
        icon: 'info',
        timer: 3000,
      });
    }
  }

  async reiniciarMarcador() {
    //Confirmacion de finalizacion
    Swal.fire({
      title: "Finalizar partido",
      text: "¿Deseas finalizar el partido y reiniciar el marcador?",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Si",
      cancelButtonText: "No"
    }).then(async (result) => {
      if (result.isConfirmed) {
        //Si confirma, que finalice el contador
        this.detenerContador(); // Detener el contador
  
        const duracion = `${this.marcadorData.horas.toString().padStart(2, "0")}:${this.marcadorData.minutos.toString().padStart(2, "0")}:${this.marcadorData.segundos.toString().padStart(2, "0")}`;
        console.log("Duración del partido:", duracion);

        //Y muestre la alerta
        Swal.fire({
          title: "¡Finalizado!",
          text: "El partido ha sido finalizado",
          icon: "success",
        });

        //Luego, que pida si quiere ingresarlo al historial
        const resultadoHistorial = await Swal.fire({
          title: "Historial de partidos",
          text: "¿Deseas agregar el marcador al historial de partidos?",
          icon: "question",
          showCancelButton: true,
          confirmButtonColor: "#3085d6",
          cancelButtonColor: "#d33",
          confirmButtonText: "Si",
          cancelButtonText: "No"
        });
        //Si acepta, logica de ingreso al historial
        if (resultadoHistorial.isConfirmed) {
          try {
            const historialData = {
              id_marcador: this.marcadorData.id_marcador,
              id_club: this.marcadorData.id_club,
              fecha_registro: new Date().toISOString(),
            };
            await this.marcadorService.agregarAlHistorial(historialData);
          } catch (error) {
            console.error("Error al agregar al historial:", error);
            return;
          }
          Swal.fire({
            title: "¡Agregado!",
            text: "El partido ha sido agregado al historial",
            icon: "success",
          });
        }
  
        this.marcadorData.marcador_finalizado = true;
  
        // Datos de los sets
        const set1Data = {
          nombre_set: "Set 1",
          games_parejaA: this.marcadorData.set1A,
          games_parejaB: this.marcadorData.set1B,
          id_marcador: this.marcadorData.id_marcador,
        };
  
        const set2Data = {
          nombre_set: "Set 2",
          games_parejaA: this.marcadorData.set2A,
          games_parejaB: this.marcadorData.set2B,
          id_marcador: this.marcadorData.id_marcador,
        };
  
        const set3Data = {
          nombre_set: "Set 3",
          games_parejaA: this.marcadorData.set3A,
          games_parejaB: this.marcadorData.set3B,
          id_marcador: this.marcadorData.id_marcador,
        };
  
        await this.marcadorService.crearSet(set1Data);
        await this.marcadorService.crearSet(set2Data);
        await this.marcadorService.crearSet(set3Data);
  
        this.marcadorData = {
          ...this.marcadorData,
          duracion_partido: duracion,
        };
  
        // Finalizar marcador
        try {
          const response = await this.marcadorService.finalizarMarcador(
            this.marcadorData.pin_editar,
            this.marcadorData
          );
          console.log("Marcador finalizado:", response);
        } catch (error) {
          console.error("Error al finalizar el marcador:", error);
        }
  
        // Reiniciar marcador
        sessionStorage.removeItem("tiempoPartido");
        this.socket.send(JSON.stringify(this.marcadorData));
        this.socketEditar.send(JSON.stringify(this.marcadorData));
  
        // Reinicio de datos
        this.marcadorData.set1A = 0;
        this.marcadorData.set2A = 0;
        this.marcadorData.set3A = 0;
        this.marcadorData.set1B = 0;
        this.marcadorData.set2B = 0;
        this.marcadorData.set3B = 0;
        this.marcadorData.puntosA = 0;
        this.marcadorData.puntosB = 0;
        this.marcadorData.set1Awin = false;
        this.marcadorData.set2Awin = false;
        this.marcadorData.set1Bwin = false;
        this.marcadorData.set2Bwin = false;
        this.marcadorData.set1 = true;
        this.marcadorData.set2 = false;
        this.marcadorData.set3 = false;
        this.marcadorData.set1tie = false;
        this.marcadorData.set2tie = false;
        this.marcadorData.set3tie = false;
        this.marcadorData.marcador_iniciado = true;
        this.marcadorData.botonInicioVisible = true;
  
        await this.marcadorService.actualizarMarcador(this.marcadorData.pin_editar, this.marcadorData);
        sessionStorage.setItem("marcadorData", JSON.stringify(this.marcadorData));
      }
    });
  }

  async finalizarMarcador() {
    // Primera confirmación: Finalizar partido
    const confirmacion = await Swal.fire({
      title: "Finalizar partido",
      text: "¿Deseas finalizar el partido?",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Si",
      cancelButtonText: "No"
    });
  
    // Si el usuario cancela, salimos de la función
    if (!confirmacion.isConfirmed) {
      return;
    }
  
    // Confirmación aceptada: Mostrar mensaje de finalización
    Swal.fire({
      title: "¡Finalizado!",
      text: "El partido ha sido finalizado",
      icon: "success"
    });
  
    // Detener el contador
    this.detenerContador();
  
    const duracion = `${this.marcadorData.horas.toString().padStart(2, "0")}:${this.marcadorData.minutos.toString().padStart(2, "0")}:${this.marcadorData.segundos.toString().padStart(2, "0")}`;
    console.log("Duración del partido:", duracion);
  
    // Segunda confirmación: Agregar al historial
    const confirmacion2 = await Swal.fire({
      title: "Historial de partidos",
      text: "¿Deseas agregar el marcador al historial de partidos?",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Si",
      cancelButtonText: "No"
    });
  
    if (confirmacion2.isConfirmed) {
      // Confirmación aceptada: Agregar al historial
      try {
        const historialData = {
          id_marcador: this.marcadorData.id_marcador,
          id_club: this.marcadorData.id_club,
          fecha_registro: new Date().toISOString(),
        };
        await this.marcadorService.agregarAlHistorial(historialData);
  
        // Mostrar mensaje de éxito
        Swal.fire({
          title: "¡Agregado!",
          text: "El partido ha sido agregado al historial",
          icon: "success"
        });
      } catch (error) {
        console.error("Error al agregar al historial:", error);
        return;
      }
    }
  
    // Actualizar el marcador como finalizado
    this.marcadorData.marcador_finalizado = true;
  
    // Preparar datos de los sets
    const set1Data = {
      nombre_set: "Set 1",
      games_parejaA: this.marcadorData.set1A,
      games_parejaB: this.marcadorData.set1B,
      id_marcador: this.marcadorData.id_marcador,
    };
  
    const set2Data = {
      nombre_set: "Set 2",
      games_parejaA: this.marcadorData.set2A,
      games_parejaB: this.marcadorData.set2B,
      id_marcador: this.marcadorData.id_marcador,
    };
  
    const set3Data = {
      nombre_set: "Set 3",
      games_parejaA: this.marcadorData.set3A,
      games_parejaB: this.marcadorData.set3B,
      id_marcador: this.marcadorData.id_marcador,
    };
  
    // Guardar sets
    try {
      await this.marcadorService.crearSet(set1Data);
      await this.marcadorService.crearSet(set2Data);
      await this.marcadorService.crearSet(set3Data);
    } catch (error) {
      console.error("Error al crear los sets:", error);
      return;
    }
  
    // Actualizar el marcador con la duración
    this.marcadorData.duracion_partido = duracion;
  
    try {
      const response = await this.marcadorService.actualizarMarcador(
        this.marcadorData.pin_editar,
        this.marcadorData
      );
      console.log("Marcador finalizado:", response);
    } catch (error) {
      console.error("Error al finalizar el marcador:", error);
    }
  
    // Reiniciar variables del marcador
    this.marcadorVisible = true;
    this.marcadorSignal.actualizarMarcadorData(null);
    sessionStorage.removeItem("marcadorData");
    this.socket.send(JSON.stringify(this.marcadorData));
    this.socketEditar.send(JSON.stringify(this.marcadorData));
    setTimeout(() => this.socket.send("Termino el partido"), 2000);
  
    // Redirigir al menú principal
    this.router.navigate(["/menuPrincipal"]);
  }

  async iniciarNuevoMarcador() {
      Swal.fire({
        title: "Crear nuevo partido",
        text: '¿Deseas crear un nuevo partido con estos datos?',
        icon: "question",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Si",
        cancelButtonText: "No"
      }).then(async (result) => {
        if (result.isConfirmed) {
          const response = await this.marcadorService.crearMarcador(this.marcadorData);
          console.log('Marcador creado:', response);
          Swal.fire({
            title: "¡Creado!",
            text: "El partido ha sido creado",
            icon: "success"
          });
          // Ocultar el botón después de iniciar un nuevo marcador
          this.marcadorData.botonInicioVisible = false;
        } else {
          return
        }
      });
    
    
  }
}
