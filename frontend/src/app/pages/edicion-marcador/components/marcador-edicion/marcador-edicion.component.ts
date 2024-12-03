import { Component, Input, OnInit } from '@angular/core';
import {
  FormGroup,
  FormControl,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { MarcadorService } from '../../services/marcador.service';
import { CommonModule } from '@angular/common';
import { MarcadorSignalService } from '../../services/marcador-signal.service';
import { ActivatedRoute } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  selector: 'app-marcador-edicion',
  templateUrl: './marcador-edicion.component.html',
  styleUrl: './marcador-edicion.component.css',
})
export class MarcadorEdicionComponent implements OnInit {
  marcadorForm!: FormGroup;
  clubes: any[] = [];
  errorInicio!: string;
  @Input() marcadorFinalizado!: boolean;

  // Variables para el contador de tiempo
  minutos: number = 0;
  segundos: number = 0;

  constructor(
    private marcadorService: MarcadorService,
    private marcadorSignal: MarcadorSignalService,
    private ruta: ActivatedRoute
  ) {}

  ngOnInit() {
    this.marcadorForm = new FormGroup({
      descripcion_competencia: new FormControl('', Validators.required),
      nombre_pareja_A1: new FormControl('', Validators.required),
      nombre_pareja_A2: new FormControl('', Validators.required),
      nombre_pareja_B1: new FormControl('', Validators.required),
      nombre_pareja_B2: new FormControl('', Validators.required),
      id_club: new FormControl('', Validators.required),
      ventaja: new FormControl(false),
      es_supertiebreak: new FormControl(false),
      set_largo: new FormControl(false),
    });

    this.obtenerClubes();
  }

  async obtenerClubes() {
    try {
      this.clubes = await this.marcadorService.obtenerClubes();
    } catch (error) {
      console.error('Error al obtener clubes:', error);
    }
  }

  async iniciarMarcador() {
    if (this.marcadorForm.valid) {
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
          this.setFormReadonly(true);

          const marcadorData = {
            ...this.marcadorForm.value,
            botonInicioVisible: false,
            marcador_iniciado: true,
            marcadorVisible: true,
            puntosA: 0,
            puntosB: 0,
            set1A: 0,
            set2A: 0,
            set3A: 0,
            set1B: 0,
            set2B: 0,
            set3B: 0,
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

            horas: 0,
            minutos: 0,
            segundos: 0,

            pin_editar: this.ruta.snapshot.paramMap.get('pin_editar'),
            pin_compartir: this.marcadorService.generarPin(),
            id_usuario: this.marcadorService.obtenerUserId(),
          };

          try {
            const response = await this.marcadorService.crearMarcador(marcadorData);
            console.log('Marcador creado:', response);

            const idMarcador = response.id_marcador;
            const fechaMarcador = response.fecha_creacion;
            const marcadorDatos = {
              ...marcadorData,
              id_marcador: idMarcador,
              fecha_creacion: fechaMarcador,
            }

            this.marcadorSignal.actualizarMarcadorData(marcadorDatos);
            sessionStorage.setItem('marcadorData', JSON.stringify(marcadorDatos));
          } catch (error) {
            console.error('Error al crear marcador:', error);
          }
          Swal.fire({
            title: "¡Creado!",
            text: "El partido ha sido creado",
            icon: "success"
          });
        }
      });
    } else {
      this.errorInicio = 'Todos los campos son obligatorios';
    }
  }

  setFormReadonly(isReadonly: boolean) {
    const formControls = this.marcadorForm.controls;
    for (let controlKey in formControls) {
      if (isReadonly) {
        formControls[controlKey].disable();
      } else {
        formControls[controlKey].enable();
      }
    }
  }
}
