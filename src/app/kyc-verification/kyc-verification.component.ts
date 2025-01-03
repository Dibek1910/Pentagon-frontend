import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { CustomerService } from '../customer.service';
import { EmailService } from '../email.service';

@Component({
  selector: 'app-kyc-verification',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './kyc-verification.component.html',
  styleUrls: ['./kyc-verification.component.css'],
})
export class KycVerificationComponent {
  kycForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private customerService: CustomerService,
    private emailService: EmailService
  ) {
    this.kycForm = this.fb.group({
      agreeTerms: [false, Validators.requiredTrue],
      confirmInformation: [false, Validators.requiredTrue],
    });
  }

  onSubmit() {
    if (this.kycForm.valid) {
      const customerId = localStorage.getItem('customer_id');
      if (customerId) {
        this.customerService
          .completeKycVerification(parseInt(customerId))
          .subscribe(
            (response) => {
              // Send email after KYC verification
              this.emailService
                .sendAccountCreationEmail(
                  response.email,
                  response.id,
                  response.primary_account_id
                )
                .subscribe(
                  () => console.log('Account creation email sent'),
                  (error) =>
                    console.error(
                      'Error sending account creation email:',
                      error
                    )
                );
              this.router.navigate(['/confirmation']);
            },
            (error) => {
              console.error('Error completing KYC verification:', error);
            }
          );
      } else {
        console.error('Customer ID not found');
      }
    }
  }
}
