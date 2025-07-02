import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

declare function homeScreenFocus(): void;

@Component({
  selector: 'app-home-screen',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './home-screen.component.html',
  styleUrl: './home-screen.component.css'
})
export class HomeScreenComponent implements OnInit {
  biblioteca: string = '';
  programa: string = '';

  @Output() startApp = new EventEmitter<{ biblioteca: string, programa: string }>();

  ngOnInit() {
    homeScreenFocus();
  }

  onSubmit() {
    this.startApp.emit({ biblioteca: this.biblioteca, programa: this.programa });
  }
}


