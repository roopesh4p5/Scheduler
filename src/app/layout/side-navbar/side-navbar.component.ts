import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-side-navbar',
  standalone: true,
  imports: [],
  templateUrl: './side-navbar.component.html',
  styleUrl: './side-navbar.component.scss'
})
export class SideNavbarComponent implements OnInit{
  userData: any;
  
  constructor(private route:Router){}
  
  ngOnInit(): void {
    const storedData = localStorage.getItem('user_data');
    if (storedData) {
      this.userData = JSON.parse(storedData);
      console.log(this.userData);
    } else {
      console.log('No user data found in localStorage');
    }
  }



      // Programmatic navigation method
  navigateTo(route: string): void {
    this.route.navigate([route]);  // This will navigate to the given route
  }
}
