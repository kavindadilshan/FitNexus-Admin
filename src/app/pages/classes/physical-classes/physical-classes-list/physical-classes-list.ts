import { Component, ContentChild, ElementRef, ViewChild } from "@angular/core";
import { FormBuilder, FormGroup } from "@angular/forms";
import { NotifierService } from "angular-notifier";
import { ModalDirective, PageChangedEvent } from "ngx-bootstrap";
import { ActivatedRoute, Router } from "@angular/router";
import * as moment from "moment";
import { constants } from "../../../../shared/constant/constant";
import { ProfileService } from "../../../../core/services/profile-service/profile.service";
import { ClassService } from "../../../../core/services/class-service/class.service";
import { PhysicalClassSerivce } from "../../../../core/services/class-service/physical-classs-service/physical-class.serivce";
import * as $ from "jquery";
import { MembershipService } from "../../../../core/services/membership-service/membership-service";
import { CoachProfileService } from "../../../../core/services/profile-service/coach-profile.service";
import { Observable } from "rxjs";
import swal from "sweetalert2";

@Component({
  selector: "Physical-class-list",
  templateUrl: "./physical-classes-list.html"
})
export class PhysicalClassesList {
  public constructor(
    private formBuilder: FormBuilder,
    private profileService: ProfileService,
    private notifierService: NotifierService,
    private physicalClassSerivce: PhysicalClassSerivce,
    private membershipService: MembershipService,
    private coachProfileService: CoachProfileService,
    private classService: ClassService,
    private activatedRoute: ActivatedRoute,
    private router: Router
  ) {
    this.currency = constants.currency;
    this.activatedRoute.params.subscribe(params => {
      this.id = params.id;
    });
    this.moreInfoForm = this.formBuilder.group({
      name: [""],
      studioProfile: [""],
      description: [""],
      prepare: [""],
      category: [""],
      type: [""],
      firstSession: [""],
      calorie: [""],
      videoURl: [""]
    });
    this.searchClassForm = this.formBuilder.group({
      search: [""]
    });
    this.userRole = localStorage.getItem(constants.user_role);
    this.filterClassForm = this.formBuilder.group({
      businessProfile: [""]
    });
    this.notifier = notifierService;
    this.getBusinessProfileName();
  }
  isLoading = false;
  isStatus = false;
  changePage = 0;
  private readonly notifier: NotifierService;
  size = 10;
  page = 0;
  trainerPage = 0;
  ratingPage = 0;
  sessionPage = 0;
  totalElement: number;
  classID: number;
  searchClassForm: FormGroup;
  returnedArray: Array<any> = [];
  profiles: Array<any> = [];
  imageDetailsArray: Array<any> = [];
  @ViewChild("moreInfoModal", { static: false })
  public moreInfoModal: ModalDirective;
  filterClassForm: FormGroup;
  moreInfoForm: FormGroup;

  businessProfile: string;
  category: string;
  trainer: Array<any> = [];
  prepare: any;
  id: any;
  classId: any;
  name: any;
  description: string;
  userRole: string;
  currency: string;

  membershipTotalElement = 0;
  membershipReturnedArray: Array<any> = [];

  @ContentChild("profileName", { static: false }) messageRef: ElementRef;
  profileName: string;

  rotate = true;
  first: "First";
  last: "List";
  public numPages = 1;
  trainerReturnedArray: Array<any> = [];
  trainerList: Array<any> = [];
  trainerTotalElement: number;

  sessionListReturnArray: Array<any> = [];
  sessionTotalElement = 0;
  ratingListReturnArray: Array<any> = [];
  ratingTotalElement = 0;

