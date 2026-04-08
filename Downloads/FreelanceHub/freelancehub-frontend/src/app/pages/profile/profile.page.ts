import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router'; // ✅ ADD

import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardSubtitle,
  IonCardContent,
  IonButton,
  IonTextarea,
  IonLabel,
  IonInput,
  IonBadge // ✅ KEEP ONLY HERE (once)
} from '@ionic/angular/standalone';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardSubtitle,
    IonCardContent,
    IonButton,
    IonTextarea,
    IonLabel,
    IonInput,
    IonBadge
  ]
})
export class ProfilePage implements OnInit {
  user: any = null;

  bio = '';
  skills = '';
  loading = false;
  message = '';

  private apiUrl = 'http://localhost:5000/api';

  constructor(
    private http: HttpClient,
    private router: Router // ✅ ADD
  ) {}

  ngOnInit() {
    this.loadProfile();
  }

  getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      Authorization: `Bearer ${token ?? ''}`
    });
  }

  loadProfile() {
    this.loading = true;

    this.http.get<any>(`${this.apiUrl}/profile`, {
      headers: this.getHeaders()
    }).subscribe({
      next: (res) => {
        this.user = res;
        this.bio = res.bio || '';
        this.skills = (res.skills || []).join(', ');
      },
      error: () => {
        this.message = 'Erreur chargement profil';
      },
      complete: () => {
        this.loading = false;
      }
    });
  }

  uploadCV() {
    this.user.cv = 'cv_uploaded.pdf';
    this.message = 'CV uploadé (simulation)';
  }

  saveProfile() {
    this.loading = true;

    const payload: any = {};

    if (this.user.role === 'freelancer') {
      payload.bio = this.bio;
      payload.skills = this.skills.split(',').map((s) => s.trim());
      payload.cv = this.user.cv || '';
    }

    this.http.put(`${this.apiUrl}/profile`, payload, {
      headers: this.getHeaders()
    }).subscribe({
      next: () => {
        this.message = 'Profil mis à jour';
      },
      error: () => {
        this.message = 'Erreur mise à jour';
      },
      complete: () => {
        this.loading = false;
      }
    });
  }

  // ✅ ADD THIS (fixes your error)
  logout() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('role');

    this.router.navigateByUrl('/');
  }

  getRoleLabel(): string {
    if (!this.user) return '';

    switch (this.user.role) {
      case 'admin':
        return 'Admin';
      case 'client':
        return 'Client';
      case 'freelancer':
        return 'Freelancer';
      default:
        return '';
    }
  }

  getStatusLabel(): string {
    if (!this.user) return '';

    switch (this.user.status) {
      case 'active':
        return 'Actif';
      case 'pending':
        return 'En attente';
      case 'rejected':
        return 'Rejeté';
      default:
        return this.user.status;
    }
  }
}