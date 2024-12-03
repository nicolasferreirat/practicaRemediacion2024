import { Component, OnInit } from '@angular/core';
import { FetchService } from '../../services/fetch.service';
import { CommonModule } from '@angular/common'; 
import { RouterLink } from '@angular/router';

@Component({
  standalone: true,  
  selector: 'app-clubes',
  templateUrl: './clubes.page.html',
  styleUrls: ['./clubes.page.css'],
  imports: [CommonModule, RouterLink]  
})
export class ClubesPage implements OnInit {
  clubes: { 
    id_club: number; 
    nombre_club: string; 
    direccion: string; 
    contacto: string;
    cant_pistas: number; 
    logo?: string; 
    foto?: string; 
  }[] = [];

  constructor(private fetchService: FetchService) {}

  ngOnInit() {
    this.obtenerClubes();
  }

  async obtenerClubes(): Promise<void> {
    try {
      const response = await this.fetchService.get<{ 
        id_club: number; 
        nombre_club: string; 
        direccion: string; 
        contacto: string;
        cant_pistas: number; 
        logo?: string; 
        foto?: string; 
      }[]>('clubes');
      
      this.clubes = response.map(club => {
        const clubNameSlug = club.nombre_club.toLowerCase().replace(/ /g, '_'); 
        const logoPath = `/assets/logos/${clubNameSlug}_logo.png`;
        const fotoPath = `/assets/fotos/${clubNameSlug}_foto.png`;
        
          return {
          ...club,
          logo: logoPath,  
          foto: fotoPath,    
        };
      });
    } catch (error) {
      console.error('Error al obtener los clubes:', error);
    }
  }
}