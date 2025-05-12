import { NextResponse } from "next/server";
import { SpeechClient, protos } from "@google-cloud/speech";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const audioFile = formData.get("audio") as File;

    if (!audioFile) {
      return NextResponse.json(
        { error: "No audio file provided" },
        { status: 400 }
      );
    }

    // Convert the audio file to buffer
    const audioBuffer = Buffer.from(await audioFile.arrayBuffer());

    // Initialize the Speech-to-Text client
    const credentials = JSON.parse(
      process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON || "{}"
    );
    const client = new SpeechClient({ credentials });

    // Configure the request
    const request: protos.google.cloud.speech.v1.IRecognizeRequest = {
      audio: {
        content: audioBuffer.toString("base64"),
      },
      config: {
        encoding:
          protos.google.cloud.speech.v1.RecognitionConfig.AudioEncoding
            .WEBM_OPUS,
        sampleRateHertz: 48000,
        languageCode: "bn-BD", // Bengali language code
        model: "default",
      },
    };

    // Perform the transcription
    const [response] = await client.recognize(request);
    const transcription = response.results
      ?.map((result) => result.alternatives?.[0]?.transcript)
      .join("\n");

    return NextResponse.json({ text: transcription });
  } catch (error) {
    console.error("Error in speech-to-text conversion:", error);
    return NextResponse.json(
      { error: "Failed to convert speech to text" },
      { status: 500 }
    );
  }
}
