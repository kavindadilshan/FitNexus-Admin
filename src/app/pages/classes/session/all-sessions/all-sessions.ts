import { Component, OnInit, ViewChild } from "@angular/core";
import { ThemeOptions } from "../../../../theme-options";
import { FormBuilder, FormGroup } from "@angular/forms";
import { ModalDirective, PageChangedEvent } from "ngx-bootstrap";
import { NotifierService } from "angular-notifier";
import * as moment from "moment";
import { BsDatepickerConfig } from "ngx-bootstrap/datepicker";
import { ClassService } from "../../../../core/services/class-service/class.service";
import { constants } from "../../../../shared/constant/constant";
import { PhysicalClassSessionService } from "../../../../core/services/class-service/physical-class-session-sevice/physical-class-session.service";
import swal from "sweetalert2";
import { MembershipService } from "../../../../core/services/membership-service/membership-service";
import { GymMembershipService } from "../../../../core/services/membership-service/gym-membership-service";
import { GymService } from "../../../../core/services/gym-service/gym-service";
import { InstructorTypeService } from "../../../../core/services/instructor-type-service/instructor-type.service";
import { PublicUserService } from "../../../../core/services/profile-service/public-user.service";

@Component({
  selector: "all-session-list",
  templateUrl: "./all-sessions.html"
})
export class AllSessions {
  @ViewChild("moreInfoModal", { static: false })
  public moreInfoModal: ModalDirective;
  @ViewChild("commonMoreInfoModal", { static: false })
  public commonMoreInfoModal: ModalDirective;
  @ViewChild("gymMoreInfoModal", { static: false })
  public gymMoreInfoModal: ModalDirective;
  private readonly notifier: NotifierService;
  size = 10;
  page = 0;
  changePage = 0;
  gymTableChangePage = 0;
  onlineCoachingChangePage = 0;
  disable = true;
  isPhysicalSession = true;
  isOnlineSession = true;
  isDateRange1 = true;
  isDateRange2 = true;
  table1 = false;
  table2 = false;
  table3 = false;
  totalElement: number;
  returnedArray: Array<any> = [];
  moreInfoForm: FormGroup;
  gymMoreInfoForm: FormGroup;
  commonMoreInfoForm: FormGroup;
  filterForm: FormGroup;
  currency: any;
  currentDateTime: any;
  currentDate: any;
  bsValue1: any;
  ngValue = "PHYSICAL";
  classType: any = "PHYSICAL";
  bsConfig: Partial<BsDatepickerConfig>;
  latitude: any;
  longitude: any;
  paymentStatus: any;
  imageDetailsArray: Array<any> = [];
  sessionListReturnArray: Array<any> = [];
  sessionTotalElement: number;
  sessionPage = 0;
  classPage = 0;
  sessionID: any;
  userID: any;
  bsInlineValue = new Date();
  bsInlineRangeValue: Date[];
  isValidDateRange: any = false;
  endDate: any;
  checkedValue: any = "PHYSICAL";
  gymMembershipTotalElement: number;
  gymMembershipEnrollmentTotalElement: number;
  publicUserGymMembershipTotalElement: number;
  gymMembershipReturnedArray: Array<any> = [];
  gymMembershipEnrollmentReturnedArray: Array<any> = [];
  publicUserGymMembershipReturnedArray: Array<any> = [];
  onlineCoachingTotalElement: number;
  onlineCoachingReturnedArray: Array<any> = [];
  trainerReturnedArray: Array<any> = [];
  facilitiesReturnedArray: Array<any> = [];
  facilitiesList: Array<any> = [];
  trainerList: Array<any> = [];
  weekDaysClosingHour: any;
  weekDaysOpeningHour: any;
  saturdayOpeningHour: any;
  saturdayClosingHour: any;
  sundayOpeningHour: any;
  sundayClosingHour: any;
  rotate = true;
  first: "First";
  last: "List";
  public numPages = 1;
  public secondNumPages = 1;

