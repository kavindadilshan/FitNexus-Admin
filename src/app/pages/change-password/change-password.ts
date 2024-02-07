import { Component } from "@angular/core";
import { ThemeOptions } from "../../theme-options";
import { NotifierService } from "angular-notifier";
import { FormBuilder, FormGroup } from "@angular/forms";
import { Router } from "@angular/router";
import { AuthenticationService } from "../../core/services/auth-service/authentication.Service";

@Component({
  selector: "change-password",
  templateUrl: "./change-password.html"
})
export class ChangePassword {
  private readonly notifier: NotifierService;
  isLoading = false;
  updatePassword: FormGroup;

  /**
   * @param globals
   * @param formBuilder
   * @param router
   * @param notifierService
   * @param authenticationService
   */
  constructor(
    public globals: ThemeOptions,
    private formBuilder: FormBuilder,
    private router: Router,
    private notifierService: NotifierService,
    private authenticationService: AuthenticationService
  ) {
    this.notifier = notifierService;
    this.updatePassword = this.formBuilder.group({
      oldPassword: [""],
      newPassword: [""],
      confirmPassword: [""]
    });
  }

  /***
   * Update Account Password
   */
  changePassword() {
    const currentPassword = this.updatePassword.controls.oldPassword.value.trim();
    const newPassword = this.updatePassword.controls.newPassword.value.trim();
    const confirmPassword = this.updatePassword.controls.confirmPassword.value.trim();

    if (currentPassword === "") {
      this.notifier.notify("danger", "Please enter old password..!");
    } else if (newPassword === "") {
      this.notifier.notify("danger", "Please enter new password..!");
    } else if (newPassword.length < 6) {
      this.notifier.notify(
        "danger",
        "Password should be at least 6 characters..!"
      );
    } else if (confirmPassword === "") {
      this.notifier.notify("danger", "Please retype new password");
    } else if (newPassword !== confirmPassword) {
      this.notifier.notify("danger", "passwords do not match,try again..!");
    } else {

    }
  }

  /**
   * Clear Form Fields
   */
  clearForm() {
    this.updatePassword.controls.oldPassword.setValue("");
    this.updatePassword.controls.newPassword.setValue("");
    this.updatePassword.controls.confirmPassword.setValue("");
  }
}
