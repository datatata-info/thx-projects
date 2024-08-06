import { Pipe, PipeTransform } from '@angular/core';
import Autolinker, { AutolinkerConfig } from 'autolinker';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
@Pipe({
  name: 'link',
  standalone: true
})
export class LinkPipe implements PipeTransform {

  constructor(
    protected sanitizer: DomSanitizer
  ){}

  transform(value: string, options?: AutolinkerConfig): SafeHtml { // maybe safeHtml
    return this.sanitizer.bypassSecurityTrustHtml(Autolinker.link(value, options));
  }

}
