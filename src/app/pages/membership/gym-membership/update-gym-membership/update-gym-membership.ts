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
import { ActivatedRoute, Router } from "@angular/router";
import { Subject } from "rxjs";
import { ClassDTO } from "../../../../shared/dto/classDTO";
import { ThemeOptions } from "../../../../theme-options";
import { UtilService } from "../../../../core/services/util-service/util.service";
import swal from "sweetalert2";
import { PageChangedEvent, parseDate } from "ngx-bootstrap";
import { MembershipService } from "../../../../core/services/membership-service/membership-service";
import { GymMembershipService } from "../../../../core/services/membership-service/gym-membership-service";
import { MembershipDTO } from "../../../../shared/dto/membershipDTO";
import { takeUntil } from "rxjs/operators";
import { UpdateGymMembershipService } from "./update-gym-membership-service";
import { GymMembershipDTO } from "../../../../shared/dto/gymMembershipDTO";
import { constants } from "../../../../shared/constant/constant";

@Component({
  selector: "update-gym-membership-form",
  templateUrl: "./update-gym-membership.html"
})
export class UpdateGymMembership implements OnInit, OnDestroy {
  isLoading = false;
  isPayment = false;
  status: any;
  private readonly notifier: NotifierService;
  private unsubscribeAll: Subject<any>;
  base64Image: any = undefined;
  textLength: any = 0;
  id: any;
  className: any;
  currency: any;
  classId: number;
  changePage: number;
  toggle: any = false;
  images: Array<any> = [];
  arr: Array<any> = [];
  days: Array<any> = [];
  myString: any;
  keyPeople: any;
  gyms: Array<any> = [];
  profiles: Array<any> = [];
  classes: Array<any> = [];
  languageList: Array<any> = [];
  maxDate = new Date();
  currentDate = new Date();
  bsValue = new Date();
  mytime: Date = new Date();
  subscribeModel: any;
  memberShipObj: GymMembershipDTO;
  selectedClass: any;

  rotate = true;
  first: "First";
  last: "List";
  public numPages = 1;
  returnedArray: Array<any> = [];
  sessionList: Array<any> = [];

  payment: File;
  paymentb64: any;
  aggrement: File;
  agreementb64: any;

  createMembershipForm: FormGroup;

  constructor(
    public globals: ThemeOptions,
    private formBuilder: FormBuilder,
    private router: Router,
    private notifierService: NotifierService,
    private membershipService: MembershipService,
    private updateGymMembershipService: UpdateGymMembershipService,
    private gymMembershipService: GymMembershipService,
    private utilService: UtilService,
    private activatedRoute: ActivatedRoute
  ) {
    this.currency = constants.currency;
    this.notifier = notifierService;
    this.unsubscribeAll = new Subject();
    // this.getBusinessProfileName();
    this.memberShipObj = new GymMembershipDTO();
    this.activatedRoute.params.subscribe(params => {
      this.id = params.profileId;
    });
  }
  ngOnInit(): void {
    this.updateGymMembershipService.onMembershipChanged
      .pipe(takeUntil(this.unsubscribeAll))
      .subscribe(membershipObj => {
        this.memberShipObj = new GymMembershipDTO(membershipObj);
      });
    if (this.memberShipObj.duration === 1) {
      this.days = [];
      const monday = document.getElementById("monday") as HTMLInputElement;
      monday.checked = this.memberShipObj.dayPassDTO.monday;

      const tuesday = document.getElementById("tuesday") as HTMLInputElement;
      tuesday.checked = this.memberShipObj.dayPassDTO.tuesday;

      const wednesday = document.getElementById(
        "wednesday"
      ) as HTMLInputElement;
      wednesday.checked = this.memberShipObj.dayPassDTO.wednesday;

      const thursday = document.getElementById("thursday") as HTMLInputElement;
      thursday.checked = this.memberShipObj.dayPassDTO.thursday;

      const friday = document.getElementById("friday") as HTMLInputElement;
      friday.checked = this.memberShipObj.dayPassDTO.friday;

      const saturday = document.getElementById("saturday") as HTMLInputElement;
      saturday.checked = this.memberShipObj.dayPassDTO.saturday;

      const sunday = document.getElementById("sunday") as HTMLInputElement;
      sunday.checked = this.memberShipObj.dayPassDTO.sunday;
      document.getElementById("daysDiv").removeAttribute("hidden");
      document.getElementById("name").setAttribute("hidden", "true");
      document.getElementById("descriptionDiv").setAttribute("hidden", "true");
    } else {
      document.getElementById("daysDiv").setAttribute("hidden", "true");
      document.getElementById("name").removeAttribute("hidden");
      document.getElementById("descriptionDiv").removeAttribute("hidden");
    }
    this.className = this.memberShipObj.gymName;
    this.createMembershipForm = this.packageCreateForm();
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
  packageCreateForm(): FormGroup {
    this.textLength = this.memberShipObj.description.length;
    return this.formBuilder.group({
      packageName: [this.memberShipObj.name],
      description: [this.memberShipObj.description],
      duration: [this.memberShipObj.duration],
      price: [this.memberShipObj.price],
      discount: [this.memberShipObj.discount]
    });
  }

  ngOnDestroy(): void {
    // Unsubscribe from all subscriptions
    this.unsubscribeAll.next();
    this.unsubscribeAll.complete();
  }
  numberOnly(event): boolean {
    const charCode = event.which ? event.which : event.keyCode;
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
      return false;
    }
    return true;
  }
  newLinePress(e) {
    const val = this.createMembershipForm.controls.description.value;
    if (e.key === "Enter") {
      this.createMembershipForm.controls.description.setValue(val + "\n");
    }
  }
  eventHandler(event) {
    return false;
    if (event.code === "Backspace" || event.code === "Delete") {
      return false;
    }
  }

