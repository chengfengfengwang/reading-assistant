import { createParser } from "eventsource-parser";

export async function handleStream(
  reader: ReadableStreamDefaultReader<Uint8Array>,
  onData: (data: string) => void
) {
  const parser = createParser((event) => {
    if (event.type === "event") {
      onData(event.data);
    }
  });
  // eslint-disable-next-line
  while (true) {
    const { done, value } = await reader.read();
    if (done) {
      break;
    }
    const text = new TextDecoder().decode(value);
    parser.feed(text);
  }
}