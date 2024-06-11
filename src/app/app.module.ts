import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { JigsawCanvasComponent } from './components/jigsaw-canvas/jigsaw-canvas.component';
import { GameComponent } from './components/game/game.component';
import { NewGameComponent } from './components/new-game/new-game.component';
import { ReactiveFormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { BoardManagementComponent } from './components/board-management/board-management.component';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { TransitionComponent } from './shared/transition/transition.component';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ProgressComponent } from './components/progress/progress.component';
import { TimerComponent } from './components/timer/timer.component';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { SummaryComponent } from './components/summary/summary.component';
import { NgFireworksModule } from '@fireworks-js/angular';

@NgModule({
  declarations: [
    AppComponent,
    JigsawCanvasComponent,
    GameComponent,
    NewGameComponent,
    BoardManagementComponent,
    TransitionComponent,
    ProgressComponent,
    TimerComponent,
    SummaryComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    FontAwesomeModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatProgressBarModule,
    NgFireworksModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
