import { Component } from '@angular/core';

@Component({
  selector: 'thx-charts-console',
  standalone: true,
  imports: [],
  templateUrl: './console.component.html',
  styleUrl: './console.component.scss'
})

export class ConsoleComponent {

  // TODO: check: https://stackoverflow.com/a/19846113

  // logOfConsole: any[] = [];
  // log: any = console.log;
  // warn: any = console.warn;
  // error: any = console.error;
  // info: any = console.info;

  constructor() {
    console.log('!!!!!!!!!! CONSOLE !!!!!!!!!!')
    console.log = this.proxy(console, console.log, 'Log:');
    console.warn = this.proxy(console, console.warn, 'Warn:');
    console.error = this.proxy(console, console.error, 'Error:');
  }

  proxy(context: any, method: any, message: string) { 
    return () => {
      const apply = method.apply(context, [message].concat(Array.prototype.slice.apply(arguments)));
      // console.log('console context', context);
      return apply;
    }
  }
  
}
