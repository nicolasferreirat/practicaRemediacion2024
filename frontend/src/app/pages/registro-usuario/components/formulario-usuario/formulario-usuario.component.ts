import { Component, OnInit } from '@angular/core';
import {
  FormGroup,
  Validators,
  AbstractControl,
  ValidationErrors,
  ReactiveFormsModule,
  FormControl,
  ValidatorFn,
} from '@angular/forms';
import { UsuarioService } from '../../../../services/usuario.service';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { ImagenService } from '../../../../services/imagen.service';
import { FetchService } from '../../../../services/fetch.service';
import { Camera, CameraResultType } from "@capacitor/camera";

@Component({
  selector: 'app-formulario-usuario',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './formulario-usuario.component.html',
  styleUrls: ['./formulario-usuario.component.css'],
})
export class FormularioUsuarioComponent implements OnInit {
  registroForm!: FormGroup;
  errorBotonRegistro: string = '';
  imagenSeleccionada: File | null = null;
  prevImagen!: string | null;
  prevImagenGoogle!: string | null;
  mailGoogle = false;
  prevFoto!: string | null;
  foto!: string | null;
  mostrarMenuOpciones = false;
  botonDesactivado = false;


  constructor(
    private imagenService: ImagenService,
    private usuarioService: UsuarioService,
    private router: Router,
    private fetch: FetchService,
    private route: ActivatedRoute
  ) {}

  async ngOnInit() {
    this.registroForm = new FormGroup(
      {
        nombre: new FormControl('', [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(30),
        ]),
        apellido: new FormControl('', [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(30),
        ]),
        nombre_usuario: new FormControl(
          '',
          [
            Validators.required,
            Validators.minLength(3),
            Validators.maxLength(30),
          ],
          this.validarNombreUsuario.bind(this)
        ),
        mail: new FormControl(
          '',
          [Validators.required, Validators.email],
          this.validarCorreo.bind(this)
        ),
        password: new FormControl('', [
          Validators.required,
          this.passwordValidator(),
        ]),
        repetirPassword: new FormControl('', [Validators.required]),
      },
      { validators: this.passwordsIguales() }
    );

    // sacamos el mail y la imagen desde params de la url
    const email = this.route.snapshot.queryParams['email'];
    if (email) {
      this.registroForm.get('mail')?.setValue(email, { emitEvent: false });
      this.mailGoogle = true;
    }
    const imagenUrl = this.route.snapshot.queryParams['imagen'];
    if (imagenUrl) {
      // Convierte la URL a base64 y asígnala a prevImagen para mostrarla
      this.prevImagenGoogle = await this.imagenService.obtenerImagenBase64DesdeURL(imagenUrl);
      console.log(this.prevImagenGoogle)
    }
  }

  passwordValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;

      if (!value) {
        return null;
      }

      const hasUpperCase = /[A-Z]/.test(value);
      const hasLowerCase = /[a-z]/.test(value);
      const hasNumeric = /[0-9]/.test(value);
      const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(value);
      const isValidLength = value.length >= 8 && value.length <= 12;

      const passwordValid =
        hasUpperCase &&
        hasLowerCase &&
        hasNumeric &&
        hasSpecialChar &&
        isValidLength;

      return !passwordValid ? { passwordStrength: true } : null;
    };
  }

  async validarNombreUsuario(
    control: AbstractControl
  ): Promise<ValidationErrors | null> {
    try {
      const response = await this.usuarioService.validarNombreUsuario(
        control.value
      );
      return response.existe ? { nombreExistente: true } : null;
    } catch (error) {
      return { errorServidor: true };
    }
  }

  async validarCorreo(
    control: AbstractControl
  ): Promise<ValidationErrors | null> {
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

  passwordsIguales(): ValidatorFn {
    return (group: AbstractControl): ValidationErrors | null => {
      const password = group.get('password')?.value || '';
      const repetirPassword = group.get('repetirPassword')?.value || '';
      return password === repetirPassword ? null : { noCoinciden: true };
    };
  }

  imagenCapturada(event: Event) {
    const fileInput = event.target as HTMLInputElement;
    if (fileInput.files && fileInput.files.length > 0) {
      this.imagenSeleccionada = fileInput.files[0];
      this.imagenService
        .extraerBase64(this.imagenSeleccionada)
        .then((imagen: any) => {
          this.prevImagen = imagen.base;
          this.mostrarMenuOpciones = false; // esconde el menu
          this.botonDesactivado = true;    // desactiva el boton
        });
    }
  }

  async onSubmit() {
    if (this.registroForm?.invalid) {
      this.errorBotonRegistro =
        'Error. Faltan rellenar campos de manera correcta.';
      return;
    }

    const nuevoUsuario = this.registroForm?.value;
    console.log(nuevoUsuario);
    try {
      const response = await this.fetch.post(
        'usuarios',
        JSON.stringify(nuevoUsuario)
      );
      console.log('usuario creado');
      if (this.prevImagen) {
        await this.usuarioService.subirImagen(
          response.id_usuario,
          this.prevImagen
        );
        console.log('Imagen subida correctamente');
      } else if (this.prevImagenGoogle){
        //google maneja imagen .png
        let base64StringWithPrefix = this.prevImagenGoogle;
        const base64String = base64StringWithPrefix.replace(
          /^data:image\/png;base64/,
          ''
        );
        await this.usuarioService.subirImagen(
          response.id_usuario,
          base64String
        );
        console.log('Imagen de google subida correctamente');
      } else if (this.foto){
        //google maneja imagen .png
        let base64StringWithPrefix = this.foto;
        const base64String = base64StringWithPrefix.replace(
          /^data:image\/png;base64/,
          ''
        );
        await this.usuarioService.subirImagen(
          response.id_usuario,
          base64String
        );
        console.log('Foto subida correctamente');
      }

      this.errorBotonRegistro =
        'Se ha registrado correctamente. Redirigiendo al login...';
      setTimeout(() => {
        this.router.navigate(['/auth/login']);
      }, 2000);
    } catch (error) {
      this.errorBotonRegistro =
        'Ha surgido un error intentando registrar a este usuario. Intentelo de nuevo más tarde.';
    }
  }
}
