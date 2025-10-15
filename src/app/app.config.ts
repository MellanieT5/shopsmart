import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZonelessChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import {provideHttpClient, withFetch} from '@angular/common/http';
import {API_URL} from './core/tokens';

import {LOCALE_ID} from '@angular/core';
import{registerLocaleData} from '@angular/common';
import localeSl from '@angular/common/locales/sl';

registerLocaleData(localeSl);

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideRouter(routes),
    provideClientHydration(withEventReplay()),
    provideHttpClient(withFetch()),
    {provide: API_URL, useValue: '/assets'},
    {provide: LOCALE_ID, useValue: 'sl'},
  ]
};
