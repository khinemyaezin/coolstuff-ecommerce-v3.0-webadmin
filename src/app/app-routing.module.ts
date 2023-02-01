import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminHomeComponent } from './admin/admin-home/admin-home.component';
import { AdminGuard } from './admin/admin.guard';
import { AttributesComponent } from './admin/attributes/attributes.component';
import { DepartmentsComponent } from './admin/departments/departments.component';
import { ProductPropertiesDetailComponent } from './admin/product-properties-detail/product-properties-detail.component';
import { ProductPropertiesComponent } from './admin/product-properties/product-properties.component';
import { SignInComponent } from './auth/sign-in/sign-in.component';
import { PagenotfoundComponent } from './core-components/pagenotfound/pagenotfound.component';
import { InventoryComponent } from './seller/inventory/inventory.component';
import { LocationDetailComponent } from './seller-setting/location-detail/location-detail.component';
import { LocationsComponent } from './seller-setting/locations/locations.component';
import { ProductSetupComponent } from './seller/product-setup/product-setup.component';
import { ProfileComponent } from './seller-setting/profile/profile.component';
import { RegisterComponent } from './seller/register/register.component';
import { SellerHomeComponent } from './seller/seller-home/seller-home.component';
import { SellerGuard } from './seller/seller.guard';
import { StoreSettingComponent } from './seller-setting/store-setting/store-setting.component';
import { BrandSettingComponent } from './seller-setting/brand-setting/brand-setting.component';
import { UsersAndPermissionComponent } from './seller-setting/users-and-permission/users-and-permission.component';
import { StoreDashboardComponent } from './seller/store-dashboard/store-dashboard.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'signin',
    pathMatch: 'full',
  },
  {
    path: 'signin',
    component: SignInComponent,
  },
  {
    path: 'admin',
    component: AdminHomeComponent,
    canActivate: [AdminGuard],
    children: [
      {
        path: 'product-attributes',
        component: AttributesComponent,
      },
      {
        path: 'departments',
        component: DepartmentsComponent,
      },
      {
        path: 'product-properties',
        component: ProductPropertiesComponent,
      },
      {
        path: 'product-properties/:id',
        component: ProductPropertiesDetailComponent,
      },
    ],
  },
  {
    path: 'brand-register',
    component: RegisterComponent,
  },
  {
    path: 'seller-central',
    component: SellerHomeComponent,
    canActivate: [SellerGuard],
    children: [
     
      {
        path: 'dashboard',
        component: StoreDashboardComponent,
      },
      {
        path: 'inventory',
        component: InventoryComponent,
      },
      {
        path: 'add-a-product',
        component: ProductSetupComponent,
      },
      {
        path: 'add-a-product/:id',
        component: ProductSetupComponent,
      },
      {
        path: 'add-a-product/:id/:vid',
        component: ProductSetupComponent,
      },
      {
        path: 'settings/store',
        component: StoreSettingComponent
      },
      {
        path: 'settings/brand',
        component: BrandSettingComponent
      },
      {
        path: 'settings/users&permissions',
        component: UsersAndPermissionComponent
      },
      {
        path: 'settings/locations',
        component: LocationsComponent
      },
      {
        path: 'settings/locations/:id',
        component: LocationDetailComponent
      },
      {
        path: 'settings/users&permissions/profile/:id',
        component: ProfileComponent,
      },
    ],
  },
  { path: '404', component: PagenotfoundComponent },
  { path: '**', redirectTo: '/404' },
  //{ path: '**', pathMatch: 'full', component: PagenotfoundComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
