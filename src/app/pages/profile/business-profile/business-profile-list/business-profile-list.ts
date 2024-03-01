import { Component, NgZone, OnInit, ViewChild } from "@angular/core";
import { ProfileService } from "../../../../core/services/profile-service/profile.service";
import { ModalDirective, PageChangedEvent } from "ngx-bootstrap";
import { NotifierService } from "angular-notifier";
import { FormBuilder, FormGroup } from "@angular/forms";
import swal from "sweetalert2";
import { constants } from "../../../../shared/constant/constant";
import {
  CountryISO,
  SearchCountryField,
  TooltipLabel
} from "ngx-intl-tel-input";
import { MapsAPILoader } from "@agm/core";
import { ActivatedRoute, Router } from "@angular/router";
import { ProfileManagerService } from "../../../../core/services/profile-manager/profile-manager.service";
declare var google: any;
@Component({
  selector: "business-profile-list",
  templateUrl: "./business-profile-list.html",
  styleUrls: ["./business-profile-list.css"]
})
export class BusinessProfileList {
  @ViewChild("lgModal", { static: false })
  public lgModal: ModalDirective;
  @ViewChild("resendEmailModal", { static: false })
  public resendEmailModal: ModalDirective;

  private readonly notifier: NotifierService;
  profiles: Array<any> = [];
  returnedArray: Array<any> = [];
  agreementDetailsArray: Array<any> = [];
  managerDetailsArray: Array<any> = [];
  imageDetailsArray: Array<any> = [];
  keyPeopleArray: Array<any> = [];
  bankDetails: Array<any> = [];
  branchArr: Array<any> = [];
  rotate = true;
  term: any;
  coverImg: any;
  businessProfile: any;
  businessProfileID: any;
  accountStatus: any;
  size = 10;
  page = 0;
  pageNo: any = undefined;
  currentPage = 0;
  pdfFile: any;
  profileId: any;
  changePage = 0;
  totalElement: number;
  searchProfile: FormGroup;
  renewalForm: FormGroup;
  sendMailForm: FormGroup;
  moreInfoForm: FormGroup;
  bankName: string;
  userRole: string;
  accountNo: string;
  branchName: string;
  locations: any[];
  keyPeopleList: Array<any> = [];
  branchList: Array<any> = [];
  headoffice: string;
  description: string;
  profileImage: string;
  swiftCode: string;
  currency: string;
  isLoading = false;
  aggrement: File;
  agreementb64: any;
  searchTxt: any = undefined;

  @ViewChild("AgreementModal", { static: false })
  public AgreementModal: ModalDirective;
  maxDate = new Date();
  bsValue = new Date();
  amount: string;
  agreementStartDate: string;
  agreementExpire: string;
  paymentModel: string;
  status: string;
  agreementReport: string;

  latitude: number;
  longitude: number;
  zoom: number;
  address: string;

