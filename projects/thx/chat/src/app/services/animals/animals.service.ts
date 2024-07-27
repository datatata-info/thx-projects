import { Injectable } from '@angular/core';
// emojis
import { EmojiService } from '../emoji/emoji.service';

@Injectable({
  providedIn: 'root'
})
export class AnimalsService {

  // GET RANDOM ANIMAL EMOJI https://erikmartinjordan.com/get-random-emoji-javascript

  private animalsList = [ 'Alligator', 'Anteater', 'Armadillo', 'Auroch', 'Axolotl', 'Badger', 'Bat', 'Bear', 'Beaver', 'Buffalo', 'Camel', 'Capybara', 'Chameleon', 'Cheetah', 'Chinchilla', 'Chipmunk', 'Chupacabra', 'Cormorant', 'Coyote', 'Crow', 'Dingo', 'Dinosaur', 'Dog', 'Dolphin', 'Duck', 'Elephant', 'Ferret', 'Fox', 'Frog', 'Giraffe', 'Gopher', 'Grizzly', 'Hedgehog', 'Hippo', 'Hyena', 'Ibex', 'Ifrit', 'Iguana', 'Jackal', 'Kangaroo', 'Koala', 'Kraken', 'Lemur', 'Leopard', 'Liger', 'Lion', 'Llama', 'Loris', 'Manatee', 'Mink', 'Monkey', 'Moose', 'Narwhal', 'Nyan', 'Cat', 'Orangutan', 'Otter', 'Panda', 'Penguin', 'Platypus', 'Pumpkin', 'Python', 'Quagga', 'Rabbit', 'Raccoon', 'Rhino', 'Sheep', 'Shrew', 'Skunk', 'Squirrel', 'Tiger', 'Turtle', 'Walrus', 'Wolf', 'Wolverine', 'Wombat' ];

  constructor(
    private emojiService: EmojiService
  ) { }

  getRandomAnimal(exclude: string[] = []): string {
    let randomIndex = this.getRandomFromTo(0, this.animalsList.length - 1);
    while (exclude.includes(this.animalsList[randomIndex])) {
      randomIndex = this.getRandomFromTo(0, this.animalsList.length - 1);
    }
    const randomEmoji = this.emojiService.getRandomEmoji('Animals & Nature');
    return randomEmoji/* `${randomEmoji} ${this.animalsList[randomIndex]}` */;
  }

  private getRandomFromTo(from: number, to: number): number {
    return Math.floor(Math.random() * (to - from) + from);
  }
}
