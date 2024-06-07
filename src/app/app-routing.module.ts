import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { NewGameComponent } from './components/new-game/new-game.component';
import { GameComponent } from './components/game/game.component';

const routes: Routes = [
  { path: 'new-game', component: NewGameComponent },
  { path: 'game', component: GameComponent },
  { path: '', redirectTo: 'new-game', pathMatch: 'full' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
