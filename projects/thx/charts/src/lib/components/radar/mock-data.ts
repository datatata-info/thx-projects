import { RadarData } from "./radar.component";

export const MOCK_DATA: RadarData[] = [
    {
      name: 'user1',
      color: 'pink',
      items: [
        { name: 'openess', value: .3 },
        { name: 'agreeableness', value: .8},
        { name: 'neuroticism', value: .2},
        { name: 'extraversion', value: .3},
        { name: 'consciousness', value: .9}
      ]
    },
    {
      name: 'user2',
      color: 'yellow',
      items: [
        { name: 'openess', value: .3 },
        { name: 'agreeableness', value: .8},
        { name: 'neuroticism', value: .2},
        { name: 'extraversion', value: .3},
        { name: 'consciousness', value: .9}
      ]
    }
  ]