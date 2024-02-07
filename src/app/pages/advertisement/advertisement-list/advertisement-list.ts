import { Component, ViewChild } from "@angular/core";
import { FormBuilder, FormGroup } from "@angular/forms";
import { NotifierService } from "angular-notifier";
import { ModalDirective, PageChangedEvent } from "ngx-bootstrap";
import { NgxImgComponent } from "ngx-img";
import swal from "sweetalert2";
import { AdvertisementService } from "../../../core/services/advertisement-service/advertisement.service";
import { Observable } from "rxjs";

@Component({
  selector: "advertisement-list",
  templateUrl: "./advertisement-list.html"
  // styleUrls: ['./newDealer.component.scss', './newDealer.css'],
})
export class AdvertisementList {
  isLoading = false;
  isStatus = false;
  adID: any;
  @ViewChild("ngimg", { static: false })
  public ngimg: NgxImgComponent;
  @ViewChild("createAdvertisementModal", { static: false })
  public createAdvertisementModal: ModalDirective;
  createAdvertisementForm: FormGroup;
  private readonly notifier: NotifierService;

  returnedArray: Array<any> = [];
  rotate = true;
  public numPages = 1;
  size = 10;
  page = 0;
  changePage = 0;
  totalElement: any;
  base64Image: any = undefined;
  image: any = undefined;
  textOption = {
    button: "Add Image"
  };
  /**
   * Image Uploader Configuration
   */
  options = {
    fileSize: 300,
    minWidth: 850, // minimum width of image that can be uploaded (by default 0, signifies any width)
    maxWidth: 0, // maximum width of image that can be uploaded (by default 0, signifies any width)
    minHeight: 240, // minimum height of image that can be uploaded (by default 0, signifies any height)
    maxHeight: 0, // maximum height of image that can be uploaded (by default 0, signifies any height)
    fileType: ["image/jpeg", "image/png"], // mime type of files accepted
    height: "230px", // height of cropperss
    crop: [
      // array of objects for mulitple image crop instances (by default null, signifies no cropping)
      {
        autoCropArea: 0.8, // A number between 0 and 1. Define the automatic cropping area size (percentage).
        ratio: 3.6, // ratio in which image needed to be cropped (by default null, signifies ratio to be free of any restrictions)
        minWidth: "470", // minimum width of image to be exported (by default 0, signifies any width)
        maxWidth: "470", // maximum width of image to be exported (by default 0, signifies any width)
        minHeight: 250, // minimum height of image to be exported (by default 0, signifies any height)
        maxHeight: 250, // maximum height of image to be exported (by default 0, signifies any height)
        width: 850, // width of image to be exported (by default 0, signifies any width)
        height: 240 // height of image to be exported (by default 0, signifies any height)
      }
    ]
  };

  /**
   *
   * @param formBuilder
   * @param notifierService
   * @param advertisementService
   */
  constructor(
    private formBuilder: FormBuilder,
    private notifierService: NotifierService,
    private advertisementService: AdvertisementService
  ) {
    this.notifier = notifierService;
    this.getAllAdvertisement(this.size, this.page);
    this.createAdvertisementForm = this.formBuilder.group({
      type: [""]
    });
  }

  /**
   * Change Advertisement Visibility
   */
  OnBeforeChange: Observable<boolean> = new Observable(observer => {
    if (this.isStatus === true) {
      swal
        .fire({
          title: "Are you sure?",
          text: "Are you sure you want to change visibility ?",
          icon: "warning",
          showCancelButton: true,
          confirmButtonText: "Yes",
          cancelButtonText: "No"
        })
        .then(result => {
          if (result.value) {
            this.isStatus = false;
            const req = {
              id: this.adID,
              visible: this.isStatus
            };
            this.advertisementService.changeVisibility(req).subscribe(
              res => {
                if (res.success) {
                  this.notifier.notify(
                    "success",
                    "Advertisement visibility has been successfully changed..!"
                  );
                  this.getAllAdvertisement(this.size, this.page);
                } else {
                  this.notifier.notify("warning", res.message);
                }
              },
              error1 => {
                this.notifier.notify("danger", "Can't Process This Request");
              }
            );
            return observer.next(true);
          } else if (result.dismiss === swal.DismissReason.cancel) {
            swal.close();
            this.isStatus = true;
            return observer.next(false);
          }
        });
    } else if (this.isStatus === false) {
      swal
        .fire({
          title: "Are you sure?",
          text: "Are you sure you want to change classes status ?",
          icon: "warning",
          showCancelButton: true,
          confirmButtonText: "Yes",
          cancelButtonText: "No"
        })
        .then(result => {
          if (result.value) {
            this.isStatus = true;
            const req = {
              id: this.adID,
              visible: this.isStatus
            };
            this.advertisementService.changeVisibility(req).subscribe(
              res => {
                if (res.success) {
                  this.notifier.notify(
                    "success",
                    "Advertisement visibility has been successfully changed..!"
                  );
                  this.getAllAdvertisement(this.size, this.page);
                } else {
                  this.notifier.notify("warning", res.message);
                }
              },
              error1 => {
                this.notifier.notify("danger", "Can't Process This Request");
              }
            );
            return observer.next(true);
          } else if (result.dismiss === swal.DismissReason.cancel) {
            swal.close();
            this.isStatus = false;
            return observer.next(false);
          }
        });
    }
  });

