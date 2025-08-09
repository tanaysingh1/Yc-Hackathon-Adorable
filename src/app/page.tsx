"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import LogoSvg from "@/logo.svg";
import { useState } from "react";
import { ExampleButton } from "@/components/ExampleButton";
import { UserButton } from "@stackframe/stack";
import { UserApps } from "@/components/user-apps";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { EnhancedPromptInput } from "@/components/enhanced-prompt-input";
import { CompressedImage } from "@/lib/image-compression";

const queryClient = new QueryClient();

export default function Home() {
  const [prompt, setPrompt] = useState("");
  const [framework, setFramework] = useState("nextjs");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (text: string, images: CompressedImage[]) => {
    setIsLoading(true);

    // Create a message parts structure similar to what the chat uses
    const messageParts = [];
    
    if (text.trim()) {
      messageParts.push({
        type: "text",
        text: text,
      });
    }

    images.forEach((image) => {
      messageParts.push({
        type: "file",
        mediaType: image.mimeType,
        url: image.data,
      });
    });

    // Encode the complex message structure as JSON
    const messageData = JSON.stringify({ parts: messageParts });

    router.push(
      `/app/new?messageData=${encodeURIComponent(messageData)}&template=${framework}`
    );
  };

  return (
    <QueryClientProvider client={queryClient}>
      <main className="min-h-screen p-4 relative">
        <div className="flex w-full justify-between items-center">
          <h1 className="text-lg font-bold flex-1 sm:w-80">
            <a href="https://www.freestyle.sh">freestyle.sh</a>
          </h1>
          <Image
            className="dark:invert mx-2"
            src={LogoSvg}
            alt="Adorable Logo"
            width={36}
            height={36}
          />
          <div className="flex items-center gap-2 flex-1 sm:w-80 justify-end">
            <UserButton />
          </div>
        </div>

        <div>
          <div className="w-full max-w-lg px-4 sm:px-0 mx-auto flex flex-col items-center mt-16 sm:mt-24 md:mt-32 col-start-1 col-end-1 row-start-1 row-end-1 z-10">
            <p className="text-neutral-600 text-center mb-6 text-3xl sm:text-4xl md:text-5xl font-bold">
              Let AI Cook
            </p>

            <div className="w-full relative my-5">
              <EnhancedPromptInput
                prompt={prompt}
                onPromptChange={setPrompt}
                framework={framework}
                onFrameworkChange={setFramework}
                isLoading={isLoading}
                onSubmit={handleSubmit}
              />
            </div>
            <Examples setPrompt={setPrompt} />
            <div className="mt-8 mb-16">
              <a
                href="https://freestyle.sh"
                className="border rounded-md px-4 py-2 mt-4 text-sm font-semibold transition-colors duration-200 ease-in-out cursor-pointer w-full max-w-72 text-center block"
              >
                <span className="block font-bold">
                  By <span className="underline">freestyle.sh</span>
                </span>
                <span className="text-xs">
                  JavaScript infrastructure for AI.
                </span>
              </a>
            </div>
          </div>
        </div>
        <div className="border-t py-8 mx-0 sm:-mx-4">
          <UserApps />
        </div>
      </main>
    </QueryClientProvider>
  );
}

function Examples({ setPrompt }: { setPrompt: (text: string) => void }) {
  return (
    <div className="mt-2">
      <div className="flex flex-wrap justify-center gap-2 px-2">
        <ExampleButton
          text="Dog Food Marketplace"
          promptText="Build a dog food marketplace where users can browse and purchase premium dog food."
          onClick={(text) => {
            console.log("Example clicked:", text);
            setPrompt(text);
          }}
        />
        <ExampleButton
          text="Personal Website"
          promptText="Create a personal website with portfolio, blog, and contact sections."
          onClick={(text) => {
            console.log("Example clicked:", text);
            setPrompt(text);
          }}
        />
        <ExampleButton
          text="Burrito B2B SaaS"
          promptText="Build a B2B SaaS for burrito shops to manage inventory, orders, and delivery logistics."
          onClick={(text) => {
            console.log("Example clicked:", text);
            setPrompt(text);
          }}
        />
      </div>
    </div>
  );
}
