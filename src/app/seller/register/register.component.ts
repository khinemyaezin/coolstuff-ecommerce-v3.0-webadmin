import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { PopupService } from 'src/app/services/popup.service';
import { ServerService } from 'src/app/services/server.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {
  
  brandFormGroup: FormGroup = new FormGroup({
    'brand-name': new FormControl('Apple', Validators.required),
    'brand-cover': new FormControl(),
    'brand-profile': new FormControl(),
  });
  accountFormGroup: FormGroup = new FormGroup({
    'user-firstname': new FormControl('Khine Myae', Validators.required),
    'user-lastname': new FormControl('Zin', Validators.required),
    'user-email': new FormControl('admin@nike.com'),
    'user-phno': new FormControl('09795957915', Validators.required),
    'user-address': new FormControl('yangon', Validators.required),
    'password': new FormControl('123'),
  });
  constructor(private http:ServerService,private alert:PopupService) { }

  ngOnInit(): void {
  }
  submit() {

    /* Common error */
   
    /* Send http request */
    const param = {
      brand: {
        title: this.brandFormGroup.get('brand-name')?.value,
        region_id: '146',
        image_profile_url: null,
        image_cover_url: null,
      },
      user: {
        first_name: this.accountFormGroup.get('user-firstname')?.value,
        last_name: this.accountFormGroup.get('user-lastname')?.value,
        email: this.accountFormGroup.get('user-email')?.value,
        phone: this.accountFormGroup.get('user-phno')?.value,
        address: this.accountFormGroup.get('user-address')?.value,
        password: this.accountFormGroup.get('password')?.value,
      },
    };
    console.log(param);

    // return;
    this.http.POST('brands/register', param).subscribe(
      {
        next:( res)=>{
          console.log(res);
          
          if(res.status == 200) {
            this.alert.showTost('Success');
          }
        },
        error :(e)=>{
          console.log(e);
          
        }
      }
    );
  }
}
