import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
// rxjs
import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';


@Injectable({
  providedIn: 'root'
})
export class HttpService {

  private defaultHeaders: HttpHeaders = new HttpHeaders({
    'Content-Type': 'application/json'
  });

  constructor(
    private http: HttpClient
  ) { }

  get(url: string, headers?: HttpHeaders): Observable<HttpResponse<any>> {
    
    return this.http.get<any>(url, {observe: 'response', headers: (headers ? headers : this.defaultHeaders)})
    .pipe(
      retry(3), // retry a failed request up to 3 times
      catchError(this.handleError) // then handle the error
    );
  }

  post(url: string, body: any, headers?: HttpHeaders): Observable<HttpResponse<any>> {
    return this.http.post<any>(url, body, {observe: 'response', headers: (headers ? headers : this.defaultHeaders)})
    .pipe(
      retry(3),
      catchError(this.handleError)
    );
  }

  delete(url: string, headers?: HttpHeaders): Observable<HttpResponse<any>> {
    return this.http.delete<any>(url, {observe: 'response', headers: (headers ? headers : this.defaultHeaders)})
    .pipe(
      retry(3),
      catchError(this.handleError)
    );
  }

  put(url: string, body: any, headers?: HttpHeaders): Observable<HttpResponse<any>> {
    return this.http.put<any>(url, body, {observe: 'response', headers: (headers ? headers : this.defaultHeaders)})
    .pipe(
      retry(3),
      catchError(this.handleError)
    );
  }

  private handleError(error: HttpErrorResponse) {
    if (error.error instanceof ErrorEvent) {
      // A client-side or network error occurred. Handle it accordingly.
      console.error('An error occurred:', error.error.message);
    } else {
      // The backend returned an unsuccessful response code.
      // The response body may contain clues as to what went wrong,
      console.error(
        `Backend returned code ${error.status}, ` +
        `body was: ${error.error}`);
    }
    // return an observable with a user-facing error message
    return throwError(() => new Error('Something bad happened; please try again later.'));
  };
}
