import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { parseStyleString } from '../utils/style-utils';

@Component({
  selector: 'app-output',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './output.component.html', 
  styleUrl: './output.component.css'
})
export class OutputComponent implements OnInit {
  @Input() data: any;
  
  parsedStyles: { [key: string]: string } = {};

  ngOnInit() {
    this.parsedStyles = parseStyleString(this.data.style, {
      top: this.data.position?.top + 'px',
      left: this.data.position?.left + 'px',
      width: this.data.size?.width + 'px',
    });
  }
}
