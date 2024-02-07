import { forwardRef, Inject, Injectable, Injector } from "@angular/core";
import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandler,
  HttpHeaderResponse,
  HttpInterceptor,
  HttpParams,
  HttpProgressEvent,
  HttpRequest,
  HttpResponse,
  HttpSentEvent,
  HttpUserEvent
} from "@angular/common/http";
import { BehaviorSubject, Observable, throwError } from "rxjs";
import { constants } from "../../shared/constant/constant";
import { catchError, filter, finalize, switchMap, take } from "rxjs/operators";
import { Router } from "@angular/router";
import { AuthenticationService } from "../services/auth-service/authentication.Service";
import { NotifierService } from "angular-notifier";

@Injectable()
export class TokenInterceptor implements HttpInterceptor {
  isRefreshingToken = false;
  tokenSubject: BehaviorSubject<string> = new BehaviorSubject<string>(null);
  private readonly notifier: NotifierService;

  constructor(
    private authService: AuthenticationService,
    private router: Router,
    private notifierService: NotifierService
  ) {
    this.notifier = notifierService;
  }

  addToken(req: HttpRequest<any>, token: string): HttpRequest<any> {
    if (token !== undefined || token != null) {
      if (req.url.includes("oauth/token")) {
        return req.clone();
      }
      return req.clone({ setHeaders: { Authorization: "Bearer " + token } });
    } else {
      return req.clone();
    }
  }

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<
    | HttpSentEvent
    | HttpHeaderResponse
    | HttpProgressEvent
    | HttpResponse<any>
    | HttpUserEvent<any>
  > {
    return next
      .handle(this.addToken(req, localStorage.getItem(constants.access_token)))
      .pipe(
        catchError(error => {
          if (error instanceof HttpErrorResponse) {
            if (req.url.includes("oauth/token")) {
              return throwError(error);
            }
            switch ((error as HttpErrorResponse).status) {
              case 401:
                return this.handleError(req, next);
              case 403:
                return this.logoutUser();
              case 500:
                return this.displayAlert(req, next);
              case 0:
                return this.connectionError(req, next);
              default:
                return throwError(error);
            }
          } else {
            return throwError(error);
          }
        })
      );
  }

  handleError(req: HttpRequest<any>, next: HttpHandler) {
    if (!this.isRefreshingToken) {
      // console.log("token refresh");
      this.isRefreshingToken = true;

      // Reset here so that the following requests wait until the token
      // comes back from the refreshToken call.
      this.tokenSubject.next(null);
      // const db = this.injector.get(DatabaseProvider);

      const Rreq = new HttpParams()
        .set(
          constants.refresh_token,
          localStorage.getItem(constants.refresh_token)
        )
        .set("grant_type", constants.refresh_token)
        .set("user_type", "ADMIN");

      return this.authService.authenticate(Rreq).pipe(
        switchMap(res => {
          this.tokenSubject.next(res.access_token);
          // console.log(res);
          localStorage.setItem(constants.access_token, res.access_token);
          localStorage.setItem(constants.refresh_token, res.refresh_token);
          localStorage.setItem(
            constants.user_role,
            res.user.authorities[0].authority
          );

          this.isRefreshingToken = false;

          return next.handle(this.addToken(req, res.access_token));

          // If we don't get a new token, we are in trouble so logout.
        }),
        catchError(error => {
          // If there is an exception calling 'refreshToken', bad news so logout.
          return this.logoutUser();
        })
      );
    } else {
      return this.tokenSubject.pipe(
        filter(token => token != null),
        take(1),
        switchMap(token => {
          return next.handle(this.addToken(req, token));
        })
      );
    }
  }

  logoutUser() {
    // Route to the login page (implementation up to you)
    localStorage.clear();
    this.router.navigate(["/login"]);
    return throwError("");
  }

  displayAlert(req: HttpRequest<any>, next: HttpHandler) {
    this.notifier.notify(
      "danger",
      "Something went wrong. Please try again later..!"
    );

    return next.handle(req);
  }

  connectionError(req: HttpRequest<any>, next: HttpHandler) {
    this.notifier.notify("danger", "Your connection was interrupted..!");

    return next.handle(req);
  }
}
