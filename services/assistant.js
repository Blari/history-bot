import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

const openaiApiKey = process.env.OPENAI_API_KEY;
const assistantId = process.env.ASSISTANT_ID;

const configuration = {
    apiKey: openaiApiKey,
};
  
const openai = new OpenAI(configuration);

async function createThread() {
  console.log("Creating a new thread...");
  const thread = await openai.beta.threads.create();
  console.log("Thread created: " + thread.id);
  return thread;
}

async function findOrCreateThread(treadId) {
  let thread;

  if (treadId) {
    thread = await openai.beta.threads.retrieve(treadId);
  }

  if (!thread) {
      thread = await createThread();
  }

  return thread;
}

async function addMessage(threadId, message) {
  console.log("Adding a new message to thread: " + threadId);
  const response = await openai.beta.threads.messages.create(threadId, {
    role: "user",
    content: message,
  });

  return response;
}

async function runAssistant(threadId) {
  console.log("Running assistant for thread: " + threadId);
  const response = await openai.beta.threads.runs.create(threadId, {
    assistant_id: assistantId,
  });

  console.log("Run created: " + response.id);
  return response;
}
async function checkingStatus(threadId, runId, pollingInterval) {
  console.log("Checking status for thread: " + threadId);
  const runObject = await openai.beta.threads.runs.retrieve(threadId, runId);

  return runObject;
  // console.log("Run object: ");
  // const status = runObject.status;
  // console.log(runObject);
  // console.log("Current status: " + status);
  //
  // if (status === "completed") {
  //   clearInterval(pollingInterval);
  //
  //   const messagesList = await openai.beta.threads.messages.list(threadId);
  //   let messages = [];
  //
  //   messagesList.body.data.forEach((message) => {
  //     messages.push(message.content);
  //   });
  //
  //   return { messages };
  // }
}

async function getMessagesList(threadId) {
  const messagesList = await openai.beta.threads.messages.list(threadId);
  let messages = [];

  messagesList.body.data.forEach((message) => {
    messages.push(message.content);
  });

  return messages;
}

export { createThread, addMessage, runAssistant, checkingStatus, getMessagesList, findOrCreateThread }