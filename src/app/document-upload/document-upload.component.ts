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

@Component({
  selector: 'app-document-upload',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './document-upload.component.html',
  styleUrls: ['./document-upload.component.css'],
})
export class DocumentUploadComponent {
  documentUploadForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private documentService: DocumentService,
    private router: Router
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
      const formData = new FormData();
      formData.append(
        'idProofType',
        this.documentUploadForm.get('idProofType')?.value
      );
      formData.append(
        'idProofFile',
        this.documentUploadForm.get('idProofFile')?.value
      );
      formData.append(
        'addressProofType',
        this.documentUploadForm.get('addressProofType')?.value
      );
      formData.append(
        'addressProofFile',
        this.documentUploadForm.get('addressProofFile')?.value
      );

      this.documentService.uploadDocuments(formData).subscribe(
        () => {
          this.router.navigate(['/confirmation']);
        },
        (error) => {
          console.error('Error uploading documents:', error);
        }
      );
    }
  }
}