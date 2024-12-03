import { Component, effect, inject, OnInit } from '@angular/core';
import { EditarTorneoComponent } from '../editar-torneo/editar-torneo.component';
import { CommonModule } from '@angular/common';
import { TorneoSignalService } from '../../services/torneo-signal.service';
import { FormsModule } from '@angular/forms';
import { TorneoService } from '../../services/torneo.service';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-ver-torneo',
  standalone: true,
  imports: [EditarTorneoComponent, CommonModule, FormsModule],
  templateUrl: './ver-torneo.component.html',
  styleUrl: './ver-torneo.component.css',
})
export class VerTorneoComponent implements OnInit {
  torneoData: any = {};
  editarTorneoVisible!: boolean;
  errorMensaje: string = '';

  rondaActual = 0;
  rondas = [
    // Ronda 1
    [
      {
        pareja1: ['nombre_jugador1', 'nombre_jugador8'],
        pareja2: ['nombre_jugador2', 'nombre_jugador5'],
      },
      {
        pareja1: ['nombre_jugador3', 'nombre_jugador6'],
        pareja2: ['nombre_jugador4', 'nombre_jugador7'],
      },
    ],

    // Ronda 2
    [
      {
        pareja1: ['nombre_jugador1', 'nombre_jugador4'],
        pareja2: ['nombre_jugador6', 'nombre_jugador7'],
      },
      {
        pareja1: ['nombre_jugador2', 'nombre_jugador3'],
        pareja2: ['nombre_jugador5', 'nombre_jugador8'],
      },
    ],

    // Ronda 3
    [
      {
        pareja1: ['nombre_jugador1', 'nombre_jugador2'],
        pareja2: ['nombre_jugador3', 'nombre_jugador4'],
      },
      {
        pareja1: ['nombre_jugador5', 'nombre_jugador6'],
        pareja2: ['nombre_jugador7', 'nombre_jugador8'],
      },
    ],

    // Ronda 4
    [
      {
        pareja1: ['nombre_jugador1', 'nombre_jugador5'],
        pareja2: ['nombre_jugador2', 'nombre_jugador6'],
      },
      {
        pareja1: ['nombre_jugador3', 'nombre_jugador7'],
        pareja2: ['nombre_jugador4', 'nombre_jugador8'],
      },
    ],

    // Ronda 5
    [
      {
        pareja1: ['nombre_jugador1', 'nombre_jugador3'],
        pareja2: ['nombre_jugador5', 'nombre_jugador7'],
      },
      {
        pareja1: ['nombre_jugador2', 'nombre_jugador4'],
        pareja2: ['nombre_jugador6', 'nombre_jugador8'],
      },
    ],

    // Ronda 6
    [
      {
        pareja1: ['nombre_jugador1', 'nombre_jugador7'],
        pareja2: ['nombre_jugador4', 'nombre_jugador6'],
      },
      {
        pareja1: ['nombre_jugador2', 'nombre_jugador8'],
        pareja2: ['nombre_jugador3', 'nombre_jugador5'],
      },
    ],

    // Ronda 7
    [
      {
        pareja1: ['nombre_jugador1', 'nombre_jugador6'],
        pareja2: ['nombre_jugador3', 'nombre_jugador8'],
      },
      {
        pareja1: ['nombre_jugador2', 'nombre_jugador7'],
        pareja2: ['nombre_jugador4', 'nombre_jugador5'],
      },
    ],
  ];

  puntos: {
    [ronda: number]: {
      [partido: number]: { pareja1Pts?: number; pareja2Pts?: number };
    };
  } = {};
  rankingFinal: any = {};
  finalizado: boolean = false;

  constructor(
    private torneoSignal: TorneoSignalService,
    private americanoService: TorneoService,
    private router: Router
  ) {
    effect(() => {
      this.torneoData = this.torneoSignal.torneoDataSignal();
      this.editarTorneoVisible = this.torneoData?.editarTorneoVisible;
    });
  }

