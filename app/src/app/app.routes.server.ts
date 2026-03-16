import {RenderMode, ServerRoute} from '@angular/ssr'

/**
 * Server-side route configuration for Angular SSR.
 *
 * All routes are pre-rendered at build time.
 */
export const serverRoutes: ServerRoute[] = [
  {
    path: '**',
    renderMode: RenderMode.Prerender
  }
]
