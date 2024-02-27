import { Component } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { Router } from "@angular/router";
import { AuthenticationService } from "../../core/services/auth-service/authentication.Service";
import { HttpParams } from "@angular/common/http";
import { constants } from "../../shared/constant/constant";
import { NotifierService } from "angular-notifier";
import swal from "sweetalert2";
import {ProfileManagerService} from "../../core/services/profile-manager/profile-manager.service";

@Component({
  selector: "app-profile-manager-password-update",
  templateUrl: "./update-profile-manager-password.component.html",
  host: { class: "w-100 d-flex align-items-center" }
})
export class UpdateProfileMangerPasswordComponent {
  changePassword: FormGroup;
  private readonly notifier: NotifierService;

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private profileManagerService: ProfileManagerService,
    private notifierService: NotifierService
  ) {
    this.notifier = notifierService;
    this.changePassword = this.formBuilder.group({
      newPassword: ["", [Validators.required]],
      confirmPassword: ["", [Validators.required]]
    });
  }

  public finishWizard(type: string, message: string): void {
    this.notifier.notify(type, message);
  }

  resetPassword() {
    const newPassword = this.changePassword.controls.newPassword.value.trim();
    const confirmPassword = this.changePassword.controls.confirmPassword.value.trim();

    if (newPassword === "") {
      this.notifier.notify("danger", "Please enter new password..!");
    } else if (newPassword.length < 6) {
      this.notifier.notify(
        "danger",
        "password should at least be 6 characters..!"
      );
    } else if (confirmPassword === "") {
      this.notifier.notify("danger", "Please retype new password");
    } else if (newPassword !== confirmPassword) {
      this.notifier.notify("danger", "passwords do not match,try again..!");
    } else {
      const req = {
        newPassword: confirmPassword
      };
      this.profileManagerService.resetProfileManagerPassword(req).subscribe(
        res => {
          if (res.success === true) {
            this.notifier.notify(
              "success",
              "Password has been updated successfully..!"
            );
            this.router.navigate(["/dashboard"], { replaceUrl: true });
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
}
