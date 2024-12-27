import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class DocumentService {
  private apiUrl = 'https://pentagon-backend-v4cw.onrender.com/documents';

  constructor(private http: HttpClient) {}

  uploadDocuments(formData: FormData): Observable<any> {
    return this.http.post(this.apiUrl, formData);
  }
}