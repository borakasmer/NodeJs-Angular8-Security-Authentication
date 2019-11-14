import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { PersonService } from 'src/Service/personService';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { LoginComponent } from './login';
import { AppRoutingModule } from './app-routing.module';
import { MainComponent } from './main';
@NgModule({
  declarations: [
    AppComponent,   
    LoginComponent,
    MainComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpClientModule,
    AppRoutingModule
  ],
  providers: [PersonService],
  bootstrap: [MainComponent]
})
export class AppModule { }
