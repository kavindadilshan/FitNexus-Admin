import { Component, ViewChild } from "@angular/core";
import { FormBuilder, FormGroup } from "@angular/forms";
import { ProfileService } from "../../../core/services/profile-service/profile.service";
import { NotifierService } from "angular-notifier";
import { ClassService } from "../../../core/services/class-service/class.service";
import { ModalDirective, PageChangedEvent } from "ngx-bootstrap";
import { constants } from "../../../shared/constant/constant";
import { ActivatedRoute, Router } from "@angular/router";
import * as moment from "moment";
import { GymService } from "../../../core/services/gym-service/gym-service";
import * as $ from "jquery";
import { UtilService } from "../../../core/services/util-service/util.service";

@Component({
  selector: "gym-list",
  templateUrl: "./gym-list.html"
})
export class GymList {
  isLoading = false;
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
  weekDaysClosingHour: any;
  weekDaysOpeningHour: any;
  saturdayOpeningHour: any;
  saturdayClosingHour: any;
  sundayOpeningHour: any;
  sundayClosingHour: any;
  weekEndOpeningHour: any;
  weekEndClosingHour: any;
  latitude: any;
  longitude: any;
  userRole: string;

  rotate = true;
  first: "First";
  last: "List";
  public numPages = 1;
  public secondNumPages = 1;
  trainerReturnedArray: Array<any> = [];
  facilitiesReturnedArray: Array<any> = [];
  trainerList: Array<any> = [];
  facilitiesList: Array<any> = [];
  trainerTotalElement: number;

  sessionListReturnArray: Array<any> = [];
  sessionTotalElement: number;
  ratingListReturnArray: Array<any> = [];
  ratingTotalElement: number;

