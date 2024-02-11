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
import swal from "sweetalert2";
import { NgxImgComponent } from "ngx-img";
import { error } from "util";
import * as $ from "jquery";
import { WizardComponent } from "angular-archwizard";
import { ThemeOptions } from "../../../../theme-options";
import { ProfileService } from "../../../../core/services/profile-service/profile.service";
import { ClassService } from "../../../../core/services/class-service/class.service";
import { CoachProfileService } from "../../../../core/services/profile-service/coach-profile.service";
import { PhysicalClassSerivce } from "../../../../core/services/class-service/physical-classs-service/physical-class.serivce";

@Component({
  selector: "create-physical-class",
  templateUrl: "./create-physical-class.html"
})
export class CreatePhysicalClass {
  isLoading = false;
  @ViewChild("ngCoverImg", { static: false })
  public coverImg: NgxImgComponent;
  @ViewChild("ngimg", { static: false })
  public ngProfileImage: NgxImgComponent;
  @ViewChild("wizardComponent", { static: false })
  public wizardComponent: WizardComponent;
  private readonly notifier: NotifierService;
  base64Image: any = undefined;
  profileImage: any = undefined;
  characterLength: any = 0;
  textLength: any = 0;
  images: Array<any> = [];
  myString: any;
  keyPeople: any;
  classType: Array<any> = [];
  profiles: Array<any> = [];
  trainers: Array<any> = [];
  maxDate = new Date();
  bsValue = new Date();
  mytime: Date = new Date();
  sessionFree = "true";
  id: any;
  name: any;

  payment: File;
  paymentb64: any;
  aggrement: File;
  agreementb64: any;

  createClassForm: FormGroup;

  constructor(
    public globals: ThemeOptions,
    private formBuilder: FormBuilder,
    private router: Router,
    private notifierService: NotifierService,
    private profileService: ProfileService,
    private coachProfileService: CoachProfileService,
    private physicalClassSerivce: PhysicalClassSerivce,
    private classService: ClassService,
    private activatedRoute: ActivatedRoute
  ) {
    this.notifier = notifierService;
    this.getClassType();
    this.activatedRoute.params.subscribe(params => {
      this.id = params.id;
      this.name = params.name;
    });
    this.getTrainerList(this.id);
    this.createClassForm = this.formBuilder.group({
      className: [""],
      businessProfile: [""],
      calorieBurnOut: [""],
      classType: [""],
      trainer: [""],
      howToPrepare: [""],
      description: [""],
      videoURl: [""]
    });
  }
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

  checkPackgeModel(evt) {
    this.sessionFree = evt.target.value;
  }

