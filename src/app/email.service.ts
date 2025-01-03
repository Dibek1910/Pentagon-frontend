import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class EmailService {
  private apiUrl = 'http://localhost:8000/notifications';

  constructor(private http: HttpClient) {}

  sendPersonalDetailsSubmissionEmail(email: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/personal-details-submission`, {
      email,
    });
  }

  sendDocumentSubmissionEmail(customerId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/document-submission`, { customerId });
  }

  sendAccountCreationEmail(
    email: string,
    customerId: number,
    accountId: number
  ): Observable<any> {
    return this.http.post(`${this.apiUrl}/account-creation`, {
      email,
      customerId,
      accountId,
    });
  }
}
