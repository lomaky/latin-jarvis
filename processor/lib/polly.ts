import {
  PollyClient,
  SynthesizeSpeechCommand,
} from "@aws-sdk/client-polly";
var propertiesReader = require("properties-reader");
var properties = propertiesReader(".properties");
const fs = require("fs");


export class Polly {
  private accessKeyId: string;
  private secretAccessKey: string;
  private region: string;
  private pollyClient;

  constructor() {
    this.accessKeyId = properties.get("AWS.accessKeyId");
    this.secretAccessKey = properties.get("AWS.secretAccessKey");
    this.region = properties.get("AWS.region");
    // Initialize polly
    this.pollyClient = new PollyClient({
      region: this.region,
      credentials: {
        accessKeyId: this.accessKeyId,
        secretAccessKey: this.secretAccessKey,
      },
    });
  }

  async synthetise(result: string): Promise<string> {
    const command = new SynthesizeSpeechCommand({
      OutputFormat: "mp3",
      SampleRate: "8000",
      Text: result,
      Engine: "standard",
      TextType: "text",
      VoiceId: "Miguel",
    });
    const response = await this.pollyClient.send(command);
    const file = `media/temp/${new Date().toISOString()}.mp3`;
    fs.writeFileSync(
      file,
      await response.AudioStream?.transformToByteArray(),
      {}
    );
    return file;
  }
}
