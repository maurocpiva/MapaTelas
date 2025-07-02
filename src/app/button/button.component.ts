import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { parseStyleString } from '../utils/style-utils';

@Component({
  selector: 'app-button',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './button.component.html',
  styleUrl: './button.component.css',
})
export class ButtonComponent implements OnInit {
  @Input() data: any;
  @Output() buttonClick = new EventEmitter<any>(); 
  
  parsedStyles: { [key: string]: string } = {};

  ngOnInit() {
    this.parsedStyles = parseStyleString(this.data.style, {
      top: this.data.position?.top + 'px',
      left: this.data.position?.left + 'px',
      width: this.data.size?.width + 'px',
    });
  }

  handleClick() {
    if (typeof this.data.onclick === 'string') {
      try {
        const onClickFunction = new Function(this.data.onclick);
        onClickFunction();
      } catch (error) {
        console.error('Error executing onclick function:', error);
      }
    } else if (typeof this.data.onclick === 'function') {
      this.data.onclick();
    } else {
      console.warn('No valid onclick handler provided for button:', this.data);
    }

    this.buttonClick.emit(this.data);

  }
}
