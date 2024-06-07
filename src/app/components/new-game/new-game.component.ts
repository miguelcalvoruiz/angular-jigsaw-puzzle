import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { GameService } from '../../services/game.service';
import { GameSettings } from '../../models/gameSettings';
import { faPuzzlePiece, faUpload } from '@fortawesome/free-solid-svg-icons';
import { fadeEnterAnimation, fadeLeaveAnimation } from '../../shared/animation';
import { BoardSettings } from '../../models/boardSettiings';

@Component({
  selector: 'app-new-game',
  animations: [fadeEnterAnimation, fadeLeaveAnimation],
  templateUrl: './new-game.component.html',
  styleUrls: ['./new-game.component.scss']
})
export class NewGameComponent implements OnInit {

  gameSettingsForm = this.fb.group({
    pieces: [null as number | null, Validators.required],
    rows: [null as number | null, Validators.required],
    cols: [null as number | null, Validators.required],
    image: [null as File | null, Validators.required],
  });

  sizing = [
    { pieces: 24, rows: 4, cols: 6 },
    { pieces: 35, rows: 5, cols: 7 },
    { pieces: 54, rows: 6, cols: 9 },
    { pieces: 77, rows: 7, cols: 11 },
    { pieces: 96, rows: 8, cols: 12 },
    { pieces: 150, rows: 10, cols: 15 },
    { pieces: 204, rows: 12, cols: 17 },
    { pieces: 320, rows: 16, cols: 20 }
  ];

  faUpload = faUpload;
  faPuzzlePiece = faPuzzlePiece;

  constructor(private gameService: GameService, private fb: FormBuilder, private router: Router) { }

  ngOnInit(): void {

  }

  onFileSelected(event: any) {
    if (event.target.files.length > 0) {
      const file = event.target.files[0];

      this.checkResolution(file);

      this.gameSettingsForm.patchValue({
        image: file,
        pieces: null
      });

    } else {
      this.gameSettingsForm.patchValue({
        image: null,
        pieces: null
      });
    }
  }

  checkResolution(file: File) {
    const image = new Image();
    image.src = URL.createObjectURL(file);
    image.onload = () => {
      if (image.height > image.width) {
        this.sizing.forEach(option => {
          const temp = option.rows;
          option.rows = option.cols;
          option.cols = temp;
        });
      }
    }
  }

  updateRowsAndCols(index: number) {
    this.gameSettingsForm.patchValue({
      rows: this.sizing[index].rows,
      cols: this.sizing[index].cols
    });
  }

  startGame() {
    const boardSettings: BoardSettings = {
      zoom: 1,
      zoomLevel: 0,
      zoomChange: 0,
      preview: false,
      fullscreen: false
    };
    if (this.gameSettingsForm.valid) {
      const gameSettings: GameSettings = {
        pieces: this.gameSettingsForm.value.pieces as number,
        rows: this.gameSettingsForm.value.rows as number,
        cols: this.gameSettingsForm.value.cols as number,
        image: this.gameSettingsForm.value.image as File
      };
      this.gameService.setBoardSettings(boardSettings);
      this.gameService.setGameSettings(gameSettings);
      this.router.navigateByUrl('game');
    } else {
      console.error('El formulario no es válido');
    }
  }

}