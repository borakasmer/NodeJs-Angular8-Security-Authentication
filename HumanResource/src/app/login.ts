import { Component, AfterViewInit } from '@angular/core';
import { PersonService } from 'src/Service/personService';
import { Router } from '@angular/router';
@Component({
    templateUrl: './login.html',
    styleUrls: ['./login.scss']
})
export class LoginComponent implements AfterViewInit {
    userName: string;
    password: string;
    constructor(public service: PersonService, private router: Router) { }
    ngAfterViewInit(): void {
        this.service.checkToken().subscribe((data: any) => {
            if (data.success != false) {
                this.router.navigateByUrl('person');
            }
        });
        //throw new Error("Method not implemented.");
    }

    Redirect() {
        this.service.login(this.userName, this.password).subscribe((data: any) => {
            window.localStorage.setItem("token", data.token);
            this.router.navigateByUrl('person');
        });
    }

}