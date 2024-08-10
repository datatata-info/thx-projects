import { Component, AfterViewInit } from '@angular/core';
import { MaterialModule } from '../../modules/material/material.module';
import { ChatService } from '../../services/chat/chat.service';
import { Router, RouterModule } from '@angular/router';
import { Location } from '@angular/common';
import { ResearchInfoComponent } from '../research-info/research-info.component';
import { ReactiveFormsModule, FormControl, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'thx-terms',
  standalone: true,
  imports: [
    MaterialModule,
    ResearchInfoComponent,
    RouterModule,
    ReactiveFormsModule
  ],
  templateUrl: './terms.component.html',
  styleUrl: './terms.component.scss'
})
export class TermsComponent implements AfterViewInit {

  additioanalAccepts: FormGroup = new FormGroup({
    userConduct: new FormControl('', Validators.required),
    policyChanges: new FormControl('', Validators.required)
  });

  constructor(
    private chatService: ChatService,
    private router: Router,
    private location: Location
  ){}

  ngAfterViewInit(): void {
    
  }

  acceptTerms(): void {
    this.chatService.options.termsApproved = true;
    this.chatService.updateOptions();
    this.router.navigate([this.chatService.lastRoute]);
  }

  rejectTerms(): void {
    this.chatService.options.termsApproved = false;
    this.chatService.updateOptions();
    this.router.navigate(['/hello']);
  }

  goBack(): void {
    this.location.back();
  }

}
