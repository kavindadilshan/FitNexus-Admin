import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { constants } from "../../../shared/constant/constant";
import { Injectable } from "@angular/core";

@Injectable()
export class PublicUserService {
  constructor(private http: HttpClient) {}

  getTotalUserCount(): Observable<any> {
    return this.http.get<any>(constants.base_url + "admin/public/users");
  }

  getTotalEnrollmentsCount(): Observable<any> {
    return this.http.get<any>(constants.base_url + "admin/public/enrollments");
  }

  getAllPublicUsers(size, page): Observable<any> {
    return this.http.get<any>(
      constants.base_url + "admin/public/user?size=" + size + "&page=" + page
    );
  }

  getPhysicalSessionEnrollments(id, page, size): Observable<any> {
    return this.http.get<any>(
      constants.base_url +
        "admin/public/session/physical/enrollments/" +
        id +
        "?page=" +
        page +
        "&size=" +
        size
    );
  }
  getPhysicalClasssMembershipEnrollments(id, page, size): Observable<any> {
    return this.http.get<any>(
      constants.base_url +
        "admin/public/membership/physical-class/enrollments/" +
        id +
        "?page=" +
        page +
        "&size=" +
        size
    );
  }
  getGymMembershipEnrollments(id, page, size): Observable<any> {
    return this.http.get<any>(
      constants.base_url +
        "admin/public/membership/gym/enrollments/" +
        id +
        "?page=" +
        page +
        "&size=" +
        size
    );
  }

  getEnrollmentProgress(req): Observable<any> {
    return this.http.post<any>(constants.base_url + "admin/public/chart", req);
  }

  getSessionEnrollemnts(id, page, size): Observable<any> {
    return this.http.get<any>(
      constants.base_url +
        "admin/public/session/enrollments/" +
        id +
        "?page=" +
        page +
        "&size=" +
        size
    );
  }

  getInstructorEnrollemnts(id, page, size): Observable<any> {
    return this.http.get<any>(
      constants.base_url +
        "admin/public/package/enrollments/" +
        id +
        "?page=" +
        page +
        "&size=" +
        size
    );
  }

  searchPublicUser(req, size, page): Observable<any> {
    return this.http.post<any>(
      constants.base_url +
        "admin/public/user/search?size=" +
        size +
        "&" +
        "page=" +
        page,
      req
    );
  }

  getPublicUserAnalytics(id): Observable<any> {
    return this.http.get<any>(
      constants.base_url + "admin/public/event/WELCOME_SELECTION/track/" + id
    );
  }

  getPersonalClassSessionEnrollments(id, page, size): Observable<any> {
    return this.http.get<any>(
      constants.base_url +
        "admin/public/session/personal/enrollments/" +
        id +
        "?page=" +
        page +
        "&size=" +
        size
    );
  }
}
