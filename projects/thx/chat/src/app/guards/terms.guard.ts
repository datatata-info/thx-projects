import { inject } from '@angular/core';
import { ActivatedRoute, CanActivateFn } from '@angular/router';
import { ChatService } from '../services/chat/chat.service';
import { Router } from '@angular/router';

export const termsGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const chatService = inject(ChatService);
  // console.log('terms.guard route', route);
  // console.log('terms.guard state', state);
  chatService.lastRoute = state.url;

  const termsApproved = chatService.options.termsApproved;
  if (!termsApproved) {
    router.navigate(['/terms']);
  }
  return termsApproved;
};
