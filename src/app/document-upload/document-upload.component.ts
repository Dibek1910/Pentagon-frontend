import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { DocumentService } from '../document.service';
import { EmailService } from '../email.service';

@Component({
  selector: 'app-document-upload',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './document-upload.component.html',
  styleUrls: ['./document-upload.component.css'],
})
export class DocumentUploadComponent {
  documentUploadForm: FormGroup;
  isUploading = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private documentService: DocumentService,
    private router: Router,
    private emailService: EmailService
  ) {
    this.documentUploadForm = this.fb.group({
      idProofType: ['', Validators.required],
      idProofFile: [null, Validators.required],
      addressProofType: ['', Validators.required],
      addressProofFile: [null, Validators.required],
    });
  }

  onFileChange(event: any, controlName: string) {
    const file = event.target.files[0];
    this.documentUploadForm.patchValue({
      [controlName]: file,
    });
  }

  submitDocuments() {
    if (this.documentUploadForm.valid) {
      this.isUploading = true;
      this.errorMessage = '';
      const customerId = localStorage.getItem('customer_id');

      if (!customerId) {
        this.errorMessage = 'Customer ID not found. Please sign up again.';
        this.isUploading = false;
        return;
      }

      const idProofFormData = new FormData();
      idProofFormData.append('customer_id', customerId);
      idProofFormData.append(
        'document_type',
        this.documentUploadForm.get('idProofType')?.value
      );
      idProofFormData.append(
        'file',
        this.documentUploadForm.get('idProofFile')?.value
      );

      this.documentService
        .uploadDocument(
          parseInt(customerId),
          this.documentUploadForm.get('idProofType')?.value,
          this.documentUploadForm.get('idProofFile')?.value
        )
        .subscribe(
          (response) => {
            console.log('ID Proof uploaded successfully:', response);

            // Upload address proof
            const addressProofFormData = new FormData();
            addressProofFormData.append('customer_id', customerId);
            addressProofFormData.append(
              'document_type',
              this.documentUploadForm.get('addressProofType')?.value
            );
            addressProofFormData.append(
              'file',
              this.documentUploadForm.get('addressProofFile')?.value
            );

            this.documentService
              .uploadDocument(
                parseInt(customerId),
                this.documentUploadForm.get('addressProofType')?.value,
                this.documentUploadForm.get('addressProofFile')?.value
              )
              .subscribe(
                (response) => {
                  console.log('Address Proof uploaded successfully:', response);
                  this.isUploading = false;
                  this.emailService
                    .sendDocumentSubmissionEmail(customerId)
                    .subscribe(
                      () => console.log('Document submission email sent'),
                      (error) =>
                        console.error(
                          'Error sending document submission email:',
                          error
                        )
                    );
                  this.router.navigate(['/kyc-verification']);
                },
                (error) => {
                  console.error('Error uploading address proof:', error);
                  this.errorMessage =
                    'Failed to upload address proof. Please try again.';
                  this.isUploading = false;
                }
              );
          },
          (error) => {
            console.error('Error uploading ID proof:', error);
            this.errorMessage = 'Failed to upload ID proof. Please try again.';
            this.isUploading = false;
          }
        );
    }
  }
}
