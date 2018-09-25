import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import {StoryService} from './story.service';
import {SubbugService} from './subbug.service';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {MatTableModule} from '@angular/material/table';
import {MatSort, MatSortModule} from '@angular/material/sort';
import {MatFormFieldModule, 
        MatInputModule, 
        MatRippleModule, 
        MatProgressBarModule,
        MatBottomSheetModule,
        MatStepperModule,
        MatButtonModule,
        MatBadgeModule} from '@angular/material';
import {MatPaginatorModule} from '@angular/material/paginator';
import {MatIconModule} from '@angular/material/icon';
import {MatTooltipModule} from '@angular/material/tooltip';

import { AppComponent } from './app.component';
import { SubbugComponent } from './subbug/subbug.component';
import { MetricsService } from './metrics.service';
import { ReportComponent } from './report/report.component';

@NgModule({
  declarations: [
    AppComponent,
    SubbugComponent,
    ReportComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    BrowserAnimationsModule,
    MatTableModule,
    MatSortModule,
    MatFormFieldModule,
    MatInputModule,
    MatRippleModule,
    MatPaginatorModule,
    MatProgressBarModule,
    MatTooltipModule,
    MatBottomSheetModule,
    MatStepperModule,
    MatButtonModule,
    MatIconModule,
    MatBadgeModule
  ],
  entryComponents: [
    AppComponent,
    SubbugComponent,
    ReportComponent
  ],
  providers: [StoryService, SubbugService, MetricsService],
  bootstrap: [AppComponent]
})
export class AppModule { }
