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
  accountImagePath: string = "";
  navBrand: string = ''
  menus: Menus[] = [
    // {
    //   id: "dashboard",
    //   title: "Dashboard",
    //   icon: "",
    //   routerLink: "dashboard",

    //   children: [],
    // },
    {
      id: 'profile',
      title: 'Profile',
      icon: '',
      routerLink: 'profile',
      collapse: true,
      children: [],
    },
    {
      id: 'page',
      title: 'My Store',
      icon: '',
      routerLink: 'page',
      collapse: true,
      children: [],
    },
    {
      id: 'inventory',
      title: 'Inventory',
      icon: '',
      routerLink: '',
      collapse: true,
      children: [
        {
          id: 'inventory-manage',
          title: 'Product lists',
          icon: '',
          routerLink: '/seller-central/inventory',
          collapse: true,
          children: [],
        },
        {
          id: 'inventory-product',
          title: 'Add a product',
          icon: '',
          routerLink: '/seller-central/add-a-product',
          collapse: true,
          children: [],
        }
      ]
    },
    // {
    //   id: "my-order",
    //   title: "My Orders",
    //   icon: "",
    //   routerLink: "",

    //   children: [],
    // },
    // {
    //   id: "reports",
    //   title: "Reports",
    //   icon: "",
    //   routerLink: "",

    //   children: [],
    // },
    {
      id: 'settings',
      title: 'Settings',
      icon: '',
      routerLink: '',
      collapse: true,
      children: [
        {
          id: 'plan',
          title: 'Plan',
          icon: '',
          routerLink: '',
          collapse: true,
          children: [],
        },
        {
          id: 'billing',
          title: 'Billing',
          icon: '',
          routerLink: '',
          collapse: true,
          children: [],
        },
        {
          id: 'user-permissions',
          title: 'Users and permissions',
          icon: '',
          routerLink: '',
          collapse: true,
          children: [],
        },
        {
          id: 'payments',
          title: 'Payments',
          icon: '',
          routerLink: '',
          collapse: true,
          children: [],
        },
        {
          id: 'checkout',
          title: 'Checkout',
          icon: '',
          routerLink: '',
          collapse: true,
          children: [],
        },
        {
          id: 'shipping-delivery',
          title: 'Shipping and delivery',
          icon: '',
          routerLink: '',
          collapse: true,
          children: [],
        },
        {
          id: 'taxes',
          title: 'Taxes',
          icon: '',
          routerLink: '',
          collapse: true,
          children: [],
        },
      ],
    },
    {
      id: "logout",
      title: "Logout",
      icon: "",
      routerLink: '../logout',
      collapse: true,
      children: [],
    },
  ];

  constructor(
    private auth: AuthService,
    private alert: PopupService,
    private offcanvasService: NgbOffcanvas
  ) {}

  ngOnInit(): void {
    this.accountName = this.auth.user?.first_name;
    this.accountImagePath = this.auth.user?.image_url;
    this.navBrand = this.auth.user?.brand.image_profile_url;
  }
  open(content:any) {
    this.offcanvasService.open(content, {ariaLabelledBy: 'offcanvas-basic-title'});
  }
}
