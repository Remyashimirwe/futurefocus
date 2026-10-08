"use client";

import Image from "next/image";
import { useRef, useState } from "react";

type GalleryItem = {
  id: number;
  label: string;
  url: string;
};

const cardStyle: React.CSSProperties = {
  background: "var(--white)",
  border: "1px solid var(--gray-100)",
};

export default function GalleryManager({ initial }: { initial: GalleryItem[] }) {
  const [items, setItems] = useState(initial);
  const [label, setLabel] = useState("");
  const [importUrl, setImportUrl] = useState("");
  const [importLabel, setImportLabel] = useState("");
  const [busy, setBusy] = useState<"upload" | "import" | "delete" | null>(null);
  const [message, setMessage] = useState<{ type: "ok" | "error"; text: string } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState("");

  const uploadFile = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const file = fileRef.current?.files?.[0];
    if (!file) {
      setMessage({ type: "error", text: "Please choose an image first." });
      return;
    }

    setBusy("upload");
    setMessage(null);
    try {
      const form = new FormData();
      form.append("file", file);
      form.append("label", label);
      const res = await fetch("/api/gallery", { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Upload failed.");

      const objectUrl = URL.createObjectURL(file);
      setItems((current) => [
        { id: data.id ?? Date.now(), label: label || file.name.replace(/\.[^.]+$/, ""), url: objectUrl },
        ...current,
      ]);
      setLabel("");
      setFileName("");
      if (fileRef.current) fileRef.current.value = "";
      setMessage({ type: "ok", text: "Image uploaded to Cloudinary." });
    } catch (err) {
      setMessage({ type: "error", text: err instanceof Error ? err.message : "Upload failed." });
    } finally {
      setBusy(null);
    }
  };

  const importImage = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setBusy("import");
    setMessage(null);
    try {
      const res = await fetch("/api/gallery", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: importUrl, label: importLabel }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Import failed.");

      setItems((current) => [
        { id: data.id ?? Date.now(), label: importLabel || "Imported image", url: importUrl.trim() },
        ...current,
      ]);
      setImportUrl("");
      setImportLabel("");
      setMessage({ type: "ok", text: "Image imported." });
    } catch (err) {
      setMessage({ type: "error", text: err instanceof Error ? err.message : "Import failed." });
    } finally {
      setBusy(null);
    }
  };

  const removeImage = async (item: GalleryItem) => {
    if (!window.confirm(`Delete "${item.label}"? This also removes it from Cloudinary.`)) return;
    setBusy("delete");
    setMessage(null);
    try {
      const res = await fetch(`/api/gallery/${item.id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Delete failed.");
      setItems((current) => current.filter((i) => i.id !== item.id));
      setMessage({ type: "ok", text: "Image deleted." });
    } catch (err) {
      setMessage({ type: "error", text: err instanceof Error ? err.message : "Delete failed." });
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-extrabold" style={{ fontFamily: "var(--font-heading)", color: "var(--gray-950)" }}>
          Gallery media
        </h2>
        <p className="text-sm" style={{ color: "var(--gray-500)" }}>
          Upload new photos or import them from a link. Images are stored on Cloudinary.
        </p>
      </div>

      {message && (
        <p
          className="text-sm rounded-xl px-4 py-2.5"
          role="status"
          style={
            message.type === "ok"
              ? { background: "#e6f4ea", border: "1px solid #c3e6cb", color: "#137333" }
              : { background: "#fff1f1", border: "1px solid #ffd7d7", color: "#b42318" }
          }
        >
          {message.text}
        </p>
      )}

      {/* Upload + import */}
      <div className="grid lg:grid-cols-2 gap-4">
        <form onSubmit={uploadFile} className="rounded-2xl p-5 space-y-4" style={cardStyle}>
          <h3 className="text-sm font-extrabold" style={{ fontFamily: "var(--font-heading)", color: "var(--gray-950)" }}>
            Upload from your device
          </h3>

          <label
            htmlFor="gallery-file"
            className="flex flex-col items-center justify-center gap-2 rounded-xl py-8 px-4 text-center cursor-pointer transition-colors duration-200"
            style={{ border: "1.5px dashed var(--gray-300)", background: "var(--ff-50)", color: "var(--gray-500)" }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
            <span className="text-xs font-semibold" style={{ fontFamily: "var(--font-heading)" }}>
              {fileName || "Click to choose an image (max 10MB)"}
            </span>
            <input
              id="gallery-file"
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => setFileName(e.target.files?.[0]?.name ?? "")}
            />
          </label>

          <div>
            <label htmlFor="gallery-label" className="block text-xs font-semibold mb-1.5" style={{ color: "var(--gray-700)", fontFamily: "var(--font-heading)" }}>
              Caption (optional)
            </label>
            <input
              id="gallery-label"
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="e.g. Coding Bootcamp"
              className="w-full rounded-xl px-4 py-2.5 text-sm outline-none"
              style={{ background: "white", border: "1.5px solid var(--gray-100)", color: "var(--gray-900)" }}
            />
          </div>

          <button type="submit" disabled={busy === "upload"} className="btn-brand w-full justify-center disabled:opacity-70">
            {busy === "upload" ? "Uploading…" : "Upload to Cloudinary"}
          </button>
        </form>

        <form onSubmit={importImage} className="rounded-2xl p-5 space-y-4" style={cardStyle}>
          <h3 className="text-sm font-extrabold" style={{ fontFamily: "var(--font-heading)", color: "var(--gray-950)" }}>
            Import from a link
          </h3>

          <div>
            <label htmlFor="gallery-url" className="block text-xs font-semibold mb-1.5" style={{ color: "var(--gray-700)", fontFamily: "var(--font-heading)" }}>
              Image URL
            </label>
            <input
              id="gallery-url"
              type="url"
              required
              value={importUrl}
              onChange={(e) => setImportUrl(e.target.value)}
              placeholder="https://example.com/photo.jpg"
              className="w-full rounded-xl px-4 py-2.5 text-sm outline-none"
              style={{ background: "white", border: "1.5px solid var(--gray-100)", color: "var(--gray-900)" }}
            />
          </div>

          <div>
            <label htmlFor="gallery-import-label" className="block text-xs font-semibold mb-1.5" style={{ color: "var(--gray-700)", fontFamily: "var(--font-heading)" }}>
              Caption (optional)
            </label>
            <input
              id="gallery-import-label"
              type="text"
              value={importLabel}
              onChange={(e) => setImportLabel(e.target.value)}
              placeholder="e.g. Graduation Day"
              className="w-full rounded-xl px-4 py-2.5 text-sm outline-none"
              style={{ background: "white", border: "1.5px solid var(--gray-100)", color: "var(--gray-900)" }}
            />
          </div>

          <button type="submit" disabled={busy === "import"} className="btn-brand w-full justify-center disabled:opacity-70">
            {busy === "import" ? "Importing…" : "Import image"}
          </button>
        </form>
      </div>

      {/* Grid */}
      <div>
        <h3 className="text-sm font-extrabold mb-3" style={{ fontFamily: "var(--font-heading)", color: "var(--gray-950)" }}>
          Uploaded images ({items.length})
        </h3>

        {items.length === 0 ? (
          <div className="rounded-2xl py-14 text-center" style={cardStyle}>
            <p className="text-sm" style={{ color: "var(--gray-500)" }}>
              No images yet — upload or import your first one above.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {items.map((item) => (
              <div key={item.id} className="group relative rounded-2xl overflow-hidden aspect-square" style={cardStyle}>
                <Image src={item.url} alt={item.label} fill sizes="(max-width: 640px) 50vw, 25vw" className="object-cover" />
                <div
                  className="absolute inset-0 flex flex-col justify-end p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                  style={{ background: "linear-gradient(to top, rgba(0,0,0,0.75) 0%, transparent 60%)" }}
                >
                  <p className="text-white text-xs font-bold truncate" style={{ fontFamily: "var(--font-heading)" }}>
                    {item.label}
                  </p>
                  <button
                    type="button"
                    onClick={() => removeImage(item)}
                    disabled={busy === "delete"}
                    className="mt-2 text-[11px] font-bold px-3 py-1.5 rounded-full cursor-pointer self-start disabled:opacity-60"
                    style={{ background: "#b42318", color: "#fff", border: "none", fontFamily: "var(--font-heading)" }}
                  >
                    {busy === "delete" ? "Deleting…" : "Delete"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
