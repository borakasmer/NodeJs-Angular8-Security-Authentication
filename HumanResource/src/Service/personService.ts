import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Person } from 'src/Model/person';
import { Observable, throwError } from 'rxjs';
import { retry, catchError } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class PersonService {
    baseUrl: string = "http://localhost:9480/people";
    baseUrlDesc: string = "http://localhost:9480/peopleDesc";
    pagingUrl: string = "http://localhost:9480/getpeoplebyPaging";
    updateUrl: string = "http://localhost:9480/updatePeople";
    inserteUrl: string = "http://localhost:9480/insertPeople";
    searchUrl: string = "http://localhost:9480/getpeopleStartsWith";
    deleteUrl: string = "http://localhost:9480/deletePeople";

    loginUrl: string = "http://localhost:9480/login";
    checkTokenUrl: string = "http://localhost:9480/checkToken";
    page: number = 1;
    constructor(private httpClient: HttpClient) { }

    GetToken(): string {
        if (window.localStorage.getItem("token") != null) {
            return window.localStorage.getItem("token");
        }
    }

    public getPeopleList(desc: boolean = false): Observable<Person> {
        let url: string = desc ? this.baseUrlDesc : this.baseUrl;

        let httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + this.GetToken(),
            })
        }
        return this.httpClient.get<Person>(url, httpOptions)
            .pipe(
                retry(1),
                catchError(this.errorHandel)
            )
    }
    public getPeopleListByPaging(pageNo: number): Observable<Person> {
        let httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + this.GetToken(),
            })
        }
        return this.httpClient.get<Person>(this.pagingUrl + "/" + pageNo + "/5", httpOptions)
            .pipe(
                retry(1),
                catchError(this.errorHandel)
            )
    }


    public updatePerson(data: Person): Observable<any> {
        let httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + this.GetToken(),
            })
        }
        return this.httpClient.post<Person>(this.updateUrl, JSON.stringify(data), httpOptions)
            .pipe(
                retry(1),
                catchError(this.errorHandel)
            )
    }

    public insertPeople(data: Person): Observable<any> {
        let httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + this.GetToken(),
            })
        }
        return this.httpClient.post<Person>(this.inserteUrl, JSON.stringify(data), httpOptions)
            .pipe(
                retry(1),
                catchError(this.errorHandel)
            )
    }

    public searchPeopleByName(name: string): Observable<Person> {
        let httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + this.GetToken(),
            })
        }
        return this.httpClient.get<Person>(this.searchUrl + "/" + name, httpOptions)
            .pipe(
                retry(1),
                catchError(this.errorHandel)
            )
    }

    public deletePeople(data: Person): Observable<any> {
        let httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + this.GetToken(),
            })
        }
        return this.httpClient.post<Person>(this.deleteUrl, JSON.stringify(data), httpOptions)
            .pipe(
                retry(1),
                catchError(this.errorHandel)
            )
    }

    public login(userName: string, password: string): Observable<Person> {
        let httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            })
        }
        //return this.httpClient.post<Person>(this.loginUrl + "/" + userName + "/" + this.Encrypt(password), httpOptions)
        return this.httpClient.post<Person>(this.loginUrl, { username: userName, password: this.Encrypt(password) }, httpOptions)
            .pipe(
                retry(1),
                catchError(this.errorHandel)
            )
    }

    public checkToken(): Observable<Person> {

        let httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + this.GetToken(),
            })
        }
        return this.httpClient.get<Person>(this.checkTokenUrl, httpOptions)
            .pipe(
                retry(1),
                catchError(this.errorHandel)
            )
    }

    errorHandel(error) {
        let errorMessage = '';
        if (error.error instanceof ErrorEvent) {
            // Get client-side error
            errorMessage = error.error.message;
        } else {
            // Get server-side error
            errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
        }
        console.log(errorMessage);
        return throwError(errorMessage);
    }

    public Encrypt(password: string) {

        let keyStr: string = "ABCDEFGHIJKLMNOP" +
            "QRSTUVWXYZabcdef" +
            "ghijklmnopqrstuv" +
            "wxyz0123456789+/" +
            "=";

        password = password.split('+').join('|');
        //let input = escape(password);
        /* let input = password; */
        let input = encodeURI(password);
        let output = "";
        let chr1, chr2, chr3;
        let enc1, enc2, enc3, enc4;
        let i = 0;

        do {
            chr1 = input.charCodeAt(i++);
            chr2 = input.charCodeAt(i++);
            chr3 = input.charCodeAt(i++);

            enc1 = chr1 >> 2;
            enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
            enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
            enc4 = chr3 & 63;

            if (isNaN(chr2)) {
                enc3 = enc4 = 64;
            } else if (isNaN(chr3)) {
                enc4 = 64;

            }
            output = output +
                keyStr.charAt(enc1) +
                keyStr.charAt(enc2) +
                keyStr.charAt(enc3) +
                keyStr.charAt(enc4);
            chr1 = chr2 = chr3 = "";
            enc1 = enc2 = enc3 = enc4 = "";
        } while (i < input.length);
        //console.log("Password :" + output);
        return output;
    }
}