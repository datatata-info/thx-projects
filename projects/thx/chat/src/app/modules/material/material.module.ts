import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
// material
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    MatButtonModule,
    MatInputModule,
    MatIconModule,
    MatCheckboxModule
  ],
  exports: [
    CommonModule,
    MatButtonModule,
    MatInputModule,
    MatIconModule,
    MatCheckboxModule
  ]
})
export class MaterialModule { }
