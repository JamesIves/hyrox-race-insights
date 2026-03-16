import {inject, Injectable} from '@angular/core'
import {HttpClient} from '@angular/common/http'
import {Observable, catchError, of, timeout} from 'rxjs'
import type {RaceConfig} from '../models'

/**
 * Maximum time (ms) to wait for the config HTTP request.
 */
const REQUEST_TIMEOUT_MS = 10_000

/**
 * Service responsible for fetching race configuration from the server.
 *
 * Provided in the root injector so a single instance is shared
 * across the entire application.
 */
@Injectable({providedIn: 'root'})
export class RaceConfigService {
  /**
   * Injects the Angular `HttpClient` for making HTTP requests.
   */
  private readonly http = inject(HttpClient)

  /**
   * Fetches race configuration from `/data/config.json`.
   *
   * Returns `null` on network or parse failure.
   *
   * @returns Observable emitting the config or null.
   */
  public getConfig(): Observable<RaceConfig | null> {
    return this.http.get<RaceConfig>('/data/config.json').pipe(
      timeout(REQUEST_TIMEOUT_MS),
      catchError(() => of(null))
    )
  }
}
