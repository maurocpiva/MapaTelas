import { Component, Input, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { parseStyleString } from '../utils/style-utils';

@Component({
  selector: 'app-panel',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './panel.component.html',
  styleUrl: './panel.component.css'
})
export class PanelComponent implements OnInit {
  @Input() data: any;
  @Input() styleString: string | null | undefined;
  @ViewChild('container', { read: ViewContainerRef, static: true }) viewContainerRef!: ViewContainerRef;

  parsedStyles: { [key: string]: string } = {};

  ngOnInit() {
    if (this.styleString) {
      this.parsedStyles = parseStyleString(this.styleString);
    }
  }
}
