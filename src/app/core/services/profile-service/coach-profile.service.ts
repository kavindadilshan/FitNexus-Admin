import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { constants } from "../../../shared/constant/constant";
import { Injectable } from "@angular/core";

@Injectable()
export class CoachProfileService {
  constructor(private http: HttpClient) {}

  createNewCoachProfile(req): Observable<any> {
    return this.http.post<any>(constants.base_url + "admin/coach/profile", req);
  }

  getCoachProfilelist(size, page, profileId): Observable<any> {
    return this.http.get<any>(
      constants.base_url +
        "admin/coach/profile?size=" +
        size +
        "&" +
        "page=" +
        page +
        "&businessProfileId=" +
        profileId
    );
  }
  getPackageForInstructor(id, size, page): Observable<any> {
    return this.http.get<any>(
      constants.base_url +
        "admin/instructor/packages/" +
        id +
        "?page=" +
        page +
        "&size=" +
        size
    );
  }
  updateCoachProfile(req): Observable<any> {
    return this.http.put<any>(constants.base_url + "admin/coach/profile", req);
  }

  getCoachProfileDetailsByID(id): Observable<any> {
    return this.http.get<any>(constants.base_url + "admin/coach/profile/" + id);
  }

  searchCoachProfile(req, size, page): Observable<any> {
    return this.http.post<any>(
      constants.base_url +
        "admin/coach/search?size=" +
        size +
        "&" +
        "page=" +
        page,
      req
    );
  }

  getCoachType(): Observable<any> {
    return this.http.get<any>(constants.base_url + "admin/coach/types");
  }

  getInstructersByProfileId(id): Observable<any> {
    return this.http.get<any>(
      constants.base_url + "admin/instructor/all/" + id
    );
  }

  getTrainersByProfileId(id): Observable<any> {
    return this.http.get<any>(
      constants.base_url + "admin/trainer/all/profile/" + id
    );
  }
  resendEmail(email): Observable<any> {
    return this.http.patch<any>(
      constants.base_url + "admin/coach/" + email + "/resend/zoom",
      ""
    );
  }

  changeAccountStatus(id, status, req): Observable<any> {
    return this.http.patch<any>(
      constants.base_url +
        "admin/coach/status?userId=" +
        id +
        "&" +
        "status=" +
        status,
      req
    );
  }
  createClientTransformation(req): Observable<any> {
    return this.http.post<any>(
      constants.base_url + "admin/client-transformation",
      req
    );
  }
  updateClientTransformation(req): Observable<any> {
    return this.http.put<any>(
      constants.base_url + "admin/client-transformation",
      req
    );
  }
  getClientTransformation(id, size, page): Observable<any> {
    return this.http.get<any>(
      constants.base_url +
        "admin/client-transformation/pageable/instructor/" +
        id +
        "?size=" +
        size +
        "&page=" +
        page
    );
  }
  deleteClientTransformation(id): Observable<any> {
    return this.http.delete<any>(
      constants.base_url + "admin/client-transformation/" + id
    );
  }
}
