import { Component } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { ImagenService } from '../../../../services/imagen.service';
import { UsuarioService } from '../../../../services/usuario.service';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FetchService } from '../../../../services/fetch.service';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../../services/auth.service';
import { Camera, CameraResultType } from "@capacitor/camera";
import Swal from 'sweetalert2';


@Component({
  selector: 'app-editar-formulario',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './editar-formulario.component.html',
  styleUrl: './editar-formulario.component.css'
})
export class EditarFormularioComponent {
  editarForm!: FormGroup; 
  errorBotonRegistro: string = '';
  imagenSeleccionada: File | null = null;
  prevImagen!: string | null;
  userId!: number;
  prevFoto!: string | null;
  foto!: string | null;
  mostrarMenuOpciones = false;
  botonDesactivado = false;

  constructor(
    private imagenService: ImagenService, 
    private usuarioService: UsuarioService, 
    private authService: AuthService,
    private router: Router, 
    private fetch: FetchService, 
    private route: ActivatedRoute) {}

  async ngOnInit() {
    this.userId = Number(this.route.snapshot.url[1].path);
    if(Number(this.fetch.getUserId()) !== Number(this.userId)){
      await Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "No puede editar los datos de otro usuario"
      });
      this.router.navigate(['/auth/login'])
      return
    } else {
      this.editarForm = new FormGroup({
        nombre: new FormControl('', [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(30)
        ]),
        apellido: new FormControl('', [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(30)
        ]),
        nombre_usuario: new FormControl('', [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(30)
        ], this.validarNombreUsuario.bind(this)),
        mail: new FormControl('', [
          Validators.required,
          Validators.email
        ], this.validarCorreo.bind(this)),});

        const response = await this.usuarioService.obtenerDatosUsuario(this.userId)
        console.log(response)
        this.editarForm.patchValue({
          nombre: response[0].nombre,
          apellido: response[0].apellido,
          nombre_usuario: response[0].nombre_usuario,
          mail: response[0].mail
        });
      this.prevImagen = await this.usuarioService.obtenerImagen(this.userId);
    }
  }


  async validarNombreUsuario(control: AbstractControl): Promise<ValidationErrors | null> {
    try {
      const response = await this.usuarioService.validarNombreUsuario(control.value);
      return response.existe ? { nombreExistente: true } : null;
    } catch (error) {
      return { errorServidor: true };
    }
  }

  async validarCorreo(control: AbstractControl): Promise<ValidationErrors | null> {
    try {
      const response = await this.usuarioService.validarCorreo(control.value);
      return response.existe ? { correoExistente: true } : null;
    } catch (error) {
      return { errorServidor: true };
    }
  }

  mostrarOpciones() {
    if (this.botonDesactivado) return;
    this.mostrarMenuOpciones = !this.mostrarMenuOpciones; // Alterna el menú
  }

  async sacarFoto(){
    this.mostrarMenuOpciones = false; // Esconde el menu
    const image = await Camera.getPhoto({
      quality: 90,
      allowEditing: true,
      resultType: CameraResultType.Base64
    });
    if(image.base64String){
      this.prevFoto = this.imagenService.convertBase64ToBlob(image.base64String, 'image/jpeg')
      this.foto = image.base64String ?? null;
      this.mostrarMenuOpciones = false; // Esconde el menu
      this.botonDesactivado = true;     // desactiva el boton
    }
  
    console.log(this.foto)
  }

  imagenCapturada(event: Event) {
    const fileInput = event.target as HTMLInputElement;
    if (fileInput.files && fileInput.files.length > 0) {
      this.imagenSeleccionada = fileInput.files[0];
      this.imagenService.extraerBase64(this.imagenSeleccionada).then((imagen: any) => {
        this.prevImagen = imagen.base;
        this.mostrarMenuOpciones = false; // esconde el menu
        this.botonDesactivado = true;    // desactiva el boton

      })
    }
  }

  async onSubmit() {
    if (this.editarForm?.invalid) {
      this.errorBotonRegistro = "Error. Faltan rellenar campos de manera correcta.";
      return;
    }

    const editadoUsuario = this.editarForm?.value;
    console.log(editadoUsuario);
    try {
      const response = await this.fetch.put(`usuarios/${this.userId}`, JSON.stringify(editadoUsuario));
      console.log("usuario editado")
      if (response.token) {
        this.authService.actualizarToken(response.token);
        this.fetch.setToken(response.token);
      }

      if (this.foto) {
        const base64String = this.foto.replace(/^data:image\/jpeg;base64,/, '');
        await this.usuarioService.subirImagen(this.userId, base64String);
        console.log("Foto subida correctamente");
      } else if (this.imagenSeleccionada && this.prevImagen) {
        await this.usuarioService.subirImagen(this.userId, this.prevImagen);
        console.log("Imagen subida correctamente");
      }
      
      this.errorBotonRegistro = "Se han actualizado los datos correctamente";
      setTimeout(() => {
        this.router.navigate(['/verUsuario']);
      }, 1500);
      this.authService.setLoginState(true); //Notificar al authService el cambio de foto
    } catch (error) {
      this.errorBotonRegistro = "Ha surgido un error intentando editar los datos. Intentelo de nuevo más tarde.";
    }
  }
}
