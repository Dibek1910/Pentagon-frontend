import { Routes } from '@angular/router';
import { WelcomeComponent } from './welcome/welcome.component';
import { SignUpComponent } from './sign-up/sign-up.component';
import { SignInComponent } from './sign-in/sign-in.component';
import { PersonalDetailsComponent } from './personal-details/personal-details.component';
import { DocumentUploadComponent } from './document-upload/document-upload.component';
import { KycVerificationComponent } from './kyc-verification/kyc-verification.component';
import { ConfirmationComponent } from './confirmation/confirmation.component';
import { DashboardComponent } from './dashboard/dashboard.component';

export const routes: Routes = [
  { path: '', component: WelcomeComponent },
  { path: 'sign-in', component: SignInComponent },
  { path: 'sign-up', component: SignUpComponent },
  { path: 'personal-details', component: PersonalDetailsComponent },
  { path: 'document-upload', component: DocumentUploadComponent },
  { path: 'kyc-verification', component: KycVerificationComponent },
  { path: 'confirmation', component: ConfirmationComponent },
  { path: 'dashboard', component: DashboardComponent },
  { path: '**', redirectTo: '' },
];
