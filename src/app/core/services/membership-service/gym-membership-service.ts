import { HttpClient } from "@angular/common/http";
import { Observable, Subject, Subscription } from "rxjs";
import { constants } from "../../../shared/constant/constant";

export class GymMembershipService {
  constructor(private http: HttpClient) {}

  createGymMembership(req): Observable<any> {
    return this.http.post<any>(
      constants.base_url + "admin/membership/gym",
      req
    );
  }

  createDayPass(req): Observable<any> {
    return this.http.post<any>(
      constants.base_url + "admin/membership/day-pass",
      req
    );
  }
  updateDayPass(req): Observable<any> {
    return this.http.put<any>(
      constants.base_url + "admin/membership/day-pass",
      req
    );
  }
}
