import { Component, OnInit } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { TorneoSignalService } from '../../services/torneo-signal.service';
import { CommonModule } from '@angular/common';
import { TorneoService } from '../../services/torneo.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-editar-torneo',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './editar-torneo.component.html',
  styleUrl: './editar-torneo.component.css',
})
export class EditarTorneoComponent implements OnInit {
  torneoForm!: FormGroup;
  errorInicio!: string;
  idAmericano!: number;

  constructor(
    private torneoSignal: TorneoSignalService,
    private torneoService: TorneoService
  ) {}

  ngOnInit(): void {
    this.torneoForm = new FormGroup({
      descripcion_torneo: new FormControl('', Validators.required),
      nombre_jugador1: new FormControl('', Validators.required),
      nombre_jugador2: new FormControl('', Validators.required),
      nombre_jugador3: new FormControl('', Validators.required),
      nombre_jugador4: new FormControl('', Validators.required),
      nombre_jugador5: new FormControl('', Validators.required),
      nombre_jugador6: new FormControl('', Validators.required),
      nombre_jugador7: new FormControl('', Validators.required),
      nombre_jugador8: new FormControl('', Validators.required),
    });
  }

  async iniciarTorneo() {
    if (this.torneoForm.valid) {
      // Validar que los nombres sean distintos
      const nombresJugadores = [
        this.torneoForm.value.nombre_jugador1,
        this.torneoForm.value.nombre_jugador2,
        this.torneoForm.value.nombre_jugador3,
        this.torneoForm.value.nombre_jugador4,
        this.torneoForm.value.nombre_jugador5,
        this.torneoForm.value.nombre_jugador6,
        this.torneoForm.value.nombre_jugador7,
        this.torneoForm.value.nombre_jugador8,
      ];

      if (new Set(nombresJugadores).size !== nombresJugadores.length) {
        this.errorInicio = 'Los nombres de los jugadores deben ser distintos';
        return;
      }

      Swal.fire({
        title: "Crear nuevo torneo",
        text: '¿Deseas crear un nuevo torneo con estos datos?',
        icon: "question",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Si",
        cancelButtonText: "No"
      }).then(async(result) => {
        if (result.isConfirmed) {

          let torneoData = {
            ...this.torneoForm.value,
            editarTorneoVisible: true,
          };
    
          const resultados: any = {};
    
          for (let i = 1; i <= 8; i++) {
            const jugadorKey = `nombre_jugador${i}`;
            const jugadorNombre = torneoData[jugadorKey];
            resultados[jugadorNombre] = Array(7).fill(0);
          }
          //post al back retornando id
          const americanoData = {
            descripcion_torneo: this.torneoForm.value.descripcion_torneo,
            jugador1: this.torneoForm.value.nombre_jugador1,
            jugador2: this.torneoForm.value.nombre_jugador2,
            jugador3: this.torneoForm.value.nombre_jugador3,
            jugador4: this.torneoForm.value.nombre_jugador4,
            jugador5: this.torneoForm.value.nombre_jugador5,
            jugador6: this.torneoForm.value.nombre_jugador6,
            jugador7: this.torneoForm.value.nombre_jugador7,
            jugador8: this.torneoForm.value.nombre_jugador8,
          };
  
    
          const response = await this.torneoService.crearTorneoAmericano(
            americanoData
          );
    
          this.idAmericano = response.id_americano;
          torneoData = {
            ...torneoData,
            id_americano: response.id_americano,
          };
    
          this.torneoSignal.actualizarTorneoData({ ...torneoData, resultados });

          Swal.fire({
            title: "¡Creado!",
            text: "El torneo ha sido creado",
            icon: "success"
          });
        }
      });
    } else {
      this.errorInicio = 'Todos los campos son obligatorios';
    }
  }
}
