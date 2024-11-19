
import { Injectable, Injector, ApplicationRef, ComponentFactoryResolver } from '@angular/core';
import { ToastComponent } from './toast.component';

@Injectable({
  providedIn: 'root',
})
export class ToastService {

  constructor(
    private injector: Injector,
    private appRef: ApplicationRef,
    private cfr: ComponentFactoryResolver
  ) {}

  private createToast(message: string, type: 'success' | 'error' | 'warning')  {
    const toastFactory = this.cfr.resolveComponentFactory(ToastComponent);
    const toastComponentRef = toastFactory.create(this.injector);
    toastComponentRef.instance.message = message;
    toastComponentRef.instance.messageType = type;
    toastComponentRef.instance.isVisible = true;

    this.appRef.attachView(toastComponentRef.hostView);
    const toastDomElem = (toastComponentRef.hostView as any).rootNodes[0];
    document.body.appendChild(toastDomElem);

    setTimeout(() => {
      toastComponentRef.instance.isVisible = false;
      setTimeout(() => {
        this.appRef.detachView(toastComponentRef.hostView);
        toastComponentRef.destroy();
      }, 300);
    }, 3000);
  }

  showSuccess(message: string) {
    this.createToast(message, 'success');
  }

  showError(message: string) {
    this.createToast(message, 'error');
  }

  showWarning(message: string) {
    this.createToast(message, 'warning');
  }
}
