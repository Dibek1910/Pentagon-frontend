import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { DashboardComponent } from './dashboard.component';
import { CustomerService } from '../customer.service';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';

describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;
  let customerServiceSpy: jasmine.SpyObj<CustomerService>;
  let router: Router;

  const mockCustomerDetails = {
    id: 123456,
    first_name: 'John',
    last_name: 'Doe',
    email: 'john@example.com',
    phone_number: '1234567890',
    primary_account_id: 987654,
  };

  beforeEach(async () => {
    const spy = jasmine.createSpyObj('CustomerService', [
      'getAccountDetails',
      'getAccountBalance',
    ]);
    spy.getAccountDetails.and.returnValue(of(mockCustomerDetails));
    spy.getAccountBalance.and.returnValue(of(1000));

    await TestBed.configureTestingModule({
      imports: [RouterTestingModule, DashboardComponent],
      providers: [{ provide: CustomerService, useValue: spy }],
    }).compileComponents();

    customerServiceSpy = TestBed.inject(
      CustomerService
    ) as jasmine.SpyObj<CustomerService>;
    router = TestBed.inject(Router);
  });

  beforeEach(() => {
    spyOn(localStorage, 'getItem').and.returnValue('123456');
    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load customer details on init', () => {
    expect(customerServiceSpy.getAccountDetails).toHaveBeenCalledWith(123456);
    expect(component.customerDetails).toEqual(mockCustomerDetails);
  });

  it('should load account balance on init', () => {
    expect(customerServiceSpy.getAccountBalance).toHaveBeenCalledWith(123456);
    expect(component.accountBalance).toEqual(1000);
  });

  it('should handle error when loading customer details', () => {
    customerServiceSpy.getAccountDetails.and.returnValue(
      throwError(() => new Error('API Error'))
    );
    component.loadCustomerDetails(123456);
    expect(component.errorMessage).toBeTruthy();
  });

  it('should mask ID correctly', () => {
    const maskedId = component.maskId('123456');
    expect(maskedId).toEqual('***456');
  });

  it('should navigate to sign-in on logout', () => {
    spyOn(router, 'navigate');
    spyOn(localStorage, 'removeItem');

    component.logout();

    expect(localStorage.removeItem).toHaveBeenCalledWith('customer_id');
    expect(localStorage.removeItem).toHaveBeenCalledWith('auth_token');
    expect(router.navigate).toHaveBeenCalledWith(['/sign-in']);
  });

  it('should refresh data when called', () => {
    component.refreshData();
    expect(customerServiceSpy.getAccountDetails).toHaveBeenCalledWith(123456);
    expect(customerServiceSpy.getAccountBalance).toHaveBeenCalledWith(123456);
  });

  it('should handle missing customer_id', () => {
    spyOn(localStorage, 'getItem').and.returnValue(null);
    spyOn(router, 'navigate');

    component.ngOnInit();

    expect(router.navigate).toHaveBeenCalledWith(['/sign-in']);
  });
});
