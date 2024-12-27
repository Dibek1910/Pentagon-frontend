import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  CustomerService,
  CustomerResponse,
} from '../customer.service';

@Component({
  selector: 'app-confirmation',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './confirmation.component.html',
  styleUrls: ['./confirmation.component.css'],
})
export class ConfirmationComponent implements OnInit {
  accountDetails: CustomerResponse | null = null;

  constructor(private customerService: CustomerService) {}

  ngOnInit() {
    this.customerService.getAccountDetails().subscribe(
      (details: CustomerResponse) => {
        this.accountDetails = details;
      },
      (error) => {
        console.error('Error fetching account details:', error);
      }
    );
  }
}