  trainerPage = 0;
  gymMembershipPage = 0;
  physicalClassPage = 0;
  physicalSessionPage = 0;
  personalClassSessionPage = 0;
  classReturnedArray: Array<any> = [];
  classTotalElement: number;
  instructorTotalElement: number;
  instructorReturnedArray: Array<any> = [];
  physicalSessionReturnedArray: Array<any> = [];
  physicalSessionTotalElement: number;
  physicalClassMembershipTotalElement: number;
  physicalClassMembershipReturnedArray: Array<any> = [];
  personalClassSessionTotalElement: number;
  personalClassSessionEnrollments: Array<any> = [];

  constructor(
    public globals: ThemeOptions,
    private formBuilder: FormBuilder,
    private classService: ClassService,
    private membershipService: MembershipService,
    private instructorTypeService: InstructorTypeService,
    private publicUserService: PublicUserService,
    private gymService: GymService,
    private notifierService: NotifierService,
    private physicalClassSessionService: PhysicalClassSessionService
  ) {
    this.currency = constants.currency;
    this.gymMoreInfoForm = this.formBuilder.group({
      firstName: [""],
      email: [""],
      dob: [""],
      lastName: [""],
      mobileNo: [""],
      gender: [""],
      height: [""],
      weight: [""]
    });
    this.commonMoreInfoForm = this.formBuilder.group({
      session: [""],
      class: [""],
      studio: [""],
      trainer: [""],
      dateTime: [""],
      gender: [""],
      maxJoiner: [""],
      duration: [""],
      language: [""],
      enrollment: [""],
      paymentStatus: [""],
      description: [""],
      prepare: [""],
      sessionFee: [""],
      branchName: [""],
      addressLine1: [""],
      addressLine2: [""],
      city: [""],
      province: [""],
      postalCode: [""],
      country: [""]
    });
    this.moreInfoForm = this.formBuilder.group({
      firstName: [""],
      email: [""],
      dob: [""],
      lastName: [""],
      mobileNo: [""],
      gender: [""],
      height: [""],
      weight: [""]
    });
    const today = new Date();
    this.currentDate = moment(today).format("YYYY-MM-DD HH:mm");
    this.currentDateTime = moment(today).format("YYYY-MM-DD HH:mm");
    this.bsValue1 = today;
    this.bsConfig = Object.assign(
      {},
      {
        dateInputFormat: "YYYY-MM-DD",
        containerClass: "theme-primary",
        isAnimated: true
      }
    );
    this.isDateRange1 = false;
    this.isDateRange2 = true;
    this.table1 = false;
    this.table2 = true;
    this.table3 = true;
    this.notifier = notifierService;
    this.filterForm = this.formBuilder.group({
      date: [this.bsValue1],
      classType: ["PHYSICAL"],
      dateRange: [""]
    });
    this.getAllSession(this.page);
  }
  eventHandler(event) {
    return false;
    if (event.code === "Backspace" || event.code === "Delete") {
      return false;
    }
  }
  getChangeValue(val) {
    if (val !== null) {
      const from = moment(val[0]);
      const to = moment(val[1]); // another date
      const dayDuration = moment.duration(to.diff(from));
      const count = dayDuration.asDays();
      if (count > 360) {
        this.isValidDateRange = false;
        const endDate = from.add(360, "days");
        this.endDate = endDate.format("YYYY-MM-DD");
        this.notifier.notify(
          "danger",
          "End date must be " + this.endDate + " or earlier (1 Year)"
        );
      } else {
        this.isValidDateRange = true;
      }
    }
  }
  changeClassType() {
    this.classType = this.filterForm.controls.classType.value;
  }
  filterResult(page) {
    this.totalElement = 0;
    this.returnedArray.length = 0;
    this.getAllSession(page);
  }
  filterMembershipResult(page) {
    this.gymMembershipTotalElement = 0;
    this.gymMembershipReturnedArray.length = 0;
    this.onlineCoachingTotalElement = 0;
    this.onlineCoachingReturnedArray.length = 0;
    if (this.filterForm.controls.dateRange.value === "") {
      this.notifier.notify("danger", "Please select date range");
    } else if (this.isValidDateRange === false) {
      this.notifier.notify(
        "danger",
        "End date must be " + this.endDate + " or earlier (1 Year)"
      );
    } else if (this.checkedValue === "GYM") {
      this.getAllGymMembershipSummary(page);
    } else {
      this.getOnlineCoachingSummary(page);
    }
  }
  openGymMoreInfoModel(row) {
    this.classTotalElement = 0;
    this.classReturnedArray.length = 0;
    this.instructorTotalElement = 0;
    this.instructorReturnedArray.length = 0;
    this.physicalSessionTotalElement = 0;
    this.physicalSessionReturnedArray.length = 0;
    this.publicUserGymMembershipTotalElement = 0;
    this.publicUserGymMembershipReturnedArray.length = 0;
    this.physicalClassMembershipTotalElement = 0;
    this.physicalClassMembershipReturnedArray.length = 0;
    this.personalClassSessionTotalElement = 0;
    this.personalClassSessionEnrollments.length = 0;
    this.gymMembershipEnrollmentTotalElement = 0;
    this.gymMembershipEnrollmentReturnedArray.length = 0;
    this.gymMembershipEnrollmentTotalElement = 0;
    this.gymMembershipEnrollmentReturnedArray.length = 0;
    this.userID = row.publicUserId;
    this.gymMoreInfoForm.controls.firstName.setValue(row.publicUserFirstName);
    this.gymMoreInfoForm.controls.lastName.setValue(row.publicUserLastName);
    this.gymMoreInfoForm.controls.email.setValue(row.email);
    this.gymMoreInfoForm.controls.dob.setValue(row.dateOfBirth);
    this.gymMoreInfoForm.controls.weight.setValue(row.weight);
    this.gymMoreInfoForm.controls.height.setValue(row.height);
    this.gymMoreInfoForm.controls.gender.setValue(row.gender);
    this.gymMoreInfoForm.controls.mobileNo.setValue(row.mobileNumber);
    if (row.image === null && row.gender === "FEMALE") {
      document
        .getElementById("gymUserProfileImage")
        .setAttribute("src", "assets/images/female.png");
    } else if (row.image === null && row.gender === "MALE") {
      document
        .getElementById("gymUserProfileImage")
        .setAttribute("src", "assets/images/male.png");
    } else {
      document
        .getElementById("gymUserProfileImage")
        .setAttribute("src", row.image);
    }
    this.getClassEnrollment(this.classPage);
    this.getInstructorEnrollment(this.trainerPage);
    this.getPublicUserPhysicalSessionEnrollments(this.physicalSessionPage);
    this.getGymMembershipEnrollment(this.gymMembershipPage);
    this.getPhysicalClassMembershipEnrollment(this.physicalClassPage);
    this.getPersonalClassSessionEnrollments(this.personalClassSessionPage);
    this.gymMoreInfoModal.show();
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
  getGymMembershipEnrollment(page) {
    this.publicUserService
      .getGymMembershipEnrollments(this.userID, page, 5)
      .subscribe(
        res => {
          if (res.success === true) {
            this.gymMembershipEnrollmentTotalElement = res.body.totalElements;
            this.gymMembershipEnrollmentReturnedArray = res.body.content;
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
    this.getPublicUserPhysicalSessionEnrollments(this.physicalSessionPage);
  }
  gymMembershipEnrollmentPageChange(event: PageChangedEvent): void {
    this.gymMembershipPage = event.page - 1;
    this.getGymMembershipEnrollment(this.gymMembershipPage);
  }
  physicalClassMembershipEnrollmentPageChange(event: PageChangedEvent): void {
    this.physicalClassPage = event.page - 1;
    this.getPhysicalClassMembershipEnrollment(this.physicalClassPage);
  }
  /**
   * get gym membership summary
   * @param page
   */
  getAllGymMembershipSummary(page) {
    this.gymService
      .getGymMembershipSummary(
        this.size,
        page,
        moment
          .utc(this.filterForm.controls.dateRange.value[0])
          .format("YYYY-MM-DD"),
        moment
          .utc(this.filterForm.controls.dateRange.value[1])
          .format("YYYY-MM-DD")
      )
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
  /**
   * get gym membership summary
   * @param page
   */
  getOnlineCoachingSummary(page) {
    this.instructorTypeService
      .getOnlineCoachingSummary(
        this.size,
        page,
        moment
          .utc(this.filterForm.controls.dateRange.value[0])
          .format("YYYY-MM-DD"),
        moment
          .utc(this.filterForm.controls.dateRange.value[1])
          .format("YYYY-MM-DD")
      )
      .subscribe(
        res => {
          if (res.success === true) {
            this.onlineCoachingTotalElement = res.body.totalElements;
            this.onlineCoachingReturnedArray = res.body.content;
          } else {
            this.notifier.notify("danger", res.message);
          }
        },
        error1 => {
          this.notifier.notify("danger", "Can't Process This Request");
        }
      );
  }
  /**
   * filter all session by class type and date
   * @param page
   */
  getAllSession(page) {
    this.classService
      .getAllSession(
        this.size,
        page,
        moment(this.filterForm.controls.date.value).format("YYYY-MM-DD"),
        this.checkedValue
      )
      .subscribe(
        res => {
          if (res.success === true) {
            this.totalElement = res.body.totalElements;
            this.returnedArray = res.body.content;
            this.classType = this.filterForm.controls.classType.value;
          } else {
            this.notifier.notify("danger", res.message);
          }
        },
        error1 => {
          this.notifier.notify("danger", "Can't Process This Request");
        }
      );
  }
  trainerChanged(event: PageChangedEvent): void {
    const startItem = (event.page - 1) * event.itemsPerPage;
    const endItem = event.page * event.itemsPerPage;
    this.trainerReturnedArray = this.trainerList.slice(startItem, endItem);
  }
  facilitiesChanged(event: PageChangedEvent): void {
    const startItem = (event.page - 1) * event.itemsPerPage;
    const endItem = event.page * event.itemsPerPage;
    this.facilitiesReturnedArray = this.facilitiesList.slice(
      startItem,
      endItem
    );
  }
  getGymDetails(id) {
    this.gymService.getGymDetailsById(id).subscribe(
      res => {
        if (res.success === true) {
          this.gymMoreInfoForm.controls.addressLine1.setValue(
            res.body.addressLine1
          );
          if (res.body.addressLine2 === "" || res.body.addressLine2 === null) {
            this.gymMoreInfoForm.controls.addressLine2.setValue("");
          } else {
            this.gymMoreInfoForm.controls.addressLine2.setValue(
              res.body.addressLine2
            );
          }
          this.gymMoreInfoForm.controls.city.setValue(res.body.city);
          this.gymMoreInfoForm.controls.branchName.setValue(res.body.gymName);
          this.gymMoreInfoForm.controls.postalCode.setValue(
            res.body.postalCode
          );
          this.gymMoreInfoForm.controls.province.setValue(res.body.province);
          this.gymMoreInfoForm.controls.country.setValue(res.body.country);
          this.latitude = res.body.latitude;
          this.longitude = res.body.longitude;
          if (res.body.openInWeekDays === true) {
            this.weekDaysOpeningHour = res.body.weekDaysOpeningHour;
            this.weekDaysClosingHour = res.body.weekDaysClosingHour;
            this.gymMoreInfoForm.controls.category.setValue("Yes");
            document.getElementById("weekHour").removeAttribute("hidden");
          } else {
            this.gymMoreInfoForm.controls.category.setValue("No");
            document.getElementById("weekHour").setAttribute("hidden", "true");
          }
          if (res.body.openInWeekEnd === true) {
            this.gymMoreInfoForm.controls.type.setValue("Yes");
          } else {
            this.gymMoreInfoForm.controls.type.setValue("No");
          }

          if (
            res.body.openInWeekEnd === true &&
            res.body.saturdayOpeningHour !== null
          ) {
            this.saturdayOpeningHour = res.body.saturdayOpeningHour;
            this.saturdayClosingHour = res.body.saturdayClosingHour;
            document.getElementById("saturday").removeAttribute("hidden");
          } else {
            document.getElementById("saturday").setAttribute("hidden", "true");
          }
          if (
            res.body.openInWeekEnd === true &&
            res.body.sundayOpeningHour !== null
          ) {
            this.sundayOpeningHour = res.body.sundayOpeningHour;
            this.sundayClosingHour = res.body.sundayClosingHour;
            document.getElementById("sunday").removeAttribute("hidden");
          } else {
            document.getElementById("sunday").setAttribute("hidden", "true");
          }

          if (res.body.closedOnSpecificDay === true) {
            this.gymMoreInfoForm.controls.firstSession.setValue("Yes");
          } else {
            this.gymMoreInfoForm.controls.firstSession.setValue("No");
          }
          this.gymMoreInfoForm.controls.name.setValue(res.body.gymName);
          this.gymMoreInfoForm.controls.studioProfile.setValue(
            res.body.businessProfileName
          );
          this.gymMoreInfoForm.controls.description.setValue(
            res.body.description
          );
          this.gymMoreInfoForm.controls.calorie.setValue(
            res.body.closedSpecificDay
          );
          document
            .getElementById("gymProfileImage")
            .setAttribute("src", res.body.profileImage);
          this.imageDetailsArray = res.body.gymImages;
          this.trainerList = res.body.equipmentList;
          this.trainerReturnedArray = this.trainerList.slice(0, 5);
          this.facilitiesList = res.body.facilities;
          this.facilitiesReturnedArray = this.facilitiesList.slice(0, 5);
        } else {
          this.notifier.notify("danger", res.message);
        }
      },
      error1 => {
        this.notifier.notify("danger", "Can't Process This Request");
      }
    );
  }
  SessionTableChange(event: PageChangedEvent): void {
    this.changePage = event.page - 1;
    this.getAllSession(this.changePage);
  }
  gymMembershipTableChange(event: PageChangedEvent): void {
    this.gymTableChangePage = event.page - 1;
    this.getAllGymMembershipSummary(this.gymTableChangePage);
  }
  onlineCoachingTableChange(event: PageChangedEvent): void {
    this.onlineCoachingChangePage = event.page - 1;
    this.getOnlineCoachingSummary(this.onlineCoachingChangePage);
  }
  returnTime(dateTime) {
    return moment(dateTime).format("HH:mm");
  }

  returnDate(dateTime) {
    return moment(dateTime).format("YYYY-MM-DD");
  }
  viewLocation() {
    window.open(
      "https://maps.google.com/?q=" + this.latitude + "," + this.longitude,
      "_blank"
    );
  }
  getSelectedValue(val) {
    this.checkedValue = val.target.defaultValue;
    if (
      val.target.defaultValue === "GYM" ||
      val.target.defaultValue === "ONLINE_COACHING"
    ) {
      this.isDateRange1 = true;
      this.isDateRange2 = false;
      this.gymMembershipTotalElement = 0;
      this.gymMembershipReturnedArray.length = 0;
      this.filterForm.controls.dateRange.setValue("");
    } else {
      this.filterForm.controls.date.setValue(this.bsValue1);
      this.totalElement = 0;
      this.returnedArray.length = 0;
      this.isDateRange1 = false;
      this.isDateRange2 = true;
    }

    if (val.target.defaultValue === "GYM") {
      this.table1 = true;
      this.table2 = false;
      this.table3 = true;
    } else if (val.target.defaultValue === "ONLINE_COACHING") {
      this.table1 = true;
      this.table2 = true;
      this.table3 = false;
    } else {
      this.table1 = false;
      this.table2 = true;
      this.table3 = true;
    }
  }

  onlineCoachingMoreInfoModal(row) {
    this.classTotalElement = 0;
    this.classReturnedArray.length = 0;
    this.instructorTotalElement = 0;
    this.instructorReturnedArray.length = 0;
    this.physicalSessionTotalElement = 0;
    this.physicalSessionReturnedArray.length = 0;
    this.publicUserGymMembershipTotalElement = 0;
    this.publicUserGymMembershipReturnedArray.length = 0;
    this.physicalClassMembershipTotalElement = 0;
    this.physicalClassMembershipReturnedArray.length = 0;
    this.personalClassSessionTotalElement = 0;
    this.personalClassSessionEnrollments.length = 0;
    this.userID = row.studentUserId;
    this.moreInfoForm.controls.firstName.setValue(row.studentFirstName);
    this.moreInfoForm.controls.lastName.setValue(row.studentLastName);
    this.moreInfoForm.controls.email.setValue(row.studentEmail);
    this.moreInfoForm.controls.dob.setValue(row.studentDateOfBirth);
    this.moreInfoForm.controls.weight.setValue(row.studentWeight);
    this.moreInfoForm.controls.height.setValue(row.studentHeight);
    this.moreInfoForm.controls.gender.setValue(row.studentGender);
    this.moreInfoForm.controls.mobileNo.setValue(row.studentMobileNumber);
    if (row.studentImage === null && row.studentGender === "FEMALE") {
      document
        .getElementById("profileImage")
        .setAttribute("src", "assets/images/female.png");
    } else if (row.studentImage === null && row.studentGender === "MALE") {
      document
        .getElementById("profileImage")
        .setAttribute("src", "assets/images/male.png");
    } else {
      document
        .getElementById("profileImage")
        .setAttribute("src", row.studentImage);
    }
    this.getClassEnrollment(this.classPage);
    this.getInstructorEnrollment(this.trainerPage);
    this.getPublicUserPhysicalSessionEnrollments(this.physicalSessionPage);
    this.getGymMembershipEnrollment(this.gymMembershipPage);
    this.getPhysicalClassMembershipEnrollment(this.physicalClassPage);
    this.getPersonalClassSessionEnrollments(this.personalClassSessionPage);
    this.moreInfoModal.show();
  }

  openMoreInfoModel(row) {
    this.sessionTotalElement = 0;
    this.sessionPage = 0;
    this.sessionListReturnArray.length = 0;
    this.sessionID = row.sessionId;
    this.imageDetailsArray = row.classImages;
    this.paymentStatus = row.allowCashPayment;
    if (row.allowCashPayment === true) {
      this.paymentStatus = "Yes";
    } else {
      this.paymentStatus = "No";
    }

    if (row.location === null) {
      this.commonMoreInfoForm.controls.addressLine2.setValue("");
      this.commonMoreInfoForm.controls.addressLine1.setValue("");
      this.commonMoreInfoForm.controls.city.setValue("");
      this.commonMoreInfoForm.controls.branchName.setValue("");
      this.commonMoreInfoForm.controls.postalCode.setValue("");
      this.commonMoreInfoForm.controls.province.setValue("");
      this.commonMoreInfoForm.controls.country.setValue("");
      this.disable = true;
    } else if (
      row.location.addressLine2 === "" ||
      row.location.addressLine2 === null
    ) {
      this.disable = false;
      this.latitude = row.location.latitude;
      this.longitude = row.location.longitude;
      this.commonMoreInfoForm.controls.addressLine2.setValue("");
      this.commonMoreInfoForm.controls.addressLine1.setValue(
        row.location.addressLine1
      );
      this.commonMoreInfoForm.controls.city.setValue(row.location.city);
      this.commonMoreInfoForm.controls.branchName.setValue(row.location.name);
      this.commonMoreInfoForm.controls.postalCode.setValue(
        row.location.postalCode
      );
      this.commonMoreInfoForm.controls.province.setValue(row.location.province);
      this.commonMoreInfoForm.controls.country.setValue(row.location.country);
    } else {
      this.disable = false;
      this.commonMoreInfoForm.controls.addressLine1.setValue(
        row.location.addressLine1
      );
      this.commonMoreInfoForm.controls.addressLine2.setValue(
        row.location.addressLine2
      );
      this.commonMoreInfoForm.controls.city.setValue(row.location.city);
      this.commonMoreInfoForm.controls.branchName.setValue(row.location.name);
      this.commonMoreInfoForm.controls.postalCode.setValue(
        row.location.postalCode
      );
      this.commonMoreInfoForm.controls.province.setValue(row.location.province);
      this.commonMoreInfoForm.controls.country.setValue(row.location.country);
      this.latitude = row.location.latitude;
      this.longitude = row.location.longitude;
    }

    this.commonMoreInfoForm.controls.paymentStatus.setValue(this.paymentStatus);
    this.commonMoreInfoForm.controls.session.setValue(row.sessionName);
    this.commonMoreInfoForm.controls.class.setValue(row.className);
    this.commonMoreInfoForm.controls.studio.setValue(row.businessProfileName);
    this.commonMoreInfoForm.controls.trainer.setValue(row.trainerName);
    this.commonMoreInfoForm.controls.dateTime.setValue(
      this.returnDateTime(row.dateTime)
    );
    this.commonMoreInfoForm.controls.gender.setValue(row.gender);
    this.commonMoreInfoForm.controls.maxJoiner.setValue(row.maxJoiners);
    this.commonMoreInfoForm.controls.duration.setValue(row.duration);
    this.commonMoreInfoForm.controls.language.setValue(row.language);
    this.commonMoreInfoForm.controls.enrollment.setValue(
      row.numberOfEnrollments
    );
    this.commonMoreInfoForm.controls.description.setValue(row.description);
    this.commonMoreInfoForm.controls.sessionFee.setValue(row.price);
    if (this.checkedValue === "PHYSICAL") {
      this.isOnlineSession = true;
      this.isPhysicalSession = false;
      this.getPhysicalSessionEnrollments(this.sessionPage);
    } else {
      this.isOnlineSession = false;
      this.isPhysicalSession = true;
      this.getOnlineSessionEnrollments(this.sessionPage);
    }
    document.getElementById("Image").setAttribute("src", row.classProfileImage);
    this.commonMoreInfoModal.show();
  }
  returnAge(age) {
    if (age === 0) {
      return "";
    } else {
      return age;
    }
  }
  getPublicUserPhysicalSessionEnrollments(page) {
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
  getPhysicalSessionEnrollments(page) {
    this.physicalClassSessionService
      .getEnrollmentsForSession(this.sessionID, 5, page)
      .subscribe(
        res => {
          if (res.success === true) {
            this.sessionTotalElement = res.body.totalElements;
            this.sessionListReturnArray = res.body.content;
          } else {
            this.notifier.notify("danger", res.message);
          }
        },
        error1 => {
          this.notifier.notify("danger", "Can't Process This Request");
        }
      );
  }
  getOnlineSessionEnrollments(page) {
    this.classService
      .getEnrollmentsForSession(this.sessionID, 5, page)
      .subscribe(
        res => {
          if (res.success === true) {
            this.sessionTotalElement = res.body.totalElements;
            this.sessionListReturnArray = res.body.content;
          } else {
            this.notifier.notify("danger", res.message);
          }
        },
        error1 => {
          this.notifier.notify("danger", "Can't Process This Request");
        }
      );
  }
  sessionEnrollmentPageChanged(event: PageChangedEvent): void {
    this.sessionPage = event.page - 1;
    this.getPhysicalSessionEnrollments(this.sessionPage);
  }
  onlineSessionEnrollmentPageChanged(event: PageChangedEvent): void {
    this.sessionPage = event.page - 1;
    this.getOnlineSessionEnrollments(this.sessionPage);
  }
  returnDateTime(dateTime) {
    const timeConvert = moment(dateTime).format("YYYY-MM-DD HH:mm");
    return timeConvert;
  }
  makePayment(val) {
    this.moreInfoModal.hide();
    swal
      .fire({
        title: "Cash payment collection",
        text: "Are you collecting the payment now? ",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Yes",
        cancelButtonText: "No"
      })
      .then(result => {
        if (result.value) {
          this.moreInfoModal.show();
          if (val.enrollStatus === "SESSION_PENDING") {
            this.physicalClassSessionService
              .makePayment(val.enrollId)
              .subscribe(
                res => {
                  if (res.success) {
                    this.notifier.notify(
                      "success",
                      "Payment has been made successfully..!"
                    );
                    this.getPhysicalSessionEnrollments(this.sessionPage);
                  }
                },
                error1 => {
                  this.notifier.notify("danger", "Can't Process This Request");
                }
              );
          } else if (val.enrollStatus === "MEMBERSHIP_PENDING") {
            this.membershipService
              .makeMembershipPayment(val.enrollId)
              .subscribe(
                res => {
                  if (res.success) {
                    this.notifier.notify(
                      "success",
                      "Payment has been made successfully..!"
                    );
                    this.getPhysicalSessionEnrollments(this.sessionPage);
                  }
                },
                error1 => {
                  this.notifier.notify("danger", "Can't Process This Request");
                }
              );
          }
        } else if (result.dismiss === swal.DismissReason.cancel) {
          this.moreInfoModal.show();
          swal.close();
        }
      });
  }
}
