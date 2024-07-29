import { Routes, ExtraOptions } from '@angular/router';
import { termsGuard } from './guards/terms.guard';
// componets
import { RoomComponent } from './components/room/room.component';
import { RoomsComponent } from './components/rooms/rooms.component';
import { NotFoundComponent } from './components/not-found/not-found.component';
import { HelloComponent } from './components/hello/hello.component';
import { TermsComponent } from './components/terms/terms.component';
import { SettingsComponent } from './components/settings/settings.component';
import { AboutComponent } from './components/about/about.component';

export const options: ExtraOptions = {
    useHash: false,
    anchorScrolling: 'enabled',
    onSameUrlNavigation: 'reload'
}

export const routes: Routes = [
    { path: 'hello', component: HelloComponent },
    { path: 'about', component: AboutComponent },
    { path: 'terms', component: TermsComponent },
    { path: 'settings', component: SettingsComponent, canActivate: [termsGuard]},
    { path: 'chat', component: RoomsComponent, canActivate: [termsGuard] },
    { path: 'chat/:roomId', component: RoomComponent, canActivate: [termsGuard] },
    { path: '',
        redirectTo: '/hello', // temp -> production to hello
        pathMatch: 'full'
    },
    { path: '**', component: NotFoundComponent }
];
