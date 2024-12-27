import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

export interface AuthResponse {
  message: string;
  success?: boolean;
  token?: string;
  user?: any;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = 'https://pentagon-backend-v4cw.onrender.com/auth';

  constructor(private http: HttpClient) {}

  generateOTP(mobileNumber: string): Observable<AuthResponse> {
    const payload = {
      mobile_number: mobileNumber.toString().trim(),
    };

    console.log('Sending OTP request with payload:', payload);

    return this.http
      .post<AuthResponse>(`${this.apiUrl}/generate-otp/`, payload)
      .pipe(
        catchError((error: HttpErrorResponse) => {
          console.error('OTP Generation Error:', error);
          if (error.status === 422) {
            return throwError(
              () =>
                'Invalid mobile number format. Please enter a 10-digit number.'
            );
          }
          return throwError(
            () => error.error?.detail || 'Failed to generate OTP'
          );
        })
      );
  }

  validateOTP(mobileNumber: string, otp: string): Observable<AuthResponse> {
    const payload = {
      mobile_number: mobileNumber.toString().trim(),
      otp: otp.trim(),
    };

    console.log('Validating OTP with payload:', payload);

    return this.http
      .post<AuthResponse>(`${this.apiUrl}/validate-otp/`, payload)
      .pipe(
        catchError((error: HttpErrorResponse) => {
          console.error('OTP validation error:', error);
          if (error.status === 422) {
            return throwError(() => 'Invalid OTP format');
          }
          return throwError(
            () => error.error?.detail || 'Failed to validate OTP'
          );
        })
      );
  }

  signIn(accountId: string, password: string): Observable<AuthResponse> {
    const payload = {
      account_id: accountId.toString().trim(),
      password: password,
    };

    return this.http.post<AuthResponse>(`${this.apiUrl}/signin/`, payload).pipe(
      catchError((error: HttpErrorResponse) => {
        console.error('Sign in error:', error);
        if (error.status === 401) {
          return throwError(() => 'Invalid account ID or password');
        }
        if (error.status === 422) {
          return throwError(() => 'Invalid account ID format');
        }
        return throwError(() => error.error?.detail || 'Failed to sign in');
      })
    );
  }
}
