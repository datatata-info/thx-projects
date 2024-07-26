import { Routes } from '@angular/router';
import { RoomComponent } from './components/room/room.component';
import { RoomsComponent } from './components/rooms/rooms.component';
import { NotFoundComponent } from './components/not-found/not-found.component';

export const routes: Routes = [
    { path: '', component: RoomsComponent },
    { path: ':roomId', component: RoomComponent },
    { path: '**', component: NotFoundComponent }
];