  /**
   * Change Classes Status
   */
  OnBeforeChange: Observable<boolean> = new Observable(observer => {
    if (this.isStatus === true) {
      swal
        .fire({
          title: "Are you sure?",
          text: "Are you sure you want to change class visibility ?",
          icon: "warning",
          showCancelButton: true,
          confirmButtonText: "Yes",
          cancelButtonText: "No"
        })
        .then(result => {
          if (result.value) {
            this.physicalClassSerivce
              .changeClassStatus(false, this.classId)
              .subscribe(
                res => {
                  if (res.success) {
                    this.notifier.notify(
                      "success",
                      "Classes Visibility has been successfully changed..!"
                    );
                    this.getClassList(10, this.changePage);
                  } else {
                    this.notifier.notify("warning", res.message);
                  }
                },
                error1 => {
                  this.notifier.notify("danger", "Can't Process This Request");
                }
              );
            return observer.next(true);
          } else if (result.dismiss === swal.DismissReason.cancel) {
            swal.close();
            return observer.next(false);
          }
        });
    } else if (this.isStatus === false) {
      swal
        .fire({
          title: "Are you sure?",
          text: "Are you sure you want to change class visibility ?",
          icon: "warning",
          showCancelButton: true,
          confirmButtonText: "Yes",
          cancelButtonText: "No"
        })
        .then(result => {
          if (result.value) {
            this.physicalClassSerivce
              .changeClassStatus(true, this.classId)
              .subscribe(
                res => {
                  if (res.success) {
                    this.notifier.notify(
                      "success",
                      "Class Visibility has been successfully changed..!"
                    );
                    this.getClassList(10, this.changePage);
                  } else {
                    this.notifier.notify("warning", res.message);
                  }
                },
                error1 => {
                  this.notifier.notify("danger", "Can't Process This Request");
                }
              );
            return observer.next(true);
          } else if (result.dismiss === swal.DismissReason.cancel) {
            swal.close();
            return observer.next(false);
          }
        });
    }
  });

