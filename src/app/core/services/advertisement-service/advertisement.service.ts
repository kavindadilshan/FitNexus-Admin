import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { constants } from "../../../shared/constant/constant";

export class AdvertisementService {
  constructor(private http: HttpClient) {}

  // create new advertisement
  createAdvertisement(req): Observable<any> {
    return this.http.post<any>(
      constants.base_url + "admin/advertisement/create",
      req
    );
  }

  // get All Advertisement
  getAllAdvertisement(size, page): Observable<any> {
    return this.http.get<any>(
      constants.base_url +
        "admin/advertisement/all?size='" +
        size +
        "'&page=" +
        page
    );
  }

  // delete Advertisement
  deleteAdvertisement(id): Observable<any> {
    return this.http.delete<any>(
      constants.base_url + "admin/advertisement/delete/" + id
    );
  }

  // change Advertisement Status (true/false)
  changeVisibility(req): Observable<any> {
    return this.http.put<any>(
      constants.base_url + "admin/advertisement/update/visibility",
      req
    );
  }
}
