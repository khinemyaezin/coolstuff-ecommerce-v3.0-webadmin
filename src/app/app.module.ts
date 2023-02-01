import { APP_INITIALIZER, ErrorHandler, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ServiceWorkerModule } from '@angular/service-worker';
import {  QuillModule } from 'ngx-quill';
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
import { ImageCropperModelComponent } from './core-components/image-cropper-model/image-cropper-model.component';
import { InventoryComponent } from './seller/inventory/inventory.component';
import { LoadingComponent } from './core-components/loading/loading.component';
import { PaginationComponent } from './core-components/pagination/pagination.component';
import { DatePipe } from '@angular/common';
import { MediaChooserComponent } from './core-components/media-chooser/media-chooser.component';
import { BackButtonDirective } from './directive/back-button.directive';
import { DialogConfirmComponent } from './core-components/dialog-confirm/dialog-confirm.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ProfileComponent } from './seller-setting/profile/profile.component';
import { ToastComponent } from './core-components/toast/toast.component';
import { NgxMaskModule } from 'ngx-mask';
import { RegisterComponent } from './seller/register/register.component';
import { AttributesComponent } from './admin/attributes/attributes.component';
import { MediaChooserModelComponent } from './core-components/media-chooser-model/media-chooser-model.component';

import { OptionGroupFilterPipe } from './seller/product-setup/option-group-filter.pipe';
import { TypeaheadCustomComponent } from './core-components/typeahead-custom/typeahead-custom.component';
import { CategoryBreadcrumbPipe } from './pipe/category-breadcrumb.pipe';
import { PasswordStrengthMeterModule } from 'angular-password-strength-meter';
import { UserControlsMenuComponent } from './core-components/user-controls-menu/user-controls-menu.component';
import { DepartmentsComponent } from './admin/departments/departments.component';
import { PagenotfoundComponent } from './core-components/pagenotfound/pagenotfound.component';
import { Router } from '@angular/router';
import { HttpErrorHandlerService } from './services/http-error-handler.service';
import { PopupService } from './services/popup.service';
import { ProductPropertiesComponent } from './admin/product-properties/product-properties.component';
import { ProductPropertiesDetailComponent } from './admin/product-properties-detail/product-properties-detail.component';
import { GlobalErrorHandlerService } from './services/global-error-handler.service';
import { ConfirmationBoxComponent } from './core-components/confirmation-box/confirmation-box.component';
import { StoreSettingComponent } from './seller-setting/store-setting/store-setting.component';
import { LocationsComponent } from './seller-setting/locations/locations.component';
import { LocationDetailComponent } from './seller-setting/location-detail/location-detail.component';
import { BrandSettingComponent } from './seller-setting/brand-setting/brand-setting.component';
import { UsersAndPermissionComponent } from './seller-setting/users-and-permission/users-and-permission.component';
import { PasswordChangeComponent } from './core-components/password-change/password-change.component';
import { AttributeSelectorComponent } from './seller/product-setup/attribute-selector/attribute-selector.component';
import { SessionDevicesComponent } from './core-components/session-devices/session-devices.component';
import { RolesUserComponent } from './core-components/access/roles-user/roles-user.component';
import { RolesManagerComponent } from './core-components/access/roles-manager/roles-manager.component';
import { UserProfileComponent } from './core-components/user-profile/user-profile.component';
import { ModelCardSwitcherDirective } from './directive/model-card-switcher.directive';
import { DatePickerDirective } from './directive/date-picker.directive';
import { FileInputDirective } from './directive/file-input.directive';
import { ImageDirective } from './directive/image.directive';
import { LineThroughDirective } from './directive/line-through.directive';
import { PasswordsInputDirective } from './directive/passwords-input.directive';
import { ProductStatusDirective } from './directive/product-status.directive';
import { RadioInputDirective } from './directive/radio-input.directive';
import { ValidationDirective } from './directive/validation.directive';
import { DefaultEmptyStringPipe } from './pipe/default-empty-string.pipe';
import { IsIdPipe } from './pipe/is-id.pipe';
import { UserAgentPipe } from './pipe/user-agent.pipe';
import { VariantOptionVisibilityPipe } from './pipe/variant-option-visibility.pipe';
import { ProfitMarginCalculatorComponent } from './core-components/profit-margin-calculator/profit-margin-calculator.component';
import { ProfitMarginCalculatorBtnDirective } from './directive/profit-margin-calculator-btn.directive';
import { IMaskModule } from 'angular-imask';
import { NgxCurrencyModule } from 'ngx-currency';
import { StoreDashboardComponent } from './seller/store-dashboard/store-dashboard.component';
import { NgxChartsModule } from '@swimlane/ngx-charts';


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
    InventoryComponent,
    ImageCropperModelComponent,
    LoadingComponent,
    PaginationComponent,
    MediaChooserComponent,
    BackButtonDirective,
    DialogConfirmComponent,
    ProfileComponent,
    DatePickerDirective,
    ToastComponent,
    LineThroughDirective,
    FileInputDirective,
    RegisterComponent,
    AttributesComponent,
    MediaChooserModelComponent,
    RadioInputDirective,
    ValidationDirective,
    ImageDirective,
    OptionGroupFilterPipe,
    TypeaheadCustomComponent,
    CategoryBreadcrumbPipe,
    PasswordsInputDirective,
    UserControlsMenuComponent,
    DepartmentsComponent,
    PagenotfoundComponent,
    ProductPropertiesComponent,
    ProductPropertiesDetailComponent,
    ConfirmationBoxComponent,
    ProductStatusDirective,
    StoreSettingComponent,
    LocationsComponent,
    LocationDetailComponent,
    BrandSettingComponent,
    UsersAndPermissionComponent,
    PasswordChangeComponent,
    AttributeSelectorComponent,
    DefaultEmptyStringPipe,
    SessionDevicesComponent,
    UserAgentPipe,
    RolesUserComponent,
    RolesManagerComponent,
    IsIdPipe,
    UserProfileComponent,
    ModelCardSwitcherDirective,
    VariantOptionVisibilityPipe,
    ProfitMarginCalculatorComponent,
    ProfitMarginCalculatorBtnDirective,
    StoreDashboardComponent,
  ],
  imports: [
    NgxChartsModule,
    BrowserModule,
    AppRoutingModule,
    ServiceWorkerModule.register('ngsw-worker.js', {
      enabled: environment.production,
    }),
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    ImageCropperModule,

    QuillModule.forRoot({
      modules: {
        toolbar: [
          ['bold', 'italic', 'underline'],
          [{ list: 'ordered' }, { list: 'bullet' }],
        ],
      },
      theme: 'snow',
      placeholder: 'Description',
    }),
    NgxMaskModule.forRoot(),
    NgbModule,
    //SocketIoModule.forRoot(config),
    PasswordStrengthMeterModule.forRoot(),
    IMaskModule,
    NgxCurrencyModule

  ],
  providers: [
    DatePipe,
    ServerService,
    { provide: ErrorHandler, useClass: GlobalErrorHandlerService },
    {
      // processes all errors
      provide: HTTP_INTERCEPTORS,
      useFactory: function (router: Router, popup: PopupService) {
        return new HttpErrorHandlerService(router, popup);
      },
      multi: true,
      deps: [Router],
    },
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
