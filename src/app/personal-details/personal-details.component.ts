import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { CustomerService } from '../customer.service';
import * as bcrypt from 'bcryptjs';

@Component({
  selector: 'app-personal-details',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './personal-details.component.html',
  styleUrls: ['./personal-details.component.css'],
})
export class PersonalDetailsComponent implements OnInit {
  personalDetailsForm: FormGroup;
  isSaving = false;
  showPopup = false;
  popupMessage = '';
  popupType: 'success' | 'error' = 'success';

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private customerService: CustomerService
  ) {
    const verifiedMobile = localStorage.getItem('verified_mobile') || '';

    this.personalDetailsForm = this.fb.group(
      {
        firstName: ['', [Validators.required, Validators.minLength(2)]],
        middleName: [''],
        lastName: ['', [Validators.required, Validators.minLength(2)]],
        email: ['', [Validators.required, Validators.email]],
        phoneNumber: [{ value: verifiedMobile, disabled: true }],
        gender: ['', [Validators.required]],
        dateOfBirth: ['', [Validators.required]],
        currentAddress: ['', [Validators.required, Validators.minLength(10)]],
        currentCity: ['', [Validators.required]],
        currentState: ['', [Validators.required]],
        currentPincode: [
          '',
          [Validators.required, Validators.pattern('^[0-9]{6}$')],
        ],
        isPermanentSameAsCurrent: [false],
        permanentAddress: ['', [Validators.required, Validators.minLength(10)]],
        permanentCity: ['', [Validators.required]],
        permanentState: ['', [Validators.required]],
        permanentPincode: [
          '',
          [Validators.required, Validators.pattern('^[0-9]{6}$')],
        ],
        password: ['', [Validators.required, Validators.minLength(8)]],
        confirmPassword: ['', [Validators.required]],
      },
      { validator: this.passwordMatchValidator }
    );

    this.personalDetailsForm
      .get('isPermanentSameAsCurrent')
      ?.valueChanges.subscribe((isSame: boolean) => {
        if (isSame) {
          this.copyCurrentToPermanentAddress();
        }
      });
  }

  ngOnInit() {
    const token = localStorage.getItem('auth_token');
    const verifiedMobile = localStorage.getItem('verified_mobile');

    if (!token || !verifiedMobile) {
      this.router.navigate(['/sign-up']);
    }
  }

  passwordMatchValidator(g: FormGroup) {
    return g.get('password')?.value === g.get('confirmPassword')?.value
      ? null
      : { mismatch: true };
  }

  copyCurrentToPermanentAddress() {
    const currentAddress =
      this.personalDetailsForm.get('currentAddress')?.value;
    const currentCity = this.personalDetailsForm.get('currentCity')?.value;
    const currentState = this.personalDetailsForm.get('currentState')?.value;
    const currentPincode =
      this.personalDetailsForm.get('currentPincode')?.value;

    this.personalDetailsForm.patchValue({
      permanentAddress: currentAddress,
      permanentCity: currentCity,
      permanentState: currentState,
      permanentPincode: currentPincode,
    });
  }

  async onSubmit() {
    if (this.personalDetailsForm.valid) {
      this.isSaving = true;

      try {
        const hashedPassword = await bcrypt.hash(
          this.personalDetailsForm.get('password')?.value,
          10
        );

        const formData = {
          first_name: this.personalDetailsForm.get('firstName')?.value,
          middle_name:
            this.personalDetailsForm.get('middleName')?.value || undefined,
          last_name: this.personalDetailsForm.get('lastName')?.value,
          phone_number: this.personalDetailsForm.get('phoneNumber')?.value,
          email: this.personalDetailsForm.get('email')?.value,
          gender: this.personalDetailsForm.get('gender')?.value.toLowerCase(),
          dob: this.formatDate(
            this.personalDetailsForm.get('dateOfBirth')?.value
          ),
          current_address:
            this.personalDetailsForm.get('currentAddress')?.value,
          current_city: this.personalDetailsForm.get('currentCity')?.value,
          current_state: this.personalDetailsForm.get('currentState')?.value,
          current_pincode:
            this.personalDetailsForm.get('currentPincode')?.value,
          is_permanent_same_as_current: this.personalDetailsForm.get(
            'isPermanentSameAsCurrent'
          )?.value,
          permanent_address:
            this.personalDetailsForm.get('permanentAddress')?.value,
          permanent_city: this.personalDetailsForm.get('permanentCity')?.value,
          permanent_state:
            this.personalDetailsForm.get('permanentState')?.value,
          permanent_pincode:
            this.personalDetailsForm.get('permanentPincode')?.value,
          password: hashedPassword,
        };

        const response = await this.customerService
          .createCustomer(formData)
          .toPromise();

        if (response) {
          localStorage.setItem('customer_id', response.id.toString());
          this.showPopupMessage(
            'Personal details saved successfully!',
            'success'
          );
          this.router.navigate(['/document-upload']);
        }
      } catch (error: any) {
        console.error('Error saving personal details:', error);

        // Handle SQLAlchemy specific errors
        if (error.message?.includes('AmbiguousForeignKeysError')) {
          this.showPopupMessage(
            'A technical error occurred. Our team has been notified.',
            'error'
          );
        } else if (error.errors) {
          const errorMessage = Array.isArray(error.errors)
            ? error.errors[0].msg
            : 'Please check your input and try again';
          this.showPopupMessage(errorMessage, 'error');
        } else {
          this.showPopupMessage(
            error.message ||
              'Failed to save personal details. Please try again.',
            'error'
          );
        }
      } finally {
        this.isSaving = false;
      }
    } else {
      this.showPopupMessage(
        'Please fill all required fields correctly',
        'error'
      );
      Object.keys(this.personalDetailsForm.controls).forEach((key) => {
        const control = this.personalDetailsForm.get(key);
        if (control?.invalid) {
          control.markAsTouched();
        }
      });
    }
  }

  private formatDate(date: string): string {
    const d = new Date(date);
    return d.toISOString().split('T')[0];
  }

  private showPopupMessage(message: string, type: 'success' | 'error'): void {
    this.popupMessage = message;
    this.popupType = type;
    this.showPopup = true;
    setTimeout(() => {
      this.showPopup = false;
    }, 3000);
  }

  private handleTechnicalError(error: any): void {
    console.error('Technical error:', error);
    this.showPopupMessage(
      'A technical error occurred. Please try again later.',
      'error'
    );
  }
}
