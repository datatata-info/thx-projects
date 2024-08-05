import { ApplicationConfig, provideZoneChangeDetection, isDevMode } from '@angular/core';
import { provideRouter, withRouterConfig } from '@angular/router';
import { provideThxSocket, SocketServerConfig } from '@thx/socket';

import { routes, options } from './app.routes';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideServiceWorker } from '@angular/service-worker';

// Ignoring this import because "node_modules/@angular/common/locales/cs.mjs" was marked as having no side effects [ignored-bare-import]
// import '@angular/common/locales/cs'; // czech locales


const SOCKET_SERVER_CONFIG: SocketServerConfig = {
  // production
  host: !isDevMode() ? 'thx.ffa.vutbr.cz' : window.location.hostname,
  path: !isDevMode() ? '/socket-server' : '',
  port: !isDevMode() ? 443 : 3002,
  // development
  // host: 'localhost',
  // path: '',
  // port: 3002,
  useEncryption: true
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(
      routes,
      withRouterConfig(options)
    ),
    provideThxSocket(SOCKET_SERVER_CONFIG),
    provideAnimationsAsync(),
    provideServiceWorker('ngsw-worker.js', {
      enabled: !isDevMode(),
      registrationStrategy: 'registerWhenStable:30000'
    })
  ]
};
