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
  getMembershipByBusinessProfile(id, size, page): Observable<any> {
    return this.http.get<any>(
      constants.base_url +
        "admin/membership/by-profile/" +
        id +
        "?size=" +
        size +
        "&page=" +
        page
    );
  }
  getGymListByProfile(Id): Observable<any> {
    return this.http.get<any>(
      constants.base_url + "admin/gym/all/profile/" + Id
    );
  }
  getPackageDetailsById(id) {
    return this.http.get<any>(constants.base_url + "admin/membership/" + id);
  }
  updateGymMembership(req): Observable<any> {
    return this.http.put<any>(constants.base_url + "admin/membership/gym", req);
  }
  searchMembership(req, id, size, page) {
    return this.http.post<any>(
      constants.base_url +
        "admin/membership/search/gym/by-profile/" +
        id +
        "?size=" +
        size +
        "&page=" +
        page,
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
