import { Injectable } from "@angular/core";
import { DirtyCheckGuard } from "@ngneat/dirty-check-forms";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { NzModalService } from "ng-zorro-antd/modal";
import {
  ActivatedRouteSnapshot,
  CanDeactivate,
  RouterStateSnapshot,
  UrlTree
} from "@angular/router";

export interface DirtyComponent {
  canDeactivate: () => boolean | Observable<boolean>;
}

@Injectable({ providedIn: "root" })
export class FormDirtyGuard implements CanDeactivate<DirtyComponent> {
  canDeactivate(
    component: DirtyComponent,
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ):
    | Observable<boolean | UrlTree>
    | Promise<boolean | UrlTree>
    | boolean
    | UrlTree {
    if (component.canDeactivate()) {
      return confirm(
        "There are changes you have made to the page. If you quit, you will lose your changes."
      );
    } else {
      return true;
    }
  }
}
