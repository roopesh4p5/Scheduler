import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../auth/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']  // Corrected typo for styleUrls
})
export class HeaderComponent implements OnInit {
  constructor(private router: Router, private authService: AuthService) {}
  ngOnInit(): void {
   
  }
  
  logout(): void {
    this.authService.logout();  // Call the logout method from AuthService
    this.router.navigate(['/login']); // Optionally navigate to login page after logout
  }


}
