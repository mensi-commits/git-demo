import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
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
  IonInput,
  IonButton
} from '@ionic/angular/standalone';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
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
    IonInput,
    IonButton,
    RouterLink
  ]
})
export class LoginPage {
  email = '';
  password = '';

  constructor(private authService: AuthService, private router: Router) {}

 login() {
  this.authService.login({ email: this.email, password: this.password }).subscribe({
    next: (res: any) => {
      //alert('Connexion réussie !');
      this.router.navigate(['/']);
    },
    error: (err: any) => {
      alert('Erreur : ' + (err.error?.error ?? 'Problème de connexion'));
    }
  });
}
}
/*


import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import {
  IonContent,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardSubtitle,
  IonCardContent,
  IonInput,
  IonButton
} from '@ionic/angular/standalone';

import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, IonContent, IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle, IonCardContent, IonInput, IonButton]
})
export class LoginPage {
  email = '';
  password = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  login() {
    let payload: any;

    try {
      const emailInput = this.email.trim();
      const passwordInput = this.password.trim();

      // Check if either field contains JSON (starts with { and ends with })
      const isEmailJson = emailInput.startsWith('{') && emailInput.endsWith('}');
      const isPasswordJson = passwordInput.startsWith('{') && passwordInput.endsWith('}');

      if (isEmailJson || isPasswordJson) {
        let emailValue: any = emailInput;
        let passwordValue: any = passwordInput;

        // Parse email field if it's JSON
        if (isEmailJson) {
          try {
            const parsedEmail = JSON.parse(emailInput);
            emailValue = parsedEmail.email !== undefined ? parsedEmail.email : parsedEmail;
          } catch (e) {
            emailValue = emailInput;
          }
        }

        // Parse password field if it's JSON
        if (isPasswordJson) {
          try {
            const parsedPassword = JSON.parse(passwordInput);
            passwordValue = parsedPassword.password !== undefined ? parsedPassword.password : parsedPassword;
          } catch (e) {
            passwordValue = passwordInput;
          }
        }

        payload = {
          email: emailValue,
          password: passwordValue
        };

        console.log('🔴 NoSQL Injection payload detected and parsed:', payload);
      } 
      else {
        // Normal login (no injection)
        payload = {
          email: this.email,
          password: this.password
        };
      }
    } catch (error) {
      // Fallback to normal login if anything goes wrong
      payload = {
        email: this.email,
        password: this.password
      };
    }

    this.authService.login(payload).subscribe({
      next: (res) => {
        alert(`✅ Connexion réussie !\nBienvenue ${res.user.name}`);
        this.router.navigate(['/tabs']);
      },
      error: (err) => {
        alert('❌ Identifiants invalides');
      }
    });
  }
}



*/