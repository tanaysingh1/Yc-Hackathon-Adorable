import { createApp } from "@/actions/create-app";
import { redirect } from "next/navigation";
import { getUser } from "@/auth/stack-auth";

// This page is never rendered. It is used to:
// - Force user login without losing the user's initial message and template selection.
// - Force a loading page to be rendered (loading.tsx) while the app is being created.
export default async function NewAppRedirectPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] }>;
  params: Promise<{ id: string }>;
}) {
  const user = await getUser().catch(() => undefined);
  const search = await searchParams;

  if (!user) {
    // reconstruct the search params
    const newParams = new URLSearchParams();
    Object.entries(search).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        value.forEach((v) => newParams.append(key, v));
      } else {
        newParams.set(key, value);
      }
    });

    // After sign in, redirect back to this page with the initial search params
    redirect(
      `/handler/sign-in?after_auth_return_to=${encodeURIComponent(
        "/app/new?" + newParams.toString()
      )}`
    );
  }

  // Handle both old message format and new messageData format for backward compatibility
  let messageParts: any[] | undefined;
  
  if (search.messageData) {
    try {
      const messageDataStr = Array.isArray(search.messageData) 
        ? search.messageData[0] 
        : search.messageData;
      const parsed = JSON.parse(decodeURIComponent(messageDataStr));
      messageParts = parsed.parts;
    } catch (error) {
      console.error("Failed to parse messageData:", error);
      // Fall back to old format
    }
  }

  // Backward compatibility: handle old message format
  if (!messageParts && search.message) {
    const message = Array.isArray(search.message) ? search.message[0] : search.message;
    if (message) {
      messageParts = [
        {
          type: "text",
          text: decodeURIComponent(message),
        },
      ];
    }
  }

  const { id } = await createApp({
    initialMessageParts: messageParts,
    templateId: search.template as string,
  });

  redirect(`/app/${id}`);
}
