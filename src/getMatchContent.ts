import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { OpenAIEmbeddings } from "@langchain/openai";

export async function getMatchContent({query,context,openAIApiKey}:{query:string,context:string,openAIApiKey:string}) {  
  const textSplitter = new RecursiveCharacterTextSplitter({
    chunkSize: 500,
    chunkOverlap:80
  });  
  const splits = await textSplitter.createDocuments([context]);  
  const embeddingModel = new OpenAIEmbeddings({
    openAIApiKey,
    model: "text-embedding-3-large",
  });
  const getVectorStore = async () => await MemoryVectorStore.fromDocuments(
    splits,
    embeddingModel
  );
  const getQueryVector = async () => await embeddingModel.embedQuery(query);
  const [vectorStore,queryVector] = await Promise.all([getVectorStore(),getQueryVector()]);
  const top3 = await vectorStore.similaritySearchVectorWithScore(queryVector,3);
  const result = top3.map(item => item[0].pageContent).join('\n')
  return result
}