import { Component, OnDestroy, OnInit, ViewChild } from "@angular/core";
import { NotifierService } from "angular-notifier";
import { FormBuilder, FormGroup } from "@angular/forms";
import { ProfileService } from "../../../../core/services/profile-service/profile.service";
import { ClassService } from "../../../../core/services/class-service/class.service";
import { ModalDirective, PageChangedEvent } from "ngx-bootstrap";
import swal from "sweetalert2";
import { ActivatedRoute, Router } from "@angular/router";
import { SessionDTO } from "../../../../shared/dto/sessionDTO";
import { ThemeOptions } from "../../../../theme-options";
import * as moment from "moment";
import { PhysicalClassSessionService } from "../../../../core/services/class-service/physical-class-session-sevice/physical-class-session.service";
import { constants } from "../../../../shared/constant/constant";
import { MembershipService } from "../../../../core/services/membership-service/membership-service";

@Component({
  selector: "physical-class-session-list",
  templateUrl: "./physical-class-session-list.html"
})
export class PhysicalClassSessionList {
  @ViewChild("RescheduleModal", { static: false })
  public RescheduleModal: ModalDirective;
  @ViewChild("moreInfoModal", { static: false })
  public moreInfoModal: ModalDirective;
  private readonly notifier: NotifierService;
  imageDetailsArray: Array<any> = [];
  size = 10;
  page = 0;
  currentPage = 0;
  sessionPage = 0;
  changePage = 0;
  searchTxt: any = undefined;
  totalElement: number;
  pageNo: any = undefined;
  currDateTime: any;
  formatTime: any;
  selectedDateTime: any;
  currentDateTime: any;
  searchProfile: FormGroup;
  returnedArray: Array<any> = [];
  sessionId: any;
  currency: any;
  reDate: any;
  maxDate = new Date();
  bsValue = new Date();
  currentDate: any;
  mytime: Date = new Date();
  rescheduleForm: FormGroup;
  searchSessionForm: FormGroup;
  bsInlineValue = new Date();

