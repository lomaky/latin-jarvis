import { Jarvis } from "./lib/jarvis";
import { Oracle } from "./lib/oracle";
import { Polly } from "./lib/polly";
import { Recorder } from "./lib/recorder";
import { Transcriber } from "./lib/transcriber";


const main = async () => {
  const recorder = new Recorder();
  const transcriber = new Transcriber();
  const oracle = new Oracle();
  const jarvis = new Jarvis();
  const polly = new Polly();
  
  await jarvis.welcome();
  console.log('.');  
  const question = await transcriber.transcribe(recorder.recordToStream());
  recorder.stopRecording();
   console.log(question);
  
  await jarvis.processing();
  const response = await oracle.answerPrompt(question);
  const result = await polly.synthetise(response??'No encontre la respuesta!');
  console.log(response);
  await jarvis.play(result);  
  process.exit(0);
};

main();
