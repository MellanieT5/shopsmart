import { mergeApplicationConfig, ApplicationConfig } from '@angular/core';
import { provideServerRendering, withRoutes } from '@angular/ssr';
import { appConfig } from './app.config';
import { serverRoutes } from './app.routes.server';
import{API_URL} from './core/tokens';

const serverConfig: ApplicationConfig = {
  providers: [
    {provide: API_URL, useValue: '/assets'}
  ]
};

export const config = mergeApplicationConfig(appConfig, serverConfig);
