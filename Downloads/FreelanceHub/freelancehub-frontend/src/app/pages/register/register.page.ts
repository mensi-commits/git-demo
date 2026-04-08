import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonInput, IonButton, IonSelect, IonSelectOption, IonLabel } from '@ionic/angular/standalone';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { RouterLink } from '@angular/router';   // ← AJOUT OBLIGATOIRE

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, IonContent, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonInput, IonButton, IonSelect, IonSelectOption, IonLabel]
})
export class RegisterPage {
  name = '';
  email = '';
  password = '';
  role = 'freelancer';

  constructor(private authService: AuthService, private router: Router) {}

  register() {
    this.authService.register({ name: this.name, email: this.email, password: this.password, role: this.role }).subscribe({
      next: () => {
        alert('Inscription réussie ! Connecte-toi.');
        this.router.navigate(['/login']);
      },
      error: (err) => alert('Erreur : ' + err.error.error)
    });
  }
}