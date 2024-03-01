import { Component, ViewChild } from "@angular/core";
import { NotifierService } from "angular-notifier";
import { FormBuilder, FormGroup } from "@angular/forms";
import { PublicUserService } from "../../../../core/services/profile-service/public-user.service";
import { ModalDirective, PageChangedEvent } from "ngx-bootstrap";
import { DashboardService } from "../../../../core/services/dashboard-service/dashboard.service";
import * as moment from "moment";
import { BsDatepickerConfig } from "ngx-bootstrap/datepicker";
import { constants } from "../../../../shared/constant/constant";
import {SubscriptionPackageService} from "../../../../core/services/subscription-package-service/subscription-package.service";

@Component({
  selector: "public-user-profile-report",
  templateUrl: "./public-user-profile-report.html"
})
export class PublicUserProfileReport {
  bsValue1: any;
  bsValue2: any;
  moreInfoForm: FormGroup;

  lat: any;
  lng: any;
  @ViewChild("moreInfoModal", { static: false })
  public moreInfoModal: ModalDirective;
  private readonly notifier: NotifierService;
  totalUser: any;
  totalEnrollment: any;
  rotate = true;
  currency: any;
  size = 10;
  page = 0;
  totalElement: number;
  physicalSessionTotalElement: number;
  personalClassSessionTotalElement: number;
  gymMembershipTotalElement: number;
  physicalClassMembershipTotalElement: number;
  profiles: Array<any> = [];
  date: Array<any> = [];
  classSessionEnrolls: Array<any> = [];
  personalSessionEnrolls: Array<any> = [];
  personalClassSessionEnrollments: Array<any> = [];
  returnedArray: Array<any> = [];
  public numPages = 1;
  first: "First";
  last: "List";
  classSize = 10;
  classPage = 0;
  trainerPage = 0;
  physicalSessionPage = 0;
  physicalClassPage = 0;
  gymMembershipPage = 0;
  personalClassSessionPage = 0;
  classTotalElement: number;
  instructorTotalElement: number;
  userID: any;
  classEnrollment: Array<any> = [];
  classReturnedArray: Array<any> = [];
  maxDate = new Date();
  mytime: Date = new Date();

  enrollmentForm: FormGroup;
  searchPublicUserForm: FormGroup;
  instructorEnrollment: Array<any> = [];
  instructorReturnedArray: Array<any> = [];
  physicalSessionReturnedArray: Array<any> = [];
  gymMembershipReturnedArray: Array<any> = [];
  physicalClassMembershipReturnedArray: Array<any> = [];
  bsConfig: Partial<BsDatepickerConfig>;

  // public user analystic property
  appType: any;
  dateTime: any;
  eventType: any;
  selectedEvent: any;

  subscriptionEnrollmentReturnedArray: Array<any> = [];
  subscriptionEnrollmentTotalElement: number;
  subscriptionEnrollmentPage = 0;

