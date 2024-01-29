import { Component } from "@angular/core";
import { FormBuilder, FormGroup } from "@angular/forms";
import { NotifierService } from "angular-notifier";
import { DomSanitizer, SafeUrl } from "@angular/platform-browser";
import { ThemeOptions } from "../../../theme-options";
import { UtilService } from "../../../core/services/util-service/util.service";
import { TimetableService } from "../../../core/services/timetable-service/timetable.service";

@Component({
  selector: "app-pages-error-500-content",
  templateUrl: "./pages-error-500-content.component.html",
  host: { class: "w-100 d-flex align-items-center" }
})
export class PagesError500ContentComponent {
  isLoading = false;
  isLoadingUpdate = false;
  addLanguageForm: FormGroup;
  private readonly notifier: NotifierService;
  packageType: Array<any> = [];

  profiles: Array<any> = [];
  returnedArray: Array<any> = [];
  rotate = true;
  first: "First";
  last: "List";
  public numPages = 1;
  size = 10;
  page = 0;
  id: any;
  changePage = 0;
  totalElement: any;
  UrlForm: FormGroup;
  fileUploadForm: FormGroup;
  timeTable: SafeUrl;
  timeTableUrl: any;
  pdf: File;
  pdfb64: any = undefined;

  constructor(
    public globals: ThemeOptions,
    private sanitizer: DomSanitizer,
    private formBuilder: FormBuilder,
    private notifierService: NotifierService,
    private utilService: UtilService,
    private timetableService: TimetableService
  ) {
    this.notifier = notifierService;
    this.getTimeTable();
  }

  getTimeTable() {
    this.timetableService.getTimetable().subscribe(
      res => {
        if (res.success) {
          this.timeTableUrl = res.body.fileUrl;
          this.timeTable = this.sanitizer.bypassSecurityTrustResourceUrl(
            res.body.fileUrl
          );
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
