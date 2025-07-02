import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { parseStyleString } from '../utils/style-utils';
import { handleEvent } from '../utils/event-handler';

@Component({
  selector: 'app-input',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './input.component.html', 
  styleUrl: './input.component.css'
})
export class InputComponent implements OnInit {
  @Input() data: any
  @Input() inputType: string = 'text';
  @Output() valueChange = new EventEmitter<any>();
  inputValue: string = '';

  parsedStyles: { [key: string]: string } = {};

  ngOnInit() {
    this.parsedStyles = parseStyleString(this.data.style, {
      top: this.data.position?.top + 'px',
      left: this.data.position?.left + 'px',
      width: this.data.size?.width + 'px',
    });
  }

  onValueChange(newValue: any): void {
    this.valueChange.emit({ id: this.data.id, value: newValue });
    console.log(`Input value changed for ${this.data.id}: ${newValue}`);
  }

  handleOnKeyUp() {
    handleEvent(this.data.onkeyup, 'onKeyUp');
  }
  
  handleOnFocus() {
    handleEvent(this.data.onfocus, 'onFocus');
  }
  
  handleOnBlur() {
    handleEvent(this.data.onblur, 'onBlur');
  }
}
