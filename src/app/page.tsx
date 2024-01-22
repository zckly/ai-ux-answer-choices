"use client";
import { useChat } from "ai/react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";

const userPrompt = `You are a world-class Spanish tutor. Your task is to teach me greetings in Spanish.
Always end your response with multiple choice options for me to choose from, starting with "## OPTIONS".
Here's an example of how your response should look:
You: <Your response>
## OPTIONS
A. <Option 1>
B. <Option 2>
C. <Option 3>`;

export default function Home() {
  // This state is for storing the answer choices
  const [answerChoices, setAnswerChoices] = useState<string[]>([]);
  // This state is for storing the user input
  const [input, setInput] = useState<string>("");
  const { messages, setMessages, append } = useChat({
    initialMessages: [
      {
        id: "SYSTEM",
        role: "system",
        content: `You are a world-class Spanish tutor. Always respond in English.`,
      },
    ],
  });
  // This ref is needed to make sure our useEffect only runs once in development mode
  const effectRan = useRef(false);

  async function initializeChat() {
    await append({
      role: "user",
      content: userPrompt,
    });
  }

  // Initialize chat on mount
  useEffect(() => {
    // Hack to make sure this useEffect only runs once, on mount
    if (!effectRan.current || process.env.NODE_ENV !== "development") {
      initializeChat();
    }

    return () => {
      effectRan.current = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // This useEffect is for converting the last assistant message into answer choices
  useEffect(() => {
    const lastMessage = messages[messages.length - 1];
    if (
      lastMessage.role === "assistant" &&
      lastMessage.content.includes("## OPTIONS")
    ) {
      const options = lastMessage.content
        .split("## OPTIONS")[1]
        .split("\n")
        .filter((option) => option.trim() !== "");
      setAnswerChoices(options);
    }
  }, [messages]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24 max-w-prose mx-auto">
      <div className="text-center">
        <h3 className="font-bold text-lg">
          AI UX Patterns: Multiple Choice Chatbot
        </h3>
        <p className="text-gray-300 text-sm">
          This is a demo of a Spanish tutoring chatbot that generates multiple
          choice options for the user to choose from.
        </p>
        <p className="text-blue-200 text-sm">
          Made by <Link href="https://twitter.com/wenquai">@wenquai</Link>
        </p>
      </div>
      <div className="flex flex-col space-y-4 max-h-[600px] overflow-auto">
        {messages.slice(2).map((message) => (
          <div
            key={message.id}
            className={`flex flex-col space-y-2 ${
              message.role === "user" ? "text-gray-400" : ""
            }`}
          >
            <Markdown
              remarkPlugins={[remarkGfm]}
              components={{
                li: ({ node, ...props }) => {
                  return <li className="list-disc list-inside" {...props} />;
                },
              }}
            >
              {message.content.split("## OPTIONS")[0]}
            </Markdown>
          </div>
        ))}
      </div>
      <div className="flex flex-col space-y-4">
        {answerChoices.map((choice, index) => (
          <button
            key={index}
            className="bg-blue-500 text-white rounded-md py-2 px-4"
            onClick={() => {
              append({
                role: "user",
                content: choice,
              });
              setAnswerChoices([]);
            }}
          >
            {choice}
          </button>
        ))}
        <div className="flex items-center">
          <input
            className="border rounded-md p-2 flex-grow"
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <button
            className="bg-blue-500 text-white rounded-md py-2 px-4 ml-2"
            onClick={() => {
              append({
                role: "user",
                content: input,
              });
              setAnswerChoices([]);
            }}
          >
            Send
          </button>
        </div>
      </div>
    </main>
  );
}
