"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import Modal from "@/app/components/Modal";

type GalleryItem = {
  id: number;
  label: string;
  url: string;
};

const ICON_IMAGE = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <circle cx="8.5" cy="8.5" r="1.5" />
    <path d="M21 15l-5-5L5 21" />
  </svg>
);
const ICON_TRASH = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M3 6h18" />
    <path d="M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2" />
    <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
  </svg>
);

/* Border lives in Tailwind classes (not inline) so focus: variants can win. */
const inputClass =
  "w-full rounded-xl px-4 py-2.5 text-sm outline-none bg-white text-[var(--gray-900)] [border:1.5px_solid_var(--gray-100)] focus:border-[var(--ff-400)] focus:shadow-[0_0_0_3px_var(--ff-100)] transition-shadow duration-200";

const labelClass = "block text-xs font-semibold mb-1.5 text-[var(--gray-700)]";

/** Floating confirmation toast — success fades away on its own, errors stay. */
function Toast({ message, onClose }: { message: { type: "ok" | "error"; text: string }; onClose: () => void }) {
  const ok = message.type === "ok";
  return (
    <div
      role={ok ? "status" : "alert"}
      className="fixed bottom-5 right-5 z-[70] flex items-start gap-3 max-w-[calc(100vw-2.5rem)] sm:max-w-md rounded-2xl py-3 pl-3.5 pr-3"
      style={{
        background: "rgba(255,255,255,0.94)",
        backdropFilter: "blur(16px) saturate(160%)",
        WebkitBackdropFilter: "blur(16px) saturate(160%)",
        border: `1px solid ${ok ? "#c3e6cb" : "#ffd7d7"}`,
        boxShadow: "0 24px 50px -20px rgba(0,43,39,0.45)",
        animation: "ffCardIn 0.3s ease both",
      }}
    >
      <span
        className="shrink-0 mt-0.5 flex h-6 w-6 items-center justify-center rounded-full"
        style={ok ? { background: "#e6f4ea", color: "#137333" } : { background: "#fff1f1", color: "#b42318" }}
        aria-hidden="true"
      >
        {ok ? (
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M20 6L9 17l-5-5" />
          </svg>
        ) : (
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 8v5M12 16.5v.01" />
          </svg>
        )}
      </span>
      <p className="text-sm leading-snug" style={{ color: ok ? "#137333" : "#b42318" }}>
        {message.text}
      </p>
      <button
        type="button"
        onClick={onClose}
        aria-label="Dismiss notification"
        className="shrink-0 ml-1 rounded-full p-1 cursor-pointer transition-colors duration-200 hover:bg-[var(--gray-100)]"
        style={{ color: "var(--gray-500)" }}
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
          <path d="M18 6 6 18M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}

export default function GalleryManager({ initial }: { initial: GalleryItem[] }) {
  const [items, setItems] = useState(initial);
  const [tab, setTab] = useState<"upload" | "import">("upload");
  const [showAdd, setShowAdd] = useState(false);
  const [label, setLabel] = useState("");
  const [importUrl, setImportUrl] = useState("");
  const [importLabel, setImportLabel] = useState("");
  const [busy, setBusy] = useState<"upload" | "import" | "delete" | null>(null);
  const [message, setMessage] = useState<{ type: "ok" | "error"; text: string } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState("");
  const [preview, setPreview] = useState<GalleryItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<GalleryItem | null>(null);

  // Success toasts clear themselves; errors stay until acted on.
  useEffect(() => {
    if (!message || message.type !== "ok") return;
    const timer = window.setTimeout(() => setMessage(null), 4500);
    return () => window.clearTimeout(timer);
  }, [message]);

  const openAdd = (which: "upload" | "import") => {
    setTab(which);
    setShowAdd(true);
    setMessage(null);
  };

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
      setShowAdd(false);
      setMessage({ type: "ok", text: "Photo added — it's live in the public gallery now." });
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
      setShowAdd(false);
      setMessage({ type: "ok", text: "Image imported — it's live in the public gallery now." });
    } catch (err) {
      setMessage({ type: "error", text: err instanceof Error ? err.message : "Import failed." });
    } finally {
      setBusy(null);
    }
  };

  /** Runs once the delete dialog is confirmed. */
  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setBusy("delete");
    setMessage(null);
    try {
      const res = await fetch(`/api/gallery/${deleteTarget.id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Delete failed.");
      setItems((current) => current.filter((i) => i.id !== deleteTarget.id));
      setPreview(null);
      setDeleteTarget(null);
      setMessage({ type: "ok", text: "Image deleted." });
    } catch (err) {
      setMessage({ type: "error", text: err instanceof Error ? err.message : "Delete failed." });
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* ── Glass header ── */}
      <div
        className="relative overflow-hidden rounded-[26px] p-5 sm:p-6"
        style={{
          background: "rgba(255,255,255,0.78)",
          backdropFilter: "blur(16px) saturate(160%)",
          WebkitBackdropFilter: "blur(16px) saturate(160%)",
          border: "1px solid rgba(255,255,255,0.7)",
          boxShadow: "0 18px 44px -30px rgba(0,61,56,0.45)",
        }}
      >
        <span
          aria-hidden="true"
          className="absolute -top-24 -right-16 h-56 w-56 rounded-full"
          style={{ background: "radial-gradient(circle, rgba(0,167,157,0.16), transparent 70%)" }}
        />
        <div className="relative flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-extrabold" style={{ fontFamily: "var(--font-heading)", color: "var(--gray-950)" }}>
              Gallery media
            </h2>
            <p className="mt-1 text-sm max-w-lg" style={{ color: "var(--gray-500)" }}>
              Every photo you add appears straight away on the public gallery page.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => openAdd("import")}
              className="inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-bold cursor-pointer transition-all duration-200 hover:-translate-y-0.5"
              style={{
                fontFamily: "var(--font-heading)",
                background: "transparent",
                border: "1.5px solid var(--gray-100)",
                color: "var(--gray-700)",
              }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" />
                <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" />
              </svg>
              Import link
            </button>
            <button
              type="button"
              onClick={() => openAdd("upload")}
              className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-bold cursor-pointer transition-all duration-200 hover:-translate-y-0.5"
              style={{
                fontFamily: "var(--font-heading)",
                background: "linear-gradient(135deg, var(--ff-500), var(--ff-700))",
                color: "#fff",
                boxShadow: "0 10px 24px -10px rgba(0,167,157,0.75)",
              }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true">
                <path d="M12 5v14M5 12h14" />
              </svg>
              Add photo
            </button>
          </div>
        </div>
        <div className="relative mt-4 flex flex-wrap gap-2">
          <div
            className="flex items-center gap-2 rounded-full pl-3 pr-3.5 py-1.5"
            style={{
              background: "rgba(255,255,255,0.75)",
              border: "1px solid rgba(255,255,255,0.9)",
              boxShadow: "0 6px 16px -12px rgba(0,61,56,0.5)",
            }}
          >
            <span className="h-1.5 w-1.5 rounded-full" style={{ background: "var(--ff-500)", boxShadow: "0 0 8px var(--ff-500)" }} aria-hidden="true" />
            <span className="text-sm font-extrabold" style={{ fontFamily: "var(--font-heading)", color: "var(--gray-950)" }}>
              {items.length}
            </span>
            <span className="text-[10px] font-bold uppercase tracking-[0.12em]" style={{ color: "var(--gray-500)" }}>
              {items.length === 1 ? "Photo" : "Photos"} live
            </span>
          </div>
        </div>
      </div>

      {message && <Toast message={message} onClose={() => setMessage(null)} />}

      {/* ── Add photo popup (upload / import tabs) ── */}
      <Modal
        open={showAdd}
        onClose={() => setShowAdd(false)}
        title="Add a photo"
        subtitle="It goes live on the public gallery the moment you save."
        icon={ICON_IMAGE}
      >
        <div
          className="mb-5 flex gap-1 rounded-full p-1"
          style={{ background: "var(--gray-100)" }}
          role="tablist"
          aria-label="How to add a photo"
        >
          {(["upload", "import"] as const).map((t) => (
            <button
              key={t}
              type="button"
              role="tab"
              aria-selected={tab === t}
              onClick={() => setTab(t)}
              className="flex-1 rounded-full py-2 text-xs font-bold cursor-pointer transition-all duration-200"
              style={{
                fontFamily: "var(--font-heading)",
                background: tab === t ? "white" : "transparent",
                color: tab === t ? "var(--ff-700)" : "var(--gray-500)",
                boxShadow: tab === t ? "0 4px 12px -6px rgba(0,61,56,0.4)" : "none",
              }}
            >
              {t === "upload" ? "Upload from device" : "Import from a link"}
            </button>
          ))}
        </div>

        {tab === "upload" ? (
          <form onSubmit={uploadFile} className="space-y-4">
            <label
              htmlFor="gallery-file"
              className="flex flex-col items-center justify-center gap-2 rounded-xl py-8 px-4 text-center cursor-pointer transition-colors duration-200 [border:1.5px_dashed_var(--gray-300)] hover:border-[var(--ff-400)] hover:bg-[var(--ff-50)]"
              style={{ background: "var(--ff-50)", color: "var(--gray-500)" }}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
              <span className="text-xs font-semibold" style={{ fontFamily: "var(--font-heading)" }}>
                {busy === "upload" ? "Uploading…" : fileName || "Click to choose an image (max 10MB)"}
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
              <label htmlFor="gallery-label" className={labelClass}>
                Caption (optional)
              </label>
              <input
                id="gallery-label"
                type="text"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder="e.g. Coding Bootcamp"
                className={inputClass}
              />
            </div>

            {message?.type === "error" && (
              <p className="text-sm rounded-xl px-4 py-2.5" role="alert" style={{ background: "#fff1f1", border: "1px solid #ffd7d7", color: "#b42318" }}>
                {message.text}
              </p>
            )}

            <div className="flex gap-3">
              <button type="submit" disabled={busy === "upload"} className="btn-brand disabled:opacity-70">
                {busy === "upload" ? "Uploading…" : "Upload photo"}
              </button>
              <button
                type="button"
                onClick={() => setShowAdd(false)}
                className="text-sm font-semibold px-5 py-2.5 rounded-full cursor-pointer"
                style={{ fontFamily: "var(--font-heading)", background: "transparent", border: "1.5px solid var(--gray-100)", color: "var(--gray-700)" }}
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={importImage} className="space-y-4">
            <div>
              <label htmlFor="gallery-url" className={labelClass}>
                Image URL
              </label>
              <input
                id="gallery-url"
                type="url"
                required
                value={importUrl}
                onChange={(e) => setImportUrl(e.target.value)}
                placeholder="https://example.com/photo.jpg"
                className={inputClass}
              />
            </div>

            <div>
              <label htmlFor="gallery-import-label" className={labelClass}>
                Caption (optional)
              </label>
              <input
                id="gallery-import-label"
                type="text"
                value={importLabel}
                onChange={(e) => setImportLabel(e.target.value)}
                placeholder="e.g. Graduation Day"
                className={inputClass}
              />
            </div>

            {looksLikeUrl(importUrl) && (
              <div
                className="relative h-40 overflow-hidden rounded-xl"
                style={{ border: "1px solid var(--gray-100)", background: "var(--ff-50)" }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element -- arbitrary URLs bypass next/image host rules */}
                <img src={importUrl} alt="" className="h-full w-full object-cover" />
              </div>
            )}

            {message?.type === "error" && (
              <p className="text-sm rounded-xl px-4 py-2.5" role="alert" style={{ background: "#fff1f1", border: "1px solid #ffd7d7", color: "#b42318" }}>
                {message.text}
              </p>
            )}

            <div className="flex gap-3">
              <button type="submit" disabled={busy === "import"} className="btn-brand disabled:opacity-70">
                {busy === "import" ? "Importing…" : "Import image"}
              </button>
              <button
                type="button"
                onClick={() => setShowAdd(false)}
                className="text-sm font-semibold px-5 py-2.5 rounded-full cursor-pointer"
                style={{ fontFamily: "var(--font-heading)", background: "transparent", border: "1.5px solid var(--gray-100)", color: "var(--gray-700)" }}
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </Modal>

      {/* ── Preview popup ── */}
      <Modal
        open={preview !== null}
        onClose={() => setPreview(null)}
        title={preview?.label || "Photo"}
        subtitle="Shown on the public gallery page."
        width="max-w-2xl"
      >
        {preview && (
          <>
            <div
              className="relative max-h-[55vh] overflow-hidden rounded-2xl"
              style={{ background: "var(--ff-50)", border: "1px solid var(--gray-100)" }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element -- arbitrary URLs bypass next/image host rules */}
              <img src={preview.url} alt={preview.label} className="w-full max-h-[55vh] object-contain" />
            </div>
            <div className="mt-5 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setPreview(null)}
                className="text-sm font-semibold px-5 py-2.5 rounded-full cursor-pointer"
                style={{ fontFamily: "var(--font-heading)", background: "transparent", border: "1.5px solid var(--gray-100)", color: "var(--gray-700)" }}
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => { setDeleteTarget(preview); setPreview(null); }}
                className="inline-flex items-center gap-1.5 text-sm font-bold px-5 py-2.5 rounded-full cursor-pointer transition-all duration-200 hover:-translate-y-0.5"
                style={{ fontFamily: "var(--font-heading)", background: "#fff1f1", border: "1px solid #ffd7d7", color: "#b42318" }}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M3 6h18" />
                  <path d="M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                  <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
                </svg>
                Delete photo
              </button>
            </div>
          </>
        )}
      </Modal>

      {/* ── Delete confirmation ── */}
      <Modal
        open={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        title="Delete photo"
        subtitle="This also removes it from Cloudinary."
        icon={ICON_TRASH}
        tone="danger"
        width="max-w-md"
      >
        <p className="text-sm leading-relaxed" style={{ color: "var(--gray-500)" }}>
          <strong style={{ color: "var(--gray-900)" }}>{deleteTarget?.label}</strong> will be removed
          from the public gallery. This cannot be undone.
        </p>

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={() => setDeleteTarget(null)}
            className="text-sm font-semibold px-5 py-2.5 rounded-full cursor-pointer"
            style={{ fontFamily: "var(--font-heading)", background: "transparent", border: "1.5px solid var(--gray-100)", color: "var(--gray-700)" }}
          >
            Keep it
          </button>
          <button
            type="button"
            onClick={confirmDelete}
            disabled={busy === "delete"}
            className="inline-flex items-center gap-1.5 text-sm font-bold px-5 py-2.5 rounded-full cursor-pointer transition-all duration-200 hover:-translate-y-0.5 disabled:opacity-60"
            style={{ fontFamily: "var(--font-heading)", background: "#b42318", border: "1px solid #b42318", color: "#fff" }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M3 6h18" />
              <path d="M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2" />
              <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
            </svg>
            {busy === "delete" ? "Deleting…" : "Delete photo"}
          </button>
        </div>
      </Modal>

      {/* ── Grid ── */}
      <div>
        <h3 className="text-sm font-extrabold mb-3 flex items-center gap-2" style={{ fontFamily: "var(--font-heading)", color: "var(--gray-950)" }}>
          All photos
          <span
            className="inline-flex items-center justify-center rounded-full px-2 py-0.5 text-[10px] font-bold"
            style={{ background: "var(--ff-100)", color: "var(--ff-700)" }}
          >
            {items.length}
          </span>
        </h3>

        {items.length === 0 ? (
          <div
            className="rounded-[26px] py-14 text-center"
            style={{ background: "rgba(255,255,255,0.7)", border: "1px dashed var(--gray-300)" }}
          >
            <div
              className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl"
              style={{ background: "var(--ff-50)", color: "var(--ff-500)", border: "1px solid var(--ff-100)" }}
              aria-hidden="true"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <path d="M21 15l-5-5L5 21" />
              </svg>
            </div>
            <p className="text-sm font-semibold" style={{ color: "var(--gray-700)", fontFamily: "var(--font-heading)" }}>
              No photos yet
            </p>
            <p className="mt-0.5 text-xs" style={{ color: "var(--gray-500)" }}>
              Add your first one with the button above.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {items.map((item) => (
              <div
                key={item.id}
                className="group relative rounded-[22px] overflow-hidden aspect-square cursor-zoom-in transition-shadow duration-300 hover:shadow-[0_20px_44px_-24px_rgba(0,61,56,0.5)]"
                style={{
                  background: "var(--ff-50)",
                  border: "1px solid var(--gray-100)",
                  boxShadow: "0 2px 10px rgba(0,61,56,0.05)",
                }}
                onClick={() => setPreview(item)}
              >
                <Image src={item.url} alt={item.label} fill sizes="(max-width: 640px) 50vw, 25vw" className="object-cover transition-transform duration-500 group-hover:scale-[1.07]" />
                <div
                  className="absolute inset-0 flex flex-col justify-end p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                  style={{ background: "linear-gradient(to top, rgba(0,20,18,0.8) 0%, rgba(0,20,18,0.1) 55%, transparent 75%)" }}
                >
                  <p className="text-white text-xs font-bold truncate" style={{ fontFamily: "var(--font-heading)" }}>
                    {item.label}
                  </p>
                  <div className="mt-2 flex items-center gap-2">
                    <span
                      className="text-[11px] font-bold px-3 py-1.5 rounded-full"
                      style={{ background: "rgba(255,255,255,0.16)", color: "#fff", border: "1px solid rgba(255,255,255,0.3)" }}
                    >
                      View
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteTarget(item);
                      }}
                      disabled={busy === "delete"}
                      aria-label={`Delete ${item.label}`}
                      className="text-[11px] font-bold px-3 py-1.5 rounded-full cursor-pointer disabled:opacity-60"
                      style={{ background: "#b42318", color: "#fff", border: "none", fontFamily: "var(--font-heading)" }}
                    >
                      {busy === "delete" ? "Deleting…" : "Delete"}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const looksLikeUrl = (v: string) => /^https?:\/\/\S+\.\S+/i.test(v.trim());
