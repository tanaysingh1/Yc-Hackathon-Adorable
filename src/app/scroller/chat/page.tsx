

"use client";

import Image from "next/image";
import { useCallback, useMemo, useState } from "react";
import { ChatContainer } from "@/components/ui/chat-container";
import { PromptInputBasic } from "@/components/chatinput";
import { Markdown } from "@/components/ui/markdown";
import type { CompressedImage } from "@/lib/image-compression";

type UIPart =
  | { type: "text"; text: string }
  | { type: "file"; mediaType: string; url: string };

type UIMessage = {
  id: string;
  role: "user" | "assistant";
  parts: UIPart[];
};

function generateId() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function getExtensionFromMime(mime: string) {
  if (mime === "image/png") return "png";
  if (mime === "image/webp") return "webp";
  if (mime === "image/gif") return "gif";
  return "jpg";
}

async function uploadCompressedImage(image: CompressedImage): Promise<string> {
  const blob = await fetch(image.data).then((r) => r.blob());
  const filename = `upload.${getExtensionFromMime(image.mimeType)}`;
  const file = new File([blob], filename, { type: image.mimeType });
  const form = new FormData();
  form.append("image", file, filename);

  const res = await fetch("/api/upload", { method: "POST", body: form });
  if (!res.ok) {
    throw new Error("Upload failed");
  }
  const json = (await res.json()) as { url: string };
  return json.url;
}

export default function ScrollerChatPage() {
  const [messages, setMessages] = useState<UIMessage[]>([]);
  const [input, setInput] = useState("");

  const onSubmit = useCallback(() => {
    if (!input.trim()) return;
    const parts: UIPart[] = [{ type: "text", text: input }];
    setMessages((prev) => [
      ...prev,
      { id: generateId(), role: "user", parts },
    ]);
    setInput("");
  }, [input]);

  const onSubmitWithImages = useCallback(
    async (text: string, images: CompressedImage[]) => {
      const parts: UIPart[] = [];
      if (text.trim()) {
        parts.push({ type: "text", text });
      }

      if (images.length > 0) {
        const uploadedUrls = await Promise.all(
          images.map((img) => uploadCompressedImage(img))
        );
        uploadedUrls.forEach((url, i) => {
          parts.push({ type: "file", mediaType: images[i]!.mimeType, url });
        });
      }

      if (parts.length === 0) return;

      setMessages((prev) => [
        ...prev,
        { id: generateId(), role: "user", parts },
      ]);
      setInput("");
    },
    []
  );

  const content = useMemo(
    () => (
      <ChatContainer autoScroll className="min-h-[60vh]">
        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} />)
        )}
      </ChatContainer>
    ),
    [messages]
  );

  return (
    <main className="min-h-screen w-full overflow-x-hidden overflow-y-auto">
      <div className="mx-auto flex w-full max-w-[100vw] flex-col">
        <div className="flex-1 p-4">{content}</div>
        <div className="flex-shrink-0 p-3 bg-background">
          <PromptInputBasic
            input={input}
            onValueChange={setInput}
            onSubmit={onSubmit}
            onSubmitWithImages={onSubmitWithImages}
            isGenerating={false}
            stop={() => {}}
          />
        </div>
      </div>
    </main>
  );
}

function MessageBubble({ message }: { message: UIMessage }) {
  const isUser = message.role === "user";
  return (
    <div className={isUser ? "flex justify-end py-1 mb-4" : "flex justify-start py-1 mb-4"}>
      <div
        className={
          isUser
            ? "bg-neutral-200 dark:bg-neutral-700 rounded-xl px-4 py-2 max-w-[80%] ml-auto"
            : "bg-neutral-100 dark:bg-neutral-800 rounded-xl px-4 py-2 max-w-[80%]"
        }
      >
        {message.parts.map((part, index) => {
          if (part.type === "text") {
            return (
              <div key={index} className="mb-2 last:mb-0">
                <Markdown className="prose prose-sm dark:prose-invert max-w-none">
                  {part.text}
                </Markdown>
              </div>
            );
          }
          if (part.type === "file" && part.mediaType.startsWith("image/")) {
            return (
              <div key={index} className="mt-2">
                <Image
                  src={part.url}
                  alt="Uploaded image"
                  width={200}
                  height={200}
                  className="max-w-full h-auto rounded"
                  style={{ maxHeight: "200px" }}
                />
              </div>
            );
          }
          return null;
        })}
      </div>
    </div>
  );
}

