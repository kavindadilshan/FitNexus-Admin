import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { HTTP_INTERCEPTORS } from "@angular/common/http";
import { TokenInterceptor } from "./interceptors/token.interceptor";
import { AuthGuard } from "./guard/auth.guard";
import { FormDirtyGuard } from "./guard/dirty-check.guard";
import { AuthenticationService } from "./services/auth-service/authentication.Service";
import { ClassService } from "./services/class-service/class.service";
import { PhysicalClassSessionService } from "./services/class-service/physical-class-session-sevice/physical-class-session.service";
import { PhysicalClassSerivce } from "./services/class-service/physical-classs-service/physical-class.serivce";
import { DashboardService } from "./services/dashboard-service/dashboard.service";
import { FinancialService } from "./services/financial-service/financial-service";
import { PackageService } from "./services/package-service/package.service";
import { ProfileManagerService } from "./services/profile-manager/profile-manager.service";
import { CoachProfileService } from "./services/profile-service/coach-profile.service";
import { ProfileService } from "./services/profile-service/profile.service";
import { PublicUserService } from "./services/profile-service/public-user.service";
import { UtilService } from "./services/util-service/util.service";
import { GymService } from "./services/gym-service/gym-service";
import { MembershipService } from "./services/membership-service/membership-service";
import { GymMembershipService } from "./services/membership-service/gym-membership-service";
import { AdvertisementService } from "./services/advertisement-service/advertisement.service";
import { InstructorTypeService } from "./services/instructor-type-service/instructor-type.service";
import { NotificationService } from "./services/notification/notification-service";
import { OnlineClassMembershipService } from "./services/membership-service/online-class-membership-service";
import { CorporateService } from "./services/corporate-service/corporate.service";
import { CorporateMembershipService } from "./services/membership-service/corporate-membership-service";
import { TimetableService } from "./services/timetable-service/timetable.service";
import { PromoCodeService } from "./services/promo-code-service/promo-code.service";
import { SubscriptionPackageService } from "./services/subscription-package-service/subscription-package.service";
import { MembershipActivationHistoryReportService } from "./services/membership-activation-history-report-service/membership-activation-history-report-service";
import { AttendanceReportService } from "./services/attendance-report-service/attendance-report-service";

@NgModule({
  imports: [CommonModule],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: TokenInterceptor, multi: true },
    AuthGuard,
    FormDirtyGuard,
    AuthenticationService,
    ClassService,
    PhysicalClassSessionService,
    PhysicalClassSerivce,
    DashboardService,
    FinancialService,
    PackageService,
    ProfileManagerService,
    CoachProfileService,
    ProfileService,
    PublicUserService,
    UtilService,
    GymService,
    MembershipService,
    GymMembershipService,
    AdvertisementService,
    InstructorTypeService,
    NotificationService,
    OnlineClassMembershipService,
    CorporateService,
    CorporateMembershipService,
    TimetableService,
    PromoCodeService,
    SubscriptionPackageService,
    MembershipActivationHistoryReportService,
    AttendanceReportService
  ],
  declarations: []
})
export class CoreModule {}
