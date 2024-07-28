import { Component } from '@angular/core';
import { MaterialModule } from '../../modules/material/material.module';
import { ChatService } from '../../services/chat/chat.service';
import { Router } from '@angular/router';

@Component({
  selector: 'thx-terms',
  standalone: true,
  imports: [ MaterialModule ],
  templateUrl: './terms.component.html',
  styleUrl: './terms.component.scss'
})
export class TermsComponent {

  constructor(
    private chatService: ChatService,
    private router: Router
  ){}

  acceptTerms(): void {
    this.chatService.setOption('termsApproved', true);
    this.router.navigate(['/']);
  }

  rejectTerms(): void {
    this.chatService.setOption('termsApproved', false);
    this.router.navigate(['/hello']);
  }

}
