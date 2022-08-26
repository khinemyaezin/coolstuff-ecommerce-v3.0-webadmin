import { APP_INITIALIZER, ErrorHandler, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ServiceWorkerModule } from '@angular/service-worker';
import { QuillModule } from 'ngx-quill';
import { environment } from 'src/environments/environment';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ImageCropperModule } from 'ngx-image-cropper';
import { SignInComponent } from './auth/sign-in/sign-in.component';
import { ServerService } from './services/server.service';
import { SellerHomeComponent } from './seller/seller-home/seller-home.component';
import { AdminHomeComponent } from './admin/admin-home/admin-home.component';
import { NavBarAdminComponent } from './core-components/nav-bar-admin/nav-bar-admin.component';
import { MenusPannelComponent } from './core-components/menus-pannel/menus-pannel.component';
import { TextEditorComponent } from './core-components/text-editor/text-editor.component';
import { ProductSetupComponent } from './seller/product-setup/product-setup.component';
import { ProductAdditionalSetupComponent } from './seller/product-additional-setup/product-additional-setup.component';
import { BootstrapModelComponent } from './core-components/bootstrap-model/bootstrap-model.component';
import { ImageCropperModelComponent } from './core-components/image-cropper-model/image-cropper-model.component';
import { InventoryComponent } from './seller/inventory/inventory.component';
import { LoadingComponent } from './core-components/loading/loading.component';
import { PaginationComponent } from './core-components/pagination/pagination.component';
import { AuthRouteHandlerService } from './services/auth-route-handler.service';
import { DatePipe } from '@angular/common';
import { MediaChooserComponent } from './core-components/media-chooser/media-chooser.component';
import { BackButtonDirective } from './core-components/back-button.directive';
import { DialogConfirmComponent } from './core-components/dialog-confirm/dialog-confirm.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ProfileComponent } from './seller/profile/profile.component';
import { TextEditorDirective } from './core-components/text-editor.directive';
import { DatePickerDirective } from './core-components/date-picker.directive';
import { ToastComponent } from './core-components/toast/toast.component';
import { NgxMaskModule } from 'ngx-mask';
import { LineThroughDirective } from './core-components/line-through.directive';
import { FileInputDirective } from './core-components/file-input.directive';
import { Router } from '@angular/router';
// const config: SocketIoConfig = {
//   url: 'http://localhost:8084',
//   options: { autoConnect: false },
// };
@NgModule({
  declarations: [
    AppComponent,
    SignInComponent,
    SellerHomeComponent,
    AdminHomeComponent,
    NavBarAdminComponent,
    MenusPannelComponent,
    TextEditorComponent,
    ProductSetupComponent,
    ProductAdditionalSetupComponent,
    InventoryComponent,
    BootstrapModelComponent,
    ImageCropperModelComponent,
    LoadingComponent,
    PaginationComponent,
    MediaChooserComponent,
    BackButtonDirective,
    DialogConfirmComponent,
    ProfileComponent,
    TextEditorDirective,
    DatePickerDirective,
    ToastComponent,
    LineThroughDirective,
    FileInputDirective,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    ServiceWorkerModule.register('ngsw-worker.js', {
      enabled: environment.production,
    }),
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    ImageCropperModule,
    QuillModule.forRoot(),
    NgxMaskModule.forRoot(),
    NgbModule,
    //SocketIoModule.forRoot(config),
  ],
  providers: [
    DatePipe,
    ServerService,
    // {
    //   // processes all errors
    //   provide: HTTP_INTERCEPTORS,
    //   useFactory: function(router: Router) {
    //     return new AuthRouteHandlerService(router);
    //   },
    //   multi: true,
    //   deps: [Router]
    // },
    {
      provide: APP_INITIALIZER,
      useFactory: (config: ServerService) => () => config.init(),
      deps: [ServerService],
      multi: true,
    },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
