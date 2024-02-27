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
import { constants } from "../../../../shared/constant/constant";

@Component({
  selector: "create-gym-membership-form",
  templateUrl: "./create-gym-membership.html"
})
export class CreateGymMembership implements OnInit {
  isLoading = false;
  isPayment = false;
  status: any;
  private readonly notifier: NotifierService;
  private unsubscribeAll: Subject<any>;
  base64Image: any = undefined;
  textLength: any = 0;
  id: any;
  className: any;
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
  classObj: ClassDTO;
  selectedClass: any;
  selectedPackage: any;

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
  currency: any;

  createMembershipForm: FormGroup;

  constructor(
    public globals: ThemeOptions,
    private formBuilder: FormBuilder,
    private router: Router,
    private notifierService: NotifierService,
    private membershipService: MembershipService,
    private gymMembershipService: GymMembershipService,
    private utilService: UtilService,
    private activatedRoute: ActivatedRoute
  ) {
    this.currency = constants.currency;
    this.notifier = notifierService;
    this.unsubscribeAll = new Subject();
    // this.getBusinessProfileName();
    this.classObj = new ClassDTO();
    this.activatedRoute.params.subscribe(params => {
      this.id = params.id;
      this.className = params.profileName;
    });
  }
  ngOnInit(): void {
    this.getGymList(this.id);
    this.createMembershipForm = this.packageCreateForm();
  }
  packageCreateForm(): FormGroup {
    return this.formBuilder.group({
      packageName: [""],
      packageType: ["1 Week"],
      description: [""],
      duration: ["7"],
      price: [""],
      discount: [""],
      gym: [""]
    });
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
  getGymList(id) {
    this.gymMembershipService.getGymListByProfile(id).subscribe(
      res => {
        if (res.success === true) {
          this.gyms = res.body;
          this.selectedClass = this.gyms[0].id;
        } else {
          this.notifier.notify("danger", res.message);
        }
      },
      error1 => {
        this.notifier.notify("danger", "Can't Process This Request");
      }
    );
  }

  change(val) {}

  // checkMaxJoiner() {
  //   if (this.createSessionForm.controls.maxJoiner.value.trim() > 500) {
  //     document
  //       .getElementById("maxJoiner")
  //       .style.setProperty("border-color", "red");
  //   } else {
  //     document.getElementById("maxJoiner").style.removeProperty("border-color");
  //   }
  // }

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
  allowPayment(val) {
    this.isPayment = val;
  }
  getClassType() {
    // this.classService.getAllClassType().subscribe(
    //   res => {
    //     if (res.success === true) {
    //       res.body.forEach(val => {
    //         const type = { id: val.id, typeName: val.typeName };
    //         this.classType.push(type);
    //       });
    //     } else {
    //       this.notifier.notify("danger", res.message);
    //     }
    //   },
    //   error1 => {
    //     this.notifier.notify("danger", "Can't Process This Request");
    //   }
    // );
  }

  changePackage(val) {
    if (val === "Day Pass") {
      this.createMembershipForm.controls.duration.setValue("1");
      document.getElementById("daysDiv").removeAttribute("hidden");
      document.getElementById("packageNameDiv").setAttribute("hidden", "true");
      document
        .getElementById("packageDescriptionDiv")
        .setAttribute("hidden", "true");
    } else if (val === "1 Week") {
      document.getElementById("daysDiv").setAttribute("hidden", "true");
      this.createMembershipForm.controls.duration.setValue("7");
      document.getElementById("packageNameDiv").removeAttribute("hidden");
      document
        .getElementById("packageDescriptionDiv")
        .removeAttribute("hidden");
    } else if (val === "2 Week") {
      document.getElementById("daysDiv").setAttribute("hidden", "true");
      this.createMembershipForm.controls.duration.setValue("14");
      document.getElementById("packageNameDiv").removeAttribute("hidden");
      document
        .getElementById("packageDescriptionDiv")
        .removeAttribute("hidden");
    } else if (val === "1 Month") {
      document.getElementById("daysDiv").setAttribute("hidden", "true");
      this.createMembershipForm.controls.duration.setValue("30");
      document.getElementById("packageNameDiv").removeAttribute("hidden");
      document
        .getElementById("packageDescriptionDiv")
        .removeAttribute("hidden");
    } else if (val === "2 Month") {
      document.getElementById("daysDiv").setAttribute("hidden", "true");
      this.createMembershipForm.controls.duration.setValue("60");
      document.getElementById("packageNameDiv").removeAttribute("hidden");
      document
        .getElementById("packageDescriptionDiv")
        .removeAttribute("hidden");
    } else if (val === "3 Months") {
      document.getElementById("daysDiv").setAttribute("hidden", "true");
      this.createMembershipForm.controls.duration.setValue("90");
      document.getElementById("packageNameDiv").removeAttribute("hidden");
      document
        .getElementById("packageDescriptionDiv")
        .removeAttribute("hidden");
    } else if (val === "6 Months") {
      document.getElementById("daysDiv").setAttribute("hidden", "true");
      this.createMembershipForm.controls.duration.setValue("180");
      document.getElementById("packageNameDiv").removeAttribute("hidden");
      document
        .getElementById("packageDescriptionDiv")
        .removeAttribute("hidden");
    } else if (val === "1 Year") {
      document.getElementById("daysDiv").setAttribute("hidden", "true");
      this.createMembershipForm.controls.duration.setValue("365");
      document.getElementById("packageNameDiv").removeAttribute("hidden");
      document
        .getElementById("packageDescriptionDiv")
        .removeAttribute("hidden");
    } else if (val === "2 Years") {
      document.getElementById("daysDiv").setAttribute("hidden", "true");
      this.createMembershipForm.controls.duration.setValue("730");
      document.getElementById("packageNameDiv").removeAttribute("hidden");
      document
        .getElementById("packageDescriptionDiv")
        .removeAttribute("hidden");
    } else {
      document.getElementById("daysDiv").setAttribute("hidden", "true");
      this.createMembershipForm.controls.duration.setValue("");
      document.getElementById("packageNameDiv").removeAttribute("hidden");
      document
        .getElementById("packageDescriptionDiv")
        .removeAttribute("hidden");
    }
    const monday = document.getElementById("monday") as HTMLInputElement;
    monday.checked = false;
    const tuesday = document.getElementById("tuesday") as HTMLInputElement;
    tuesday.checked = false;
    const wednesday = document.getElementById("wednesday") as HTMLInputElement;
    wednesday.checked = false;
    const thursday = document.getElementById("thursday") as HTMLInputElement;
    thursday.checked = false;
    const friday = document.getElementById("friday") as HTMLInputElement;
    friday.checked = false;
    const saturday = document.getElementById("saturday") as HTMLInputElement;
    saturday.checked = false;
    const sunday = document.getElementById("sunday") as HTMLInputElement;
    sunday.checked = false;
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

  // getBusinessProfileName() {
  //   this.profileService.getProfileNameList().subscribe(
  //     res => {
  //       if (res.success === true) {
  //         this.profiles = res.body;
  //       } else {
  //         this.notifier.notify("danger", res.message);
  //       }
  //     },
  //     error1 => {
  //       this.notifier.notify("danger", "Can't Process This Request");
  //     }
  //   );
  // }

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

  createMembership() {
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
      this.createMembershipForm.controls.gym.value === "" ||
      this.createMembershipForm.controls.gym.value === undefined ||
      this.createMembershipForm.controls.gym.value === null
    ) {
      this.notifier.notify("danger", "Please select eligible gym..!");
    } else if (
      this.createMembershipForm.controls.duration.value.trim() === "" ||
      this.createMembershipForm.controls.duration.value === "0"
    ) {
      this.notifier.notify("danger", "Please select package type..!");
    } else if (
      this.createMembershipForm.controls.packageName.value.trim() === "" &&
      this.createMembershipForm.controls.packageType.value !== "Day Pass"
    ) {
      this.notifier.notify("danger", "Please enter a package name..!");
    } else if (
      this.createMembershipForm.controls.description.value.trim() === "" &&
      this.createMembershipForm.controls.packageType.value !== "Day Pass"
    ) {
      this.notifier.notify("danger", "Please enter description..!");
    } else if (
      this.createMembershipForm.controls.price.value.trim() === "" ||
      this.createMembershipForm.controls.price.value < 1
    ) {
      this.notifier.notify("danger", "Please enter listed price..!");
    } else if (this.createMembershipForm.controls.price.value < 100) {
      this.notifier.notify(
        "danger",
        "Listed price must be greater than or equal the 100..!"
      );
    } else if (this.createMembershipForm.controls.discount.value.trim() > 100) {
      this.notifier.notify(
        "danger",
        "Discount rate must be less-than the 100%..!"
      );
    } else if (
      this.days.length === 0 &&
      this.createMembershipForm.controls.packageType.value === "Day Pass"
    ) {
      this.notifier.notify("danger", "Please select eligible days..!");
    } else {
      this.isLoading = true;
      document.getElementById("finishButton").setAttribute("disabled", "true");
      if (this.createMembershipForm.controls.packageType.value === "Day Pass") {
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
          price: this.createMembershipForm.controls.price.value,
          discount: this.createMembershipForm.controls.discount.value,
          gymId: this.createMembershipForm.controls.gym.value,
          dayPassDTO: dayObj
        };
        this.gymMembershipService.createDayPass(req).subscribe(
          res => {
            this.isLoading = false;
            if (res.success === true) {
              this.notifier.notify(
                "success",
                "Package has been successfully added..!"
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
        const req = {
          name: this.createMembershipForm.controls.packageName.value,
          description: this.createMembershipForm.controls.description.value,
          duration: this.createMembershipForm.controls.duration.value,
          price: this.createMembershipForm.controls.price.value,
          discount: this.createMembershipForm.controls.discount.value,
          gymId: this.createMembershipForm.controls.gym.value
        };
        this.gymMembershipService.createGymMembership(req).subscribe(
          res => {
            this.isLoading = false;
            if (res.success === true) {
              this.notifier.notify(
                "success",
                "Package has been successfully added..!"
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
