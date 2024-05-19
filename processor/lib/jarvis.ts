const player = require("node-wav-player");

export class Jarvis {
  constructor() {}

  async welcome(): Promise<void> {
    console.log("Que se te ofrece patron?");
    await this.play("media/alaorden.wav");
  }

  async processing(): Promise<void> {
    console.log("Ya va patron! Dejame pensar la respuesta");
    await this.play("media/pensando.wav");
  }

  async play(path:string){
    await player.play({
      path: path,
      sync: true,
    });
  }
}
