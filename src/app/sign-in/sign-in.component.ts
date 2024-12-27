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
  selector: 'app-sign-in',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './sign-in.component.html',
  styleUrls: ['./sign-in.component.css'],
})
export class SignInComponent {
  signInForm: FormGroup;
  isSigningIn = false;
  showPopup = false;
  popupMessage = '';
  popupType: 'success' | 'error' = 'success';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.signInForm = this.fb.group({
      accountId: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  signIn(): void {
    if (this.signInForm.valid) {
      this.isSigningIn = true;
      const accountId = this.signInForm.get('accountId')?.value;
      const password = this.signInForm.get('password')?.value;

      this.authService.signIn(accountId, password).subscribe({
        next: (response) => {
          if (response.success) {
            if (response.token) {
              localStorage.setItem('auth_token', response.token);
            }
            this.showPopupMessage('Signed in successfully!', 'success');
            this.router.navigate(['/dashboard']).then(
              (navigated) => console.log('Navigation result:', navigated),
              (error) => console.error('Navigation error:', error)
            );
          } else {
            this.showPopupMessage(
              response.message || 'Sign in failed',
              'error'
            );
          }
          this.isSigningIn = false;
        },
        error: (error) => {
          console.error('Sign in error:', error);
          this.showPopupMessage(
            typeof error === 'string'
              ? error
              : 'Invalid credentials. Please try again.',
            'error'
          );
          this.isSigningIn = false;
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
