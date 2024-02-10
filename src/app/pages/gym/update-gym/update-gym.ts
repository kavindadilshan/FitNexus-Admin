import {
  Component,
  ElementRef,
  NgZone,
  OnDestroy,
  OnInit,
  ViewChild
} from "@angular/core";
import { NotifierService } from "angular-notifier";
import { FormBuilder, FormGroup, FormGroupDirective } from "@angular/forms";
import { TagsChangedEvent } from "ngx-tags-input";
import { ActivatedRoute, Router } from "@angular/router";
import { MapsAPILoader, MouseEvent } from "@agm/core";
import { NgxImgComponent } from "ngx-img";
import {
  CountryISO,
  SearchCountryField,
  TooltipLabel
} from "ngx-intl-tel-input";
import { WizardComponent } from "angular-archwizard";
import swal from "sweetalert2";
import * as $ from "jquery";
import { ThemeOptions } from "../../../theme-options";
import { ProfileService } from "src/app/core/services/profile-service/profile.service";
import { UtilService } from "../../../core/services/util-service/util.service";
import { GymService } from "../../../core/services/gym-service/gym-service";
import { PageChangedEvent } from "ngx-bootstrap";
import * as moment from "moment";
import { takeUntil } from "rxjs/operators";
import { ClassDTO } from "../../../shared/dto/classDTO";
import { UpdateGymService } from "./update-gym-service";
import { Subject } from "rxjs";
import { GymDTO } from "../../../shared/dto/gymDTO";
import { start } from "repl";

declare var google: any;
@Component({
  selector: "update-gym",
  templateUrl: "./update-gym.html"
})
export class UpdateGym implements OnInit, OnDestroy {
  @ViewChild("ngimg", { static: false })
  public profileImg: NgxImgComponent;
  @ViewChild("coverImg", { static: false })
  public coverImg: NgxImgComponent;
  @ViewChild("wizardComponent", { static: false })
  public wizardComponent: WizardComponent;
  isLoading = false;
  private unsubscribeAll: Subject<any>;

  private readonly notifier: NotifierService;
  base64Image: any = undefined;
  profileImage: any = undefined;
  images: Array<any> = [];
  countryList: Array<any> = [];
  languages: Array<any> = [];
  timeZone: Array<any> = [];
  days: Array<any> = [];
  locations: Array<any> = [];
  facilities: Array<any> = [];
  facilitiesArr: Array<any> = [];
  equipmentsArr: Array<any> = [];
  equipments: Array<any> = [];
  myString: any;
  characterLength: any = 0;
  packageCharacterLength: any = 0;
  keyPeople: any;
  branches: Array<any> = [];
  equipmentsReturnedArray: Array<any> = [];
  facilitiesReturnedArray: Array<any> = [];
  maxDate = new Date();
  bsValue = new Date();
  from: Date = new Date();
  to: Date = new Date();
  weekendFrom: Date = new Date();
  weekendTo: Date = new Date();
  subscribeModel: any;
  id: any;
  isValid: boolean;
  isWeekDayOpen = false;
  isWeekendOpen = false;
  isClosedSpecificDay = false;
  selectedDay = "Sunday";
  profilePic: any = undefined;
  descriptionLength: any = 0;

  payment: File;
  paymentb64: any;
  aggrement: File;
  agreementb64: any;

  latitude: number;
  longitude: number;
  zoom: number;
  address: string;

  headOfficeLatitude: number;
  headOfficeLongitude: number;
  headOfficeAddress: string;
  gymObj: GymDTO;
  rotate = true;
  first: "First";
  last: "List";
  public numPages = 1;
  public facilitiesNumPages = 1;
  profileName: string;

  isSaturadayOpen = true;
  saturday = false;
  isCheckedSaturday = false;
  isCheckedSunday = false;
  isSundayOpen = true;
  sunday = false;
  saturdayStartTime: Date = new Date();
  saturdayEndTime: Date = new Date();
  sundayStartTime: Date = new Date();
  sundayEndTime: Date = new Date();

