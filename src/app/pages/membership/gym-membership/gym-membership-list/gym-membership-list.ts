import { Component, ViewChild } from "@angular/core";
import { FormBuilder, FormGroup } from "@angular/forms";
import { NotifierService } from "angular-notifier";
import { ModalDirective, PageChangedEvent } from "ngx-bootstrap";
import { ActivatedRoute, Router } from "@angular/router";
import * as moment from "moment";
import { ProfileService } from "../../../../core/services/profile-service/profile.service";
import { ClassService } from "../../../../core/services/class-service/class.service";
import { GymService } from "../../../../core/services/gym-service/gym-service";
import { constants } from "../../../../shared/constant/constant";
import { PhysicalClassSerivce } from "../../../../core/services/class-service/physical-classs-service/physical-class.serivce";
import { MembershipService } from "../../../../core/services/membership-service/membership-service";
import * as $ from "jquery";
import { GymMembershipService } from "../../../../core/services/membership-service/gym-membership-service";
import { UtilService } from "../../../../core/services/util-service/util.service";
import swal from "sweetalert2";

@Component({
  selector: "gym-membership-list",
  templateUrl: "./gym-membership-list.html"
})
export class GymMembershipList {
  isLoading = false;
  private readonly notifier: NotifierService;
  size = 10;
  page = 0;
  trainerPage = 0;
  ratingPage = 0;
  sessionPage = 0;
  totalElement: number;
  classID: number;
  changePage = 0;
  searchClassForm: FormGroup;
  returnedArray: Array<any> = [];
  profiles: Array<any> = [];
  imageDetailsArray: Array<any> = [];
  filterClassForm: FormGroup;
  moreInfoForm: FormGroup;

  @ViewChild("moreInfoModal", { static: false })
  public moreInfoModal: ModalDirective;

  businessProfile: string;
  category: string;
  trainer: Array<any> = [];
  prepare: any;
  id: any;
  membershipId: any;
  profileId: any;
  description: string;
  currency: string;
  userRole: string;

  rotate = true;
  first: "First";
  last: "List";
  public numPages = 1;
  trainerReturnedArray: Array<any> = [];
  trainerList: Array<any> = [];
  trainerTotalElement: number;

  sessionListReturnArray: Array<any> = [];
  sessionTotalElement: number;
  userReturnArray: Array<any> = [];
  totalUsers: number;
  ratingListReturnArray: Array<any> = [];
  ratingTotalElement: number;

