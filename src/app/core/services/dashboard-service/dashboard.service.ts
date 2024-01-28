import { Injectable, OnDestroy, OnInit } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable, Subject, Subscription } from "rxjs";
import { constants } from "../../../shared/constant/constant";

export class DashboardService {
  constructor(private http: HttpClient) {}

  getDashboardCount(): Observable<any> {
    return this.http.get<any>(constants.base_url + "admin/public/dashboard");
  }
}
