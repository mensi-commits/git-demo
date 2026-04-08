import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle, IonCardContent, IonButton } from '@ionic/angular/standalone';
import { ProductService } from '../../services/product.service';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';

@Component({
  selector: 'app-store',
  templateUrl: './store.page.html',
  standalone: true,
  imports: [CommonModule, IonHeader, IonToolbar, IonTitle, IonContent, IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle, IonCardContent, IonButton]
})
export class StorePage implements OnInit {
  products: any[] = [];

  constructor(private productService: ProductService) {}

  ngOnInit() {
    this.productService.getProducts().subscribe({
      next: (data) => this.products = data,
      error: () => alert('Impossible de charger le Store (backend non lancé ?)')
    });
  }

  async buy(product: any) {
    alert(`✅ Paiement simulé réussi !\n${product.price} TND pour ${product.title}`);

    const fileName = product.file_name || `${product.title.replace(/\s+/g, '-')}.zip`;

    await Filesystem.writeFile({
      path: fileName,
      data: btoa('🎉 Contenu du fichier numérique - Starter Kit FreelanceHub\nVersion 1.2\nLicence Commerciale'),
      directory: Directory.Documents,
      encoding: Encoding.UTF8
    });

    alert(`📥 Fichier téléchargé avec succès !\nNom : ${fileName}\nDossier : Documents`);
  }
}