  constructor(
    public globals: ThemeOptions,
    private formBuilder: FormBuilder,
    private router: Router,
    private notifierService: NotifierService,
    private utilService: UtilService,
    private profileService: ProfileService,
    private updateGymService: UpdateGymService,
    private gymService: GymService,
    private mapsAPILoader: MapsAPILoader,
    private ngZone: NgZone,
    private route: ActivatedRoute
  ) {
    this.unsubscribeAll = new Subject();
    this.route.params.subscribe(params => {
      this.id = params.profileId;
      this.profileName = params.profileName;
    });
    this.days = [
      { day: "Sunday" },
      { day: "Monday" },
      { day: "Tuesday" },
      { day: "Wednesday" },
      { day: "Thursday" },
      { day: "Friday" },
      { day: "Saturday" }
    ];
    this.subscribeModel = "SUBSCRIPTION_MONTHLY";
    this.notifier = notifierService;
    this.getLocations(this.id);
    this.getEquipments();
    this.getFacilites();
  }

  private geoCoder;

  @ViewChild("headOffice", { static: false })
  public headOffice: ElementRef;
  // comment
  // @ViewChild("searchBranch", { static: false })
  // public searchBranch: ElementRef;

  createProfileForm: FormGroup;
  textOption = {
    button: "Add Image"
  };
  options = {
    fileSize: 5000,
    minWidth: 800, // minimum width of image that can be uploaded (by default 0, signifies any width)
    maxWidth: 0, // maximum width of image that can be uploaded (by default 0, signifies any width)
    minHeight: 800, // minimum height of image that can be uploaded (by default 0, signifies any height)
    maxHeight: 0, // maximum height of image that can be uploaded (by default 0, signifies any height)
    fileType: ["image/jpeg", "image/png"], // mime type of files accepted
    height: "230px", // height of cropperss
    quality: 100, // quaity of image after compression
    crop: [
      // array of objects for mulitple image crop instances (by default null, signifies no cropping)
      {
        autoCropArea: 0.8, // A number between 0 and 1. Define the automatic cropping area size (percentage).
        ratio: 1, // ratio in which image needed to be cropped (by default null, signifies ratio to be free of any restrictions)
        minWidth: 800, // minimum width of image to be exported (by default 0, signifies any width)
        maxWidth: 800, // maximum width of image to be exported (by default 0, signifies any width)
        minHeight: 800, // minimum height of image to be exported (by default 0, signifies any height)
        maxHeight: 800, // maximum height of image to be exported (by default 0, signifies any height)
        width: 8, // width of image to be exported (by default 0, signifies any width)
        height: 8 // height of image to be exported (by default 0, signifies any height)
      }
    ]
  };

  onTagsChangedOutput = "";

  tags = [];
  KeyPeoples = [];

  separateDialCode = true;
  SearchCountryField = SearchCountryField;
  TooltipLabel = TooltipLabel;
  CountryISO = CountryISO;
  preferredCountries: CountryISO[] = [
    CountryISO.SriLanka,
    CountryISO.UnitedKingdom
  ];

  ngOnDestroy(): void {
    // Unsubscribe from all subscriptions
    this.unsubscribeAll.next();
    this.unsubscribeAll.complete();
  }

  changePreferredCountries() {
    this.preferredCountries = [CountryISO.India, CountryISO.Canada];
  }

  ngOnInit() {
    this.updateGymService.onGymChanged
      .pipe(takeUntil(this.unsubscribeAll))
      .subscribe(gymObj => {
        this.gymObj = new GymDTO(gymObj);
      });
    this.descriptionLength = this.gymObj.closedSpecificDay.length;
    this.createProfileForm = this.createUpdateGymForm();
  }

