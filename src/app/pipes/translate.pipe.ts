import { Pipe, PipeTransform } from '@angular/core';
import { TranslateService } from '../services/translate/translate.service';

@Pipe({
  name: 'translate'
})
export class TranslatePipe implements PipeTransform {

  constructor(private translateService: TranslateService) { }

  transform(value: any): any {
    const translation = this.translateService.getTranslate(value);
    return translation !== undefined ? translation : value;
  }

}
