import { Component, ViewChild } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { Router } from "@angular/router";
import { AuthenticationService } from "../../core/services/auth-service/authentication.Service";
import { HttpParams } from "@angular/common/http";
import { constants } from "../../shared/constant/constant";
import { NotifierService } from "angular-notifier";
import swal from "sweetalert2";
import { ModalDirective } from "ngx-bootstrap";
import {
  DomSanitizer,
  SafeResourceUrl,
  SafeUrl
} from "@angular/platform-browser";
import { ProfileManagerService } from "../../core/services/profile-manager/profile-manager.service";

@Component({
  selector: "app-pages-login",
  templateUrl: "./login.component.html",
  host: { class: "w-100 d-flex align-items-center" }
})
export class LoginComponent {
  isLoading = false;
  message: any;
  loginForm: FormGroup;
  private readonly notifier: NotifierService;
  @ViewChild("lgModal", { static: false })
  public lgModal: ModalDirective;
  agreement: SafeUrl;

  constructor(
    private sanitizer: DomSanitizer,
    private formBuilder: FormBuilder,
    private router: Router,
    private authService: AuthenticationService,
    private profileManagerService: ProfileManagerService,
    private notifierService: NotifierService
  ) {
    this.notifier = notifierService;
    this.loginForm = this.formBuilder.group({
      username: ["", [Validators.required]],
      password: ["", [Validators.required]]
    });
  }

  public finishWizard(type: string, message: string): void {
    this.notifier.notify(type, message);
  }

  public authenticate(): void {
    if (this.loginForm.controls.username.value.trim() === "") {
      this.notifier.notify("danger", "Please enter valid username..!");
    } else if (this.loginForm.controls.password.value.trim() === "") {
      this.notifier.notify("danger", "Please enter valid password..!");
    } else {
      // swal.fire({
      //   title: "Processing...",
      //   imageUrl: "assets/images/loader_ring.gif",
      //   imageHeight: 150,
      //   showCancelButton: false,
      //   showConfirmButton: false
      // });
      this.isLoading = true;
      const req = new HttpParams()
        .set("grant_type", "password")
        .set("username", this.loginForm.controls.username.value.trim())
        .set("password", this.loginForm.controls.password.value.trim());
      this.authService.authenticate(req).subscribe(
        res => {
          this.isLoading = false;
          this.message = res.message;
          localStorage.setItem(constants.access_token, res.access_token);
          localStorage.setItem(constants.refresh_token, res.refresh_token);

          localStorage.setItem(
            constants.user_role,
            res.user.authorities[0].authority
          );

          localStorage.setItem(
            constants.first_name,
            res.user.userDetails.firstName
          );
          localStorage.setItem(
            constants.last_name,
            res.user.userDetails.lastName
          );
          localStorage.setItem(constants.email, res.user.userDetails.email);
          localStorage.setItem(constants.mobile, res.user.userDetails.mobile);
          localStorage.setItem(
            constants.timeZone,
            res.user.userDetails.timeZone
          );
          localStorage.setItem(
            constants.user_name,
            res.user.userDetails.username
          );
          localStorage.setItem(constants.image, res.user.userDetails.image);
          localStorage.setItem(
            constants.studio_name,
            res.user.userDetails.studioName
          );
          localStorage.setItem(
            constants.verificationType,
            res.user.userDetails.verificationType
          );
          localStorage.setItem(
            constants.verificationNo,
            res.user.userDetails.verificationNo
          );
          localStorage.setItem(
            constants.condition,
            res.user.userDetails.conditionsAccepted
          );
          this.agreement = this.sanitizer.bypassSecurityTrustResourceUrl(
            res.user.userDetails.businessAgreement
          );
          if (
            res.user.status === "PENDING" &&
            res.user.authorities[0].authority ===
              "ROLE_BUSINESS_PROFILE_MANAGER"
          ) {
            this.router.navigate(["/change-profile-manager-password"]);
          } else if (
            res.user.status === "ACTIVE" &&
            res.user.userDetails.conditionsAccepted === false &&
            res.user.authorities[0].authority ===
              "ROLE_BUSINESS_PROFILE_MANAGER"
          ) {
            this.lgModal.show();
          } else if (
            res.user.status === "ACTIVE" &&
            res.user.userDetails.conditionsAccepted === true &&
            (res.user.authorities[0].authority ===
              "ROLE_BUSINESS_PROFILE_MANAGER" ||
              res.user.authorities[0].authority === "ROLE_SUPER_ADMIN")
          ) {
            this.router.navigate(["/dashboard"], { replaceUrl: true });
          } else if (
            res.user.authorities[0].authority !==
              "ROLE_BUSINESS_PROFILE_MANAGER" ||
            res.user.authorities[0].authority !== "ROLE_SUPER_ADMIN"
          ) {
            this.notifier.notify("danger", "Invalid User login");
          } else {
            this.notifier.notify("danger", res.message);
          }
        },
        error1 => {
          this.isLoading = false;
          swal.close();
          if (error1.status === 401) {
            this.notifier.notify("danger", error1.error.message);
          }
        }
      );
    }
  }

  isChecked(val) {
    if (val.target.checked === true) {
      document.getElementById("acceptBtn").removeAttribute("disabled");
    } else {
      document.getElementById("acceptBtn").setAttribute("disabled", "true");
    }
  }

  acceptConditions() {
    document.getElementById("acceptBtn").setAttribute("disabled", "true");
    this.isLoading = true;
    this.profileManagerService.acceptConditions().subscribe(
      res => {
        this.isLoading = false;
        if (res.success === true) {
          localStorage.setItem(constants.condition, "true");
          this.lgModal.hide();
          this.router.navigate(["/dashboard"], { replaceUrl: true });
          document.getElementById("acceptBtn").removeAttribute("disabled");
        } else {
          document.getElementById("acceptBtn").removeAttribute("disabled");
          this.notifier.notify("danger", res.message);
        }
      },
      error1 => {
        this.isLoading = false;
        document.getElementById("acceptBtn").removeAttribute("disabled");
        this.notifier.notify("danger", "Can't Process This Request");
      }
    );
  }
}
