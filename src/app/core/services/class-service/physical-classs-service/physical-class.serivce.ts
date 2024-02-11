import { HttpClient } from "@angular/common/http";
import { Observable, Subject, Subscription } from "rxjs";
import { constants } from "../../../../shared/constant/constant";

export class PhysicalClassSerivce {
  constructor(private http: HttpClient) {}

  getPhysicalClassByBusinessProfile(id, size, page): Observable<any> {
    return this.http.get<any>(
      constants.base_url +
        "admin/class/physical/all/by-profile/" +
        id +
        "?size=" +
        size +
        "&" +
        "page=" +
        page
    );
  }
  searchPhysicalClass(req, size, page): Observable<any> {
    return this.http.post<any>(
      constants.base_url +
        "admin/class/physical/search?size=" +
        size +
        "&page=" +
        page,
      req
    );
  }
  createPhysicalClass(req): Observable<any> {
    return this.http.post<any>(
      constants.base_url + "admin/class/physical/create",
      req
    );
  }
  changeClassStatus(status, id): Observable<any> {
    return this.http.patch<any>(
      constants.base_url +
        "admin/class/physical/visible/" +
        id +
        "?visible=" +
        status,
      ""
    );
  }
  updatePhysicalClass(req): Observable<any> {
    return this.http.put<any>(
      constants.base_url + "admin/class/physical/update",
      req
    );
  }
  getClassDetailsByID(id): Observable<any> {
    return this.http.get<any>(
      constants.base_url + "admin/class/physical/" + id
    );
  }
  getPhysicalSessionByClassID(id, size, page): Observable<any> {
    return this.http.get<any>(
      constants.base_url +
        "admin/class/physical/session/by-class/" +
        id +
        "?size=" +
        size +
        "&page=" +
        page
    );
  }
  getRatingForPhysicalClasses(id, size, page): Observable<any> {
    return this.http.get<any>(
      constants.base_url +
        "admin/class/physical/ratings/" +
        id +
        "?size=" +
        size +
        "&" +
        "page=" +
        page
    );
  }
  getPhysicalClassForTrainer(id, page, size): Observable<any> {
    return this.http.get<any>(
      constants.base_url +
        "admin/trainer/classes/physical/" +
        id +
        "?page=" +
        page +
        "&" +
        "size=" +
        size
    );
  }
  getRatingForPhysicalClass(id, size, page): Observable<any> {
    return this.http.get<any>(
      constants.base_url +
        "admin/trainer/rating/physical/" +
        id +
        "?size=" +
        size +
        "&" +
        "page=" +
        page
    );
  }
}
