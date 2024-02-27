import { HttpClient } from "@angular/common/http";
import { Observable, Subject, Subscription } from "rxjs";
import { constants } from "../../../shared/constant/constant";

export class MembershipService {
  constructor(private http: HttpClient) {}
  createClassMembership(req): Observable<any> {
    return this.http.post<any>(
      constants.base_url + "admin/membership/physical-class",
      req
    );
  }
  updateClassMembership(req): Observable<any> {
    return this.http.put<any>(
      constants.base_url + "admin/membership/physical-class",
      req
    );
  }
  getClassByBusinessProfile(id, size, page): Observable<any> {
    return this.http.get<any>(
      constants.base_url +
        "admin/membership/by-profile/class/" +
        id +
        "?size=" +
        size +
        "&page=" +
        page
    );
  }
  searchClassByBusinessProfile(req, id, size, page) {
    return this.http.post<any>(
      constants.base_url +
        "admin/membership/search/by-profile/" +
        id +
        "?size=" +
        size +
        "&page=" +
        page,
      req
    );
  }
  getClassDetailsByProfileId(id) {
    return this.http.get<any>(
      constants.base_url + "admin/class/physical/all/profile/" + id
    );
  }
  getMembershipByClassId(id, size, page): Observable<any> {
    return this.http.get<any>(
      constants.base_url +
        "admin/membership/by-class/" +
        id +
        "?size=" +
        size +
        "&page=" +
        page
    );
  }
  getEnrolledUsers(id, size, page): Observable<any> {
    return this.http.get<any>(
      constants.base_url +
        "admin/membership/" +
        id +
        "/students?size=" +
        size +
        "&page=" +
        page
    );
  }
  searchMembershipByClass(req, id, size, page) {
    return this.http.post<any>(
      constants.base_url +
        "admin/membership/search/by-class/" +
        id +
        "?size=" +
        size +
        "&page=" +
        page,
      req
    );
  }
  getMembershipById(id): Observable<any> {
    return this.http.get<any>(constants.base_url + "admin/membership/" + id);
  }
  makeMembershipPayment(id): Observable<any> {
    return this.http.patch<any>(
      constants.base_url + "admin/membership/pay/" + id,
      ""
    );
  }
}
