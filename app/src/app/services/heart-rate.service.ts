import {inject, Injectable} from '@angular/core'
import {HttpClient} from '@angular/common/http'
import {Observable, catchError, of, timeout} from 'rxjs'
import type {HeartRateJsonRow} from '../models'

/**
 * Maximum time (ms) to wait for the heart-rate data HTTP request.
 */
const REQUEST_TIMEOUT_MS = 8_000

/**
 * Service responsible for fetching heart-rate export data from the server.
 *
 * Provided in the root injector so a single instance is shared
 * across the entire application.
 */
@Injectable({providedIn: 'root'})
export class HeartRateService {
  /**
   * Injects the Angular `HttpClient` for making HTTP requests.
   */
  private readonly http = inject(HttpClient)

  /**
   * Fetches the heart-rate JSON export from `/data/heart_rate.json`.
   *
   * Returns an empty array on network or parse failure.
   *
   * @returns Observable emitting the heart-rate row array.
   */
  public getHeartRateData(): Observable<HeartRateJsonRow[]> {
    return this.http.get<HeartRateJsonRow[]>('/data/heart_rate.json').pipe(
      timeout(REQUEST_TIMEOUT_MS),
      catchError((err: unknown) => {
        console.error('Failed to load heart rate data', err)
        return of([] as HeartRateJsonRow[])
      })
    )
  }
}
