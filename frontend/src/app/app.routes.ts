import { Routes } from '@angular/router';
import { RegistroUsuarioPage } from './pages/registro-usuario/registro-usuario.page';
import { LoginPage } from './pages/auth/login/login.page';
import { MenuPrincipalPage } from './pages/menu-principal/menu-principal.page';
import { EdicionMarcadorPage } from './pages/edicion-marcador/edicion-marcador.page';
import { VerMarcadorPage } from './pages/ver-marcador/ver-marcador.page';
import { HistorialPage } from './pages/historial/historial.page';
import { SobreNosotrosPage } from './pages/sobre-nosotros/sobre-nosotros.page';
import { InformacionPage } from './pages/informacion/informacion.page';
import { VerUsuarioPage } from './pages/ver-usuario/ver-usuario.page';
import { EditarUsuarioPage } from './pages/editar-usuario/editar-usuario.page';
import { EliminarUsuarioPage } from './pages/eliminar-usuario/eliminar-usuario.page';
import { EditarPasswordPage } from './pages/editar-password/editar-password.page';
import { AuthCallbackComponent } from './pages/auth/login/components/auth-callback/auth-callback.component';
import { ClubesPage } from './pages/clubes/clubes.page';
import { TorneoAmericanoPage } from './pages/torneo-americano/torneo-americano.page';
import { loggedGuard } from './guards/logged.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'auth/login',
    pathMatch: 'full',
  },
  {
    path: 'auth/login',
    component: LoginPage,
  },
  {
    path: 'registro',
    component: RegistroUsuarioPage,
  },
  {
    path: 'menuPrincipal',
    component: MenuPrincipalPage,
    canActivate: [loggedGuard]
  },
  {
    path: 'edicionMarcador/:pin_editar',
    component: EdicionMarcadorPage,
    canActivate: [loggedGuard]
  },
  {
    path: 'verMarcador/:pin_compartir',
    component: VerMarcadorPage,
    canActivate: [loggedGuard]
  },
  {
    path: 'historial',
    component: HistorialPage,
    canActivate: [loggedGuard]
  },
  {
    path: 'sobreNosotros',
    component: SobreNosotrosPage,
  },
  {
    path: 'informacion',
    component: InformacionPage,
    canActivate: [loggedGuard]
  },
  {
    path: 'verUsuario',
    component: VerUsuarioPage,
    canActivate: [loggedGuard]
  },
  {
    path: 'editarUsuario/:id_usuario',
    component: EditarUsuarioPage,
    canActivate: [loggedGuard]
  },
  {
    path: 'editarPassword/:id_usuario',
    component: EditarPasswordPage,
    canActivate: [loggedGuard]
  },
  {
    path: 'eliminarUsuario/:id_usuario',
    component: EliminarUsuarioPage,
    canActivate: [loggedGuard]
  },
  {
    path: 'auth/callback',
    component: AuthCallbackComponent,
  },
  {
    path: 'clubes',  
    component: ClubesPage,
    canActivate: [loggedGuard]
  },
  {
    path: 'torneo',
    component: TorneoAmericanoPage,
    canActivate: [loggedGuard]
  },
];
