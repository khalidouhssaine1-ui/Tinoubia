import { MessageCircle, Send } from "lucide-react";
import { whatsappLink } from "@/lib/nav-config";

export function MobileStickyBar() {
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 flex lg:hidden border-t border-border bg-background/95 backdrop-blur-md pb-[env(safe-area-inset-bottom)]">
      <a
        href="/contact"
        className="flex flex-1 items-center justify-center gap-2 py-3.5 text-sm font-medium text-charcoal border-r border-border"
      >
        <Send className="size-4" />
        Enquire Now
      </a>
      <a
        href={whatsappLink("Hello, I'd like more information about a property.")}
        target="_blank"
        rel="noopener noreferrer"
        className="flex flex-1 items-center justify-center gap-2 bg-[#25D366] py-3.5 text-sm font-medium text-white"
      >
        <MessageCircle className="size-4" fill="currentColor" />
        WhatsApp
      </a>
    </div>
  );
}