  constructor(
    private formBuilder: FormBuilder,
    private notifierService: NotifierService,
    private publicUserService: PublicUserService,
    private dashboardService: DashboardService,
    private subscriptionPackageService: SubscriptionPackageService
  ) {
    const today = new Date();
    const dd = String(today.getDate()).padStart(2, "0");
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const yyyy = today.getFullYear();
    const endDate = yyyy + "-" + mm + "-" + dd;
    this.bsValue2 = today;

    const ourDate = new Date();
    const pastDate = ourDate.getDate() - 7;
    ourDate.setDate(pastDate);
    const month = ourDate.getMonth() + 1;
    const dat = ourDate.getDate();
    this.bsValue1 = ourDate;
    const startDate =
      ourDate.getFullYear() +
      "-" +
      this.setDateZero(month) +
      "-" +
      this.setDateZero(dat);

    this.maxDate.setDate(this.maxDate.getDate() + 7);
    this.notifier = notifierService;
    this.getPublicUserCount();
    this.getEnrollmentCount();
    const arr = {
      start: startDate + "T06:30:00Z",
      end: endDate + "T06:30:00Z"
    };
    this.defaultSessionEnrollment(arr);
    this.getProfileList(this.size, this.page);
    this.bsConfig = Object.assign(
      {},
      {
        dateInputFormat: "YYYY-MM-DD",
        containerClass: "theme-primary",
        isAnimated: true
      }
    );
    this.currency = constants.currency;
    this.enrollmentForm = this.formBuilder.group({
      fromDate: [this.bsValue1],
      toDate: [this.bsValue2]
    });
    this.searchPublicUserForm = this.formBuilder.group({
      search: [""]
    });
    this.moreInfoForm = this.formBuilder.group({
      firstName: [""],
      gender: [""],
      lastName: [""],
      dob: [""],
      email: [""],
      mobileNo: [""],
      height: [""],
      weight: [""],
      addressLine1: [""],
      addressLine2: [""],
      city: [""],
      province: [""],
      postalCode: [""],
      Timezone: [""]
    });
  }

  defaultSessionEnrollment(arr) {
    this.publicUserService.getEnrollmentProgress(arr).subscribe(
      res => {
        if (res.success === true) {
          this.classSessionEnrolls = res.body.classSessionEnrolls;
          this.personalSessionEnrolls = res.body.personalSessionEnrolls;
          this.date = res.body.dates;
        } else {
          this.notifier.notify("danger", res.message);
        }
      },
      error1 => {
        this.notifier.notify("danger", "Can't Process This Request");
      }
    );
  }

  eventHandler(event) {
    return false;
    if (event.code === "Backspace" || event.code === "Delete") {
      return false;
    }
  }
  clear() {
    this.totalElement = 0;
    this.returnedArray.length = 0;
    this.getProfileList(this.size, this.page);
  }

  viewLocation() {
    window.open(
      "https://maps.google.com/?q=" + this.lat + "," + this.lng,
      "_blank"
    );
  }
  filterPublicUser() {
    this.totalElement = 0;
    this.returnedArray.length = 0;
    this.searchPublicUser(this.size, this.page);
  }
  searchPublicUser(size, page) {
    const filter = this.searchPublicUserForm.controls.search.value.trim();
    if (filter !== "") {
      const req = {
        data: filter
      };
      this.publicUserService.searchPublicUser(req, size, page).subscribe(
        res => {
          if (res.success) {
            this.totalElement = res.body.totalElements;
            this.returnedArray = res.body.content;
          } else {
            this.notifier.notify("danger", res.message);
          }
        },
        error1 => {
          this.notifier.notify("danger", "Can't Process This Request");
        }
      );
    } else {
      this.totalElement = 0;
      this.returnedArray.length = 0;
      this.getProfileList(this.size, this.page);
    }
  }

  getProfileList(size, page) {
    this.publicUserService.getAllPublicUsers(size, page).subscribe(
      res => {
        if (res.success) {
          this.totalElement = 1;

          this.returnedArray = res.body.content.filter(item => {
            const lastSeenYear = new Date(item.publicUserCommonDTO.lastSeenDateTime).getFullYear();
            const isNotReshan = item.publicUserCommonDTO.firstName !== 'Reshan';
            return lastSeenYear === 2024 && isNotReshan;
          });

        } else {
          this.notifier.notify("danger", res.message);
        }
      },
      error1 => {
        this.notifier.notify("danger", "Can't Process This Request");
      }
    );
  }

  getPhysicalSessionEnrollments(page) {
    this.publicUserService
      .getPhysicalSessionEnrollments(this.userID, page, 5)
      .subscribe(
        res => {
          if (res.success) {
            this.physicalSessionTotalElement = res.body.totalElements;
            this.physicalSessionReturnedArray = res.body.content;
          } else {
            this.notifier.notify("danger", res.message);
          }
        },
        error1 => {
          this.notifier.notify("danger", "Can't Process This Request");
        }
      );
  }

