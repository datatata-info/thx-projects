import { Component } from '@angular/core';
import { MaterialModule } from '../../modules/material/material.module';
import { ChatService } from '../../services/chat/chat.service';
import { Router, RouterModule } from '@angular/router';
import { Location } from '@angular/common';
import { ResearchInfoComponent } from '../research-info/research-info.component';

@Component({
  selector: 'thx-terms',
  standalone: true,
  imports: [ MaterialModule, ResearchInfoComponent, RouterModule ],
  templateUrl: './terms.component.html',
  styleUrl: './terms.component.scss'
})
export class TermsComponent {

  constructor(
    private chatService: ChatService,
    private router: Router,
    private location: Location
  ){}

  acceptTerms(): void {
    this.chatService.setOption('termsApproved', true);
    this.router.navigate(['/chat']);
  }

  rejectTerms(): void {
    this.chatService.setOption('termsApproved', false);
    this.router.navigate(['/hello']);
  }

  goBack(): void {
    this.location.back();
  }

}
