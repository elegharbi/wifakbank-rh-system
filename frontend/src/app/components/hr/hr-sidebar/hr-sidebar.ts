import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-hr-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './hr-sidebar.html',
  styleUrls: ['./hr-sidebar.css']
})
export class HrSidebar {}
