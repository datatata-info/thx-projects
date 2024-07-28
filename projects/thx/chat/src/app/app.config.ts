import { ApplicationConfig, provideZoneChangeDetection, isDevMode } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideThxSocket, SocketServerConfig } from '@thx/socket';

import { routes } from './app.routes';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideServiceWorker } from '@angular/service-worker';

// Ignoring this import because "node_modules/@angular/common/locales/cs.mjs" was marked as having no side effects [ignored-bare-import]
// import '@angular/common/locales/cs'; // czech locales


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
    provideAnimationsAsync(), provideServiceWorker('ngsw-worker.js', {
            enabled: !isDevMode(),
            registrationStrategy: 'registerWhenStable:30000'
          })
  ]
};
