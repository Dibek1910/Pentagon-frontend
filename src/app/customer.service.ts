import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

interface CustomerData {
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

export interface CustomerResponse {
  id: number;
  primary_account_id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
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
}

@Injectable({
  providedIn: 'root',
})
export class CustomerService {
  private apiUrl = 'https://pentagon-backend-v4cw.onrender.com/customers';

  constructor(private http: HttpClient) {}

  createCustomer(formData: CustomerData): Observable<CustomerResponse> {
    return this.http.post<CustomerResponse>(this.apiUrl, formData).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 422) {
          return throwError(() => ({
            message: 'Validation error',
            errors: error.error.detail,
          }));
        }
        if (error.status === 400) {
          if (error.error.detail.includes('Email already registered')) {
            return throwError(() => ({
              message: 'This email is already registered.',
            }));
          }
          if (error.error.detail.includes('Phone number already registered')) {
            return throwError(() => ({
              message: 'This phone number is already registered.',
            }));
          }
        }
        return throwError(() => ({
          message:
            'An error occurred while creating your account. Please try again.',
        }));
      })
    );
  }

  getAccountDetails(): Observable<CustomerResponse> {
    return this.http.get<CustomerResponse>(`${this.apiUrl}/account-details`);
  }
}
