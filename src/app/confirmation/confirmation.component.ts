import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CustomerService, CustomerResponse } from '../customer.service';

@Component({
  selector: 'app-confirmation',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './confirmation.component.html',
  styleUrls: ['./confirmation.component.css'],
})
export class ConfirmationComponent implements OnInit {
  accountDetails: CustomerResponse | null = null;
  errorMessage = '';

  constructor(private customerService: CustomerService) {}

  ngOnInit() {
    const customerId = localStorage.getItem('customer_id');
    if (customerId) {
      this.customerService
        .getAccountDetails(parseInt(customerId, 10))
        .subscribe(
          (details: CustomerResponse) => {
            this.accountDetails = details;
          },
          (error) => {
            console.error('Error fetching account details:', error);
            this.errorMessage =
              'Failed to fetch account details. Please try again later.';
          }
        );
    } else {
      this.errorMessage = 'Customer ID not found. Please sign up again.';
    }
  }
}