  createUpdateGymForm(): FormGroup {
    this.gymObj.gymImages.forEach(val => {
      const x = { img: val };
      this.images.push(x);
    });
    this.gymObj.equipmentList.forEach(val => {
      this.equipmentsArr.push(val.id);
    });
    this.gymObj.facilities.forEach(val => {
      this.facilitiesArr.push(val.id);
    });
    this.isWeekDayOpen = this.gymObj.openInWeekDays;
    this.isWeekendOpen = this.gymObj.openInWeekEnd;
    this.isClosedSpecificDay = this.gymObj.closedOnSpecificDay;
    if (this.gymObj.openInWeekDays === true) {
      document.getElementById("weekDayHourDiv").hidden = false;
      this.from = moment(
        "2020-07-27" + this.gymObj.weekDaysOpeningHour,
        moment.defaultFormat
      ).toDate();
      this.to = moment(
        "2020-07-27" + this.gymObj.weekDaysClosingHour,
        moment.defaultFormat
      ).toDate();
    } else {
      document.getElementById("weekDayHourDiv").hidden = true;
    }
    if (
      this.gymObj.openInWeekEnd === true &&
      this.gymObj.saturdayOpeningHour !== ""
    ) {
      this.saturdayStartTime = moment(
        "2020-07-27" + this.gymObj.saturdayOpeningHour,
        moment.defaultFormat
      ).toDate();
      this.saturdayEndTime = moment(
        "2020-07-27" + this.gymObj.saturdayClosingHour,
        moment.defaultFormat
      ).toDate();
      document.getElementById("tablediv").hidden = false;
      this.isCheckedSaturday = true;
      this.saturday = true;
      this.isSaturadayOpen = false;
    } else if (
      this.gymObj.openInWeekEnd === true &&
      this.gymObj.sundayOpeningHour !== ""
    ) {
      this.sundayStartTime = moment(
        "2020-07-27" + this.gymObj.sundayOpeningHour,
        moment.defaultFormat
      ).toDate();
      this.sundayEndTime = moment(
        "2020-07-27" + this.gymObj.sundayClosingHour,
        moment.defaultFormat
      ).toDate();
      document.getElementById("tablediv").hidden = false;
      this.isCheckedSunday = true;
      this.isSundayOpen = false;
      this.sunday = true;
    } else {
      document.getElementById("tablediv").hidden = true;
    }

    if (this.gymObj.closedOnSpecificDay === true) {
      this.selectedDay = this.gymObj.closedSpecificDay;
      document.getElementById("specificDayDiv").hidden = false;
    } else {
      document.getElementById("specificDayDiv").hidden = true;
    }
    this.profilePic = this.gymObj.profileImage;
    document.getElementById("imgTable").hidden = false;
    return this.formBuilder.group({
      gymName: [this.gymObj.gymName],
      specificDescription: [this.selectedDay],
      location: [this.gymObj.businessProfileLocationId],
      profileDescription: [this.gymObj.description],
      startTime: [this.from],
      endTime: [this.to],
      weekendStartTime: [this.weekendFrom],
      weekendEndTime: [this.weekendTo],
      videoURl: [this.gymObj.youtubeUrl],
      saturdayFrom: [],
      saturdayTo: [],
      sundayFrom: [],
      sundayTo: []
    });
  }
  uploadNewImage() {
    swal
      .fire({
        title: "Are you sure?",
        text: "Are you sure you want to change profile picture ?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Yes",
        cancelButtonText: "No"
      })
      .then(result => {
        if (result.value) {
          document.getElementById("ngxDiv").hidden = false;
          document.getElementById("profileImgDiv").hidden = true;
        } else if (result.dismiss === swal.DismissReason.cancel) {
          swal.close();
        }
      });
  }

  getLocations(profileId) {
    this.utilService.getLocationByBusinessProfileID(profileId).subscribe(
      res => {
        if (res.success === true) {
          this.locations = res.body;
        } else {
          this.notifier.notify("danger", res.message);
        }
      },
      error1 => {
        this.notifier.notify("danger", "Can't Process This Request");
      }
    );
  }
  checkDescriptionLength() {
    this.descriptionLength = this.createProfileForm.controls.specificDescription.value.length;
  }

