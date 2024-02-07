import { Injectable, OnDestroy, OnInit } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable, Subject, Subscription } from "rxjs";
import { constants } from "../../../shared/constant/constant";

export class AuthenticationService {
  constructor(private http: HttpClient) {}

  isAuthenticated() {
    if (
      localStorage.getItem(constants.access_token) &&
      localStorage.getItem(constants.condition) === "true"
    ) {
      return true;
    } else {
      return false;
    }
  }

  authenticate(req): Observable<any> {
    return this.http.post<any>(
      constants.base_url + "oauth/token",
      req.toString(),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: constants.basic_token
        }
      }
    );
  }

  updatePassword(req): Observable<any> {
    return this.http.post<any>(constants.base_url + "admin/password", req);
  }

  logout(req): Observable<any> {
    return this.http.post<any>(
      constants.base_url + "api/v1/users/logout?userId=",
      req
    );
  }

  isTokenValid(req): Observable<any> {
    return this.http.post<any>(
      constants.base_url + "api/oauth/token/validate",
      req
    );
  }
}
