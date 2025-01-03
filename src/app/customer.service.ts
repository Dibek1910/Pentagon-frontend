import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

export interface CustomerResponse {
  id: number;
  first_name: string;
  middle_name?: string;
  last_name: string;
  email: string;
  phone_number: string;
  primary_account_id: number;
}

export interface CustomerCreate {
  first_name: string;
  middle_name?: string;
  last_name: string;
  phone_number: string;
  email: string;
  gender: string;
  dob: string;
  current_address: string;
  current_city: string;
  current_state: string;
  current_pincode: string;
  is_permanent_same_as_current: boolean;
  permanent_address: string;
  permanent_city: string;
  permanent_state: string;
  permanent_pincode: string;
  password: string;
}

@Injectable({
  providedIn: 'root'
})
export class CustomerService {
  private apiUrl = 'http://localhost:8000';

  constructor(private http: HttpClient) {}

  createCustomer(customerData: CustomerCreate): Observable<CustomerResponse> {
    return this.http.post<CustomerResponse>(`${this.apiUrl}/customers`, customerData)
      .pipe(catchError(this.handleError));
  }

  getAccountDetails(customerId: number): Observable<CustomerResponse> {
    return this.http.get<CustomerResponse>(`${this.apiUrl}/customers/${customerId}`)
      .pipe(catchError(this.handleError));
  }

  completeKycVerification(customerId: number): Observable<CustomerResponse> {
    return this.http.post<CustomerResponse>(`${this.apiUrl}/customers/${customerId}/complete-kyc`, {})
      .pipe(catchError(this.handleError));
  }

  getAccountBalance(customerId: number): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/customers/${customerId}/balance`)
      .pipe(catchError(this.handleError));
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'An error occurred';

    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Server-side error
      if (error.status === 0) {
        errorMessage = 'Server is currently unavailable. Please try again later.';
      } else if (error.error?.detail) {
        errorMessage = error.error.detail;
      } else {
        errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
      }
    }

    console.error('Customer Service Error:', errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}

