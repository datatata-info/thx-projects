import { Injectable, inject } from '@angular/core';
// dialog
import { MatDialog } from '@angular/material/dialog';
import { DialogComponent } from '../../components/dialog/dialog.component';
// rxjs
import { Observable, BehaviorSubject } from 'rxjs';

export interface DialogAction {
  title: string,
  value: any,
  focus?: boolean
}

export interface DialogData {
  title: string,
  content: string,
  actions: DialogAction[]
}

@Injectable({
  providedIn: 'root'
})
export class DialogService {

  readonly dialog = inject(MatDialog);
  dialogData: BehaviorSubject<any> = new BehaviorSubject(null);

  constructor() { }

  openDialog(data: DialogData): Observable<any> {
    const dialogRef = this.dialog.open(DialogComponent);
    this.dialogData.next(data);
    return dialogRef.afterClosed();
  }
}
