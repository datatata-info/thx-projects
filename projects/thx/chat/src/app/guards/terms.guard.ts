import { inject } from '@angular/core';
import { CanActivateFn } from '@angular/router';
import { ChatService } from '../services/chat/chat.service';
import { Router } from '@angular/router';

export const termsGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const termsApproved = inject(ChatService).options.termsApproved;
  if (!termsApproved) {
    router.navigate(['/terms']);
  }
  return termsApproved;
};
