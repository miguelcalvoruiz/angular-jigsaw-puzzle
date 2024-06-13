import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { GameService } from '../../services/game/game.service';
import { GameSettings } from '../../models/interfaces/gameSettings';
import { faPuzzlePiece, faUpload } from '@fortawesome/free-solid-svg-icons';
import { fadeEnterAnimation, fadeLeaveAnimation } from '../../shared/animation';
import { BoardSettings } from '../../models/interfaces/boardSettiings';
import { TranslateService } from '../../services/translate/translate.service';
import { ProgressBar } from '../../models/interfaces/progressBar';
import { GameProgress } from '../../models/interfaces/game-progress';

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

  sizing: { pieces: number, rows: number, cols: number }[] = [];

  faUpload = faUpload;
  faPuzzlePiece = faPuzzlePiece;
  tooltipPlayText: string = '';

  constructor(private gameService: GameService,
    private fb: FormBuilder,
    private router: Router,
    private translateService: TranslateService) { }

  ngOnInit(): void {
    this.translateService.getData().then(() => {
      this.tooltipPlayText = this.translateService.getTranslate('label.new.game.tooltip.play');
    });
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
      const longerEdge = Math.max(image.height, image.width);
      const shorterEdge = Math.min(image.height, image.width);
      this.sizing = [];

      for (let i = 4; i < 27; i += 2) {
        let pieceSize = longerEdge / i;
        let j = Math.round(shorterEdge / pieceSize);

        const rows = image.height >= image.width ? i : j;
        const cols = image.height < image.width ? i : j;

        this.sizing.push({ pieces: rows * cols, rows, cols });
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
      fullImage: false,
      preview: false,
      timer: true,
      fullscreen: false
    };
    if (this.gameSettingsForm.valid) {
      const gameSettings: GameSettings = {
        pieces: this.gameSettingsForm.value.pieces as number,
        rows: this.gameSettingsForm.value.rows as number,
        cols: this.gameSettingsForm.value.cols as number,
        image: this.gameSettingsForm.value.image as File
      };
      const progressBar: ProgressBar = {
        currentPieces: 0,
        allPieces: this.gameSettingsForm.controls['pieces'].value as number,
        value: 0
      };
      const gameProgress: GameProgress = { progressBar, time: null };

      this.gameService.setBoardSettings(boardSettings);
      this.gameService.setGameProgress(gameProgress);
      this.gameService.setGameSettings(gameSettings);
      this.router.navigateByUrl('game');
    } else {
      console.error('El formulario no es válido');
    }
  }

}