  numberOnly(event): boolean {
    const charCode = event.which ? event.which : event.keyCode;
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
      return false;
    }
    return true;
  }

  checkCharacterLength() {
    this.characterLength = this.createClassForm.controls.description.value.length;
  }

  checkLength() {
    this.textLength = this.createClassForm.controls.howToPrepare.value.length;
  }

  newLinePress(e) {
    const val = this.createClassForm.controls.description.value;
    if (e.key === "Enter") {
      this.createClassForm.controls.description.setValue(val + "\n");
    }
  }

  prepareDescriptionNewLine(e) {
    const val = this.createClassForm.controls.howToPrepare.value;
    if (e.key === "Enter") {
      this.createClassForm.controls.howToPrepare.setValue(val + "\n");
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

  clear() {
    this.profileImage = undefined;
    this.ngProfileImage.reset();
    document.getElementById("profileImagePreview").hidden = true;
  }

  onReset() {
    this.base64Image = undefined;
    document.getElementById("imgPreviewTable").hidden = true;
  }
  onResetCover() {
    this.coverImg.reset();
    this.base64Image = undefined;
    document.getElementById("imgPreviewTable").hidden = true;
  }
  removeImageList(rowobj) {
    this.images = this.images.filter(obj => obj.img !== rowobj);
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
          this.router.navigate(["/physical-classes/" + this.id]);
        } else if (result.dismiss === swal.DismissReason.cancel) {
          swal.close();
        }
      });
  }

  getClassType() {
    this.classService.getClassType().subscribe(
      res => {
        if (res.success === true) {
          res.body.forEach(val => {
            const type = { id: val.id, typeName: val.typeName };
            this.classType.push(type);
          });
        } else {
          this.notifier.notify("danger", res.message);
        }
      },
      error1 => {
        this.notifier.notify("danger", "Can't Process This Request");
      }
    );
  }

  getBusinessProfileName() {
    this.profileService.getProfileNameList().subscribe(
      res => {
        if (res.success === true) {
          this.profiles = res.body;
        } else {
          this.notifier.notify("danger", res.message);
        }
      },
      error1 => {
        this.notifier.notify("danger", "Can't Process This Request");
      }
    );
  }

  getTrainerList(Id) {
    this.coachProfileService.getTrainersByProfileId(Id).subscribe(
      res => {
        if (res.success === true) {
          this.trainers = res.body;
          if (this.trainers.length === 0) {
            this.notifier.notify("danger", "Trainers Not Available");
          }
        } else {
          this.notifier.notify("danger", res.message);
        }
      },
      error1 => {
        this.notifier.notify("danger", "Can't Process This Request");
      }
    );
  }
  clearProfileImage() {
    document.getElementById("profileImagePreview").hidden = true;
  }

  autoScrollClassInformationWizard() {
    $("html, body").animate(
      {
        scrollTop: $("#wizard1").offset().top
      },
      1000
    );
  }

  autoScrollGalleryWizard() {
    $("html, body").animate(
      {
        scrollTop: $("#wizard2").offset().top
      },
      1000
    );
  }

  autoScrollMoreInfoWizard() {
    $("html, body").animate(
      {
        scrollTop: $("#wizard3").offset().top
      },
      1000
    );
  }

  clickClassInformationWizard() {
    if (this.createClassForm.controls.className.value.trim() === "") {
      this.notifier.notify("danger", "Please enter a class name..!");
    } else if (this.createClassForm.controls.description.value.trim() === "") {
      this.notifier.notify("danger", "Please enter description..!");
    } else if (
      this.createClassForm.controls.classType.value === "" ||
      this.createClassForm.controls.classType.value === null
    ) {
      this.notifier.notify("danger", "Please select class type..!");
    } else {
      this.wizardComponent.goToNextStep();
      this.autoScrollGalleryWizard();
    }
  }

  clickGalleryWizard() {
    if (this.profileImage === undefined || this.profileImage === "") {
      this.notifier.notify("danger", "Please upload profile image..!");
    } else if (document.getElementById("imgPreviewTable").hidden === false) {
      this.notifier.notify(
        "danger",
        "Please confirm the cover images to proceed..!"
      );
    } else if (this.images.length === 0) {
      this.notifier.notify("danger", "Please upload  cover images..!");
    } else {
      this.wizardComponent.goToNextStep();
      this.autoScrollMoreInfoWizard();
    }
  }

  createClass() {
    if (
      this.createClassForm.controls.trainer.value === "" ||
      this.createClassForm.controls.trainer.value === null ||
      this.createClassForm.controls.trainer.value.length === 0
    ) {
      this.notifier.notify("danger", "Please select trainer..!");
    } else if (this.createClassForm.controls.howToPrepare.value.trim() === "") {
      this.notifier.notify("danger", "Please enter how to prepare..!");
    } else {
      const ImgArr = [];
      this.images.forEach(val => {
        ImgArr.push(val.img);
      });

      let firstSessionFee;
      if (this.sessionFree === "true") {
        firstSessionFee = true;
      } else {
        firstSessionFee = false;
      }
      this.isLoading = true;
      document.getElementById("finishButton").setAttribute("disabled", "true");
      const req = {
        name: this.createClassForm.controls.className.value.trim(),
        classTypeId: this.createClassForm.controls.classType.value,
        calorieBurnOut: this.createClassForm.controls.calorieBurnOut.value.trim(),
        firstSessionFree: firstSessionFee,
        howToPrepare: this.createClassForm.controls.howToPrepare.value.trim(),
        description: this.createClassForm.controls.description.value.trim(),
        businessProfileId: this.id,
        trainerIdList: this.createClassForm.controls.trainer.value,
        images: ImgArr,
        profileImage: this.profileImage,
        youtubeUrl: this.createClassForm.controls.videoURl.value.trim()
      };
      this.physicalClassSerivce.createPhysicalClass(req).subscribe(
        res => {
          this.isLoading = false;
          if (res.success === true) {
            this.notifier.notify(
              "success",
              "Class has been successfully added..!"
            );
            this.router.navigate(["/physical-classes/" + this.id]);
            document.getElementById("finishButton").removeAttribute("disabled");
          } else {
            document.getElementById("finishButton").removeAttribute("disabled");
            this.notifier.notify("danger", res.message);
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
