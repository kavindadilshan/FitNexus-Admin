import {
  ActivatedRouteSnapshot,
  Resolve,
  RouterStateSnapshot
} from "@angular/router";
import { BehaviorSubject, Observable } from "rxjs";
import { Injectable } from "@angular/core";
import { MembershipService } from "../../../../core/services/membership-service/membership-service";
import { GymMembershipService } from "../../../../core/services/membership-service/gym-membership-service";

@Injectable()
export class UpdateGymMembershipService implements Resolve<any> {
  routeParams: any;
  membership: any;
  onMembershipChanged: BehaviorSubject<any>;

  /**
   *
   * @param membershipService
   */

  constructor(private membershipService: GymMembershipService) {
    // Set the defaults
    this.onMembershipChanged = new BehaviorSubject({});
  }

  resolve(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<any> | Promise<any> | any {
    this.routeParams = route.params;

    return new Promise((resolve, reject) => {
      Promise.all([this.getMembershipDetails()]).then(() => {
        resolve();
      }, reject);
    });
  }

  getMembershipDetails(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.membershipService
        .getPackageDetailsById("" + this.routeParams.membershipId)
        .subscribe((response: any) => {
          this.membership = response.body;
          this.onMembershipChanged.next(this.membership);
          resolve(response);
        }, reject);
    });
  }
}