  getPersonalClassSessionEnrollments(page) {
    this.publicUserService
      .getPersonalClassSessionEnrollments(this.userID, page, 5)
      .subscribe(
        res => {
          if (res.success) {
            this.personalClassSessionTotalElement = res.body.totalElements;
            this.personalClassSessionEnrollments = res.body.content;
          } else {
            this.notifier.notify("danger", res.message);
          }
        },
        error1 => {
          this.notifier.notify("danger", "Can't Process This Request");
        }
      );
  }

  getPublicUserCount() {
    this.dashboardService.getDashboardCount().subscribe(
      res => {
        if (res.success === true) {
          this.totalUser = res.body.totalUsers;
        } else {
          this.notifier.notify("danger", res.message);
        }
      },
      error1 => {
        this.notifier.notify("danger", "Can't Process This Request");
      }
    );
  }
  getEnrollmentCount() {
    this.publicUserService.getTotalEnrollmentsCount().subscribe(
      res => {
        if (res.success === true) {
          this.totalEnrollment = res.body;
        } else {
          this.notifier.notify("danger", res.message);
        }
      },
      error1 => {
        this.notifier.notify("danger", "Can't Process This Request");
      }
    );
  }

  setDateZero(date) {
    return date < 10 ? "0" + date : date;
  }

