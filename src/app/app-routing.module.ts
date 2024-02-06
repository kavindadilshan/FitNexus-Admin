import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";

import { PagesRegisterComponent } from "./example-pages/pages-register/pages-register.component";
import { PagesRecoverPasswordComponent } from "./example-pages/pages-recover-password/pages-recover-password.component";

import { PagesError404Component } from "./example-pages/pages-error-404/pages-error-404.component";
import { PagesError500Component } from "./example-pages/pages-error-500/pages-error-500.component";
import { PagesError505Component } from "./example-pages/pages-error-505/pages-error-505.component";


// Layouts


import { MinimalLayoutComponent } from "./layout-blueprints/minimal-layout/minimal-layout.component";

import { LoginComponent } from "./pages/login/login.component";


const routes: Routes = [

  {
    path: "",
    component: MinimalLayoutComponent,
    children: [
      { path: "login", component: LoginComponent },
      {
        path: "change-profile-manager-password",
        component: UpdateProfileMangerPasswordComponent
      },
      { path: "pages-register", component: PagesRegisterComponent },
      {
        path: "pages-recover-password",
        component: PagesRecoverPasswordComponent
      },
      { path: "pages-error-404", component: PagesError404Component },
      { path: "pages-error-500", component: PagesError500Component },
      { path: "pages-error-505", component: PagesError505Component }
    ]
  },

  { path: "**", redirectTo: "" }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {
      // useHash: true,
      scrollPositionRestoration: "enabled",
      anchorScrolling: "enabled"
    })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
