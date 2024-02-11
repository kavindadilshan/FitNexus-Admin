import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { constants } from "../../../shared/constant/constant";
import { Injectable } from "@angular/core";
import { body, options } from "ionicons/icons";

@Injectable()
export class ProfileService {
  constructor(private http: HttpClient) {}

  createNewBusinessProfile(req): Observable<any> {
    return this.http.post<any>(constants.base_url + "admin/profile", req);
  }

  updateBusinessProfile(req): Observable<any> {
    return this.http.put<any>(constants.base_url + "admin/profile", req);
  }

  getProfilelist(size, page): Observable<any> {
    return this.http.get<any>(
      constants.base_url + "admin/profile?size=" + size + "&" + "page=" + page
    );
  }

  checkUsername(req): Observable<any> {
    return this.http.get<any>(constants.base_url + "admin/username/" + req);
  }

  searchBusinessProfile(req, size, page): Observable<any> {
    return this.http.post<any>(
      constants.base_url +
        "admin/profile/search?size=" +
        size +
        "&" +
        "page=" +
        page,
      req
    );
  }
  CheckBusinessProfileExistence(req): Observable<any> {
    return this.http.post<any>(
      constants.base_url + "admin/profile/existence",
      req
    );
  }
  getProfileNameList(): Observable<any> {
    return this.http.get<any>(constants.base_url + "admin/profile/names");
  }

  getProfileNameListHasTrainers(): Observable<any> {
    return this.http.get<any>(
      constants.base_url + "admin/profile/names/has-instructors"
    );
  }

  getProfileDetailsByID(id): Observable<any> {
    return this.http.get<any>(constants.base_url + "admin/profile/" + id);
  }

  changeAccountStatus(id, status, req): Observable<any> {
    return this.http.patch<any>(
      constants.base_url +
        "admin/profile/status?profileId=" +
        id +
        "&" +
        "status=" +
        status,
      req
    );
  }
}
