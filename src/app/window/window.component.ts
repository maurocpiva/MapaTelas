import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, Input, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { parseStyleString } from '../utils/style-utils';
import { handleEvent } from '../utils/event-handler';

@Component({
  selector: 'app-window',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './window.component.html',
  styleUrl: './window.component.css'
})
export class WindowComponent implements OnInit, AfterViewInit {
  @Input() data: any;
  @Input() styleString: string | null | undefined;
  @ViewChild('container', { read: ViewContainerRef, static: true }) viewContainerRef!: ViewContainerRef;
  
  parsedStyles: { [key: string]: string } = {};

  ngOnInit() {
    this.parsedStyles = parseStyleString(this.data.style, {
      top: this.data.position?.top + 'px',
      left: this.data.position?.left + 'px',
      width: this.data.size?.width + 'px',
      height: this.data.size?.height + 'px',
    });    
  }

  ngAfterViewInit() {
    if (this.data && this.data.onshow) {
      this.handleOnShow();
    }
  }

  handleOnShow() {
    handleEvent(this.data.onshow, 'onShow');
  }
}
