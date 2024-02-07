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