  public constructor(
    private formBuilder: FormBuilder,
    private profileService: ProfileService,
    private profileManagerService: ProfileManagerService,
    private notifierService: NotifierService,
    private mapsAPILoader: MapsAPILoader,
    private ngZone: NgZone,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.currency = constants.currency;
    this.userRole = localStorage.getItem(constants.user_role);
    if (this.userRole === "ROLE_BUSINESS_PROFILE_MANAGER") {
      this.getProfileManagerDetails(this.size, this.page);
    }
    this.searchProfile = this.formBuilder.group({
      search: [""]
    });
    this.sendMailForm = this.formBuilder.group({
      email: [""]
    });
    this.renewalForm = this.formBuilder.group({
      newStartDate: [""],
      newExpireDate: [""],
      agreement: [""]
    });
    this.route.params.subscribe(params => {
      this.pageNo = params.pageNo;
      this.searchTxt = params.searchTxt;
    });
    this.moreInfoForm = this.formBuilder.group({
      accNumber: [""],
      commission: [""],
      swiftCode: [""],
      bankName: [""],
      bankCode: [""],
      branch: [""],
      brachCode: [""],
      businessName: [""],
      email: [""],
      regNo: [""],
      phone: [""],
      profileDescription: [""],
      startDate: [""],
      expireDate: [""],
      model: [""],
      agreemtDescription: [""],
      type: [""],
      fee: [""],
      firstName: [""],
      lastName: [""],
      Username: [""],
      managerEmail: [""],
      managerMobileNo: [""]
    });
    this.notifier = notifierService;
    if (this.pageNo === undefined && this.searchTxt === undefined) {
      this.pageNo = 0;
      this.getDefaultProfileList(this.size, this.pageNo);
    } else if (this.pageNo !== "undefined" && this.searchTxt === "undefined") {
      this.getDefaultProfileList(this.size, this.pageNo);
    } else if (this.pageNo !== "undefined" && this.searchTxt !== "undefined") {
      this.searchProfile.controls.search.setValue(this.searchTxt);
      this.defaultSearchBusinessProfile(this.searchTxt, this.size, this.pageNo);
    }
  }

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
  editBusinessProfileRoute(profileName, id) {
    if (this.searchProfile.controls.search.value.trim() !== "") {
      this.router.navigate([
        "/update-profile/" +
          profileName +
          "/" +
          id +
          "/" +
          this.pageNo +
          "/" +
          this.searchProfile.controls.search.value.trim()
      ]);
    } else {
      this.router.navigate([
        "/update-profile/" + profileName + "/" + id + "/" + this.pageNo
      ]);
    }
  }

  clear() {
    this.currentPage = 1;
    this.pageNo = 0;
    this.getProfileList(this.size, this.page);
    this.totalElement = 0;
    this.returnedArray.length = 0;
  }

