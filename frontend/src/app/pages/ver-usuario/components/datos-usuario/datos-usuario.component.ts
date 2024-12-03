import { Component, inject, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FetchService } from '../../../../services/fetch.service';
import { AuthService } from '../../../../services/auth.service';
import { UsuarioService } from '../../../../services/usuario.service';
import Swal from 'sweetalert2';


@Component({
  selector: 'app-datos-usuario',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './datos-usuario.component.html',
  styleUrl: './datos-usuario.component.css'
})
export class DatosUsuarioComponent implements OnInit {
  userId!: number;
  datosUsuario: any = {
    id: 0,
    nombre: '',
    apellido: '',
    usuario: '',
    mail: '',
  }

  prevImagen!: string | null;
  
  constructor(
    private fetch: FetchService, 
    private router: Router,
    private usuarioService: UsuarioService, 
    private authService: AuthService){}

  ngOnInit(): void {
    this.cargarDatos()
  }


  async cargarDatos() {
    const id = this.fetch.getUserId();
    if (id !== null) {
      this.userId = id;
      try {
        const response = await this.usuarioService.obtenerDatosUsuario(this.userId);
        this.prevImagen = await this.usuarioService.obtenerImagen(this.userId);;
        // Asignar los datos obtenidos a los atributos de datosUsuario
        this.datosUsuario.id = response[0].id;
        this.datosUsuario.nombre = response[0].nombre;
        this.datosUsuario.apellido = response[0].apellido;
        this.datosUsuario.usuario = response[0].nombre_usuario;
        this.datosUsuario.mail = response[0].mail;
      } catch (error) {
        console.error('Error al cargar los datos del usuario:', error);
      }
    }
  }

  logout(): void {
    Swal.fire({
      title: "Cerrar sesión",
      text: "¿Estás seguro que deseas cerrar sesión?",
      icon: "info",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Si",
      cancelButtonText: "No",
    }).then((result) => {
      if (result.isConfirmed) {
        this.authService.logout();
        this.fetch.logout();
        this.router.navigate(['/']);
      }
    });
  }

}
