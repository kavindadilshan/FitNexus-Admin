import { HttpClient } from "@angular/common/http";
import { Observable, Subject, Subscription } from "rxjs";
import { constants } from "../../../shared/constant/constant";

export class GymService {
  constructor(private http: HttpClient) {}

  createGym(req): Observable<any> {
    return this.http.post<any>(constants.base_url + "admin/gym/create", req);
  }

  updateGym(req): Observable<any> {
    return this.http.put<any>(constants.base_url + "admin/gym/update", req);
  }

  getGymsByProfileId(id, size, page): Observable<any> {
    return this.http.get<any>(
      constants.base_url +
        "admin/gym/all/by-profile/" +
        id +
        "?size=" +
        size +
        "&page=" +
        page
    );
  }
  getGymMembershipSummary(size, page, startDate, endDate): Observable<any> {
    return this.http.get<any>(
      constants.base_url +
        "admin/class/gym-memberships/date/type" +
        "?size=" +
        size +
        "&page=" +
        page +
        "&startDate=" +
        startDate +
        "&endDate=" +
        endDate
    );
  }
  searchByProfileId(req, id, size, page): Observable<any> {
    return this.http.post<any>(
      constants.base_url +
        "admin/gym/search/by-profile/" +
        id +
        "?size=" +
        size +
        "&page=" +
        page,
      req
    );
  }
  getFacilitesList(): Observable<any> {
    return this.http.get<any>(constants.base_url + "admin/facility/all");
  }
  getEquipmentsList(): Observable<any> {
    return this.http.get<any>(constants.base_url + "admin/equipment/all");
  }
  getGymDetailsById(Id): Observable<any> {
    return this.http.get<any>(constants.base_url + "admin/gym/by-id/" + Id);
  }
}
