import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FetchService } from '../../../../services/fetch.service';

@Component({
  selector: 'app-historial-americano',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './historial-americano.component.html',
  styleUrl: './historial-americano.component.css',
})
export class HistorialAmericanoComponent {
  @Input() americano: any;
  americanos: any[] = []; // Lista de torneos americanos

  constructor(private fetch: FetchService) {}

  async ngOnInit() {
    try {
      this.americanos = await this.fetch.get<any[]>('/americanos');
    } catch (error) {
      console.error('Error al obtener los torneos americanos', error);
    }
  }
}
