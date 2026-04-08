import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { finalize } from 'rxjs/operators';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonCard,
  IonCardContent,
  IonButton,
  IonSpinner,
  IonBadge,
  IonItem,
  IonLabel,
  IonList,
  IonCardHeader,
  IonCardTitle,
  IonCardSubtitle
} from '@ionic/angular/standalone';

interface PendingUser {
  _id: string;
  name: string;
  email: string;
  role: string;
  status: string;
}

interface PendingGig {
  _id: string;
  title: string;
  description: string;
  price: number;
  status: string;
}

interface PendingProduct {
  _id: string;
  title: string;
  description: string;
  price: number;
  status: string;
}

@Component({
  selector: 'app-admin',
  templateUrl: './admin.page.html',
  standalone: true,
  imports: [
    CommonModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonCard,
    IonCardContent,
    IonButton,
    IonSpinner,
    IonBadge,
    IonItem,
    IonLabel,
    IonList,
    IonCardHeader,
    IonCardTitle,
    IonCardSubtitle
  ]
})
export class AdminPage implements OnInit {
  loading = false;
  message = '';

  pendingUsers: PendingUser[] = [];
  pendingGigs: PendingGig[] = [];
  pendingProducts: PendingProduct[] = [];

  private apiUrl = 'http://localhost:5000/api';

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.loadPending();
  }

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      Authorization: `Bearer ${token ?? ''}`
    });
  }

  loadPending() {
    this.loading = true;
    this.message = '';

    this.http
      .get<any>(`${this.apiUrl}/admin/pending`, {
        headers: this.getHeaders()
      })
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: (res) => {
          this.pendingUsers = res.pending_users || [];
          this.pendingGigs = res.pending_gigs || [];
          this.pendingProducts = res.pending_products || [];
        },
        error: (err) => {
          this.message = err?.error?.error || 'Erreur lors du chargement des demandes';
        }
      });
  }

  approveUser(id: string) {
    this.validateItem(`/admin/validate/user/${id}`, 'approved');
  }

  rejectUser(id: string) {
    this.validateItem(`/admin/validate/user/${id}`, 'rejected');
  }

  approveGig(id: string) {
    this.validateItem(`/admin/validate/gig/${id}`, 'approved');
  }

  rejectGig(id: string) {
    this.validateItem(`/admin/validate/gig/${id}`, 'rejected');
  }

  approveProduct(id: string) {
    this.validateItem(`/admin/validate/product/${id}`, 'approved');
  }

  rejectProduct(id: string) {
    this.validateItem(`/admin/validate/product/${id}`, 'rejected');
  }

  private validateItem(endpoint: string, status: 'approved' | 'rejected') {
    this.loading = true;
    this.message = '';

    this.http
      .post(
        `${this.apiUrl}${endpoint}`,
        { status },
        { headers: this.getHeaders() }
      )
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: () => {
          this.message = `Élément ${status === 'approved' ? 'approuvé' : 'rejeté'} avec succès`;
          this.loadPending();
        },
        error: (err) => {
          this.message = err?.error?.error || 'Action refusée';
        }
      });
  }
}