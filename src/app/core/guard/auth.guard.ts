import { Injectable } from "@angular/core";
import {
  ActivatedRouteSnapshot,
  CanActivate,
  Router,
  RouterStateSnapshot,
  UrlTree
} from "@angular/router";
import { Observable, throwError } from "rxjs";
import { constants } from "../../shared/constant/constant";
import { catchError, map, take } from "rxjs/operators";
import { AuthenticationService } from "../services/auth-service/authentication.Service";

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private authService: AuthenticationService,
    private router: Router
  ) {}

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | Promise<boolean> | boolean {
    // let arr = [] as any;
    // console.log = console.warn = () => {};
    if (this.authService.isAuthenticated()) {
      return true;
      const x = {
        token: localStorage.getItem(constants.access_token)
      };
      // this.router.navigate(["/dashboard"]);
      // return this.authService.isTokenValid(x).pipe(
      //   take(1),
      //   map((response: Response) => {
      //     arr = response;
      //     if (arr.success === true) {
      //       return true;
      //     } else {
      //       this.router.navigate(["/pages-login"], { replaceUrl: true });
      //       return false;
      //     }
      //   }),
      //   catchError((err: Response) => {
      //     this.router.navigate(["/pages-login"], { replaceUrl: true });
      //     return throwError(err.statusText);
      //   })
      // );
    } else {
      this.router.navigate(["/login"], { replaceUrl: true });
      return false;
    }
  }
}
