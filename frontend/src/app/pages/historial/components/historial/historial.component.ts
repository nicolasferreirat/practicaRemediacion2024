import { Component, Input, OnInit } from '@angular/core';
import { FetchService } from '../../../../services/fetch.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-historial',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './historial.component.html',
  styleUrl: './historial.component.css'
})
export class HistorialComponent implements OnInit {
  @Input() partido: any;
  sets: any[] = [];

  constructor(private fetch: FetchService) {}

  async ngOnInit() {
    if (this.partido?.id_marcador) {
      try {
        this.sets = await this.fetch.get<any[]>(`set/${this.partido.id_marcador}`);
      } catch (error) {
        console.error(`Error al obtener los sets del marcador ${this.partido.id_marcador}:`, error);
      }
    }
  }
}
