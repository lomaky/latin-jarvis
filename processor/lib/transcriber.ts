import { StartStreamTranscriptionCommandOutput } from "@aws-sdk/client-transcribe-streaming";
import { PassThrough, Stream, Readable } from "stream";

const {
  TranscribeStreamingClient,
  StartStreamTranscriptionCommand,
} = require("@aws-sdk/client-transcribe-streaming");
var propertiesReader = require("properties-reader");
var properties = propertiesReader(".properties");
const {} = require("stream");

export class Transcriber {
  private accessKeyId: string;
  private secretAccessKey: string;
  private region: string;
  private transcribeClient;

  constructor() {
    this.accessKeyId = properties.get("AWS.accessKeyId");
    this.secretAccessKey = properties.get("AWS.secretAccessKey");
    this.region = properties.get("AWS.region");
    // Initialize transcribe
    this.transcribeClient = new TranscribeStreamingClient({
      region: this.region,
      credentials: {
        accessKeyId: this.accessKeyId,
        secretAccessKey: this.secretAccessKey,
      },
    });
  }

  async transcribe(micStream: Stream): Promise<string> {
    const audioPayloadStream = new PassThrough({ highWaterMark: 1 * 1024 }); // Stream chunk less than 1 KB
    micStream.pipe(audioPayloadStream);
    const audioStream = async function* () {
      for await (const payloadChunk of audioPayloadStream) {
        yield { AudioEvent: { AudioChunk: payloadChunk } };
      }
    };

    const command = new StartStreamTranscriptionCommand({
      LanguageCode: "es-US",
      MediaEncoding: "pcm",
      MediaSampleRateHertz: 48000,
      AudioStream: audioStream(),
    });
    const response = await this.transcribeClient.send(command);
    return await this.onStart(response);
  }

  async onStart(
    response: StartStreamTranscriptionCommandOutput
  ): Promise<string> {
    let finalTranscript: string = "";
    if (response.TranscriptResultStream) {
      for await (const event of response.TranscriptResultStream) {
        if (event.TranscriptEvent) {
          // Get multiple possible results
          const results = event?.TranscriptEvent?.Transcript?.Results;
          if (results) {
            // Print all the possible transcripts
            results.map((result) => {
              (result.Alternatives || []).map((alternative) => {
                const transcript = alternative?.Items?.map(
                  (item) => item.Content
                ).join(" ");
                finalTranscript = transcript ?? "";
                process.stdout.write(".");
              });
            });
          }
        }
      }
    }
    console.log("");
    return finalTranscript ?? "";
  }
}
