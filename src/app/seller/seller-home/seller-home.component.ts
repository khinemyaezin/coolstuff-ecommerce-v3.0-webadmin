import { Component, OnInit } from '@angular/core';
import { NgbOffcanvas } from '@ng-bootstrap/ng-bootstrap';
import { Menus } from 'src/app/app.component';
import { AuthService } from 'src/app/auth/auth.service';
import { PopupService } from 'src/app/services/popup.service';

@Component({
  selector: 'app-seller-home',
  templateUrl: './seller-home.component.html',
  styleUrls: ['./seller-home.component.scss'],
})
export class SellerHomeComponent implements OnInit {
  accountName: string = '';
  accountImagePath: string = '';
  navBrand: string = '';
  menus: Menus[] = [
    {
      id: 'page',
      title: 'My Store',
      icon: 'bi bi-shop',
      routerLink: 'dashboard',
      collapse: false,
      children: [],
    },
    {
      id: 'inventory',
      title: 'Inventory',
      icon: 'bi bi-cart-fill',
      routerLink: '',
      collapse: false,
      children: [
        {
          id: 'inventory-manage',
          title: 'Product lists',
          icon: '',
          routerLink: '/seller-central/inventory',
          collapse: false,
          children: [],
        },
        {
          id: 'inventory-product',
          title: 'Add a product',
          icon: '',
          routerLink: '/seller-central/add-a-product',
          collapse: false,
          children: [],
        },
      ],
    },

    {
      id: 'settings',
      title: 'Settings',
      icon: 'bi bi-gear-fill',
      routerLink: '',
      collapse: false,
      children: [
        {
          id: 'store-setting',
          title: 'Store',
          icon: '',
          routerLink: '/seller-central/settings/store',
          collapse: false,
          children: [],
        },
        {
          id: 'locations',
          title: 'Locations',
          icon: '',
          routerLink: '/seller-central/settings/locations',
          collapse: false,
          children: [],
        },
        {
          id: 'users&permission',
          title: 'Users and Permissions',
          icon: '',
          routerLink: '/seller-central/settings/users&permissions',
          collapse: false,
          children: [],
        },
        {
          id: 'brand-setting',
          title: 'Brand',
          icon: '',
          routerLink: '/seller-central/settings/brand',
          collapse: false,
          children: [],
        },
      ],
    },
  ];

  constructor(
    private auth: AuthService,

    private offcanvasService: NgbOffcanvas
  ) {}

  ngOnInit(): void {
    this.accountName = this.auth.user?.first_name;
    this.accountImagePath = this.auth.user?.profile_image;
    this.navBrand = this.auth.user?.brand.profile_image;
  }
  open(content: any) {
    this.offcanvasService.open(content, {
      ariaLabelledBy: 'offcanvas-basic-title',
    });
  }
}
