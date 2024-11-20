import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import { QueryCache, QueryClient } from '@tanstack/query-core';


const queryClient = new QueryClient({
  queryCache: new QueryCache(),
});

bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));
