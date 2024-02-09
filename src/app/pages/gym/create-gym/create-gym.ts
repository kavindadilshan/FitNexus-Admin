import {
  Component,
  ElementRef,
  NgZone,
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

declare var google: any;
@Component({
  selector: "create-gym",
  templateUrl: "./create-gym.html"
})
export class CreateGym implements OnInit {
  @ViewChild("profileImg", { static: false })
  public profileImg: NgxImgComponent;
  @ViewChild("coverImg", { static: false })
  public coverImg: NgxImgComponent;
  @ViewChild("wizardComponent", { static: false })
  public wizardComponent: WizardComponent;
  isLoading = false;
  isChecked = true;

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
  descriptionLength: any = 0;
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
  staurdayStartTime: Date = new Date();
  staurdayEndTime: Date = new Date();
  sundayStartTime: Date = new Date();
  sundayEndTime: Date = new Date();
  subscribeModel: any;
  id: any;
  isValid: boolean;
  isWeekDayOpen = false;
  markFacilitites = false;
  isWeekendOpen = false;
  isSaturadayOpen = true;
  saturday = false;
  isSaturadayChecked = false;
  isSundayChecked = false;
  isSundayOpen = true;
  sunday = false;
  isClosedSpecificDay = false;
  selectedDay = "Sunday";
  profileName: string;

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

  rotate = true;
  first: "First";
  last: "List";
  public numPages = 1;
  public facilitiesNumPages = 1;

  constructor(
    public globals: ThemeOptions,
    private formBuilder: FormBuilder,
    private router: Router,
    private notifierService: NotifierService,
    private utilService: UtilService,
    private profileService: ProfileService,
    private gymService: GymService,
    private mapsAPILoader: MapsAPILoader,
    private ngZone: NgZone,
    private route: ActivatedRoute
  ) {
    this.route.params.subscribe(params => {
      this.id = params.id;
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
    this.createProfileForm = this.formBuilder.group({
      gymName: [""],
      brn: [""],
      phone: [""],
      email: [""],
      day: [""],
      location: [""],
      profileDescription: [""],
      headOfficeName: [""],
      addressLine1: [""],
      specificDescription: [""],
      addressLine2: [""],
      headOfficeCountry: [""],
      headOfficeProvince: [""],
      headOfficeCity: [""],
      headOfficePostalCode: [""],
      headOfficeTimeZone: [""],
      searchLocation: [""],
      address: [""],
      branchAddressLine1: [""],
      branchAddressLine2: [""],
      branchCountry: [""],
      branchProvince: [""],
      branchCity: [""],
      branchPostalCode: [""],
      branchTimeZone: [""],
      bankName: [""],
      bankCode: [""],
      accountNo: [""],
      accountName: [""],
      swiftCode: [""],
      branch: [""],
      branchCode: [""],
      branchName: [""],
      startDate: [""],
      expireDate: [""],
      agreement: [""],
      paymentModel: ["COMMISSION"],
      subscriptionFee: [""],
      commissionPercentage: [""],
      packageDescription: [""],
      firtName: [""],
      lastName: [""],
      managerTelephoneNo: [""],
      managerEmail: [""],
      userName: [""],
      managerTimeZone: [""],
      startTime: [""],
      endTime: [""],
      weekendStartTime: [""],
      weekendEndTime: [""],
      saturdayFrom: [""],
      saturdayTo: [""],
      sundayFrom: [""],
      sundayTo: [""],
      videoURl: [""]
    });
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

  changePreferredCountries() {
    this.preferredCountries = [CountryISO.India, CountryISO.Canada];
  }

  ngOnInit() {
    // load Places Autocomplete
    // this.mapsAPILoader.load().then(() => {
    //   this.setCurrentLocation();
    //   this.setHeadOfficeCurrentLocation();
    //   this.geoCoder = new google.maps.Geocoder();
    //
    //   // comment
    //   // const autocompleteBrachLocation = new google.maps.places.Autocomplete(
    //   //   this.searchBranch.nativeElement
    //   // );
    //   // autocompleteBrachLocation.addListener("place_changed", () => {
    //   //   this.ngZone.run(() => {
    //   //     // get the place result
    //   //     const place: google.maps.places.PlaceResult = autocompleteBrachLocation.getPlace();
    //   //     // verify result
    //   //     if (place.geometry === undefined || place.geometry === null) {
    //   //       return;
    //   //     }
    //   //
    //   //     this.latitude = place.geometry.location.lat();
    //   //     this.longitude = place.geometry.location.lng();
    //   //     this.zoom = 12;
    //   //   });
    //   // });
    //
    //   const autocomplete = new google.maps.places.Autocomplete(
    //     this.headOffice.nativeElement
    //   );
    //   autocomplete.addListener("place_changed", () => {
    //     this.ngZone.run(() => {
    //       // get the place result
    //       const place: google.maps.places.PlaceResult = autocomplete.getPlace();
    //       // verify result
    //       if (place.geometry === undefined || place.geometry === null) {
    //         return;
    //       }
    //       // set latitude, longitude and zoom
    //       this.headOfficeLatitude = place.geometry.location.lat();
    //       this.headOfficeLongitude = place.geometry.location.lng();
    //       this.zoom = 12;
    //     });
    //   });
    // });
  }

  // Get Current Location Coordinates
  private setCurrentLocation() {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(position => {
        this.latitude = position.coords.latitude;
        this.longitude = position.coords.longitude;
        this.zoom = 8;
        this.getAddress(this.latitude, this.longitude);
      });
    }
  }
  disableSpecilaCharacters(event): boolean {
    if (
      event.keyCode === 47 ||
      event.keyCode === 92 ||
      event.keyCode === 123 ||
      event.keyCode === 125 ||
      event.keyCode === 60 ||
      event.keyCode === 62 ||
      event.keyCode === 124 ||
      event.keyCode === 126 ||
      event.keyCode === 96 ||
      event.keyCode === 94 ||
      event.keyCode === 91 ||
      event.keyCode === 93 ||
      event.keyCode === 42 ||
      event.keyCode === 39 ||
      event.keyCode === 40 ||
      event.keyCode === 41 ||
      event.keyCode === 59 ||
      event.keyCode === 58 ||
      event.keyCode === 38 ||
      event.keyCode === 61 ||
      event.keyCode === 43 ||
      event.keyCode === 36 ||
      event.keyCode === 44 ||
      event.keyCode === 63 ||
      event.keyCode === 37 ||
      event.keyCode === 35 ||
      event.keyCode === 33
    ) {
      return false;
    }
    return true;
  }
  getLocations(profileId) {
    this.utilService.getNewLocationByBusinessProfileID(profileId).subscribe(
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

  private setHeadOfficeCurrentLocation() {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(position => {
        this.headOfficeLatitude = position.coords.latitude;
        this.headOfficeLongitude = position.coords.longitude;
        this.zoom = 8;
        this.getAddress(this.latitude, this.longitude);
      });
    }
  }

  markerDragEnd($event: MouseEvent) {
    this.latitude = $event.coords.lat;
    this.longitude = $event.coords.lng;
    this.getAddress(this.latitude, this.longitude);
  }

  headOfficeMarkerDragEnd($event: MouseEvent) {
    this.headOfficeLatitude = $event.coords.lat;
    this.headOfficeLongitude = $event.coords.lng;
    this.getAddress(this.headOfficeLatitude, this.headOfficeLongitude);
  }

  getAddress(latitude, longitude) {
    this.geoCoder.geocode(
      { location: { lat: latitude, lng: longitude } },
      (results, status) => {
        if (status === "OK") {
          if (results[0]) {
            this.zoom = 12;
            this.address = results[0].formatted_address;
          } else {
            window.alert("No results found");
          }
        } else {
          window.alert("Geocoder failed due to: " + status);
        }
      }
    );
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
    } else if (this.profileImage === undefined) {
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
      this.notifier.notify("danger", "Please enter a description..!");
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
  loadMap(Latitude, Longitude) {
    this.ngZone.run(() => {
      // get the place result

      this.latitude = Latitude;
      this.longitude = Longitude;
      this.zoom = 12;
    });
  }
  onChangePaymentReport(file, b64) {
    this.payment = file.files[0];
    if (this.payment.type !== "application/pdf") {
      this.notifier.notify("danger", "Please select only pdf file ..!");
      this.paymentb64 = "";
      this.createProfileForm.controls.paymentReport.setValue("");
    } else {
      const paymentpdf = b64.target.files[0];
      const reader = new FileReader();
      reader.readAsDataURL(paymentpdf);
      reader.onload = () => {
        this.paymentb64 = reader.result;
      };
    }
  }

  public addValue(val): void {
    this.myString = val.target.value;
    const stringLength = this.myString.length; //
    this.myString.charAt(stringLength - 1);
    if (this.myString.charAt(stringLength - 1) === ",") {
      const tagValue = { displayValue: this.myString.slice(0, -1) };
      this.tags.push(tagValue);
      val.target.value = "";
    }
  }

  selectPaymentModel() {
    if (this.createProfileForm.controls.paymentModel.value === "Subscription") {
      document.getElementById("subscriptionPackge").hidden = false;
      document.getElementById("subscriptionFeeDiv").hidden = false;
      document.getElementById("commissionPrecentageDiv").hidden = true;
    } else {
      document.getElementById("commissionPrecentageDiv").hidden = false;
      document.getElementById("subscriptionPackge").hidden = true;
      document.getElementById("subscriptionFeeDiv").hidden = true;
    }
  }

  public addKeyPeople(val): void {
    this.keyPeople = val.target.value;
    const keyPeopleString = this.keyPeople.length; //
    this.keyPeople.charAt(keyPeopleString - 1);
    if (this.keyPeople.charAt(keyPeopleString - 1) === ",") {
      const keyPeopleValue = { displayValue: this.keyPeople.slice(0, -1) };
      this.KeyPeoples.push(keyPeopleValue);
      val.target.value = "";
    }
  }

  public onTagsChangedEventHandler(event: TagsChangedEvent): void {
    this.onTagsChangedOutput = JSON.stringify(event);
  }

  backButtonRouting(val) {
    if (
      this.createProfileForm.controls.gymName.value !== "" ||
      this.profileImage !== undefined ||
      this.base64Image !== undefined ||
      this.createProfileForm.controls.profileDescription.value !== "" ||
      this.createProfileForm.controls.location.value !== ""
    ) {
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
    } else {
      this.router.navigate(["/gyms/" + this.id]);
    }
  }

  checkPackgeModel(evt) {
    this.subscribeModel = evt.target.value;
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
    this.createProfileForm.controls.weekendEndTime.setValue(this.weekendTo);
    if (val === true) {
      this.isWeekendOpen = true;
      document.getElementById("tablediv").hidden = false;
    } else {
      this.isWeekendOpen = false;
      document.getElementById("tablediv").hidden = true;
    }
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
  specificDayToggleFunction(val) {
    if (val === true) {
      this.isClosedSpecificDay = true;
      document.getElementById("specificDayDiv").hidden = false;
    } else {
      this.isClosedSpecificDay = false;
      document.getElementById("specificDayDiv").hidden = true;
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

  checkDescriptionLength() {
    this.descriptionLength = this.createProfileForm.controls.specificDescription.value.length;
  }

  descriptionNewLinePress(e) {
    const val = this.createProfileForm.controls.specificDescription.value;
    if (e.key === "Enter") {
      this.createProfileForm.controls.specificDescription.setValue(val + "\n");
    }
  }

  createGym() {
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
      const req = {
        businessProfileLocationId: this.createProfileForm.controls.location
          .value,
        gymName: this.createProfileForm.controls.gymName.value,
        description: this.createProfileForm.controls.profileDescription.value,
        openInWeekDays: this.isWeekDayOpen,
        openInWeekEnd: this.isWeekendOpen,
        weekDaysOpeningHour: weekDayOpenHour,
        weekDaysClosingHour: weekDayCloseHour,
        weekendOpeningHour: "",
        weekendClosingHour: "",
        saturdayOpeningHour: saturdayOpenHour,
        saturdayClosingHour: saturdayCloseHour,
        sundayOpeningHour: sundayOpenHour,
        sundayClosingHour: sundayCloseHour,
        closedOnSpecificDay: this.isClosedSpecificDay,
        closedSpecificDay: closedDay,
        profileImage: this.profileImage,
        gymImages: ImgArr,
        equipmentIdList: this.equipmentsArr,
        facilityIdList: this.facilitiesArr,
        youtubeUrl: this.createProfileForm.controls.videoURl.value.trim()
      };
      this.gymService.createGym(req).subscribe(
        res => {
          this.isLoading = false;
          if (res.success === true) {
            this.notifier.notify(
              "success",
              "Gym has been successfully added..!"
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
