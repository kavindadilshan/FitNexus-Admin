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
import { constants } from "../../../../shared/constant/constant";

@Component({
  selector: "new-membership-form",
  templateUrl: "./new-membership.html"
})
export class NewMembership implements OnInit {
  isLoading = false;
  isPayment = false;
  status: boolean;
  paymentModel: any;
  private readonly notifier: NotifierService;
  private unsubscribeAll: Subject<any>;
  base64Image: any = undefined;
  textLength: any = 0;
  id: any;
  className: any;
  classId: any;
  changePage: number;
  toggle: any = false;
  images: Array<any> = [];
  arr: Array<any> = [];
  myString: any;
  days: any = 7;
  keyPeople: any;
  classType: Array<any> = [];
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
  currency: any;

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
    private utilService: UtilService,
    private activatedRoute: ActivatedRoute
  ) {
    this.currency = constants.currency;
    this.notifier = notifierService;
    this.unsubscribeAll = new Subject();
    // this.getBusinessProfileName();
    this.classObj = new ClassDTO();
    this.activatedRoute.params.subscribe(params => {
      this.id = params.profileId;
      this.classId = params.classId;
      this.className = params.className;
      this.paymentModel = params.paymentModel;
    });
    if (this.paymentModel !== "COMMISSION") {
      this.status = false;
    } else {
      this.status = true;
    }
  }
  ngOnInit(): void {
    this.getClasses(this.id);
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
    this.selectedClass = this.classId;
    return this.formBuilder.group({
      packageName: [""],
      description: [""],
      duration: ["7"],
      price: [""],
      slots: [""],
      discount: [""],
      classes: [""]
    });
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

  changePackage(val) {
    if (val === "7") {
      this.days = 7;
    } else if (val === "14") {
      this.days = 14;
    } else if (val === "30") {
      this.days = 30;
    } else if (val === "60") {
      this.days = 60;
    } else if (val === "90") {
      this.days = 90;
    } else if (val === "120") {
      this.days = 120;
    } else if (val === "180") {
      this.days = 180;
    } else if (val === "365") {
      this.days = 365;
    } else {
      this.days = "0";
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
  getClasses(id) {
    this.membershipService.getClassDetailsByProfileId(id).subscribe(
      res => {
        if (res.success === true) {
          this.classes = res.body;
        } else {
          this.notifier.notify("danger", res.message);
        }
        this.selectedClass = [this.className];
      },
      error1 => {
        this.notifier.notify("danger", "Can't Process This Request");
      }
    );
  }
  allowPayment(val) {
    this.isPayment = val;
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
          this.router.navigate([
            "/classes-memberships-list/" +
              this.id +
              "/" +
              this.className +
              "/" +
              this.classId +
              "/" +
              this.paymentModel
          ]);
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
  checkValue(val) {
    if (val + "" === this.classId + "") {
      return true;
    } else {
      return false;
    }
  }
  createMembership() {
    if (this.createMembershipForm.controls.packageName.value.trim() === "") {
      this.notifier.notify("danger", "Please enter package name..!");
    } else if (
      this.createMembershipForm.controls.description.value.trim() === ""
    ) {
      this.notifier.notify("danger", "Please enter description..!");
    } else if (this.days === "" || this.days === "0") {
      this.notifier.notify("danger", "Please select package duration..!");
    } else if (
      this.createMembershipForm.controls.slots.value.trim() === "" ||
      this.createMembershipForm.controls.slots.value === "0"
    ) {
      this.notifier.notify("danger", "Please enter valid number of slots..!");
    } else if (this.createMembershipForm.controls.price.value.trim() === "") {
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
    } else if (this.createMembershipForm.controls.classes.value.length === 0) {
      this.notifier.notify("danger", "Please select eligible class..!");
    } else {
      let classId = [];
      if (
        this.createMembershipForm.controls.classes.value[0] === this.className
      ) {
        classId.push(this.classId);
      } else {
        classId = this.createMembershipForm.controls.classes.value;
      }
      this.isLoading = true;
      document.getElementById("finishButton").setAttribute("disabled", "true");
      const req = {
        name: this.createMembershipForm.controls.packageName.value,
        description: this.days,
        duration: this.createMembershipForm.controls.duration.value,
        slotCount: this.createMembershipForm.controls.slots.value,
        price: this.createMembershipForm.controls.price.value,
        discount: this.createMembershipForm.controls.discount.value,
        allowCashPayment: this.isPayment,
        physicalClassIdList: classId
      };
      this.membershipService.createClassMembership(req).subscribe(
        res => {
          this.isLoading = false;
          if (res.success === true) {
            this.notifier.notify(
              "success",
              "Package has been successfully added..!"
            );
            this.router.navigate([
              "/classes-memberships-list/" +
                this.id +
                "/" +
                this.className +
                "/" +
                this.classId +
                "/" +
                this.paymentModel
            ]);
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
