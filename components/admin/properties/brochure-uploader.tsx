"use client";

import { useRef, useState } from "react";
import { FileText, UploadCloud, Loader2, Trash2, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { setPropertyBrochure, removePropertyBrochure } from "@/lib/actions/media";

const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const MAX_MB = 20;

export function BrochureUploader({
  propertyId,
  initialUrl,
}: {
  propertyId: string;
  initialUrl: string | null;
}) {
  const [url, setUrl] = useState(initialUrl);
  const [busy, setBusy] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const configured = Boolean(CLOUD_NAME);

  async function handleFile(file: File | undefined) {
    if (!file) return;
    if (file.type !== "application/pdf") {
      toast.error("Please choose a PDF file.");
      return;
    }
    if (file.size > MAX_MB * 1024 * 1024) {
      toast.error(`PDF must be under ${MAX_MB} MB.`);
      return;
    }
    if (!configured) {
      toast.error("Cloudinary is not configured yet.");
      return;
    }

    setBusy(true);
    try {
      const signRes = await fetch("/api/cloudinary/sign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ folder: "brochures" }),
      });
      if (!signRes.ok) throw new Error("Could not sign upload");
      const { timestamp, signature, apiKey, cloudName, folder } = await signRes.json();

      const formData = new FormData();
      formData.append("file", file);
      formData.append("api_key", apiKey);
      formData.append("timestamp", String(timestamp));
      formData.append("signature", signature);
      formData.append("folder", folder);

      // PDFs upload as `raw` so they stay downloadable documents.
      const uploadRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/raw/upload`, {
        method: "POST",
        body: formData,
      });
      const result = await uploadRes.json();
      if (!uploadRes.ok) throw new Error(result?.error?.message || "Upload failed");

      const saved = await setPropertyBrochure(propertyId, {
        url: result.secure_url,
        publicId: result.public_id,
      });
      if (!saved.success) throw new Error(saved.error || "Could not save brochure");

      setUrl(result.secure_url);
      toast.success("Brochure uploaded");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  async function handleRemove() {
    setBusy(true);
    const result = await removePropertyBrochure(propertyId);
    setBusy(false);
    if (result.success) {
      setUrl(null);
      toast.success("Brochure removed");
    } else {
      toast.error(result.error || "Could not remove brochure");
    }
  }

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-center gap-2">
        <FileText className="size-4 text-bronze" />
        <h3 className="text-sm font-medium text-charcoal">Property brochure (PDF)</h3>
      </div>
      <p className="mt-1 text-xs text-muted-foreground">
        Optional. Shown as a &quot;Download brochure&quot; button on the public property page.
      </p>

      <input
        ref={inputRef}
        type="file"
        accept="application/pdf"
        hidden
        onChange={(e) => handleFile(e.target.files?.[0])}
      />

      {url ? (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-sm font-medium text-charcoal hover:bg-muted"
          >
            <ExternalLink className="size-4" /> View current PDF
          </a>
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={busy}
            className="inline-flex items-center gap-1.5 rounded-lg bg-bronze px-3 py-2 text-sm font-medium text-white hover:bg-bronze/90 disabled:opacity-60"
          >
            {busy ? <Loader2 className="size-4 animate-spin" /> : <UploadCloud className="size-4" />} Replace
          </button>
          <button
            type="button"
            onClick={handleRemove}
            disabled={busy}
            className="inline-flex items-center gap-1.5 rounded-lg border border-destructive/40 px-3 py-2 text-sm font-medium text-destructive hover:bg-destructive/10 disabled:opacity-60"
          >
            <Trash2 className="size-4" /> Remove
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={busy || !configured}
          className="mt-3 inline-flex items-center gap-2 rounded-lg bg-bronze px-3 py-2 text-sm font-medium text-white hover:bg-bronze/90 disabled:opacity-60"
        >
          {busy ? <Loader2 className="size-4 animate-spin" /> : <UploadCloud className="size-4" />} Upload PDF
        </button>
      )}

      {!configured && <p className="mt-2 text-xs text-destructive">Cloudinary env vars not configured yet.</p>}
    </div>
  );
}
