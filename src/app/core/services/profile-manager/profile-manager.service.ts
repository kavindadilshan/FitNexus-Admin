import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { constants } from "../../../shared/constant/constant";
import { Injectable } from "@angular/core";

@Injectable()
export class ProfileManagerService {
  constructor(private http: HttpClient) {}

  resetProfileManagerPassword(req): Observable<any> {
    return this.http.post<any>(
      constants.base_url + "manager/authenticate",
      req
    );
  }

  removeCoach(req): Observable<any> {
    return this.http.delete<any>(
      constants.base_url + "manager/coach/remove/" + req
    );
  }

  assignCoach(req): Observable<any> {
    return this.http.post<any>(
      constants.base_url + "manager/coach/assign/" + req,
      ""
    );
  }
  acceptConditions(): Observable<any> {
    return this.http.patch<any>(
      constants.base_url + "manager/accept-conditions",
      ""
    );
  }

  searchCoaches(req, size, page): Observable<any> {
    return this.http.post<any>(
      constants.base_url +
        "manager/coach/search?size=" +
        size +
        "&" +
        "page=" +
        page,
      req
    );
  }
  resendEmail(id, email): Observable<any> {
    return this.http.post<any>(
      constants.base_url +
        "admin/profile/manager/email/resend/" +
        id +
        "?email=" +
        email,
      ""
    );
  }

  getCoachlist(size, page): Observable<any> {
    return this.http.get<any>(
      constants.base_url +
        "manager/coach/all?size=" +
        size +
        "&" +
        "page=" +
        page
    );
  }
}