  gender: any;
  duration: any;
  description: any;
  fee: any;
  maxjoiner: any;
  trainer: any;
  sessionObj: SessionDTO;
  id: any;
  name: any;
  profileID: any;
  disable = true;
  status: boolean;
  latitude: any;
  longitude: any;
  paymentStatus: any;
  paymentModal: any;
  moreInfoForm: FormGroup;
  sessionID: any;
  sessionListReturnArray: Array<any> = [];
  sessionTotalElement: number;
  public constructor(
    public globals: ThemeOptions,
    private formBuilder: FormBuilder,
    private profileService: ProfileService,
    private notifierService: NotifierService,
    private classService: ClassService,
    private membershipService: MembershipService,
    private physicalClassSessionService: PhysicalClassSessionService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.status = true;
    const today = new Date();
    this.currentDate = moment(today).format("YYYY-MM-DD HH:mm");
    this.currency = constants.currency;
    this.route.params.subscribe(params => {
      this.id = params.id;
      this.pageNo = params.pageNo;
      this.searchTxt = params.searchTxt;
      this.name = params.name;
      this.profileID = params.profileID;
      this.paymentModal = params.paymentModal;
    });
    this.sessionObj = new SessionDTO();
    this.searchSessionForm = this.formBuilder.group({
      search: [""]
    });
    this.notifier = notifierService;
    this.rescheduleForm = this.formBuilder.group({
      time: [""]
    });
    this.moreInfoForm = this.formBuilder.group({
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
    if (this.pageNo === undefined && this.searchTxt === undefined) {
      this.pageNo = 0;
      this.getDefaultSessionList(this.id, this.size, this.pageNo, this.pageNo);
    } else if (this.pageNo !== "undefined" && this.searchTxt === "undefined") {
      this.getDefaultSessionList(this.id, this.size, this.pageNo, this.pageNo);
    } else if (this.pageNo !== "undefined" && this.searchTxt !== "undefined") {
      this.searchSessionForm.controls.search.setValue(this.searchTxt);
      this.defaultSearchSession(
        this.searchTxt,
        this.size,
        this.pageNo,
        this.pageNo
      );
    }
  }

  openRescheduleModal(row) {
    this.sessionId = row.sessionId;
    const scheduleDateTime = moment(
      row.dateTime,
      moment.defaultFormat
    ).toDate();
    this.bsInlineValue = scheduleDateTime;
    this.rescheduleForm.controls.time.setValue(scheduleDateTime);
    this.RescheduleModal.show();
  }
  changeStatus(val) {
    this.totalElement = 0;
    this.returnedArray.length = 0;
    this.status = val;
    this.getSessionList(this.id, this.size, this.page);
  }

  editPageRout(profileId, Id, name, sessionId, paymentModal, changePage) {
    if (this.searchSessionForm.controls.search.value.trim() === "") {
      this.router.navigate([
        "/update-physical-class-session/" +
          profileId +
          "/" +
          Id +
          "/" +
          name +
          "/" +
          sessionId +
          "/" +
          paymentModal +
          "/" +
          changePage
      ]);
    } else {
      this.router.navigate([
        "/update-physical-class-session/" +
          profileId +
          "/" +
          Id +
          "/" +
          name +
          "/" +
          sessionId +
          "/" +
          paymentModal +
          "/" +
          changePage +
          "/" +
          this.searchSessionForm.controls.search.value.trim()
      ]);
    }
  }

  clear() {
    this.totalElement = 0;
    this.returnedArray.length = 0;
    this.currentPage = 1;
    this.getSessionList(this.id, this.size, this.page);
  }
  filterSession() {
    this.currentPage = 1;
    this.totalElement = 0;
    this.returnedArray.length = 0;
    this.searchSession(this.size, this.page);
  }
  defaultSearchSession(searchTxt, size, page, currentPage) {
    const req = {
      text: searchTxt,
      classId: this.id
    };
    this.physicalClassSessionService
      .searchPhysicalSession(req, size, page)
      .subscribe(
        res => {
          if (res.success) {
            this.totalElement = res.body.totalElements;
            this.returnedArray = res.body.content;
            this.currentPage = Number(currentPage) + 1;
          } else {
            this.notifier.notify("danger", res.message);
          }
        },
        error1 => {
          this.notifier.notify("danger", "Can't Process This Request");
        }
      );
  }
  searchSession(size, page) {
    const filter = this.searchSessionForm.controls.search.value.trim();
    if (filter !== "") {
      const req = {
        text: filter,
        classId: this.id
      };
      this.physicalClassSessionService
        .searchPhysicalSession(req, size, page)
        .subscribe(
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
      this.getSessionList(this.id, this.size, this.page);
    }
  }

  eventHandler(event) {
    return false;
    if (event.code === "Backspace" || event.code === "Delete") {
      return false;
    }
  }

  getValue(value) {
    this.reDate = value;
  }

  setDateZero(date) {
    return date < 10 ? "0" + date : date;
  }
  returnAge(age) {
    if (age === 0) {
      return "";
    } else {
      return age;
    }
  }
  getDefaultSessionList(id, size, page, currentPage) {
    let state;
    if (this.status === true) {
      state = "UPCOMING";
    } else {
      state = "PAST";
    }
    this.physicalClassSessionService
      .getPhysicalSessionByClassId(id, size, page, state)
      .subscribe(
        res => {
          if (res.success) {
            this.totalElement = res.body.totalElements;
            this.returnedArray = res.body.content;
            this.currentPage = Number(currentPage) + 1;
          } else {
            this.notifier.notify("danger", res.message);
          }
        },
        error1 => {
          this.notifier.notify("danger", "Can't Process This Request");
        }
      );
  }
  getSessionList(id, size, page) {
    let state;
    if (this.status === true) {
      state = "UPCOMING";
    } else {
      state = "PAST";
    }
    this.physicalClassSessionService
      .getPhysicalSessionByClassId(id, size, page, state)
      .subscribe(
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
  }
  openMoreInfoModel(row) {
    this.moreInfoModal.show();
    this.sessionTotalElement = 0;
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
      this.moreInfoForm.controls.addressLine2.setValue("");
      this.moreInfoForm.controls.addressLine1.setValue("");
      this.moreInfoForm.controls.city.setValue("");
      this.moreInfoForm.controls.branchName.setValue("");
      this.moreInfoForm.controls.postalCode.setValue("");
      this.moreInfoForm.controls.province.setValue("");
      this.moreInfoForm.controls.country.setValue("");
      this.disable = true;
    } else if (
      row.location.addressLine2 === "" ||
      row.location.addressLine2 === null
    ) {
      this.disable = false;
      this.latitude = row.location.latitude;
      this.longitude = row.location.longitude;
      this.moreInfoForm.controls.addressLine2.setValue("");
      this.moreInfoForm.controls.addressLine1.setValue(
        row.location.addressLine1
      );
      this.moreInfoForm.controls.city.setValue(row.location.city);
      this.moreInfoForm.controls.branchName.setValue(row.location.name);
      this.moreInfoForm.controls.postalCode.setValue(row.location.postalCode);
      this.moreInfoForm.controls.province.setValue(row.location.province);
      this.moreInfoForm.controls.country.setValue(row.location.country);
    } else {
      this.disable = false;
      this.moreInfoForm.controls.addressLine1.setValue(
        row.location.addressLine1
      );
      this.moreInfoForm.controls.addressLine2.setValue(
        row.location.addressLine2
      );
      this.moreInfoForm.controls.city.setValue(row.location.city);
      this.moreInfoForm.controls.branchName.setValue(row.location.name);
      this.moreInfoForm.controls.postalCode.setValue(row.location.postalCode);
      this.moreInfoForm.controls.province.setValue(row.location.province);
      this.moreInfoForm.controls.country.setValue(row.location.country);
      this.latitude = row.location.latitude;
      this.longitude = row.location.longitude;
    }

    this.moreInfoForm.controls.paymentStatus.setValue(this.paymentStatus);
    this.moreInfoForm.controls.session.setValue(row.sessionName);
    this.moreInfoForm.controls.class.setValue(row.className);
    this.moreInfoForm.controls.studio.setValue(row.businessProfileName);
    this.moreInfoForm.controls.trainer.setValue(row.trainerName);
    this.moreInfoForm.controls.dateTime.setValue(
      this.returnDateTime(row.dateTime)
    );
    this.moreInfoForm.controls.gender.setValue(row.gender);
    this.moreInfoForm.controls.maxJoiner.setValue(row.maxJoiners);
    this.moreInfoForm.controls.duration.setValue(row.duration);
    this.moreInfoForm.controls.language.setValue(row.language);
    this.moreInfoForm.controls.enrollment.setValue(row.numberOfEnrollments);
    this.moreInfoForm.controls.description.setValue(row.description);
    this.moreInfoForm.controls.sessionFee.setValue(row.price);
    this.getSessionEnrollments(this.sessionPage);
    document
      .getElementById("profileImage")
      .setAttribute("src", row.classProfileImage);
  }

  viewLocation() {
    window.open(
      "https://maps.google.com/?q=" + this.latitude + "," + this.longitude,
      "_blank"
    );
  }

  returnDateTime(dateTime) {
    const timeConvert = moment(dateTime).format("YYYY-MM-DD HH:mm");
    return timeConvert;
  }
  returnEndTime(dateTime, duration) {
    const timeConvert = moment(dateTime)
      .add(duration, "minute")
      .format("YYYY-MM-DD HH:mm");
    return timeConvert;
  }

  numberOnly(event): boolean {
    const charCode = event.which ? event.which : event.keyCode;
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
      return false;
    }
    return true;
  }

  rescheduleSession() {
    if (
      this.rescheduleForm.controls.time.value !== null ||
      this.rescheduleForm.controls.time.value !== ""
    ) {
      const currentDateTime = moment(this.maxDate).format("YYYY-MM-DD HH:mm");
      const newDate = moment(this.reDate).format("YYYY-MM-DD");
      const newTime = moment(this.rescheduleForm.controls.time.value).format(
        "HH:mm"
      );
      const rescheduleDateTime = newDate + " " + newTime;
      if (rescheduleDateTime < currentDateTime) {
        this.notifier.notify(
          "danger",
          "Reschedule Date & Time must be greater than or Equal the Current Date & Time "
        );
      } else {
        const istFormat = moment(
          rescheduleDateTime,
          moment.defaultFormat
        ).toDate();
        const utcFormat = moment.utc(istFormat).format();
        document
          .getElementById("rescheduleBtn")
          .setAttribute("disabled", "true");
        this.physicalClassSessionService
          .rescheduleSession(this.sessionId, utcFormat)
          .subscribe(
            res => {
              if (res.success) {
                this.notifier.notify(
                  "success",
                  "This session has been Rescheduled..!"
                );
                this.RescheduleModal.hide();
                if (
                  this.searchSessionForm.controls.search.value.trim() === ""
                ) {
                  this.getDefaultSessionList(
                    this.id,
                    this.size,
                    this.changePage,
                    this.changePage
                  );
                } else {
                  this.defaultSearchSession(
                    this.searchSessionForm.controls.search.value.trim(),
                    this.size,
                    this.changePage,
                    this.changePage
                  );
                }
                document
                  .getElementById("rescheduleBtn")
                  .removeAttribute("disabled");
              } else {
                if (
                  this.searchSessionForm.controls.search.value.trim() === ""
                ) {
                  this.getDefaultSessionList(
                    this.id,
                    this.size,
                    this.changePage,
                    this.changePage
                  );
                } else {
                  this.defaultSearchSession(
                    this.searchSessionForm.controls.search.value.trim(),
                    this.size,
                    this.changePage,
                    this.changePage
                  );
                }
                this.notifier.notify("danger", res.message);
                document
                  .getElementById("rescheduleBtn")
                  .removeAttribute("disabled");
              }
            },
            error1 => {
              this.notifier.notify("danger", "Can't Process This Request");
              document
                .getElementById("rescheduleBtn")
                .removeAttribute("disabled");
            }
          );
      }
    } else {
      this.notifier.notify("danger", "Please select correct time..!");
    }
  }
  getSessionEnrollments(page) {
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
  sessionEnrollmentPageChanged(event: PageChangedEvent): void {
    this.sessionPage = event.page - 1;
    this.getSessionEnrollments(this.sessionPage);
  }
  pageChanged(event: PageChangedEvent): void {
    const page = event.page - 1;
    this.changePage = page;
    if (this.searchSessionForm.controls.search.value.trim() !== "") {
      this.searchSession(this.size, page);
    } else {
      this.getSessionList(this.id, this.size, page);
    }
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
                    this.getSessionEnrollments(this.sessionPage);
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
                    this.getSessionEnrollments(this.sessionPage);
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

  cancelSession(Obj) {
    swal
      .fire({
        title: "Are you sure?",
        text: "Do you want to cancel this session ?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Yes",
        cancelButtonText: "No"
      })
      .then(result => {
        if (result.value) {
          this.physicalClassSessionService
            .cancelSession(Obj.sessionId)
            .subscribe(
              res => {
                if (res.success) {
                  this.notifier.notify(
                    "success",
                    "This session has been cancelled..!"
                  );
                  if (
                    this.searchSessionForm.controls.search.value.trim() === ""
                  ) {
                    this.getDefaultSessionList(
                      this.id,
                      this.size,
                      this.changePage,
                      this.changePage
                    );
                  } else {
                    this.defaultSearchSession(
                      this.searchSessionForm.controls.search.value.trim(),
                      this.size,
                      this.changePage,
                      this.changePage
                    );
                  }
                } else if (res.success === false) {
                  this.notifier.notify("danger", res.message);
                  if (
                    this.searchSessionForm.controls.search.value.trim() === ""
                  ) {
                    this.getDefaultSessionList(
                      this.id,
                      this.size,
                      this.changePage,
                      this.changePage
                    );
                  } else {
                    this.defaultSearchSession(
                      this.searchSessionForm.controls.search.value.trim(),
                      this.size,
                      this.changePage,
                      this.changePage
                    );
                  }
                }
              },
              error1 => {
                this.notifier.notify("danger", "Can't Process This Request");
              }
            );
        } else if (result.dismiss === swal.DismissReason.cancel) {
          swal.close();
        }
      });
  }
}
