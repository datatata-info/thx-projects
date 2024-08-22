import { RadarData } from "./radar.component";

export const MOCK_DATA: RadarData[] = [
    {
      id: 'a',
      name: 'user1',
      color: 'pink',
      items: [
        { name: 'openess', value: .7 },
        { name: 'agreeableness', value: .8},
        { name: 'neuroticism', value: .2},
        { name: 'extraversion', value: .3},
        { name: 'consciousness', value: .6}
      ]
    },
    {
      id: 'b',
      name: 'user2',
      color: 'aquamarine',
      items: [
        { name: 'openess', value: .4 },
        { name: 'agreeableness', value: .5},
        { name: 'neuroticism', value: .4},
        { name: 'extraversion', value: .6},
        { name: 'consciousness', value: .2}
      ]
    }
  ]