  setDateZero(date) {
    return date < 10 ? "0" + date : date;
  }
  allowPayment(val) {
    this.isPayment = val;
  }
  backButtonRouting() {
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
          this.router.navigate(["/gym-membership/" + this.id]);
        } else if (result.dismiss === swal.DismissReason.cancel) {
          swal.close();
        }
      });
  }

  checkLength() {
    this.textLength = this.createMembershipForm.controls.description.value.length;
  }
  checkFee() {
    if (
      this.createMembershipForm.controls.price.value === "" ||
      this.createMembershipForm.controls.price.value >= 100
    ) {
      document
        .getElementById("subscriptionFeeError")
        .setAttribute("hidden", "true");
      document.getElementById("price").style.removeProperty("border-color");
    } else if (this.createMembershipForm.controls.price.value < 100) {
      document.getElementById("price").style.setProperty("border-color", "red");
      document.getElementById("subscriptionFeeError").removeAttribute("hidden");
    }
  }
  checkPrecentange() {
    if (this.createMembershipForm.controls.discount.value.trim() > 100) {
      document
        .getElementById("discount")
        .style.setProperty("border-color", "red");
    } else {
      document.getElementById("discount").style.removeProperty("border-color");
    }
  }

  pageChanged(event: PageChangedEvent): void {
    const startItem = (event.page - 1) * event.itemsPerPage;
    this.changePage = event.page;
    const endItem = event.page * event.itemsPerPage;
    this.returnedArray = this.sessionList.slice(startItem, endItem);
  }

  updateMembership() {
    this.days = [];
    const monday = document.getElementById("monday") as HTMLInputElement;
    if (monday.checked) {
      this.days.push("Monday");
    } else {
      this.days.filter(obj => obj !== "Monday");
    }
    const tuesday = document.getElementById("tuesday") as HTMLInputElement;
    if (tuesday.checked) {
      this.days.push("Tuesday");
    } else {
      this.days.filter(obj => obj !== "Tuesday");
    }
    const wednesday = document.getElementById("wednesday") as HTMLInputElement;
    if (wednesday.checked) {
      this.days.push("Wednesday");
    } else {
      this.days.filter(obj => obj !== "Wednesday");
    }
    const thursday = document.getElementById("thursday") as HTMLInputElement;
    if (thursday.checked) {
      this.days.push("Thursday");
    } else {
      this.days.filter(obj => obj !== "Thursday");
    }
    const friday = document.getElementById("friday") as HTMLInputElement;
    if (friday.checked) {
      this.days.push("Friday");
    } else {
      this.days.filter(obj => obj !== "Friday");
    }
    const saturday = document.getElementById("saturday") as HTMLInputElement;
    if (saturday.checked) {
      this.days.push("Saturday");
    } else {
      this.days.filter(obj => obj !== "Saturday");
    }
    const sunday = document.getElementById("sunday") as HTMLInputElement;
    if (sunday.checked) {
      this.days.push("Sunday");
    } else {
      this.days.filter(obj => obj !== "Sunday");
    }
    if (
      this.createMembershipForm.controls.packageName.value.trim() === "" &&
      this.createMembershipForm.controls.duration.value !== 1
    ) {
      this.notifier.notify("danger", "Please enter package name..!");
    } else if (
      this.createMembershipForm.controls.description.value.trim() === "" &&
      this.createMembershipForm.controls.duration.value !== 1
    ) {
      this.notifier.notify("danger", "Please enter description..!");
    } else if (
      this.createMembershipForm.controls.duration.value === "" ||
      this.createMembershipForm.controls.duration.value === "0"
    ) {
      this.notifier.notify("danger", "Please enter valid duration..!");
    } else if (
      this.createMembershipForm.controls.price.value === "" ||
      this.createMembershipForm.controls.price.value < 1
    ) {
      this.notifier.notify("danger", "Please enter listed price..!");
    } else if (this.createMembershipForm.controls.price.value < 100) {
      this.notifier.notify(
        "danger",
        "Listed price must be greater than or equal the 100..!"
      );
    } else if (this.createMembershipForm.controls.discount.value > 100) {
      this.notifier.notify(
        "danger",
        "Discount rate must be less-than the 100%..!"
      );
    } else if (
      this.days.length === 0 &&
      this.createMembershipForm.controls.duration.value === 1
    ) {
      this.notifier.notify("danger", "Please select eligible days..!");
    } else {
      this.isLoading = true;
      document.getElementById("finishButton").setAttribute("disabled", "true");
      if (this.createMembershipForm.controls.duration.value !== 1) {
        const req = {
          name: this.createMembershipForm.controls.packageName.value,
          membershipId: this.memberShipObj.membershipId,
          description: this.createMembershipForm.controls.description.value,
          duration: this.createMembershipForm.controls.duration.value,
          price: this.createMembershipForm.controls.price.value,
          discount: this.createMembershipForm.controls.discount.value
        };
        this.gymMembershipService.updateGymMembership(req).subscribe(
          res => {
            this.isLoading = false;
            if (res.success === true) {
              this.notifier.notify(
                "success",
                "Package has been successfully updated..!"
              );
              this.router.navigate(["/gym-membership/" + this.id]);
              document
                .getElementById("finishButton")
                .removeAttribute("disabled");
            } else {
              this.notifier.notify("danger", res.message);
              document
                .getElementById("finishButton")
                .removeAttribute("disabled");
            }
          },
          error1 => {
            this.isLoading = false;
            document.getElementById("finishButton").removeAttribute("disabled");
            this.notifier.notify("danger", "Can't Process This Request");
          }
        );
      } else {
        const dayObj = {
          monday: monday.checked,
          tuesday: tuesday.checked,
          wednesday: wednesday.checked,
          thursday: thursday.checked,
          friday: friday.checked,
          saturday: saturday.checked,
          sunday: sunday.checked
        };
        const req = {
          name: this.createMembershipForm.controls.packageName.value,
          membershipId: this.memberShipObj.membershipId,
          description: "",
          price: this.createMembershipForm.controls.price.value,
          discount: this.createMembershipForm.controls.discount.value,
          dayPassDTO: dayObj
        };
        this.gymMembershipService.updateDayPass(req).subscribe(
          res => {
            this.isLoading = false;
            if (res.success === true) {
              this.notifier.notify(
                "success",
                "Package has been successfully created..!"
              );
              this.router.navigate(["/gym-membership/" + this.id]);
              document
                .getElementById("finishButton")
                .removeAttribute("disabled");
            } else {
              this.notifier.notify("danger", res.message);
              document
                .getElementById("finishButton")
                .removeAttribute("disabled");
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
}
