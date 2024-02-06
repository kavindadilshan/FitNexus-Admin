import { Component } from "@angular/core";

@Component({
  selector: "app-root",
  template:
    "<router-outlet></router-outlet><ng-progress></ng-progress><notifier-container></notifier-container>"
})
export class AppComponent {
  constructor() {}
}
