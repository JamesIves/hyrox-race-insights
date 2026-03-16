import {mergeApplicationConfig, ApplicationConfig} from '@angular/core'
import {provideServerRendering, withRoutes} from '@angular/ssr'
import {appConfig} from './app.config'
import {serverRoutes} from './app.routes.server'

/**
 * Server-side rendering configuration.
 */
const serverConfig: ApplicationConfig = {
  providers: [provideServerRendering(withRoutes(serverRoutes))]
}

/**
 * Merged application config for server-side rendering,
 * combining browser and SSR providers.
 */
export const config = mergeApplicationConfig(appConfig, serverConfig)
