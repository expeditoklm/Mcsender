import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './toast.component.html',
  styleUrl: './toast.component.css'
})
export class ToastComponent implements OnInit {

  message: string = '';
  messageType: 'success' | 'error' = 'success';
  isVisible: boolean = false;

  constructor() { }

  ngOnInit(): void {
  }
}
