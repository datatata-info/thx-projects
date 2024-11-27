import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideThxProtocol, SocketServerConfig } from '@thx/protocol';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideThxProtocol({
      // TODO IF isDevMode() ... 
      host: window.location.hostname,
      path: '',
      port: 3002,
      useEncryption: false
    })
  ]
};