  getEnrollmentProgress() {
    if (this.enrollmentForm.controls.fromDate.value === "") {
      this.notifier.notify("danger", "Please select start date");
    } else if (this.enrollmentForm.controls.toDate.value === "") {
      this.notifier.notify("danger", "Please select end date");
    } else {
      const fromDate = new Date(this.enrollmentForm.controls.fromDate.value);
      let month = fromDate.getMonth() + 1;
      let dat = fromDate.getDate();
      const startDate =
        fromDate.getFullYear() +
        "-" +
        this.setDateZero(month) +
        "-" +
        this.setDateZero(dat);

      const toDate = new Date(this.enrollmentForm.controls.toDate.value);
      month = toDate.getMonth() + 1;
      dat = toDate.getDate();
      const endDate =
        toDate.getFullYear() +
        "-" +
        this.setDateZero(month) +
        "-" +
        this.setDateZero(dat);

      if (startDate > endDate) {
        this.notifier.notify(
          "danger",
          "End Date must be greater than the Start Date"
        );
      } else {
        const arr = {
          start: startDate + "T06:30:00Z",
          end: endDate + "T06:30:00Z"
        };
        this.publicUserService.getEnrollmentProgress(arr).subscribe(
          res => {
            if (res.success === true) {
              this.classSessionEnrolls = res.body.classSessionEnrolls;
              this.personalSessionEnrolls = res.body.personalSessionEnrolls;
              this.date = res.body.dates;
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
  }

  pageChanged(event: PageChangedEvent): void {
    const page = event.page - 1;
    if (this.searchPublicUserForm.controls.search.value.trim() === "") {
      this.getProfileList(this.size, page);
    } else {
      this.searchPublicUser(this.size, page);
    }
  }

  moreInfo(data) {
    this.classTotalElement = 0;
    this.classReturnedArray.length = 0;
    this.instructorTotalElement = 0;
    this.instructorReturnedArray.length = 0;
    this.lat = data.publicUserCommonDTO.latitude;
    this.lng = data.publicUserCommonDTO.longitude;
    this.userID = data.publicUserCommonDTO.id;
    this.getPublicUserAnalytics();
    if (
      data.publicUserCommonDTO.image === null &&
      data.publicUserCommonDTO.gender === "FEMALE"
    ) {
      document
        .getElementById("profileImage")
        .setAttribute("src", "assets/images/female.png");
    } else if (
      data.publicUserCommonDTO.image === null &&
      data.publicUserCommonDTO.gender === "MALE"
    ) {
      document
        .getElementById("profileImage")
        .setAttribute("src", "assets/images/male.png");
    } else {
      document
        .getElementById("profileImage")
        .setAttribute("src", data.publicUserCommonDTO.image);
    }
    this.moreInfoForm.controls.addressLine1.setValue(
      data.publicUserCommonDTO.addressLine1
    );
    this.moreInfoForm.controls.addressLine2.setValue(
      data.publicUserCommonDTO.addressLine2
    );
    this.moreInfoForm.controls.city.setValue(data.publicUserCommonDTO.city);
    this.moreInfoForm.controls.province.setValue(
      data.publicUserCommonDTO.province
    );
    this.moreInfoForm.controls.postalCode.setValue(
      data.publicUserCommonDTO.postalCode
    );
    this.moreInfoForm.controls.Timezone.setValue(
      data.publicUserCommonDTO.timeZone
    );
    this.moreInfoForm.controls.firstName.setValue(
      data.publicUserCommonDTO.firstName
    );
    this.moreInfoForm.controls.lastName.setValue(
      data.publicUserCommonDTO.lastName
    );
    this.moreInfoForm.controls.email.setValue(data.publicUserCommonDTO.email);
    this.moreInfoForm.controls.mobileNo.setValue(
      data.publicUserCommonDTO.mobile
    );
    this.moreInfoForm.controls.dob.setValue(
      data.publicUserCommonDTO.dateOfBirth
    );
    this.moreInfoForm.controls.gender.setValue(data.publicUserCommonDTO.gender);
    this.moreInfoForm.controls.height.setValue(data.publicUserCommonDTO.height);
    this.moreInfoForm.controls.weight.setValue(data.publicUserCommonDTO.weight);
    this.moreInfoModal.show();
    this.getClassEnrollment(this.classPage);
    this.getSubscriptionPackageEnrollment(this.subscriptionEnrollmentPage);
    this.getInstructorEnrollment(this.trainerPage);
    this.getPhysicalSessionEnrollments(this.physicalSessionPage);
    this.getGymMembershipEnrollment(this.gymMembershipPage);
    this.getPhysicalClassMembershipEnrollment(this.physicalClassPage);
    this.getPersonalClassSessionEnrollments(this.personalClassSessionPage);
    // this.getClassEnrollment(data.classEnrollments);
    // this.getInstructorEnrollment(data.instructorEnrolls);
  }

  getPublicUserAnalytics() {
    this.publicUserService.getPublicUserAnalytics(this.userID).subscribe(
      res => {
        if (res.success === true) {
          this.appType = res.body.appType;
          this.dateTime = res.body.dateTime;
          this.eventType = res.body.eventType;
          this.selectedEvent = res.body.selectedEvent;
        } else {
          this.notifier.notify("danger", res.message);
        }
      },
      error1 => {
        this.notifier.notify("danger", "Can't Process This Request");
      }
    );
  }

  getClassEnrollment(page) {
    this.publicUserService
      .getSessionEnrollemnts(this.userID, page, 5)
      .subscribe(
        res => {
          if (res.success === true) {
            this.classTotalElement = res.body.totalElements;
            this.classReturnedArray = res.body.content;
          } else {
            this.notifier.notify("danger", res.message);
          }
        },
        error1 => {
          this.notifier.notify("danger", "Can't Process This Request");
        }
      );
  }
  getGymMembershipEnrollment(page) {
    this.publicUserService
      .getGymMembershipEnrollments(this.userID, page, 5)
      .subscribe(
        res => {
          if (res.success === true) {
            this.gymMembershipTotalElement = res.body.totalElements;
            this.gymMembershipReturnedArray = res.body.content;
          } else {
            this.notifier.notify("danger", res.message);
          }
        },
        error1 => {
          this.notifier.notify("danger", "Can't Process This Request");
        }
      );
  }

  getInstructorEnrollment(page) {
    this.publicUserService
      .getInstructorEnrollemnts(this.userID, page, 5)
      .subscribe(
        res => {
          if (res.success === true) {
            this.instructorTotalElement = res.body.totalElements;
            this.instructorReturnedArray = res.body.content;
          } else {
            this.notifier.notify("danger", res.message);
          }
        },
        error1 => {
          this.notifier.notify("danger", "Can't Process This Request");
        }
      );
  }
  getPhysicalClassMembershipEnrollment(page) {
    this.publicUserService
      .getPhysicalClasssMembershipEnrollments(this.userID, page, 5)
      .subscribe(
        res => {
          if (res.success === true) {
            this.physicalClassMembershipTotalElement = res.body.totalElements;
            this.physicalClassMembershipReturnedArray = res.body.content;
          } else {
            this.notifier.notify("danger", res.message);
          }
        },
        error1 => {
          this.notifier.notify("danger", "Can't Process This Request");
        }
      );
  }

  getSubscriptionPackageEnrollment(page) {
    this.subscriptionPackageService
      .getUserPackageEnrollment(this.userID, "5", page)
      .subscribe(
        res => {
          if (res.success === true) {
            this.subscriptionEnrollmentTotalElement = res.body.totalElements;
            this.subscriptionEnrollmentReturnedArray = res.body.content;
          } else {
            this.notifier.notify("danger", res.message);
          }
        },
        error1 => {
          this.notifier.notify("danger", "Can't Process This Request");
        }
      );
  }

  returnClassNameList(row) {
    let str1 = new String("");
    row.forEach(e => {
      str1 = new String(str1.concat(new String(e.name + " , ").toString()));
    });

    return (str1 = str1.replace(/,\s*$/, ""));
  }

  classEnrollmentPageChange(event: PageChangedEvent): void {
    this.classPage = event.page - 1;
    this.getClassEnrollment(this.classPage);
  }
  personalClassSessionEnrollmentPageChange(event: PageChangedEvent): void {
    this.personalClassSessionPage = event.page - 1;
    this.getPersonalClassSessionEnrollments(this.personalClassSessionPage);
  }

  instructorEnrollmentPageChange(event: PageChangedEvent): void {
    this.trainerPage = event.page - 1;
    this.getInstructorEnrollment(this.trainerPage);
  }
  physicalSessionEnrollmentPageChange(event: PageChangedEvent): void {
    this.physicalSessionPage = event.page - 1;
    this.getPhysicalSessionEnrollments(this.physicalSessionPage);
  }
  gymMembershipEnrollmentPageChange(event: PageChangedEvent): void {
    this.gymMembershipPage = event.page - 1;
    this.getGymMembershipEnrollment(this.gymMembershipPage);
  }
  physicalClassMembershipEnrollmentPageChange(event: PageChangedEvent): void {
    this.physicalClassPage = event.page - 1;
    this.getPhysicalClassMembershipEnrollment(this.physicalClassPage);
  }

  subscriptionPackageEnrollmentPageChange(event: PageChangedEvent): void {
    this.subscriptionEnrollmentPage = event.page - 1;
    this.getSubscriptionPackageEnrollment(this.subscriptionEnrollmentPage);
  }

  returnDate(dateTime) {
    if (dateTime === null) {
      return "";
    } else {
      return moment(dateTime).format("YYYY-MM-DD");
    }
  }

  returnDateTime(dateTime) {
    if (dateTime === null || dateTime === "") {
      return "";
    } else {
      return moment(dateTime).format("YYYY-MM-DD HH:mm");
    }
  }

  // instructorEnrollmentPageChange(event: PageChangedEvent): void {
  //   const startItem = (event.page - 1) * event.itemsPerPage;
  //   const endItem = event.page * event.itemsPerPage;
  //   this.instructorReturnedArray = this.instructorEnrollment.slice(
  //     startItem,
  //     endItem
  //   );
  // }
}
