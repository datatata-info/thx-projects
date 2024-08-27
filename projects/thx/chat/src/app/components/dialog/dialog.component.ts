import {
  Component,
  ChangeDetectionStrategy,
  OnInit,
  OnDestroy
} from '@angular/core';
// material
import { MaterialModule } from '../../modules/material/material.module';
// services
import { DialogService, DialogData, DialogAction } from '../../services/dialog/dialog.service';
// rxjs
import { Subscription } from 'rxjs';

@Component({
  selector: 'thx-dialog',
  standalone: true,
  imports: [ MaterialModule ],
  templateUrl: './dialog.component.html',
  styleUrl: './dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DialogComponent implements OnInit, OnDestroy {

  dialogData!: DialogData;
  private dialogDataSub: Subscription = new Subscription();

  constructor(
    private dialogService: DialogService
  ) { }

  ngOnInit(): void {
    this.dialogDataSub = this.dialogService.dialogData.subscribe({
      next: (data: DialogData | null) => {
        if (data) {
          // console.log('dialogData?', data);
          this.dialogData = data;
        }
      },
      error: (e: any) => console.error(e)
    });
  }

  ngOnDestroy(): void {
    this.dialogDataSub.unsubscribe();
  }
}
