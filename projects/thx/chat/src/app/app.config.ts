import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideThxSocket, SocketServerConfig } from '@thx/socket';

import { routes } from './app.routes';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';


const SOCKET_SERVER_CONFIG: SocketServerConfig = {
  host: 'localhost',
  port: 3002,
  useEncryption: true
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideThxSocket(SOCKET_SERVER_CONFIG),
    provideAnimationsAsync()
  ]
};
