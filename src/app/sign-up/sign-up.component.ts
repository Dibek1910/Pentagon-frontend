import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-sign-up',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './sign-up.component.html',
  styleUrls: ['./sign-up.component.css'],
})
export class SignUpComponent {
  signUpForm: FormGroup;
  otpSent = false;
  isGeneratingOTP = false;
  isVerifyingOTP = false;
  showPopup = false;
  popupMessage = '';
  popupType: 'success' | 'error' = 'success';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.signUpForm = this.fb.group({
      mobileNumber: [
        '',
        [Validators.required, Validators.pattern('^[0-9]{10}$')],
      ],
      otp: ['', [Validators.required, Validators.pattern('^[0-9]{4}$')]],
    });
  }

  generateOTP(): void {
    if (this.signUpForm.get('mobileNumber')?.valid) {
      this.isGeneratingOTP = true;
      const mobileNumber = this.signUpForm.get('mobileNumber')?.value;

      this.authService.generateOTP(mobileNumber).subscribe({
        next: (response) => {
          if (response.success) {
            this.otpSent = true;
            this.showPopupMessage('OTP sent successfully!', 'success');
          } else {
            this.showPopupMessage(
              response.message || 'Failed to send OTP',
              'error'
            );
          }
          this.isGeneratingOTP = false;
        },
        error: (error) => {
          this.showPopupMessage(
            error.message || 'Failed to send OTP. Please try again.',
            'error'
          );
          this.isGeneratingOTP = false;
        },
      });
    }
  }

  validateOTP(): void {
    if (this.signUpForm.valid) {
      this.isVerifyingOTP = true;
      const mobileNumber = this.signUpForm.get('mobileNumber')?.value;
      const otp = this.signUpForm.get('otp')?.value;

      this.authService.validateOTP(mobileNumber, otp).subscribe({
        next: (response) => {
          if (response.success) {
            if (response.token) {
              localStorage.setItem('auth_token', response.token);
              localStorage.setItem('verified_mobile', mobileNumber);
            }
            this.showPopupMessage('OTP verified successfully!', 'success');
            this.router.navigate(['/personal-details']);
          } else {
            this.showPopupMessage(
              response.message || 'OTP validation failed',
              'error'
            );
          }
          this.isVerifyingOTP = false;
        },
        error: (error) => {
          this.showPopupMessage(
            error.message || 'Invalid OTP. Please try again.',
            'error'
          );
          this.isVerifyingOTP = false;
        },
      });
    }
  }

  private showPopupMessage(message: string, type: 'success' | 'error'): void {
    this.popupMessage = message;
    this.popupType = type;
    this.showPopup = true;
    setTimeout(() => {
      this.showPopup = false;
    }, 3000);
  }
}
