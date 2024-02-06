import { Injectable } from "@angular/core";

@Injectable()
export class ThemeOptions {
  // Header

  hoverHeaderSearch = false;
  toggleHeaderDrawer = false;
  headerFixed = true;
  headerShadow = true;
  headerTransparentBg = true;

  // Sidebar

  toggleSidebar = false;
  toggleSidebarMobile = false;
  sidebarBackground = "bg-slick-carbon";
  sidebarBackgroundStyle = "dark";
  sidebarFixed = true;
  sidebarLighterStyle = false;
  sidebarShadow = true;
  sidebarFooter = true;
  sidebarUserbox = false;

  // Footer

  footerFixed = false;
  footerShadow = false;
  footerTransparentBg = true;

  // Page title

  pageTitleIconBox = false;
  pageTitleBreadcrumb = false;
  pageTitleDescription = true;
  pageTitleShadow = true;
  pageTitleStyle = "app-page-title-alt-1";
  pageTitleBackground = "";

  // Main content

  contentBackground = "";
}
