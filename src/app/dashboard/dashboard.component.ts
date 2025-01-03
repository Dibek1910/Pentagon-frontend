import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { CustomerService, CustomerResponse } from '../customer.service';
import { Subscription, interval } from 'rxjs';
import { startWith, switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
})
export class DashboardComponent implements OnInit, OnDestroy {
  customerDetails: CustomerResponse | null = null;
  accountBalance: number = 0;
  errorMessage = '';
  isLoading = true;
  private balanceSubscription?: Subscription;

  constructor(
    private customerService: CustomerService,
    private router: Router
  ) {}

  ngOnInit() {
    const customerId = localStorage.getItem('customer_id');
    if (!customerId) {
      this.router.navigate(['/sign-in']);
      return;
    }

    this.loadCustomerDetails(parseInt(customerId, 10));
    this.setupBalancePolling(parseInt(customerId, 10));
  }

  ngOnDestroy() {
    if (this.balanceSubscription) {
      this.balanceSubscription.unsubscribe();
    }
  }

  loadCustomerDetails(customerId: number) {
    this.isLoading = true;
    this.customerService.getAccountDetails(customerId).subscribe(
      (details: CustomerResponse) => {
        this.customerDetails = details;
        this.isLoading = false;
      },
      (error) => {
        console.error('Error fetching customer details:', error);
        this.errorMessage = 'Failed to fetch customer details';
        this.isLoading = false;
      }
    );
  }

  setupBalancePolling(customerId: number) {
    // Poll balance every 30 seconds
    this.balanceSubscription = interval(30000)
      .pipe(
        startWith(0),
        switchMap(() => this.customerService.getAccountBalance(customerId))
      )
      .subscribe(
        (balance: number) => {
          this.accountBalance = balance;
        },
        (error) => {
          console.error('Error fetching account balance:', error);
          this.errorMessage = 'Failed to fetch account balance';
        }
      );
  }

  maskId(id: string | undefined): string {
    if (!id) return '';
    return '*'.repeat(id.length - 3) + id.slice(-3);
  }

  logout() {
    localStorage.removeItem('customer_id');
    localStorage.removeItem('auth_token');
    this.router.navigate(['/sign-in']);
  }

  refreshData() {
    const customerId = localStorage.getItem('customer_id');
    if (customerId) {
      this.loadCustomerDetails(parseInt(customerId, 10));
      this.customerService
        .getAccountBalance(parseInt(customerId, 10))
        .subscribe(
          (balance: number) => {
            this.accountBalance = balance;
          },
          (error) => {
            console.error('Error fetching account balance:', error);
            this.errorMessage = 'Failed to fetch account balance';
          }
        );
    }
  }
}
