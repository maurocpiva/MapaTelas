import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-error-screen',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './error-screen.component.html',
  styleUrl: './error-screen.component.css'
})
export class ErrorScreenComponent {
  @Input() message: string = '';
  @Input() isHomeScreen: boolean = false;
  @Output() closeEvent = new EventEmitter<void>();

  close() {
    this.closeEvent.emit();
  }
}
