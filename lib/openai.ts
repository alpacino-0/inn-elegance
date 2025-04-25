import 'server-only'; // Bu dosyanın sadece sunucu tarafında import edilmesini sağlar
import OpenAI from 'openai';

const apiKey = process.env.OPENAI_API_KEY;

if (!apiKey) {
  throw new Error("OPENAI_API_KEY ortam değişkeni tanımlanmamış.");
}

export const openai = new OpenAI({
  apiKey: apiKey,
});

console.log("OpenAI Client Initialized (Server-Side)"); 