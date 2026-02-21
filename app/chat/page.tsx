import { Suspense } from "react";
import ChatClient from "./ChatClient";

export const metadata = {
  title: "Chat — CFB Stats",
};

export default function ChatPage() {
  return (
    <Suspense>
      <ChatClient />
    </Suspense>
  );
}
