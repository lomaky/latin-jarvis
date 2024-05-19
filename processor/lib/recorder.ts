import { Stream } from "stream";

const {
  TranscribeStreamingClient,
  StartStreamTranscriptionCommand,
} = require("@aws-sdk/client-transcribe-streaming");
var propertiesReader = require("properties-reader");
var properties = propertiesReader(".properties");
const AudioRecorder = require("node-audiorecorder");
const fs = require("fs");

export class Recorder {
  private accessKeyId: string;
  private secretAccessKey: string;
  private region: string;
  // private transcribeClient;
  private recording: any | null = null;
  private wavFile: string | null = null;

  audioConfig = {
    program: `sox`, // Which program to use, either `arecord`, `rec`, or `sox`.
    bits: 16, // Sample size. (only for `rec` and `sox`)
    channels: 1, // Channel count.
    encoding: `signed-integer`, // Encoding type. (only for `rec` and `sox`)
    format: `S16_LE`, // Encoding type. (only for `arecord`)
    rate: 48000, // Sample rate.
    type: `wav`, // Format type.
    // Following options only available when using `rec` or `sox`.
    silence: 2, // Duration of silence in seconds before it stops recording.
    thresholdStart: 0.5, // Silence threshold to start recording.
    thresholdStop: 0.5, // Silence threshold to stop recording.
    keepSilence: true, // Keep the silence in the recording.
  };

  constructor() {
    this.accessKeyId = properties.get("AWS.accessKeyId");
    this.secretAccessKey = properties.get("AWS.secretAccessKey");
    this.region = properties.get("AWS.region");
  }

  recordToFile(): string | null {
    if (!this.recording) {
      this.wavFile = `audio/${new Date().toISOString()}.mp3`;
      const file = fs.createWriteStream(this.wavFile, { encoding: "binary" });
      this.recording = new AudioRecorder(this.audioConfig);
      this.recording.start();
      this.recording.stream().pipe(file);
    }
    return this.wavFile;
  }

  recordToStream(): any {
    if (!this.recording) {
      this.recording = new AudioRecorder(this.audioConfig);
      this.recording.start();
      return this.recording.stream();
    }
    throw new Error("Unable to create a stream");
  }

  stopRecording(): string | null {
    if (this.recording) {
      this.recording.stop();
      this.recording = null;
    }
    return this.wavFile;
  }

  isRecording(): boolean {
    return this.recording != null;
  }
}
