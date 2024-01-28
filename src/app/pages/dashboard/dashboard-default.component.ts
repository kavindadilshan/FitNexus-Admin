import { Component } from "@angular/core";
import { FormBuilder } from "@angular/forms";
import { NotifierService } from "angular-notifier";
import { DashboardService } from "../../core/services/dashboard-service/dashboard.service";
import { constants } from "../../shared/constant/constant";

@Component({
  selector: "app-dashboard-default",
  templateUrl: "./dashboard-default.component.html",
  styleUrls: ["./dashboard.component.css"]
})
export class DashboardDefaultComponent {
  private readonly notifier: NotifierService;
  profileCount: any;
  classCount: any;
  usersCount: any;
  coachesCount: any;
  groupClassSessionCount: any;
  personalClassSessionCount: any;
  fitnessClassSessionCount: any;
  gymCount: any;
  classTrainerCount: any;
  coachingTrainerCount: any;
  instructorCount: any;
  userRole: any;

  /**
   *
   * @param formBuilder
   * @param notifierService
   * @param dashboardService
   */
  constructor(
    private formBuilder: FormBuilder,
    private notifierService: NotifierService,
    private dashboardService: DashboardService
  ) {
    this.userRole = localStorage.getItem(constants.user_role);
    this.notifier = notifierService;
    this.getDashboardCount();
  }

  /**
   * Get Dashboard's Values
   */
  getDashboardCount() {
    this.dashboardService.getDashboardCount().subscribe(
      res => {
        if (res.success) {
          this.profileCount = res.body.totalProfiles;
          this.coachesCount = res.body.totalCoaches;
          this.classTrainerCount = res.body.totalClassTrainers;
          this.coachingTrainerCount = res.body.totalCoachingTrainers;
          this.usersCount = res.body.totalUsers;
          this.instructorCount = res.body.totalSessions;
          this.classCount = res.body.totalClasses;
          this.groupClassSessionCount = res.body.totalOnlineGroupSessions;
          this.personalClassSessionCount = res.body.totalOnlinePersonalSessions;
          this.fitnessClassSessionCount = res.body.totalFitnessSessions;
          this.gymCount = res.body.totalGyms;
        } else {
          this.notifier.notify("danger", res.message);
        }
      },
      error1 => {
        this.notifier.notify("danger", "Can't Process This Request");
      }
    );
  }
}
