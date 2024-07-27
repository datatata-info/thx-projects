import { Routes } from '@angular/router';
import { RoomComponent } from './components/room/room.component';
import { RoomsComponent } from './components/rooms/rooms.component';
import { NotFoundComponent } from './components/not-found/not-found.component';
import { HelloComponent } from './components/hello/hello.component';

export const routes: Routes = [
    { path: 'hello', component: HelloComponent },
    { path: 'chat', component: RoomsComponent },
    { path: 'chat/:roomId', component: RoomComponent },
    { path: '',
        redirectTo: '/chat', // temp -> production to hello
        pathMatch: 'full'
    },
    { path: '**', component: NotFoundComponent }
];
