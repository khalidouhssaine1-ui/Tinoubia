"use client";

import { MessageCircle } from "lucide-react";
import { whatsappLink } from "@/lib/nav-config";

export function WhatsAppFloat() {
  return (
    <a
      href={whatsappLink("Hello, I'd like more information about a property.")}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-40 hidden lg:flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg shadow-black/20 transition-transform duration-300 hover:scale-105 motion-reduce:transition-none motion-reduce:hover:scale-100"
      aria-label="Chat on WhatsApp"
    >
      <MessageCircle className="size-7" fill="currentColor" />
      <span className="absolute inset-0 -z-10 animate-ping rounded-full bg-[#25D366]/50 motion-reduce:animate-none" />
    </a>
  );
}