  ngOnInit(): void {
    this.rondas.forEach((partidos, rondaIndex) => {
      this.puntos[rondaIndex] = {};
      partidos.forEach((_, partidoIndex) => {
        this.puntos[rondaIndex][partidoIndex] = {
          pareja1Pts: 0,
          pareja2Pts: 0,
        };
      });
    });
  }

  // Método para obtener los nombres de las parejas
  obtenerNombresPareja(pareja: string[]): string {
    return pareja.map((jugadorKey) => this.torneoData[jugadorKey]).join(' / ');
  }

  actualizarPuntos(rondaIndex: number) {
    const ronda = this.rondas[rondaIndex];

    const pareja1APts = this.puntos[rondaIndex][0].pareja1Pts || 0;
    const pareja1BPts = this.puntos[rondaIndex][0].pareja2Pts || 0;

    if (pareja1APts + pareja1BPts !== 32) {
      this.errorMensaje = `La suma de puntos en el partido 1 no es 32.`;
      return;
    }

    const pareja2APts = this.puntos[rondaIndex][1].pareja1Pts || 0;
    const pareja2BPts = this.puntos[rondaIndex][1].pareja2Pts || 0;

    if (pareja2APts + pareja2BPts !== 32) {
      this.errorMensaje = `La suma de puntos en el partido 2 no es 32.`;
      return;
    }

    this.errorMensaje = '';
    // Actualizamos puntos para la primera pareja en la ronda
    ronda[0].pareja1.forEach((jugadorKey: string) => {
      const jugadorNombre = this.torneoData[jugadorKey];
      this.torneoData.resultados[jugadorNombre][rondaIndex] = pareja1APts;
    });

    ronda[0].pareja2.forEach((jugadorKey: string) => {
      const jugadorNombre = this.torneoData[jugadorKey];
      this.torneoData.resultados[jugadorNombre][rondaIndex] = pareja1BPts;
    });

    // Actualizamos puntos para la segunda pareja en la ronda
    ronda[1].pareja1.forEach((jugadorKey: string) => {
      const jugadorNombre = this.torneoData[jugadorKey];
      this.torneoData.resultados[jugadorNombre][rondaIndex] = pareja2APts;
    });

    ronda[1].pareja2.forEach((jugadorKey: string) => {
      const jugadorNombre = this.torneoData[jugadorKey];
      this.torneoData.resultados[jugadorNombre][rondaIndex] = pareja2BPts;
    });

    const puntosRonda = this.generarObjetoRonda();
    const id_americano = this.torneoData.id_americano;
    this.americanoService.actualizarPuntos(id_americano, puntosRonda);
    console.log('idamericano:  ', id_americano);
    console.log('objetoo ronda: ', puntosRonda);

    // Pasamos a la siguiente ronda o mostramos el ranking si es la última
    if (rondaIndex < 6) {
      this.rondaActual++;
    } else {
      this.mostrarRanking();
    }
  }

  generarObjetoRonda(): {
    puntosJ1: number;
    puntosJ2: number;
    puntosJ3: number;
    puntosJ4: number;
    puntosJ5: number;
    puntosJ6: number;
    puntosJ7: number;
    puntosJ8: number;
    numeroRonda: number;
  } {
    // Acumulador de puntos totales
    const puntosTotales: { [key: string]: number } = {
      nombre_jugador1: 0,
      nombre_jugador2: 0,
      nombre_jugador3: 0,
      nombre_jugador4: 0,
      nombre_jugador5: 0,
      nombre_jugador6: 0,
      nombre_jugador7: 0,
      nombre_jugador8: 0,
    };

    // Recorremos todas las rondas hasta la ronda actual y sumamos los puntos
    for (let i = 0; i <= this.rondaActual; i++) {
      const ronda = this.rondas[i];
      const puntosRonda = this.puntos[i];

      // Sumamos los puntos de esta ronda a los puntos totales
      ronda.forEach((partido, partidoIndex) => {
        partido.pareja1.forEach((jugadorKey) => {
          puntosTotales[jugadorKey] +=
            puntosRonda[partidoIndex].pareja1Pts || 0;
        });
        partido.pareja2.forEach((jugadorKey) => {
          puntosTotales[jugadorKey] +=
            puntosRonda[partidoIndex].pareja2Pts || 0;
        });
      });
    }

    // retorna los puntos totales de cada jugador hasta la ronda jugada junto con el número de ronda
    return {
      puntosJ1: puntosTotales['nombre_jugador1'],
      puntosJ2: puntosTotales['nombre_jugador2'],
      puntosJ3: puntosTotales['nombre_jugador3'],
      puntosJ4: puntosTotales['nombre_jugador4'],
      puntosJ5: puntosTotales['nombre_jugador5'],
      puntosJ6: puntosTotales['nombre_jugador6'],
      puntosJ7: puntosTotales['nombre_jugador7'],
      puntosJ8: puntosTotales['nombre_jugador8'],
      numeroRonda: this.rondaActual + 1,
    };
  }