  public constructor(
    private formBuilder: FormBuilder,
    private profileService: ProfileService,
    private notifierService: NotifierService,
    private utilService: UtilService,
    private classService: ClassService,
    private gymService: GymService,
    private activatedRoute: ActivatedRoute,
    private router: Router
  ) {
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
      branchName: [""],
      addressLine1: [""],
      addressLine2: [""],
      city: [""],
      province: [""],
      postalCode: [""],
      country: [""],
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
  clear() {
    this.totalElement = 0;
    this.returnedArray.length = 0;
    this.getClassList(this.size, this.page);
  }

  filterClass() {
    this.totalElement = 0;
    this.returnedArray.length = 0;
    this.searchClass(this.size, this.page);
  }

  searchClass(size, page) {
    const filter = this.searchClassForm.controls.search.value.trim();
    const profileId = this.filterClassForm.controls.businessProfile.value;
    if (filter !== "") {
      const req = {
        text: filter
      };
      this.gymService.searchByProfileId(req, profileId, size, page).subscribe(
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
    const profileId = this.filterClassForm.controls.businessProfile.value;
    if (this.businessProfile === undefined) {
      this.notifier.notify("warning", "Fetching data..Please wait");
    } else {
      this.utilService.getNewLocationByBusinessProfileID(profileId).subscribe(
        res => {
          if (res.success === true) {
            if (res.body.length !== 0) {
              this.businessProfile = $(
                "#businessProfile option:selected"
              ).text();
              this.router.navigate([
                "/create-gym/" + profileId + "/" + this.businessProfile
              ]);
            } else {
              this.notifier.notify(
                "warning",
                "There is no available locations to assign new gym under this business profile." +
                  " Please create new location and create again."
              );
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

  filterGymList(size, page) {
    this.totalElement = 0;
    this.returnedArray.length = 0;
    this.getClassList(size, page);
  }

  getClassList(size, page) {
    const profileId = this.filterClassForm.controls.businessProfile.value;
    this.isLoading = true;
    this.businessProfile = $("#businessProfile option:selected").text();
    this.gymService.getGymsByProfileId(profileId, size, page).subscribe(
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
  viewLocation() {
    window.open(
      "https://maps.google.com/?q=" + this.latitude + "," + this.longitude,
      "_blank"
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
          this.defaultLoadClassList(this.profiles[0].id, this.size, this.page);
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
            this.defaultLoadClassList(
              this.profiles[0].id,
              this.size,
              this.page
            );
            this.filterClassForm.controls.businessProfile.setValue(
              this.profiles[0].id
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
    this.gymService.getGymsByProfileId(profileId, size, page).subscribe(
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
    // this.getSessionList(this.sessionPage);
  }

  ratingPageChanged(event: PageChangedEvent): void {
    this.ratingPage = event.page - 1;
    this.getRatingForClass(this.ratingPage);
  }

  pageChanged(event: PageChangedEvent): void {
    const page = event.page - 1;
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
  facilitiesChanged(event: PageChangedEvent): void {
    const startItem = (event.page - 1) * event.itemsPerPage;
    const endItem = event.page * event.itemsPerPage;
    this.facilitiesReturnedArray = this.facilitiesList.slice(
      startItem,
      endItem
    );
  }
  openMoreInfoModel(row) {
    this.trainerReturnedArray.length = 0;
    this.trainerList.length = 0;
    this.facilitiesReturnedArray.length = 0;
    this.facilitiesList.length = 0;
    this.moreInfoForm.controls.addressLine1.setValue(row.addressLine1);
    if (row.addressLine2 === "" || row.addressLine2 === null) {
      this.moreInfoForm.controls.addressLine2.setValue("");
    } else {
      this.moreInfoForm.controls.addressLine2.setValue(row.addressLine2);
    }
    this.moreInfoForm.controls.city.setValue(row.city);
    this.moreInfoForm.controls.branchName.setValue(row.gymName);
    this.moreInfoForm.controls.postalCode.setValue(row.postalCode);
    this.moreInfoForm.controls.province.setValue(row.province);
    this.moreInfoForm.controls.country.setValue(row.country);
    this.latitude = row.latitude;
    this.longitude = row.longitude;
    this.getGymDetails(row.gymId);
    if (row.openInWeekDays === true) {
      this.weekDaysOpeningHour = row.weekDaysOpeningHour;
      this.weekDaysClosingHour = row.weekDaysClosingHour;
      this.moreInfoForm.controls.category.setValue("Yes");
      document.getElementById("weekHour").removeAttribute("hidden");
    } else {
      this.moreInfoForm.controls.category.setValue("No");
      document.getElementById("weekHour").setAttribute("hidden", "true");
    }
    if (row.openInWeekEnd === true) {
      this.moreInfoForm.controls.type.setValue("Yes");
    } else {
      this.moreInfoForm.controls.type.setValue("No");
    }

    if (row.openInWeekEnd === true && row.saturdayOpeningHour !== null) {
      this.saturdayOpeningHour = row.saturdayOpeningHour;
      this.saturdayClosingHour = row.saturdayClosingHour;
      document.getElementById("saturday").removeAttribute("hidden");
    } else {
      document.getElementById("saturday").setAttribute("hidden", "true");
    }
    if (row.openInWeekEnd === true && row.sundayOpeningHour !== null) {
      this.sundayOpeningHour = row.sundayOpeningHour;
      this.sundayClosingHour = row.sundayClosingHour;
      document.getElementById("sunday").removeAttribute("hidden");
    } else {
      document.getElementById("sunday").setAttribute("hidden", "true");
    }

    if (row.closedOnSpecificDay === true) {
      this.moreInfoForm.controls.firstSession.setValue("Yes");
    } else {
      this.moreInfoForm.controls.firstSession.setValue("No");
    }
    this.moreInfoForm.controls.name.setValue(row.gymName);
    this.moreInfoForm.controls.studioProfile.setValue(row.businessProfileName);
    this.moreInfoForm.controls.description.setValue(row.description);
    this.moreInfoForm.controls.calorie.setValue(row.closedSpecificDay);
    this.moreInfoForm.controls.videoURl.setValue(row.youtubeUrl);
    document
      .getElementById("profileImage")
      .setAttribute("src", row.profileImage);
    this.imageDetailsArray = row.gymImages;
    this.moreInfoModal.show();
  }
  getGymDetails(id) {
    this.gymService.getGymDetailsById(id).subscribe(
      res => {
        if (res.success === true) {
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
}
