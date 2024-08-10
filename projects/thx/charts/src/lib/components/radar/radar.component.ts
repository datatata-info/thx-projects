import { CommonModule } from '@angular/common';
import {
  Component,
  Input,
  OnInit,
  AfterViewInit,
  OnDestroy,
  ElementRef,
  Output,
  EventEmitter,
  ViewChild
} from '@angular/core';
// d3
import * as d3 from 'd3';

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
export class RadarComponent implements OnInit, AfterViewInit, OnDestroy {

  @Input('size') size: number = 360;
  @Input('colorScheme') colorScheme: ColorScheme = {
    color: 'white',
    background: 'black'
  }
  @Input('data') data: RadarData[] = [];
  @ViewChild('svg') svgElm!: ElementRef;

  features: string[] = new Array();

  private radialScale = d3.scaleLinear()
    .domain([0, 10])
    .range([0, 250]);
  private ticks = [2, 4, 6, 8, 10, 12];

  constructor(
    private elm: ElementRef
  ) {}

  ngOnInit(): void {
    console.log('radar data', this.data);
    if (this.elm) {}
    if (this.data.length) {
      // check data (has to have same names in items)
      // const features: string[] = new Array();
      //
      for (const d of this.data) {
        for (const item of d.items) {
          if (!this.features.includes(item.name)) this.features.push(item.name);
        }
      }
      console.log('features', this.features);
      // create axix for item, put slider to proper place, rotate (360/items)
      // for (const )
    }
  }

  ngAfterViewInit(): void {
    // see: https://yangdanny97.github.io/blog/2019/03/01/D3-Spider-Chart
    console.log('svgElm', this.svgElm);
    const svg = d3.select(this.svgElm.nativeElement)
    .attr('width', this.size)
    .attr('height', this.size);
    
    svg.selectAll('circle')
    .data(this.ticks)
    .join((enter: any) => 
      enter.append('circle')
      .attr('cx', this.size / 2)
      .attr('cy', this.size / 2)
      .attr('fill', 'none')
      .attr('stroke', this.colorScheme.color)
      .attr('r', (d: any) => this.radialScale(d))
    );

    let featureData = this.features.map((f, i) => {
      let angle = (Math.PI / 2) + (2 * Math.PI * i / this.features.length);
      return {
          "name": f,
          "angle": angle,
          "line_coord": this.angleToCoordinate(angle, 10),
          "label_coord": this.angleToCoordinate(angle, 10.5)
      };
    });

    // draw axis line
    svg.selectAll("line")
    .data(featureData)
    .join(
        enter => enter.append("line")
            .attr("x1", this.size / 2)
            .attr("y1", this.size / 2)
            .attr("x2", d => d.line_coord.x)
            .attr("y2", d => d.line_coord.y)
            .attr("stroke", this.colorScheme.color)
    );

    // draw axis label
    svg.selectAll(".axislabel")
    .data(featureData)
    .join(
        enter => enter.append("text")
            .attr("x", d => d.label_coord.x)
            .attr("y", d => d.label_coord.y)
            .text(d => d.name)
    );

  
  }

  ngOnDestroy(): void {
    
  }

  private angleToCoordinate(angle: number, value: number): any {
    let x = Math.cos(angle) * this.radialScale(value);
    let y = Math.sin(angle) * this.radialScale(value);
    return {"x": this.size / 2 + x, "y": this.size / 2 - y};
}

}
