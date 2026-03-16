import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners
} from '@angular/core'
import {provideRouter} from '@angular/router'
import {provideHttpClient, withFetch} from '@angular/common/http'

import {routes} from './app.routes'

/**
 * Browser-side application configuration.
 *
 * Registers the router, HTTP client (with `fetch` transport),
 * and the global error listener.
 */
export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(withFetch())
  ]
}
