import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminHomeComponent } from './admin/admin-home/admin-home.component';
import { AdminGuard } from './admin/admin.guard';
import { AttributesComponent } from './admin/attributes/attributes.component';
import { DepartmentsComponent } from './admin/departments/departments.component';
import { SignInComponent } from './auth/sign-in/sign-in.component';
import { PagenotfoundComponent } from './core-components/pagenotfound/pagenotfound.component';
import { InventoryComponent } from './seller/inventory/inventory.component';
import { ProductAdditionalSetupComponent } from './seller/product-additional-setup/product-additional-setup.component';
import { ProductSetupComponent } from './seller/product-setup/product-setup.component';
import { ProfileComponent } from './seller/profile/profile.component';
import { RegisterComponent } from './seller/register/register.component';
import { SellerHomeComponent } from './seller/seller-home/seller-home.component';
import { SellerGuard } from './seller/seller.guard';
import { StoreComponent } from './seller/store/store.component';

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
        path: 'profile',
        component: ProfileComponent,
      },
      {
        path: 'store',
        component: StoreComponent,
      },
      {
        path: 'inventory',
        component: InventoryComponent,
      },
      {
        path: 'add-a-product',
        component: ProductAdditionalSetupComponent,
      },
      {
        path: 'add-a-product/:id',
        component: ProductAdditionalSetupComponent,
      },
      {
        path: 'add-a-product/:id/:vid',
        component: ProductAdditionalSetupComponent,
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