  descriptionNewLinePress(e) {
    const val = this.createProfileForm.controls.specificDescription.value;
    if (e.key === "Enter") {
      this.createProfileForm.controls.specificDescription.setValue(val + "\n");
    }
  }
  getFacilites() {
    this.gymService.getFacilitesList().subscribe(
      res => {
        if (res.success === true) {
          this.facilities = res.body;
          this.facilitiesReturnedArray = this.facilities.slice(0, 10);
        } else {
          this.notifier.notify("danger", res.message);
        }
      },
      error1 => {
        this.notifier.notify("danger", "Can't Process This Request");
      }
    );
  }
  saturdayOpen(val) {
    if (val === true) {
      this.isSaturadayOpen = false;
      this.saturday = true;
    } else {
      this.isSaturadayOpen = true;
      this.saturday = false;
    }
  }
  sundayOpen(val) {
    if (val === true) {
      this.isSundayOpen = false;
      this.sunday = true;
    } else {
      this.isSundayOpen = true;
      this.sunday = false;
    }
  }
  getEquipments() {
    this.gymService.getEquipmentsList().subscribe(
      res => {
        if (res.success === true) {
          this.equipments = res.body;
          this.equipmentsReturnedArray = this.equipments.slice(0, 10);
        } else {
          this.notifier.notify("danger", res.message);
        }
      },
      error1 => {
        this.notifier.notify("danger", "Can't Process This Request");
      }
    );
  }
  equipmentsTableChanged(event: PageChangedEvent): void {
    const startItem = (event.page - 1) * event.itemsPerPage;
    const endItem = event.page * event.itemsPerPage;
    this.equipmentsReturnedArray = this.equipments.slice(startItem, endItem);
  }
  facilitiesTableChanged(event: PageChangedEvent): void {
    const startItem = (event.page - 1) * event.itemsPerPage;
    const endItem = event.page * event.itemsPerPage;
    this.facilitiesReturnedArray = this.facilities.slice(startItem, endItem);
  }

  onSelect(e) {
    if (this.images.length === 3) {
      this.coverImg.reset();
      this.notifier.notify(
        "danger",
        "Maximum number of allowable Image uploads has been exceeded..!"
      );
    } else {
      this.base64Image = e;
      document.getElementById("imgPreviewTable").hidden = false;
    }
  }

  addCoverImages(val) {
    const x = { img: val };
    this.coverImg.reset();
    this.images.push(x);
    if (this.images.length > 0) {
      document.getElementById("imgPreviewTable").hidden = true;
      document.getElementById("imgTable").hidden = false;
    }
  }

  onSelectProfileImage(e) {
    this.profileImage = e;
    document.getElementById("profileImagePreview").hidden = false;
  }

  onResetProfileImage() {
    this.profileImage = undefined;
    document.getElementById("profileImagePreview").hidden = true;
  }

  onResetCover() {
    this.coverImg.reset();
    this.base64Image = undefined;
    document.getElementById("imgPreviewTable").hidden = true;
  }

  clearProfileImage() {
    document.getElementById("profileImagePreview").hidden = true;
  }
  clear() {
    this.profileImage = undefined;
    this.profileImg.reset();
    document.getElementById("profileImagePreview").hidden = true;
  }

  onReset() {
    this.base64Image = undefined;
    document.getElementById("imgPreviewTable").hidden = true;
  }

