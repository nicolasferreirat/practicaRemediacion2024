import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const loggedGuard: CanActivateFn = async (route, state) => {
  const authService: AuthService = inject(AuthService)
  const router: Router = inject(Router);

  const isAuthenticated = await authService.isAuthenticated();
  
  if (isAuthenticated) {
    return true;
  } else {
    router.navigate(['/auth/login']);
    return false;
  }
};