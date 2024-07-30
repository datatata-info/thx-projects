import { CommonModule } from '@angular/common';
import { Component, Input, OnInit, OnDestroy, ElementRef, Output, EventEmitter } from '@angular/core';

export interface RadarDataItem {
  name: string,
  value: number, // float 0-1
  color?: string
}

export interface RadarData {
  items: RadarDataItem[],
  name: string,
  color?: string
}

export interface ColorScheme {
  color: string,
  background: string
}

@Component({
  selector: 'thx-charts-radar',
  standalone: true,
  imports: [ CommonModule ],
  templateUrl: './radar.component.html',
  styleUrl: './radar.component.scss'
})
export class RadarComponent implements OnInit, OnDestroy {

  @Input('size') size: number = 360;
  @Input('colorScheme') colorScheme: ColorScheme = {
    color: 'white',
    background: 'black'
  }
  @Input('data') data: RadarData[] = [];

  axes: string[] = new Array();

  constructor(
    private elm: ElementRef
  ) {}

  ngOnInit(): void {
    console.log('radar data', this.data);
    if (this.elm) {}
    if (this.data.length) {
      // check data (has to have same names in items)
      // const axes: string[] = new Array();
      //
      for (const d of this.data) {
        for (const item of d.items) {
          if (!this.axes.includes(item.name)) this.axes.push(item.name);
        }
      }
      console.log('axes', this.axes);
      // create axix for item, put slider to proper place, rotate (360/items)
      // for (const )
    }
  }

  ngOnDestroy(): void {
    
  }

}
