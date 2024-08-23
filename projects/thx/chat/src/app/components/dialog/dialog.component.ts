import {
  Component,
  ChangeDetectionStrategy
} from '@angular/core';
// material
import { MaterialModule } from '../../modules/material/material.module';
// services
import { DialogService, DialogData, DialogAction } from '../../services/dialog/dialog.service';

@Component({
  selector: 'thx-dialog',
  standalone: true,
  imports: [ MaterialModule ],
  templateUrl: './dialog.component.html',
  styleUrl: './dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DialogComponent {

  dialogData!: DialogData;

  constructor(
    private dialogService: DialogService
  ) {
    this.dialogService.dialogData.subscribe({
      next: (data: DialogData | null) => {
        if (data) {
          console.log('dialogData?', data);
          this.dialogData = data;
        }
      },
      error: (e: any) => console.error(e)
    })
  }
}
