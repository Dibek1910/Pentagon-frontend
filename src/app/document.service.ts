import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class DocumentService {
  private apiUrl = 'https://pentagon-backend-v4cw.onrender.com/documents';

  constructor(private http: HttpClient) {}

  uploadDocument(
    customerId: number,
    documentType: string,
    file: File
  ): Observable<any> {
    const formData = new FormData();
    formData.append('customer_id', customerId.toString());
    formData.append('document_type', documentType);
    formData.append('file', file);

    return this.http
      .post(this.apiUrl, formData)
      .pipe(catchError(this.handleError));
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'An error occurred';
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Error: ${error.error.message}`;
    } else {
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
    }
    console.error(errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}