  /**
   * convert selected image to base64
   * @param e
   */
  onSelect(e) {
    this.base64Image = e;
    document.getElementById("advertisementImage").hidden = false;
  }

  /**
   * remove selected image
   */
  onReset() {
    this.base64Image = undefined;
    document.getElementById("advertisementImage").hidden = true;
  }

  /**
   * remove selected image
   */
  clearImage() {
    this.base64Image = undefined;
    this.ngimg.reset();
    document.getElementById("advertisementImage").hidden = true;
  }

  /**
   * open create Advertisement modal
   */
  showCreateAdvertisementModel() {
    this.createAdvertisementForm.controls.type.setValue("");
    this.ngimg.reset();
    this.base64Image = undefined;
    this.createAdvertisementModal.show();
  }

  /**
   * load All Advertisements
   * @param size
   * @param page
   */
  getAllAdvertisement(size, page) {
    this.advertisementService.getAllAdvertisement(size, page).subscribe(
      res => {
        if (res.success === true) {
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
  }

  /**
   * load Advertisements Data using Pagination
   * @param event
   */
  pageChanged(event: PageChangedEvent): void {
    const page = event.page - 1;
    this.changePage = page;
    this.getAllAdvertisement(this.size, page);
  }

  /**
   * get Advertisement Current Status
   * @param val
   * @param id
   */
  getAdvertisementStatus(val, id) {
    this.isStatus = val;
    this.adID = id;
  }

  /**
   * create a New Advertisement
   */
  createAdvertisement() {
    if (this.base64Image === undefined) {
      this.notifier.notify("danger", "Please upload image");
    } else {
      const req = {
        image: this.base64Image
      };
      document.getElementById("finishButton").setAttribute("disabled", "true");
      this.isLoading = true;
      this.advertisementService.createAdvertisement(req).subscribe(
        res => {
          this.isLoading = false;
          if (res.success === true) {
            this.notifier.notify(
              "success",
              "Advertisement Type has been successfully added..!"
            );
            this.createAdvertisementModal.hide();
            this.ngimg.reset();
            this.totalElement = 0;
            this.returnedArray.length = 0;
            this.getAllAdvertisement(this.size, this.page);
            // this.getAllClassType(this.size, this.changePage);
            document.getElementById("finishButton").removeAttribute("disabled");
          } else {
            this.isLoading = false;
            document.getElementById("finishButton").removeAttribute("disabled");
            this.notifier.notify("danger", res.message);
          }
        },
        error1 => {
          document.getElementById("finishButton").removeAttribute("disabled");
          this.notifier.notify("danger", "Can't Process This Request");
        }
      );
    }
  }

  /**
   * remove Advertisement
   * @param id
   */
  removeAdvertisement(id) {
    swal
      .fire({
        title: "Are you sure?",
        text: "Do you want to remove this advertisement ?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Yes",
        cancelButtonText: "No"
      })
      .then(result => {
        if (result.value) {
          this.advertisementService.deleteAdvertisement(id).subscribe(
            res => {
              if (res.success) {
                this.notifier.notify(
                  "success",
                  "Advertisement has been has been successfully removed..!"
                );
                this.getAllAdvertisement(this.size, this.page);
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
}