  public constructor(
    private formBuilder: FormBuilder,
    private profileService: ProfileService,
    private notifierService: NotifierService,
    private classService: ClassService,
    private physicalClassSerivce: PhysicalClassSerivce,
    private membershipService: MembershipService,
    private utilService: UtilService,
    private gymMembershipService: GymMembershipService,
    private gymService: GymService,
    private activatedRoute: ActivatedRoute,
    private router: Router
  ) {
    this.currency = constants.currency;
    this.activatedRoute.params.subscribe(params => {
      this.id = params.id;
    });
    this.moreInfoForm = this.formBuilder.group({
      name: [""],
      studio: [""],
      packageDescription: [""]
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
  clear() {
    this.totalElement = 0;
    this.returnedArray.length = 0;
    this.getGymList(this.size, this.page);
  }
  changeBusinessProfile() {
    this.businessProfile = $("#businessProfile option:selected").text();
    this.profileId = this.filterClassForm.controls.businessProfile.value;
  }

  filterClass() {
    this.totalElement = 0;
    this.returnedArray.length = 0;
    this.searchMembership(this.size, this.page);
  }
  returnAge(val) {
    if (val === 0) {
      return "-";
    } else {
      return val;
    }
  }
  searchMembership(size, page) {
    const filter = this.searchClassForm.controls.search.value.trim();
    const profileId = this.filterClassForm.controls.businessProfile.value;
    if (filter !== "") {
      const req = {
        text: filter
      };
      this.gymMembershipService
        .searchMembership(req, profileId, size, page)
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
      this.getGymList(this.size, this.page);
    }
  }

  createProfileRoute() {
    const profileId = this.filterClassForm.controls.businessProfile.value;
    this.router.navigate(["/create-gym/" + profileId]);
  }

  filterGymList(size, page) {
    this.totalElement = 0;
    this.returnedArray.length = 0;
    this.getGymList(size, page);
  }

  getGymList(size, page) {
    const profileId = this.filterClassForm.controls.businessProfile.value;
    this.profileId = profileId;
    this.isLoading = true;
    this.gymMembershipService
      .getMembershipByBusinessProfile(profileId, size, page)
      .subscribe(
        res => {
          this.isLoading = false;
          if (res.success) {
            this.totalElement = res.body.totalElements;
            this.returnedArray = res.body.content;
            this.businessProfile = $("#businessProfile option:selected").text();
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

  getBusinessProfileList() {
    this.profileService.getProfileNameList().subscribe(
      res => {
        if (res.success === true) {
          this.profiles = res.body;
          this.filterClassForm.controls.businessProfile.setValue(
            this.profiles[0].id
          );
          this.defaultLoadGymList(this.profiles[0].id, this.size, this.page);
        } else {
          this.notifier.notify("danger", res.message);
        }
      },
      error1 => {
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
            this.defaultLoadGymList(this.profiles[0].id, this.size, this.page);
            this.filterClassForm.controls.businessProfile.setValue(
              this.profiles[0].id
            );
            this.profileId = this.profiles[0].id;
          } else {
            this.profileId = this.id;
            this.filterClassForm.controls.businessProfile.setValue(this.id);
            this.defaultLoadGymList(this.id, this.size, this.page);
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
  viewMoreInfo(val) {
    this.totalUsers = 0;
    this.userReturnArray.length = 0;
    this.moreInfoModal.show();
    this.membershipId = val.membershipId;
    this.moreInfoForm.controls.name.setValue(val.name);
    this.moreInfoForm.controls.studio.setValue(val.location.name);
    this.moreInfoForm.controls.packageDescription.setValue(val.description);
    this.getEnrolledUsers(val.membershipId, 5, 0);
  }
  getEnrolledUsers(id, size, page) {
    this.membershipService.getEnrolledUsers(id, size, page).subscribe(
      res => {
        if (res.success) {
          this.totalUsers = res.body.totalElements;
          this.userReturnArray = res.body.content;
        } else {
          this.notifier.notify("danger", res.message);
        }
      },
      error1 => {
        this.notifier.notify("danger", "Can't Process This Request");
      }
    );
  }
  defaultLoadGymList(profileId, size, page) {
    this.gymMembershipService
      .getMembershipByBusinessProfile(profileId, size, page)
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
  deactivateMembership(val) {
    swal
      .fire({
        title: "Are you sure?",
        text: "Are you sure you want to deactivate this package ?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Yes",
        cancelButtonText: "No"
      })
      .then(result => {
        if (result.value) {
          this.utilService.deactivatePackage(val).subscribe(
            res => {
              if (res.success) {
                this.notifier.notify(
                  "success",
                  "This Package has been successfully deactivated..!"
                );
                this.getGymList(this.size, this.changePage);
              } else {
                this.notifier.notify("warning", res.message);
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
  activeMembership(val) {
    swal
      .fire({
        title: "Are you sure?",
        text: "Are you sure you want to activate this package ?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Yes",
        cancelButtonText: "No"
      })
      .then(result => {
        if (result.value) {
          this.utilService.activePackage(val).subscribe(
            res => {
              if (res.success) {
                this.notifier.notify(
                  "success",
                  "This Package has been successfully activated..!"
                );
                this.getGymList(this.size, this.changePage);
              } else {
                this.notifier.notify("warning", res.message);
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
  sessionPageChanged(event: PageChangedEvent): void {
    this.sessionPage = event.page - 1;
    // this.getSessionList(this.sessionPage);
  }

  ratingPageChanged(event: PageChangedEvent): void {
    this.ratingPage = event.page - 1;
    this.getRatingForClass(this.ratingPage);
  }

  pageChanged(event: PageChangedEvent): void {
    const page = event.page - 1;
    this.changePage = page;
    if (this.searchClassForm.controls.search.value.trim() !== "") {
      this.searchMembership(this.size, page);
    } else {
      this.getGymList(this.size, page);
    }
  }

  trainerChanged(event: PageChangedEvent): void {
    const startItem = (event.page - 1) * event.itemsPerPage;
    const endItem = event.page * event.itemsPerPage;
    this.trainerReturnedArray = this.trainerList.slice(startItem, endItem);
  }
  // getSessionList(page) {
  //   this.classService.getSessionByClassID(this.classID, 5, page).subscribe(
  //     res => {
  //       if (res.success === true) {
  //         this.sessionTotalElement = res.body.totalElements;
  //         this.sessionListReturnArray = res.body.content;
  //       } else {
  //         this.notifier.notify("danger", res.message);
  //       }
  //     },
  //     error1 => {
  //       this.notifier.notify("danger", "Can't Process This Request");
  //     }
  //   );
  // }
  getRatingForClass(page) {
    this.classService.getRatingForClasses(this.classID, 5, page).subscribe(
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
  userChangedPage(event: PageChangedEvent): void {
    const page = event.page - 1;
    this.getEnrolledUsers(this.membershipId, 5, page);
  }
}