  filterProfile() {
    this.currentPage = 1;
    this.totalElement = 0;
    this.pageNo = 0;
    this.returnedArray.length = 0;
    this.searchBusinessProfile(this.size, this.page);
  }
  onChangeAgreementReport(file, b64) {
    this.aggrement = file.files[0];

    if (this.renewalForm.controls.paymentProof.value === "") {
      this.agreementb64 = undefined;
    } else if (this.aggrement.type !== "application/pdf") {
      this.notifier.notify("danger", "Please select only pdf file ..!");
      this.agreementb64 = "";
      this.renewalForm.controls.paymentProof.setValue("");
    } else {
      const aggrementpdf = b64.target.files[0];
      const reader = new FileReader();
      reader.readAsDataURL(aggrementpdf);
      reader.onload = () => {
        this.agreementb64 = reader.result;
      };
    }
  }
  searchBusinessProfile(size, page) {
    const filter = this.searchProfile.controls.search.value.trim();
    if (filter !== "") {
      const req = {
        data: filter
      };
      this.profileService.searchBusinessProfile(req, size, page).subscribe(
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
      this.getProfileList(size, page);
    }
  }

  viewLocation(row) {
    window.open(
      "https://maps.google.com/?q=" + row.latitude + "," + row.longitude,
      "_blank"
    );
  }
  deactivateProfile(Obj) {
    swal
      .fire({
        title: "Are you sure?",
        text: "Are you sure you want to deactivate this business profile ?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Yes",
        cancelButtonText: "No"
      })
      .then(result => {
        if (result.value) {
          this.profileService
            .changeAccountStatus(Obj.id, "INACTIVE", "")
            .subscribe(
              res => {
                if (res.success) {
                  this.notifier.notify(
                    "success",
                    "Profile has been successfully deactivated..!"
                  );
                  if (this.searchProfile.controls.search.value.trim() === "") {
                    this.getProfileList(this.size, this.pageNo);
                  } else {
                    this.searchBusinessProfile(this.size, this.pageNo);
                  }
                } else {
                  this.notifier.notify("warning", res.message);
                }
              },
              error1 => {
                this.notifier.notify("danger", "Can't Process This Request");
              }
            );
        } else if (result.dismiss === swal.DismissReason.cancel) {
          swal.close();
        }
      });
  }

  activateProfile(Obj) {
    swal
      .fire({
        title: "Are you sure?",
        text: "Are you sure you want to activate this business profile ?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Yes",
        cancelButtonText: "No"
      })
      .then(result => {
        if (result.value) {
          this.profileService
            .changeAccountStatus(Obj.id, "ACTIVE", "")
            .subscribe(
              res => {
                if (res.success) {
                  this.notifier.notify(
                    "success",
                    "Profile has been successfully activated..!"
                  );
                  if (this.searchProfile.controls.search.value.trim() === "") {
                    this.getProfileList(this.size, this.pageNo);
                  } else {
                    this.searchBusinessProfile(this.size, this.pageNo);
                  }
                } else {
                  this.notifier.notify("warning", res.message);
                }
              },
              error1 => {
                this.notifier.notify("danger", "Can't Process This Request");
              }
            );
        } else if (result.dismiss === swal.DismissReason.cancel) {
          swal.close();
        }
      });
  }

  getProfileManagerDetails(size, page) {
    this.profileService.getProfilelist(size, page).subscribe(
      res => {
        if (res.success) {
          this.returnedArray = res.body.content.filter(item => item.accountStatus !== 'Inactive');
          this.profileManagerDetails(this.returnedArray);
        } else {
          this.notifier.notify("danger", res.message);
        }
      },
      error1 => {
        this.notifier.notify("danger", "Can't Process This Request");
      }
    );
  }
  defaultSearchBusinessProfile(searchTxt, size, page) {
    if (searchTxt !== "") {
      const req = {
        data: searchTxt
      };
      this.profileService.searchBusinessProfile(req, size, page).subscribe(
        res => {
          if (res.success) {
            this.totalElement = res.body.totalElements;
            this.returnedArray = res.body.content;
            this.currentPage = Number(page) + 1;
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
  getDefaultProfileList(size, page) {
    this.profileService.getProfilelist(size, page).subscribe(
      res => {
        if (res.success) {
          this.totalElement = 1;
          this.returnedArray = res.body.content.filter(item => item.accountStatus !== 'Inactive');
          this.currentPage = Number(page) + 1;
        } else {
          this.notifier.notify("danger", res.message);
        }
      },
      error1 => {
        this.notifier.notify("danger", "Can't Process This Request");
      }
    );
  }
  getProfileList(size, page) {
    this.profileService.getProfilelist(size, page).subscribe(
      res => {
        if (res.success) {
          this.totalElement = 1;
          this.returnedArray = res.body.content.filter(item => item.accountStatus !== 'Inactive');
        } else {
          this.notifier.notify("danger", res.message);
        }
      },
      error1 => {
        this.notifier.notify("danger", "Can't Process This Request");
      }
    );
  }

  emailModal(data) {
    this.profileId = data.id;
    this.sendMailForm.controls.email.setValue("");
    this.resendEmailModal.show();
  }

  moreInfo(data) {
    this.branchArr = [];
    this.moreInfoForm.controls.businessName.setValue(data.businessName);
    this.moreInfoForm.controls.email.setValue(data.email);
    this.moreInfoForm.controls.regNo.setValue(data.businessRegistrationNumber);
    this.moreInfoForm.controls.phone.setValue(data.telephone);
    this.moreInfoForm.controls.profileDescription.setValue(data.description);
    // this.branchList = data.headOffice;
    // this.branchArr = data.branches;
    this.branchArr.push(data.headOffice);
    data.branches.forEach(val => {
      const arr = {
        addressLine1: val.addressLine1,
        addressLine2: val.addressLine2,
        city: val.city,
        country: val.country,
        id: val.id,
        latitude: val.latitude,
        longitude: val.longitude,
        name: val.name,
        postalCode: val.postalCode,
        province: val.province,
        timeZone: val.timeZone,
        type: val.type
      };
      this.branchArr.push(arr);
    });
    this.profileImage = data.profileImage;
    this.imageDetailsArray = data.images;
    this.pdfFile = data.agreementDetails[0].file;
    this.moreInfoForm.controls.accNumber.setValue(data.accountNumber);
    this.moreInfoForm.controls.swiftCode.setValue(data.swiftCode);
    this.moreInfoForm.controls.bankName.setValue(data.bankName);
    this.moreInfoForm.controls.bankCode.setValue(data.bankCode);
    this.moreInfoForm.controls.branch.setValue(data.branchName);
    this.moreInfoForm.controls.brachCode.setValue(data.branchCode);
    this.moreInfoForm.controls.startDate.setValue(
      data.agreementDetails[0].agreementStartDate
    );
    this.moreInfoForm.controls.expireDate.setValue(
      data.agreementDetails[0].agreementExpireDate
    );
    this.moreInfoForm.controls.model.setValue(data.paymentModel);
    this.moreInfoForm.controls.fee.setValue(data.amount);
    this.moreInfoForm.controls.agreemtDescription.setValue(
      data.packageDescription
    );
    this.moreInfoForm.controls.firstName.setValue(data.manager.firstName);
    this.moreInfoForm.controls.lastName.setValue(data.manager.lastName);
    this.moreInfoForm.controls.Username.setValue(data.manager.username);
    this.moreInfoForm.controls.managerEmail.setValue(data.manager.email);
    this.moreInfoForm.controls.managerMobileNo.setValue(data.manager.mobile);
    this.amount = data.amount;
    this.agreementDetailsArray = data.agreementDetails;
    this.managerDetailsArray = data.manager;
    this.keyPeopleArray = data.keyPeople;
    this.bankName = data.bankName;
    this.accountNo = data.accountNumber;
    this.branchName = data.branchName;
    this.locations = data.locations;
    this.headoffice = data.headOffice;
    this.keyPeopleList = data.keyPeople;
    this.description = data.description;
    this.swiftCode = data.swiftCode;

    this.agreementStartDate = data.agreementDetails[0].agreementStartDate;
    this.agreementExpire = data.agreementDetails[0].agreementExpireDate;
    this.paymentModel = data.paymentModel;
    this.status = data.agreementDetails[0].status;
    this.agreementReport = data.agreementDetails[0].file;

    if (data.paymentModel === "COMMISSION") {
      document.getElementById("subscriptionDiv").hidden = true;
      document.getElementById("commissionDiv").hidden = false;
      this.moreInfoForm.controls.commission.setValue(data.amount + "%");
    } else {
      document.getElementById("commissionDiv").hidden = true;
      document.getElementById("subscriptionDiv").hidden = false;
      this.moreInfoForm.controls.fee.setValue(data.amount);
    }

    this.lgModal.show();
  }

  sendMail() {
    const pattern = new RegExp(
      "[A-Za-z0-9._%-]+@[A-Za-z0-9._%-]+\\.[a-z]{2,3}"
    );
    const validEmail = pattern.test(
      this.sendMailForm.controls.email.value.trim()
    );
    if (this.sendMailForm.controls.email.value.trim() === "") {
      this.notifier.notify("danger", "Please enter email address..!");
    } else if (validEmail === false) {
      this.notifier.notify("danger", "Please enter valid email address..!");
    } else {
      document.getElementById("finishButton").setAttribute("disabled", "true");
      this.isLoading = true;
      this.profileManagerService
        .resendEmail(this.profileId, this.sendMailForm.controls.email.value)
        .subscribe(
          res => {
            if (res.success) {
              this.notifier.notify(
                "success",
                "Account activation email has been successfully resend..!"
              );
              document
                .getElementById("finishButton")
                .removeAttribute("disabled");
              this.isLoading = false;
              this.resendEmailModal.hide();
            } else {
              document
                .getElementById("finishButton")
                .removeAttribute("disabled");
              this.isLoading = false;
              this.notifier.notify("warning", res.message);
            }
          },
          error1 => {
            document.getElementById("finishButton").removeAttribute("disabled");
            this.isLoading = false;
            this.notifier.notify("danger", "Can't Process This Request");
          }
        );
    }
  }

  profileManagerDetails(data) {
    this.businessProfile = data[0].businessName;
    this.businessProfileID = data[0].id;
    this.accountStatus = data[0].accountStatus;
    this.branchArr = [];
    this.moreInfoForm.controls.businessName.setValue(data[0].businessName);
    this.moreInfoForm.controls.email.setValue(data[0].email);
    this.moreInfoForm.controls.regNo.setValue(
      data[0].businessRegistrationNumber
    );
    this.moreInfoForm.controls.phone.setValue(data[0].telephone);
    this.moreInfoForm.controls.profileDescription.setValue(data[0].description);
    // this.branchList = data.headOffice;
    // this.branchArr = data.branches;
    this.branchArr.push(data[0].headOffice);
    data[0].branches.forEach(val => {
      const arr = {
        addressLine1: val.addressLine1,
        addressLine2: val.addressLine2,
        city: val.city,
        country: val.country,
        id: val.id,
        latitude: val.latitude,
        longitude: val.longitude,
        name: val.name,
        postalCode: val.postalCode,
        province: val.province,
        timeZone: val.timeZone,
        type: val.type
      };
      this.branchArr.push(arr);
    });
    this.profileImage = data[0].profileImage;
    this.imageDetailsArray = data[0].images;
    this.pdfFile = data[0].agreementDetails[0].file;
    this.moreInfoForm.controls.accNumber.setValue(data[0].accountNumber);
    this.moreInfoForm.controls.swiftCode.setValue(data[0].swiftCode);
    this.moreInfoForm.controls.bankName.setValue(data[0].bankName);
    this.moreInfoForm.controls.bankCode.setValue(data[0].bankCode);
    this.moreInfoForm.controls.branch.setValue(data[0].branchName);
    this.moreInfoForm.controls.brachCode.setValue(data[0].branchCode);
    this.moreInfoForm.controls.startDate.setValue(
      data[0].agreementDetails[0].agreementStartDate
    );
    this.moreInfoForm.controls.expireDate.setValue(
      data[0].agreementDetails[0].agreementExpireDate
    );
    this.moreInfoForm.controls.model.setValue(data[0].paymentModel);
    this.moreInfoForm.controls.fee.setValue(data[0].amount);
    this.moreInfoForm.controls.agreemtDescription.setValue(
      data[0].packageDescription
    );
    this.moreInfoForm.controls.firstName.setValue(data[0].manager.firstName);
    this.moreInfoForm.controls.lastName.setValue(data[0].manager.lastName);
    this.moreInfoForm.controls.Username.setValue(data[0].manager.username);
    this.moreInfoForm.controls.managerEmail.setValue(data[0].manager.email);
    this.moreInfoForm.controls.managerMobileNo.setValue(data[0].manager.mobile);
    this.amount = data[0].amount;
    this.agreementDetailsArray = data[0].agreementDetails;
    this.managerDetailsArray = data[0].manager;
    this.keyPeopleArray = data[0].keyPeople;
    this.bankName = data[0].bankName;
    this.accountNo = data[0].accountNumber;
    this.branchName = data[0].branchName;
    this.locations = data[0].locations;
    this.headoffice = data[0].headOffice;
    this.keyPeopleList = data[0].keyPeople;
    this.description = data[0].description;
    this.swiftCode = data[0].swiftCode;

    this.agreementStartDate = data[0].agreementDetails[0].agreementStartDate;
    this.agreementExpire = data[0].agreementDetails[0].agreementExpireDate;
    this.paymentModel = data[0].paymentModel;
    this.status = data[0].agreementDetails[0].status;
    this.agreementReport = data[0].agreementDetails[0].file;
    if (data[0].paymentModel === "COMMISSION") {
      document.getElementById("managerSubscriptionDiv").hidden = true;
      document.getElementById("managerCommissionDiv").hidden = false;
      this.moreInfoForm.controls.commission.setValue(data[0].amount + "%");
    } else {
      document.getElementById("managerCommissionDiv").hidden = true;
      document.getElementById("managerSubscriptionDiv").hidden = false;
      this.moreInfoForm.controls.fee.setValue(data[0].amount);
    }
  }

  pageChanged(event: PageChangedEvent): void {
    const page = event.page - 1;
    this.changePage = page;
    this.pageNo = page;
    if (this.searchProfile.controls.search.value.trim() === "") {
      this.getProfileList(this.size, page);
    } else {
      this.searchBusinessProfile(this.size, page);
    }
  }
}
