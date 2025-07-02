import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { DynamicScreenComponent } from './dynamic-screen/dynamic-screen.component';

@Component({
  selector: 'app-root',
  standalone: true,
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
  providers: [HttpClient],
  imports: [CommonModule, DynamicScreenComponent]
})
export class AppComponent {}