  numberOnly(event): boolean {
    const charCode = event.which ? event.which : event.keyCode;
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
      return false;
    }
    return true;
  }

  autoScrollBusinessProfileWizard() {
    $("html, body").animate(
      {
        scrollTop: $("#wizard1").offset().top
      },
      1000
    );
  }
  autoScrollMoreInfoWizard() {
    $("html, body").animate(
      {
        scrollTop: $("#wizard2").offset().top
      },
      1000
    );
  }

  clickGymInformationWizard() {
    if (this.createProfileForm.controls.gymName.value.trim() === "") {
      this.notifier.notify("danger", "Please enter a gym name..!");
    } else if (
      this.profileImage === undefined &&
      this.profilePic === undefined
    ) {
      this.notifier.notify("danger", "Please upload profile image..!");
    } else if (document.getElementById("imgPreviewTable").hidden === false) {
      this.notifier.notify(
        "danger",
        "Please confirm the cover images to proceed..!"
      );
    } else if (
      this.images.length === 0 &&
      document.getElementById("imgPreviewTable").hidden === true
    ) {
      this.notifier.notify("danger", "Please upload cover images..!");
    } else if (
      this.createProfileForm.controls.profileDescription.value.trim() === ""
    ) {
      this.notifier.notify("danger", "Please enter description..!");
    } else if (
      this.createProfileForm.controls.location.value === "" ||
      this.createProfileForm.controls.location.value === null
    ) {
      this.notifier.notify("danger", "Please select location..!");
    } else if (
      this.isWeekDayOpen === true &&
      this.createProfileForm.controls.startTime.value === null
    ) {
      this.notifier.notify(
        "danger",
        "Please select correct time of week days opening hour..!"
      );
    } else if (
      this.isWeekDayOpen === true &&
      this.createProfileForm.controls.endTime.value === null
    ) {
      this.notifier.notify(
        "danger",
        "Please select correct time of week days closing hour..!"
      );
    } else if (
      this.isWeekDayOpen === true &&
      moment(this.createProfileForm.controls.startTime.value).format("HH:mm") >=
        moment(this.createProfileForm.controls.endTime.value).format("HH:mm")
    ) {
      this.notifier.notify(
        "danger",
        "Week days closing hour should be greater than opening hour..!"
      );
    } else if (
      this.isWeekendOpen === true &&
      this.saturday === false &&
      this.sunday === false
    ) {
      this.notifier.notify(
        "danger",
        "Please select correct time of weekend opening & closing hour..!"
      );
    } else if (
      this.isWeekendOpen === true &&
      this.saturday === true &&
      moment(this.createProfileForm.controls.saturdayFrom.value).format(
        "HH:mm"
      ) >=
        moment(this.createProfileForm.controls.saturdayTo.value).format("HH:mm")
    ) {
      this.notifier.notify(
        "danger",
        "Saturday closing hour should be greater than opening hour..!"
      );
    } else if (
      this.isWeekendOpen === true &&
      this.sunday === true &&
      moment(this.createProfileForm.controls.sundayFrom.value).format(
        "HH:mm"
      ) >=
        moment(this.createProfileForm.controls.sundayTo.value).format("HH:mm")
    ) {
      this.notifier.notify(
        "danger",
        "Sunday closing hour should be greater than opening hour..!"
      );
    } else if (
      this.isClosedSpecificDay === true &&
      this.createProfileForm.controls.specificDescription.value === ""
    ) {
      this.notifier.notify(
        "danger",
        "Please enter a description to close on the specified day...!"
      );
    } else {
      this.wizardComponent.goToNextStep();
      this.autoScrollMoreInfoWizard();
    }
  }

  eventHandler(event) {
    return false;
    if (event.code === "Backspace" || event.code === "Delete") {
      return false;
    }
  }

  removeImageList(rowobj) {
    this.coverImg.reset();
    this.images = this.images.filter(obj => obj.img !== rowobj);
    if (this.images.length === 0) {
      document.getElementById("imgTable").hidden = true;
    }
  }

  public onTagsChangedEventHandler(event: TagsChangedEvent): void {
    this.onTagsChangedOutput = JSON.stringify(event);
  }

  backButtonRouting(val) {
    swal
      .fire({
        title: "Are you sure to close this ?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Yes",
        cancelButtonText: "No"
      })
      .then(result => {
        if (result.value) {
          this.router.navigate(["/gyms/" + this.id]);
        } else if (result.dismiss === swal.DismissReason.cancel) {
          swal.close();
        }
      });
  }

  setDateZero(date) {
    return date < 10 ? "0" + date : date;
  }
  weekDayToggleFunction(val) {
    this.createProfileForm.controls.startTime.setValue(this.from);
    this.createProfileForm.controls.endTime.setValue(this.to);
    if (val === true) {
      this.isWeekDayOpen = true;
      document.getElementById("weekDayHourDiv").hidden = false;
    } else {
      this.isWeekDayOpen = false;
      document.getElementById("weekDayHourDiv").hidden = true;
    }
  }
  weekendDayToggleFunction(val) {
    this.createProfileForm.controls.weekendStartTime.setValue(this.weekendFrom);
    this.createProfileForm.controls.weekendEndTime.setValue(this.weekendFrom);
    if (val === true) {
      this.isWeekendOpen = true;
      document.getElementById("tablediv").hidden = false;
    } else {
      this.isWeekendOpen = false;
      document.getElementById("tablediv").hidden = true;
    }
  }
  specificDayToggleFunction(val) {
    if (val === true) {
      this.isClosedSpecificDay = true;
      document.getElementById("specificDayDiv").hidden = false;
    } else {
      this.isClosedSpecificDay = false;
      document.getElementById("specificDayDiv").hidden = true;
    }
  }
  markAllFacilities() {
    if (this.facilities.length !== 0) {
      if (
        this.facilitiesArr.length !== 0 &&
        this.facilitiesArr.length !== this.facilities.length
      ) {
        this.facilitiesArr.length = 0;
      }
      for (let i = 0; i < this.facilities.length; i++) {
        this.markFacilities(this.facilities[i]);
      }
    }
  }
  markAllEquipments() {
    if (this.equipments.length !== 0) {
      if (
        this.equipmentsArr.length !== 0 &&
        this.equipmentsArr.length !== this.equipments.length
      ) {
        this.equipmentsArr.length = 0;
      }
      for (let i = 0; i < this.equipments.length; i++) {
        this.markEquipments(this.equipments[i]);
      }
    }
  }
  checkPrecentange() {
    if (
      this.createProfileForm.controls.commissionPercentage.value.trim() > 100
    ) {
      document
        .getElementById("commissionPercentage")
        .style.setProperty("border-color", "red");
    } else {
      document
        .getElementById("commissionPercentage")
        .style.removeProperty("border-color");
    }
  }

  markFacilities(val) {
    if (this.facilitiesArr.find(obj => obj === val.id)) {
      this.facilitiesArr = this.facilitiesArr.filter(obj => obj !== val.id);
    } else {
      this.facilitiesArr.push(val.id);
    }
    if (this.facilities.length === this.facilitiesArr.length) {
      $("#inputCheckbox1").prop("checked", true);
    } else {
      $("#inputCheckbox1").prop("checked", false);
    }
  }

  returnMarkedFacilities(val) {
    if (this.facilitiesArr.find(obj => obj === val.id)) {
      return true;
    } else {
      return false;
    }
  }

  returnMarkedEquipments(val) {
    if (this.equipmentsArr.find(obj => obj === val.id)) {
      return true;
    } else {
      return false;
    }
  }

  markEquipments(val) {
    if (this.equipmentsArr.find(obj => obj === val.id)) {
      this.equipmentsArr = this.equipmentsArr.filter(obj => obj !== val.id);
    } else {
      this.equipmentsArr.push(val.id);
    }
    if (this.equipments.length === this.equipmentsArr.length) {
      $("#inputCheckbox2").prop("checked", true);
    } else {
      $("#inputCheckbox2").prop("checked", false);
    }
  }

  checkCharacterLength() {
    this.characterLength = this.createProfileForm.controls.profileDescription.value.length;
  }

  newLinePress(e) {
    const val = this.createProfileForm.controls.profileDescription.value;
    if (e.key === "Enter") {
      this.createProfileForm.controls.profileDescription.setValue(val + "\n");
    }
  }

  updateGym() {
    if (this.facilitiesArr.length === 0) {
      this.notifier.notify("danger", "Please select facilities ..!");
    } else if (this.equipmentsArr.length === 0) {
      this.notifier.notify("danger", "Please select equipments ..!");
    } else {
      document.getElementById("finishButton").setAttribute("disabled", "true");
      this.isLoading = true;

      const ImgArr = [];
      this.images.forEach(val => {
        ImgArr.push(val.img);
      });
      let closedDay = "";
      if (this.isClosedSpecificDay === false) {
        closedDay = "";
      } else {
        closedDay = this.createProfileForm.controls.specificDescription.value;
      }
      // ....................................................
      let weekDayOpenHour = "";
      let weekDayCloseHour = "";
      if (this.isWeekDayOpen === false) {
        weekDayOpenHour = "";
        weekDayCloseHour = "";
      } else {
        weekDayOpenHour = moment(
          this.createProfileForm.controls.startTime.value
        ).format("HH:mm");
        weekDayCloseHour = moment(
          this.createProfileForm.controls.endTime.value
        ).format("HH:mm");
      }
      // ....................................................
      let saturdayOpenHour = "";
      let saturdayCloseHour = "";
      if (
        (this.isWeekendOpen === false && this.saturday === false) ||
        (this.isWeekendOpen === true && this.saturday === false)
      ) {
        saturdayOpenHour = "";
        saturdayOpenHour = "";
      } else {
        saturdayOpenHour = moment(
          this.createProfileForm.controls.saturdayFrom.value
        ).format("HH:mm");
        saturdayCloseHour = moment(
          this.createProfileForm.controls.saturdayTo.value
        ).format("HH:mm");
      }
      // ....................................................
      let sundayOpenHour = "";
      let sundayCloseHour = "";
      if (
        (this.isWeekendOpen === false && this.sunday === false) ||
        (this.isWeekendOpen === true && this.sunday === false)
      ) {
        sundayOpenHour = "";
        sundayCloseHour = "";
      } else {
        sundayOpenHour = moment(
          this.createProfileForm.controls.sundayFrom.value
        ).format("HH:mm");
        sundayCloseHour = moment(
          this.createProfileForm.controls.sundayTo.value
        ).format("HH:mm");
      }
      let newProfileImage: any;
      if (this.profileImage === undefined) {
        newProfileImage = this.gymObj.profileImage;
      } else {
        newProfileImage = this.profileImage;
      }
      const req = {
        gymId: this.gymObj.gymId,
        description: this.createProfileForm.controls.profileDescription.value,
        openInWeekDays: this.isWeekDayOpen,
        openInWeekEnd: this.isWeekendOpen,
        weekDaysOpeningHour: weekDayOpenHour,
        weekDaysClosingHour: weekDayCloseHour,
        saturdayOpeningHour: saturdayOpenHour,
        saturdayClosingHour: saturdayCloseHour,
        sundayOpeningHour: sundayOpenHour,
        sundayClosingHour: sundayCloseHour,
        closedOnSpecificDay: this.isClosedSpecificDay,
        closedSpecificDay: closedDay,
        profileImage: newProfileImage,
        gymImages: ImgArr,
        equipmentIdList: this.equipmentsArr,
        facilityIdList: this.facilitiesArr,
        youtubeUrl: this.createProfileForm.controls.videoURl.value
      };
      this.gymService.updateGym(req).subscribe(
        res => {
          this.isLoading = false;
          if (res.success === true) {
            this.notifier.notify(
              "success",
              "Gym has been successfully updated..!"
            );
            this.router.navigate(["/gyms/" + this.id]);
            document.getElementById("finishButton").removeAttribute("disabled");
          } else {
            this.notifier.notify("danger", res.message);
            document.getElementById("finishButton").removeAttribute("disabled");
          }
        },
        error1 => {
          this.isLoading = false;
          document.getElementById("finishButton").removeAttribute("disabled");
          this.notifier.notify("danger", "Can't Process This Request");
        }
      );
    }
  }
}
