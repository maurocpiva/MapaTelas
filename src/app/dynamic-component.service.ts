import { Injectable, ViewContainerRef, Type, EventEmitter } from '@angular/core';
import { PanelComponent } from './panel/panel.component';
import { OutputComponent } from './output/output.component';
import { InputComponent } from './input/input.component';
import { ButtonComponent } from './button/button.component';
import { WindowComponent } from './window/window.component';

@Injectable({
  providedIn: 'root'
})
export class DynamicComponentService {

  public valueChanged = new EventEmitter<any>();

  renderComponents(viewContainerRef: ViewContainerRef, components: any[], sendApiRequest?: (payload: any) => void, screenData?: any): void {
    viewContainerRef.clear();
    
    components.forEach((componentData) => {
      let componentType: Type<any> | null = null;

      switch (componentData.type) {
        case 'PANEL':
          componentType = PanelComponent;
          break;
        case 'WINDOW':
          componentType = WindowComponent;
          break;
        case 'OUTPUT':
          componentType = OutputComponent;
          break;
        case 'INPUT':
          componentType = InputComponent;
          componentData.inputType = 'text';
          break;
        case 'COMMAND_BUTTON':
          componentType = ButtonComponent;
          break;
        case 'INPUT_HIDDEN':
          componentType = InputComponent;
          componentData.inputType = 'hidden';
          break;
        default:
          return;
      }

      if (componentType) {
        const componentRef = viewContainerRef.createComponent(componentType);
        componentRef.instance.data = componentData;

        if (componentType === InputComponent) {
          componentRef.instance.inputType = componentData.inputType;
        }

        if (componentData.type === 'COMMAND_BUTTON') {
          componentRef.instance.buttonClick.subscribe((data: any) => {
            if (sendApiRequest) {
              sendApiRequest(screenData);
            }
          });
        }

        this.setupEventListeners(componentRef.instance, componentData);

        if (componentData.componentes && componentData.componentes.length > 0) {
          this.renderComponents(componentRef.instance.viewContainerRef, componentData.componentes, sendApiRequest);
        }
      }
    });
  }

  private setupEventListeners(instance: any, componentData: any): void {
    if (instance.valueChange) {
      instance.valueChange.subscribe((change: any) => {
        this.valueChanged.emit({ id: componentData.id, value: change.value });
      });
    }
  }
}
