import { Component, HostListener, OnInit, ViewChild, ViewContainerRef, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DynamicComponentService } from '../dynamic-component.service';
import { PanelComponent } from '../panel/panel.component';
import { OutputComponent } from '../output/output.component';
import { InputComponent } from '../input/input.component';
import { ButtonComponent } from '../button/button.component';
import { HomeScreenComponent } from '../home-screen/home-screen.component';
import { ErrorScreenComponent } from '../error-screen/error-screen.component';
import { HttpClient } from '@angular/common/http';
import * as $ from 'jquery';

declare function detectEvent(event: KeyboardEvent): void;
declare function detectFirstEvent(event: KeyboardEvent): void;
declare function detectErrorEvent(event: KeyboardEvent): void;

@Component({
  selector: 'app-dynamic-screen',
  standalone: true,
  imports: [CommonModule, PanelComponent, OutputComponent, InputComponent, ButtonComponent, HomeScreenComponent, ErrorScreenComponent],
  templateUrl: './dynamic-screen.component.html',
  styleUrl: './dynamic-screen.component.css',
  encapsulation: ViewEncapsulation.None
})
export class DynamicScreenComponent implements OnInit {
  @ViewChild('mainPanelContainer', { read: ViewContainerRef }) mainPanelContainer!: ViewContainerRef;
  @ViewChild('underNoErasePanelContainer', { read: ViewContainerRef }) underNoErasePanelContainer!: ViewContainerRef;
  @ViewChild('controlsPanelContainer', { read: ViewContainerRef }) controlsPanelContainer!: ViewContainerRef;

  screenData: any;
  originalScreenData: any;
  jsessionCookie: any;
  errorMessage: string = "";
  isHomeScreenVisible: boolean = true;
  isErrorScreenVisible: boolean = false;

  constructor(private dynamicComponentService: DynamicComponentService) { }

  ngOnInit(): void { }


  @HostListener('window:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent): void {
    if (this.isHomeScreenVisible) {
      detectFirstEvent(event);
    } else if (this.isErrorScreenVisible) {
      detectErrorEvent(event);
    } else {
      detectEvent(event);
    } 
  }

  detectEvent(event: KeyboardEvent): void {
    if (typeof detectEvent === 'function') {
      detectEvent(event);
    } else {
      console.error('detectEvent function is not defined.');
    }
  }
  onStartApp(params: { biblioteca: string, programa: string }): void {
    const apiUrl = `http://localhost:8080/Naja/najaapi/rs/executeProgram/${params.biblioteca}/${params.programa}`;
    this.isHomeScreenVisible = false;
    this.loadScreenData(apiUrl);
  }

  handleErrorClose() {
    this.isErrorScreenVisible = false;
    this.isHomeScreenVisible = true;
  }

  defaultContinue() {
    this.isHomeScreenVisible = true;
  }

  async loadScreenData(apiUrl: string): Promise<void> {
    try {
      //const response = await fetch('/JSONStructure.json');
      const response = await fetch(apiUrl);
      if (!response.ok) {
        throw new Error(`Failed to load api endpoint: ${response.statusText}`);
      }
      
      const responseJSON = await response.json();
      if (responseJSON.errorPopUp) {
        this.isErrorScreenVisible = true;
        this.errorMessage = responseJSON.errorMessage;
        return;
      }

      const cookies = document.cookie.split(';').find(cookie => cookie.trim().startsWith('JSESSIONID='));
      const jsessionId = cookies ? cookies.split('=')[1] : null;

      this.jsessionCookie = jsessionId;
      this.screenData = responseJSON
      this.originalScreenData = JSON.parse(JSON.stringify(this.screenData));
      this.renderScreenData();
    } catch (error) {
      console.error('Error loading screen data:', error);
    }
  }

  renderScreenData(): void {
    const renderPanelComponents = (panel: any, container: ViewContainerRef, panelName: string) => {
      // debugger;
      if (panel && panel.componentes) {
        this.dynamicComponentService.renderComponents(container, panel.componentes, this.sendApiRequest.bind(this), this.screenData);
      } else {
        console.warn(`${panelName} has no components to render.`);
      }
    };

    this.mainPanelContainer.clear();
    this.underNoErasePanelContainer.clear();
    this.controlsPanelContainer.clear();

    renderPanelComponents(this.screenData.underNoErasePanel, this.underNoErasePanelContainer, 'underNoErasePanel');
    renderPanelComponents(this.screenData.mainPanel, this.mainPanelContainer, 'mainPanel');
    renderPanelComponents(this.screenData.controlsPanel, this.controlsPanelContainer, 'controlsPanel');
  }

  async sendApiRequest(payload: any): Promise<void> {

    const headers = {
      'Content-Type': 'application/json'
    };

    this.updateScreenData();

    try {
      const response = await fetch('http://localhost:8080/Naja/najaapi/rs/pfKeyPressed', {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}: ${response.statusText}`);
      }

      const responseData = await response.json();

      if (responseData.navAction === "restart") {
        this.isHomeScreenVisible = true;
        return;
      }

      if (responseData.errorPopUp) {
        this.isErrorScreenVisible = true;
        this.errorMessage = responseData.errorMessage;
        return;
      }

      this.screenData = responseData;
      this.originalScreenData = JSON.parse(JSON.stringify(responseData));
      this.renderScreenData();

    } catch (error) {
      console.error('Request failed:', error);
    }
  }

  onValueChange(change: any): void {
    this.updateScreenData();
    this.compareScreenData();
  }

  private updateScreenData(): void {
    const updateComponentValue = (components: any[]) => {
      for (const component of components) {
        if (component.type === "INPUT" || component.type === "INPUT_HIDDEN") {
          component.value = (<HTMLInputElement>document.getElementById(component.id)).value;
        } else if (component.componentes && component.componentes.length > 0) {
          updateComponentValue(component.componentes);
        }
      }
    };

    if (this.screenData) {
      updateComponentValue(this.screenData.mainPanel.componentes);
      updateComponentValue(this.screenData.underNoErasePanel.componentes);
      updateComponentValue(this.screenData.controlsPanel.componentes);
    }
  }

  compareScreenData(): void {
    const hasChanges = JSON.stringify(this.originalScreenData) !== JSON.stringify(this.screenData);
    if (hasChanges) {
      console.log('Original Data:', this.originalScreenData);
      console.log('Updated Data:', this.screenData);
    }
  }
}
