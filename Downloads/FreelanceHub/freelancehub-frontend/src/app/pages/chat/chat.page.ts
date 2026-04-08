import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonCard, IonCardContent, IonItem, IonInput, IonButton } from '@ionic/angular/standalone';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.page.html',
  standalone: true,
  imports: [CommonModule, FormsModule, IonHeader, IonToolbar, IonTitle, IonContent, IonCard, IonCardContent, IonItem, IonInput, IonButton]
})
export class ChatPage {
  messages = [
    { from: 'Client Sara', content: 'Bonjour, intéressé par ton gig Ionic ?' }
  ];
  newMessage = '';

  sendMessage() {
    if (this.newMessage) {
      this.messages.push({ from: 'Moi', content: this.newMessage });
      this.newMessage = '';
    }
  }
}