  getId(val, status) {
    this.classId = val;
    this.isStatus = status;
  }
  clear() {
    this.totalElement = 0;
    this.returnedArray.length = 0;
    this.getClassList(this.size, this.page);
  }
  searchClass(size, page) {
    const filter = this.searchClassForm.controls.search.value.trim();
    if (filter !== "") {
      const req = {
        text: filter,
        businessProfileId: this.filterClassForm.controls.businessProfile.value
      };
      this.physicalClassSerivce.searchPhysicalClass(req, size, page).subscribe(
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
      this.getClassList(this.size, this.page);
    }
  }
  createProfileRoute() {
    if (this.businessProfile === undefined) {
      this.notifier.notify("warning", "Fetching data..Please wait");
    } else {
      this.businessProfile = $("#businessProfile option:selected").text();
      this.coachProfileService
        .getTrainersByProfileId(
          this.filterClassForm.controls.businessProfile.value
        )
        .subscribe(
          res => {
            if (res.success === true) {
              if (res.body.length === 0) {
                this.notifier.notify(
                  "warning",
                  "Please create a trainer first"
                );
              } else {
                this.router.navigate([
                  "/create-physical-class/" +
                    this.filterClassForm.controls.businessProfile.value +
                    "/" +
                    this.businessProfile
                ]);
              }
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
  filterClassList(size, page) {
    this.totalElement = 0;
    this.returnedArray.length = 0;
    this.businessProfile = $("#businessProfile option:selected").text();
    this.getClassList(size, page);
  }
  getClassList(size, page) {
    const profileId = this.filterClassForm.controls.businessProfile.value;
    this.isLoading = true;
    this.physicalClassSerivce
      .getPhysicalClassByBusinessProfile(profileId, size, page)
      .subscribe(
        res => {
          this.isLoading = false;
          if (res.success) {
            this.totalElement = res.body.totalElements;
            this.returnedArray = res.body.content;
          } else {
            this.notifier.notify("danger", res.message);
          }
        },
        error1 => {
          this.isLoading = false;
          this.notifier.notify("danger", "Can't Process This Request");
        }
      );
  }

  getBusinessProfileName() {
    this.profileService.getProfileNameList().subscribe(
      res => {
        if (res.success === true) {
          this.profiles = res.body;
          if (this.id === undefined) {
            this.defaultLoadClassList(
              this.profiles[0].id,
              this.size,
              this.page
            );
          } else {
            this.filterClassForm.controls.businessProfile.setValue(this.id);
            this.defaultLoadClassList(this.id, this.size, this.page);
          }
          this.businessProfile = this.profiles[0].name;
        } else {
          this.notifier.notify("danger", res.message);
        }
      },
      error1 => {
        this.notifier.notify("danger", "Can't Process This Request");
      }
    );
  }

  defaultLoadClassList(profileId, size, page) {
    // console.log($("#businessProfile").);
    this.filterClassForm.controls.businessProfile.setValue(profileId);
    this.physicalClassSerivce
      .getPhysicalClassByBusinessProfile(profileId, size, page)
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
  sessionPageChanged(event: PageChangedEvent): void {
    this.sessionPage = event.page - 1;
    this.getSessionList(this.sessionPage);
  }

  ratingPageChanged(event: PageChangedEvent): void {
    this.ratingPage = event.page - 1;
    this.getRatingForClass(this.ratingPage);
  }

  pageChanged(event: PageChangedEvent): void {
    const page = event.page - 1;
    this.changePage = page;
    if (this.searchClassForm.controls.search.value.trim() !== "") {
      this.searchClass(this.size, page);
    } else {
      this.getClassList(this.size, page);
    }
  }

  trainerChanged(event: PageChangedEvent): void {
    const startItem = (event.page - 1) * event.itemsPerPage;
    const endItem = event.page * event.itemsPerPage;
    this.trainerReturnedArray = this.trainerList.slice(startItem, endItem);
  }

  openMoreInfoModel(row) {
    this.trainerReturnedArray.length = 0;
    this.trainerList.length = 0;
    this.trainerTotalElement = 0;
    this.classID = row.classId;
    if (row.firstSessionFree === true) {
      this.moreInfoForm.controls.firstSession.setValue("Yes");
    } else {
      this.moreInfoForm.controls.firstSession.setValue("No");
    }
    this.moreInfoForm.controls.name.setValue(row.name);
    this.moreInfoForm.controls.studioProfile.setValue(row.businessProfileName);
    this.moreInfoForm.controls.description.setValue(row.description);
    this.moreInfoForm.controls.prepare.setValue(row.howToPrepare);
    this.moreInfoForm.controls.category.setValue(row.category);
    this.moreInfoForm.controls.type.setValue(row.classTypeName);
    this.moreInfoForm.controls.calorie.setValue(row.calorieBurnOut);
    this.moreInfoForm.controls.videoURl.setValue(row.youtubeUrl);
    document
      .getElementById("profileImage")
      .setAttribute("src", row.profileImage);
    this.imageDetailsArray = row.images;
    this.trainerList = row.trainerDetails;
    this.trainerReturnedArray = this.trainerList.slice(0, 5);
    this.sessionTotalElement = 0;
    this.sessionListReturnArray.length = 0;
    this.getSessionList(this.sessionPage);
    this.ratingTotalElement = 0;
    this.ratingListReturnArray.length = 0;
    this.getRatingForClass(this.ratingPage);
    this.getMembershipList(this.classID, 5, this.page);
    this.moreInfoModal.show();
  }
  getMembershipList(classId, size, page) {
    this.membershipService
      .getMembershipByClassId(classId, size, page)
      .subscribe(
        res => {
          if (res.success) {
            this.membershipTotalElement = res.body.totalElements;
            this.membershipReturnedArray = res.body.content;
          } else {
            this.notifier.notify("danger", res.message);
          }
        },
        error1 => {
          this.notifier.notify("danger", "Can't Process This Request");
        }
      );
  }
  membershipPageChanged(event: PageChangedEvent): void {
    const page = event.page - 1;
    this.getMembershipList(this.classID, 5, page);
  }
  getSessionList(page) {
    this.physicalClassSerivce
      .getPhysicalSessionByClassID(this.classID, 5, page)
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

  getRatingForClass(page) {
    this.physicalClassSerivce
      .getRatingForPhysicalClasses(this.classID, 5, page)
      .subscribe(
        res => {
          if (res.success === true) {
            this.ratingTotalElement = res.body.totalElements;
            this.ratingListReturnArray = res.body.content;
          } else {
            this.notifier.notify("danger", res.message);
          }
        },
        error1 => {
          this.notifier.notify("danger", "Can't Process This Request");
        }
      );
  }

  returnDateTime(dateTime) {
    const timeConvert = moment(dateTime).format("YYYY-MM-DD HH:mm");
    return timeConvert;
  }

  loop(row) {
    let str1 = new String("");
    row.forEach(e => {
      str1 = new String(str1.concat(new String(e.name + " , ").toString()));
    });

    return (str1 = str1.replace(/,\s*$/, ""));
  }
}
