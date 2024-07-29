import { Component } from '@angular/core';
import { Location } from '@angular/common';
import { MaterialModule } from '../../modules/material/material.module';
import { RouterModule } from '@angular/router';
import { ResearchInfoComponent } from '../research-info/research-info.component';

@Component({
  selector: 'thx-about',
  standalone: true,
  imports: [ MaterialModule, RouterModule, ResearchInfoComponent ],
  templateUrl: './about.component.html',
  styleUrl: './about.component.scss'
})
export class AboutComponent {

  constructor(
    private location: Location
  ){}

  goBack(): void {
    this.location.back();
  }

}
