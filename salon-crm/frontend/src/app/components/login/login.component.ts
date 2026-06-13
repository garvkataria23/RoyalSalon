import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit {
  isLoading = false;
  credentials = { userId: '', password: '' };
  error = '';
  showPassword = false;
  rememberMe = false;

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit() {
    const saved = localStorage.getItem('rememberedUser');
    if (saved) {
      const parsed = JSON.parse(saved);
      this.credentials.userId = parsed.userId || '';
      this.credentials.password = parsed.password || '';
      this.rememberMe = true;
    }
  }

  clearError() {
    this.error = '';
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  onSubmit() {
    if (!this.credentials.userId || !this.credentials.password) {
      this.error = 'Please enter both Username and Password';
      return;
    }
    this.isLoading = true;
    this.authService.login(this.credentials).subscribe({
      next: () => {
        this.isLoading = false;
        if (this.rememberMe) {
          localStorage.setItem('rememberedUser', JSON.stringify(this.credentials));
        } else {
          localStorage.removeItem('rememberedUser');
        }
        this.router.navigate(['/home']);
      },
      error: (err) => {
        this.isLoading = false;
        this.error = err.error?.message || 'Invalid credentials';
      }
    });
  }
}
