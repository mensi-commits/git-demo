
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { Router } from '@angular/router'; // ✅ ADD

@Injectable({ providedIn: 'root' })
export class AuthService {
  private tokenKey = 'access_token';

  constructor(
    private http: HttpClient,
    private router: Router // ✅ ADD
  ) {}

  login(credentials: any): Observable<any> {
    return this.http.post(`${environment.apiUrl}/auth/login`, credentials).pipe(
      tap((res: any) => {
        localStorage.setItem(this.tokenKey, res.access_token);
        localStorage.setItem('role', res.user.role);
      })
    );
  }

  register(user: any): Observable<any> {
    return this.http.post(`${environment.apiUrl}/auth/register`, user);
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  logout() {
    // ✅ Use SAME key everywhere
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem('role');

    // Redirect
    this.router.navigateByUrl('/login');

    alert('Déconnecté avec succès');
  }
}


