/*
import { Component } from '@angular/core';
import { CommonModule, NgIf } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-tabs',
  templateUrl: './tabs.page.html',
  standalone: true,
  imports: [
    CommonModule,
    IonicModule,
    NgIf,
    RouterModule
  ]
})
export class TabsPage {
  isLoggedIn = false;

  constructor(private authService: AuthService, private router: Router) {
    // Subscribe to AuthService observable
    this.authService.isLoggedIn.subscribe((state: boolean) => {
      this.isLoggedIn = state;
    });
  }

  goProfile() {
    if (this.isLoggedIn) {
      this.router.navigateByUrl('/profile');
    } else {
      this.router.navigateByUrl('/login');
    }
  }
}


*/
import { Component } from '@angular/core';
import {
  IonTabs,
  IonTabBar,
  IonTabButton,
  IonIcon,
  IonLabel
} from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { homeOutline, briefcaseOutline, storefrontOutline, chatbubblesOutline, personOutline, logInOutline } from 'ionicons/icons';

@Component({
  selector: 'app-tabs',
  templateUrl: './tabs.page.html',
  standalone: true,
  imports: [IonTabs, IonTabBar, IonTabButton, IonIcon, IonLabel]
})
export class TabsPage {
  isLoggedIn = false;

  // Map icons for easier template binding
  icons = {
    home: homeOutline,
    gigs: briefcaseOutline,
    store: storefrontOutline,
    messages: chatbubblesOutline,
    profile: personOutline,
    login: logInOutline
  };

  constructor(private authService: AuthService, private router: Router) {
    this.isLoggedIn = !!this.authService.getToken();
  }

  goProfile() {
    if (this.isLoggedIn) {
      this.router.navigate(['/profile']);
    } else {
      this.router.navigate(['/login']);
    }
  }
}