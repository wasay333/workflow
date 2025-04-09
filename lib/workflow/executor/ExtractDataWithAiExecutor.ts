import { ExecutionEnviroment } from "@/types/executor";
import { ExtractDataWithAiTask } from "../task/ExtractDataWithAiTask";
import prisma from "@/lib/prisma";
import { symmetricDecrypt } from "@/lib/encryption";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function ExtractDataWithAiExecutor(
  enviroment: ExecutionEnviroment<typeof ExtractDataWithAiTask>
): Promise<boolean> {
  try {
    const credentials = enviroment.getInput("Credentials");
    if (!credentials) {
      enviroment.log.error("input->credentials not defined");
    }
    const prompt = enviroment.getInput("Prompt");
    if (!prompt) {
      enviroment.log.error("input->prompt not defined");
    }
    const content = enviroment.getInput("Content");
    if (!content) {
      enviroment.log.error("input->contebt not defined");
    }
    const credential = await prisma.credential.findUnique({
      where: { id: credentials },
    });
    if (!credential) {
      enviroment.log.error("credential not found");
      return false;
    }
    const plainCredentialValue = symmetricDecrypt(credential.value);
    if (!plainCredentialValue) {
      enviroment.log.error("cannot decrypt credential");
      return false;
    }
    // const mockExtractedData = {
    //   usernameSelector: "#username",
    //   passwordSelector: "#password",
    //   loginSelector: "body > div > form > input.btn.btn-primary",
    // };
    const genAI = new GoogleGenerativeAI(plainCredentialValue);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const systemInstruction = `You are a webscraper helper that extracts data from HTML or text. 
    You will be given a piece of text or HTML content as input and also the prompt with
    the data you have to extract. The response should always be only the extracted data 
    as a JSON array or object, without any additional words or explanations. 
    Analyze the input carefully and extract data precisely based on the prompt. 
    If no data is found, return an empty JSON array. Work only with the provided content 
    and ensure the output is always a valid jSON array without any surrounding text.`;

    const result = await model.generateContent([
      { text: systemInstruction },
      { text: content },
      { text: prompt },
    ]);

    const responseText = result.response.text();

    const cleanText = responseText
      .replace(/^```(?:json)?/i, "") // remove starting ``` or ```json
      .replace(/```$/, "") // remove ending ```
      .trim();

    if (!cleanText) {
      enviroment.log.error("Empty or malformed response from Gemini");
      return false;
    }

    enviroment.setOutput("Extracted data", cleanText);
    // if (!responseText) {
    //   enviroment.log.error("Empty response from Gemini");
    //   return false;
    // }

    // enviroment.setOutput("Extracted data", responseText.trim());
    return true;
  } catch (error: any) {
    enviroment.log.error(error.message);
    return false;
  }
}
