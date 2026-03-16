import {Component} from '@angular/core'
import {DashboardComponent} from './dashboard.component'

/**
 * Application root component.
 *
 * Renders the single-page dashboard and serves as the bootstrap
 * entry point referenced in `main.ts`.
 */
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [DashboardComponent],
  template: '<app-dashboard></app-dashboard>',
  styleUrl: './app.css'
})
export class App {}
