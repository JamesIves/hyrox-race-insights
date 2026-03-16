import {inject, Injectable} from '@angular/core'
import {HttpClient} from '@angular/common/http'
import {Observable, catchError, of, timeout} from 'rxjs'
import type {RaceData} from '../models'

/**
 * Maximum time (ms) to wait for the race-data HTTP request.
 */
const REQUEST_TIMEOUT_MS = 15_000

/**
 * Service responsible for fetching race-result data from the server.
 *
 * Provided in the root injector so a single instance is shared
 * across the entire application.
 */
@Injectable({providedIn: 'root'})
export class RaceDataService {
  /**
   * Injects the Angular `HttpClient` for making HTTP requests.
   */
  private readonly http = inject(HttpClient)

  /**
   * Fetches the full race-result dataset from `/data/race.json`.
   *
   * Returns an empty array on network or parse failure.
   *
   * @returns Observable emitting the race-data array.
   */
  public getRaceData(): Observable<RaceData[]> {
    return this.http.get<RaceData[]>('/data/race.json').pipe(
      timeout(REQUEST_TIMEOUT_MS),
      catchError((err: unknown) => {
        console.error('Failed to load race data', err)
        return of([] as RaceData[])
      })
    )
  }
}