  mostrarRanking() {
    // Crea un array de jugadores con sus totales de puntos
    const ranking = Object.keys(this.torneoData.resultados).map((jugador) => {
      const puntosTotales = this.torneoData.resultados[jugador].reduce(
        (acc: number, puntos: number) => acc + puntos,
        0
      );
      return { jugador, puntosTotales };
    });

    // Ordena el array de mayor a menor según los puntos totales
    ranking.sort((a, b) => b.puntosTotales - a.puntosTotales);

    this.finalizado = true;
    this.rankingFinal = ranking;
  }

  finalizarTorneo() {
    // Solo se puede finalizar el torneo cuando la última ronda se haya completado
    if (this.rondaActual === 6) {
      // Verifica que el ranking haya sido generado
      if (!this.rankingFinal || this.rankingFinal.length === 0) {
        this.mostrarRanking(); // Genera el ranking si no se ha hecho aún
      }

      Swal.fire({
        title: "Finalizar torneo",
        text: '¿Estás seguro que deseas finalizar el torneo?',
        icon: "question",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Si",
        cancelButtonText: "No"
      }).then((result) => {
        if (result.isConfirmed) {

          const datosTorneoFinal = {
            descripcion_torneo: this.torneoData.descripcion_torneo,
            jugador1: this.torneoData.nombre_jugador1,
            jugador2: this.torneoData.nombre_jugador2,
            jugador3: this.torneoData.nombre_jugador3,
            jugador4: this.torneoData.nombre_jugador4,
            jugador5: this.torneoData.nombre_jugador5,
            jugador6: this.torneoData.nombre_jugador6,
            jugador7: this.torneoData.nombre_jugador7,
            jugador8: this.torneoData.nombre_jugador8,
            puesto1: this.rankingFinal[0]?.jugador,
            puntos1: this.rankingFinal[0]?.puntosTotales,
            puesto2: this.rankingFinal[1]?.jugador,
            puntos2: this.rankingFinal[1]?.puntosTotales,
            puesto3: this.rankingFinal[2]?.jugador,
            puntos3: this.rankingFinal[2]?.puntosTotales,
          };
    
          // Llamar al servicio para finalizar el torneo
          this.americanoService
            .finalizarTorneo(this.torneoData.id_americano, datosTorneoFinal)
            .then(async(response) => {
              alert(response.mensaje);
              this.finalizado = true;
              await Swal.fire({
                title: "¡Finalizado!",
                text: "El torneo ha sido finalizado",
                icon: "success"
              });
              this.router.navigate(['/menuPrincipal']);
              this.editarTorneoVisible = true;
              this.torneoSignal.actualizarTorneoData(null);
            })
            .catch((error) => {
              this.errorMensaje =
                error.message || 'Ocurrió un error al finalizar el torneo.';
          });

          
        }
      });
    } else {
      this.errorMensaje = 'El torneo no ha llegado a la últidma ronda.';
    }
  }

  limpiarDatosTorneo() {
    this.torneoData = {};
    this.rondaActual = 0;
    this.puntos = {};
    this.rankingFinal = {};
    this.finalizado = false;
    this.errorMensaje = '';
  }
}
