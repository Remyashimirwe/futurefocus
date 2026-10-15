"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import Modal from "@/app/components/Modal";

type Program = {
  id: number;
  title: string;
  description: string;
  tag: string;
  img: string;
  published: boolean;
  sort_order: number;
};

type ProgramForm = {
  title: string;
  tag: string;
  description: string;
  img: string;
};

const EMPTY_FORM: ProgramForm = { title: "", tag: "", description: "", img: "" };

/** Only show the thumbnail once the URL looks complete, so typing doesn't
 *  fire a broken image request on every keystroke. */
const looksLikeUrl = (v: string) => /^https?:\/\/\S+\.\S+/i.test(v.trim());

/* Border lives in Tailwind classes (not inline) so focus: variants can win. */
const inputClass =
  "w-full rounded-xl px-4 py-2.5 text-sm outline-none bg-white text-[var(--gray-900)] [border:1.5px_solid_var(--gray-100)] focus:border-[var(--ff-400)] focus:shadow-[0_0_0_3px_var(--ff-100)] transition-shadow duration-200";

const labelStyle: React.CSSProperties = {
  color: "var(--gray-700)",
  fontFamily: "var(--font-heading)",
};

/* ── Small shared icons (kept tiny to avoid repetition below) ── */
const ICON_PLUS = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true">
    <path d="M12 5v14M5 12h14" />
  </svg>
);
const ICON_PENCIL = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M12 20h9" />
    <path d="M16.5 3.5a2.12 2.12 0 013 3L7 19l-4 1 1-4z" />
  </svg>
);
const ICON_TRASH = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M3 6h18" />
    <path d="M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2" />
    <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
  </svg>
);

function Field({
  id,
  label,
  value,
  onChange,
  placeholder,
  required,
  textarea,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  required?: boolean;
  textarea?: boolean;
}) {
  return (
    <div>
      <label htmlFor={id} className="block text-xs font-semibold mb-1.5" style={labelStyle}>
        {label}
      </label>
      {textarea ? (
        <textarea
          id={id}
          rows={3}
          required={required}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`${inputClass} resize-y`}
        />
      ) : (
        <input
          id={id}
          type="text"
          required={required}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={inputClass}
        />
      )}
    </div>
  );
}

/**
 * Upload from the device (straight to Cloudinary), or paste a URL. Either way
 * the resulting address lands in the form's `img` field.
 */
function ImagePicker({
  idPrefix,
  value,
  onChange,
  onUpload,
  uploading,
}: {
  idPrefix: string;
  value: string;
  onChange: (v: string) => void;
  onUpload: (file: File) => void;
  uploading: boolean;
}) {
  const [fileName, setFileName] = useState("");

  return (
    <div className="space-y-3">
      <span className="block text-xs font-semibold" style={labelStyle}>
        Image
      </span>

      <div className="flex items-stretch gap-3">
        <label
          htmlFor={`${idPrefix}-file`}
          className="flex flex-1 flex-col items-center justify-center gap-2 rounded-xl py-5 px-4 text-center cursor-pointer transition-colors duration-200 [border:1.5px_dashed_var(--gray-300)] hover:border-[var(--ff-400)] hover:bg-[var(--ff-50)]"
          style={{ background: "var(--ff-50)", color: "var(--gray-500)" }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
          <span className="text-xs font-semibold" style={{ fontFamily: "var(--font-heading)" }}>
            {uploading ? "Uploading…" : fileName || "Upload from your device (max 10MB)"}
          </span>
          <input
            id={`${idPrefix}-file`}
            type="file"
            accept="image/*"
            className="hidden"
            disabled={uploading}
            onChange={(e) => {
              const file = e.target.files?.[0];
              // Reset so picking the same file twice still fires a change event.
              e.target.value = "";
              if (!file) return;
              setFileName(file.name);
              onUpload(file);
            }}
          />
        </label>

        {looksLikeUrl(value) && (
          <div
            className="relative h-[58px] w-[58px] shrink-0 overflow-hidden rounded-xl"
            style={{ border: "1px solid var(--gray-100)", background: "var(--ff-50)" }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element -- arbitrary URLs bypass next/image host rules */}
            <img src={value} alt="" className="h-full w-full object-cover" />
            <button
              type="button"
              onClick={() => {
                onChange("");
                setFileName("");
              }}
              aria-label="Remove image"
              className="absolute right-1 top-1 rounded-full p-1 cursor-pointer"
              style={{ background: "rgba(12,13,13,0.6)", color: "#fff" }}
            >
              <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" aria-hidden="true">
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}
      </div>

      <Field
        id={`${idPrefix}-img`}
        label="…or paste an image URL"
        value={value}
        onChange={onChange}
        placeholder="https://example.com/photo.jpg"
      />
    </div>
  );
}

function ProgramFormFields({
  form,
  setForm,
  idPrefix,
  onUpload,
  uploading = false,
}: {
  form: ProgramForm;
  setForm: (f: ProgramForm) => void;
  idPrefix: string;
  onUpload: (file: File) => void;
  uploading?: boolean;
}) {
  return (
    <>
      <div className="grid sm:grid-cols-2 gap-4">
        <Field
          id={`${idPrefix}-title`}
          label="Title"
          required
          value={form.title}
          onChange={(v) => setForm({ ...form, title: v })}
          placeholder="e.g. Web Development"
        />
        <Field
          id={`${idPrefix}-tag`}
          label="Tag"
          value={form.tag}
          onChange={(v) => setForm({ ...form, tag: v })}
          placeholder="e.g. Technology"
        />
      </div>
      <Field
        id={`${idPrefix}-desc`}
        label="Description"
        value={form.description}
        onChange={(v) => setForm({ ...form, description: v })}
        placeholder="Short summary shown on the program card."
        textarea
      />
      <ImagePicker
        idPrefix={idPrefix}
        value={form.img}
        onChange={(v) => setForm({ ...form, img: v })}
        onUpload={onUpload}
        uploading={uploading}
      />
    </>
  );
}

/** Compact glass stat chip for the header strip. */
function StatChip({ label, value, dot }: { label: string; value: number; dot: string }) {
  return (
    <div
      className="flex items-center gap-2 rounded-full pl-3 pr-3.5 py-1.5"
      style={{
        background: "rgba(255,255,255,0.75)",
        border: "1px solid rgba(255,255,255,0.9)",
        boxShadow: "0 6px 16px -12px rgba(0,61,56,0.5)",
      }}
    >
      <span className="h-1.5 w-1.5 rounded-full shrink-0" style={{ background: dot, boxShadow: `0 0 8px ${dot}` }} aria-hidden="true" />
      <span className="text-sm font-extrabold" style={{ fontFamily: "var(--font-heading)", color: "var(--gray-950)" }}>
        {value}
      </span>
      <span className="text-[10px] font-bold uppercase tracking-[0.12em]" style={{ color: "var(--gray-500)" }}>
        {label}
      </span>
    </div>
  );
}

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
      <p className="text-sm leading-snug" style={{ color: ok ? "#137333" : "#b42318", fontFamily: "var(--font-body)" }}>
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

export default function PublishManager({ initial }: { initial: Program[] }) {
  const [programs, setPrograms] = useState(initial);
  const [showForm, setShowForm] = useState(false);
  const [createForm, setCreateForm] = useState<ProgramForm>(EMPTY_FORM);
  const [createPublish, setCreatePublish] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<ProgramForm>(EMPTY_FORM);
  const [deleteTarget, setDeleteTarget] = useState<Program | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: "ok" | "error"; text: string } | null>(null);

  // Success toasts clear themselves; errors stay until acted on.
  useEffect(() => {
    if (!message || message.type !== "ok") return;
    const timer = window.setTimeout(() => setMessage(null), 4500);
    return () => window.clearTimeout(timer);
  }, [message]);

  const editingProgram = programs.find((p) => p.id === editingId) ?? null;

  const createProgram = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setBusy("create");
    setMessage(null);
    try {
      const res = await fetch("/api/programs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...createForm, published: createPublish }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Could not save the program.");

      setPrograms((current) => [
        ...current,
        {
          id: data.id ?? Date.now(),
          title: createForm.title.trim(),
          description: createForm.description.trim(),
          tag: createForm.tag.trim(),
          img: createForm.img.trim(),
          published: createPublish,
          sort_order: current.length + 1,
        },
      ]);
      setCreateForm(EMPTY_FORM);
      setCreatePublish(true);
      setShowForm(false);
      setMessage({ type: "ok", text: "Program created." });
    } catch (err) {
      setMessage({ type: "error", text: err instanceof Error ? err.message : "Could not save the program." });
    } finally {
      setBusy(null);
    }
  };

  /** Sends a chosen file to Cloudinary, then drops the URL into the form. */
  const uploadImage = (file: File, apply: (url: string) => void) => {
    if (!file.type.startsWith("image/")) {
      setMessage({ type: "error", text: "Only image files are allowed." });
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setMessage({ type: "error", text: "Image must be under 10MB." });
      return;
    }
    setBusy("upload");
    setMessage(null);
    (async () => {
      try {
        const body = new FormData();
        body.append("file", file);
        const res = await fetch("/api/upload", { method: "POST", body });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Upload failed.");

        apply(String(data.url ?? ""));
        setMessage({ type: "ok", text: "Image uploaded." });
      } catch (err) {
        setMessage({ type: "error", text: err instanceof Error ? err.message : "Upload failed." });
      } finally {
        setBusy(null);
      }
    })();
  };

  const startEdit = (program: Program) => {
    setEditingId(program.id);
    setEditForm({
      title: program.title,
      tag: program.tag,
      description: program.description,
      img: program.img,
    });
    setMessage(null);
  };

  const saveEdit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (editingId === null) return;
    setBusy(`edit:${editingId}`);
    setMessage(null);
    try {
      const res = await fetch(`/api/programs/${editingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Could not update the program.");

      setPrograms((current) =>
        current.map((p) => (p.id === editingId ? { ...p, ...editForm } : p))
      );
      setEditingId(null);
      setMessage({ type: "ok", text: "Program updated." });
    } catch (err) {
      setMessage({ type: "error", text: err instanceof Error ? err.message : "Could not update the program." });
    } finally {
      setBusy(null);
    }
  };

  const togglePublished = async (program: Program) => {
    setBusy(`toggle:${program.id}`);
    setMessage(null);
    try {
      const res = await fetch(`/api/programs/${program.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ published: !program.published }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Could not update the program.");

      setPrograms((current) =>
        current.map((p) => (p.id === program.id ? { ...p, published: !p.published } : p))
      );
      setMessage({
        type: "ok",
        text: program.published
          ? `"${program.title}" is now a draft (hidden from the site).`
          : `"${program.title}" is now published.`,
      });
    } catch (err) {
      setMessage({ type: "error", text: err instanceof Error ? err.message : "Could not update the program." });
    } finally {
      setBusy(null);
    }
  };

  /** Runs once the delete dialog is confirmed. */
  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setBusy(`delete:${deleteTarget.id}`);
    setMessage(null);
    try {
      const res = await fetch(`/api/programs/${deleteTarget.id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Delete failed.");

      const removed = deleteTarget.title;
      setPrograms((current) => current.filter((p) => p.id !== deleteTarget.id));
      setDeleteTarget(null);
      setMessage({ type: "ok", text: `"${removed}" was deleted.` });
    } catch (err) {
      setMessage({ type: "error", text: err instanceof Error ? err.message : "Delete failed." });
    } finally {
      setBusy(null);
    }
  };

  const publishedCount = programs.filter((p) => p.published).length;
  const draftCount = programs.length - publishedCount;

  return (
    <div className="space-y-6">
      {/* ── Glass header with stats ── */}
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
              Publish programs
            </h2>
            <p className="mt-1 text-sm max-w-lg" style={{ color: "var(--gray-500)" }}>
              Published programs appear on the home page, the programs page, and the apply form.
            </p>
          </div>
          <button
            type="button"
            onClick={() => { setShowForm(true); setMessage(null); }}
            className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-bold cursor-pointer transition-all duration-200 hover:-translate-y-0.5"
            style={{
              fontFamily: "var(--font-heading)",
              background: "linear-gradient(135deg, var(--ff-500), var(--ff-700))",
              color: "#fff",
              boxShadow: "0 10px 24px -10px rgba(0,167,157,0.75)",
            }}
          >
            {ICON_PLUS}
            New program
          </button>
        </div>
        <div className="relative mt-4 flex flex-wrap gap-2">
          <StatChip label="Total" value={programs.length} dot="var(--gray-300)" />
          <StatChip label="Published" value={publishedCount} dot="#22c55e" />
          <StatChip label="Drafts" value={draftCount} dot="var(--ff-400)" />
        </div>
      </div>

      {message && <Toast message={message} onClose={() => setMessage(null)} />}

      {/* ── New program ── */}
      <Modal
        open={showForm}
        onClose={() => setShowForm(false)}
        title="New program"
        subtitle="It goes live on the site the moment you save."
        icon={ICON_PLUS}
      >
        <form onSubmit={createProgram} className="space-y-4">
          <ProgramFormFields
            form={createForm}
            setForm={setCreateForm}
            idPrefix="new"
            uploading={busy === "upload"}
            onUpload={(file) =>
              uploadImage(file, (url) => setCreateForm((f) => ({ ...f, img: url })))
            }
          />
          {message?.type === "error" && (
            <p
              className="text-sm rounded-xl px-4 py-2.5"
              role="alert"
              style={{ background: "#fff1f1", border: "1px solid #ffd7d7", color: "#b42318" }}
            >
              {message.text}
            </p>
          )}
          <label className="flex items-center gap-2 text-sm cursor-pointer" style={{ color: "var(--gray-700)", fontFamily: "var(--font-heading)" }}>
            <input
              type="checkbox"
              checked={createPublish}
              onChange={(e) => setCreatePublish(e.target.checked)}
              className="cursor-pointer"
              style={{ accentColor: "var(--ff-600, #005850)" }}
            />
            Publish immediately
          </label>
          <div className="flex gap-3">
            <button type="submit" disabled={busy === "create"} className="btn-brand disabled:opacity-70">
              {busy === "create" ? "Saving…" : "Create program"}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="text-sm font-semibold px-5 py-2.5 rounded-full cursor-pointer"
              style={{ fontFamily: "var(--font-heading)", background: "transparent", border: "1.5px solid var(--gray-100)", color: "var(--gray-700)" }}
            >
              Cancel
            </button>
          </div>
        </form>
      </Modal>

      {/* ── Edit (same popup as New program, prefilled) ── */}
      <Modal
        open={editingId !== null}
        onClose={() => setEditingId(null)}
        title={editingProgram ? `Edit “${editingProgram.title}”` : "Edit program"}
        subtitle="Changes are saved to the live site."
        icon={ICON_PENCIL}
      >
        <form onSubmit={saveEdit} className="space-y-4">
          <ProgramFormFields
            form={editForm}
            setForm={setEditForm}
            idPrefix="edit"
            uploading={busy === "upload"}
            onUpload={(file) =>
              uploadImage(file, (url) => setEditForm((f) => ({ ...f, img: url })))
            }
          />
          {message?.type === "error" && (
            <p
              className="text-sm rounded-xl px-4 py-2.5"
              role="alert"
              style={{ background: "#fff1f1", border: "1px solid #ffd7d7", color: "#b42318" }}
            >
              {message.text}
            </p>
          )}
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={busy === `edit:${editingId}`}
              className="btn-brand disabled:opacity-70"
            >
              {busy === `edit:${editingId}` ? "Saving…" : "Save changes"}
            </button>
            <button
              type="button"
              onClick={() => setEditingId(null)}
              className="text-sm font-semibold px-5 py-2.5 rounded-full cursor-pointer"
              style={{ fontFamily: "var(--font-heading)", background: "transparent", border: "1.5px solid var(--gray-100)", color: "var(--gray-700)" }}
            >
              Cancel
            </button>
          </div>
        </form>
      </Modal>

      {/* ── Delete confirmation ── */}
      <Modal
        open={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        title="Delete program"
        subtitle="This permanently removes it from the site."
        icon={ICON_TRASH}
        tone="danger"
        width="max-w-md"
      >
        <p className="text-sm leading-relaxed" style={{ color: "var(--gray-500)", fontFamily: "var(--font-body)" }}>
          <strong style={{ color: "var(--gray-900)" }}>{deleteTarget?.title}</strong> will be
          permanently removed from the site, including the home page and the programs page.
          This cannot be undone.
        </p>

        {message?.type === "error" && (
          <p
            className="mt-4 text-sm rounded-xl px-4 py-2.5"
            role="alert"
            style={{ background: "#fff1f1", border: "1px solid #ffd7d7", color: "#b42318" }}
          >
            {message.text}
          </p>
        )}

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
            disabled={busy === `delete:${deleteTarget?.id}`}
            className="inline-flex items-center gap-1.5 text-sm font-bold px-5 py-2.5 rounded-full cursor-pointer transition-all duration-200 hover:-translate-y-0.5 disabled:opacity-60"
            style={{ fontFamily: "var(--font-heading)", background: "#b42318", border: "1px solid #b42318", color: "#fff" }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M3 6h18" />
              <path d="M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2" />
              <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
            </svg>
            {busy === `delete:${deleteTarget?.id}` ? "Deleting…" : "Delete program"}
          </button>
        </div>
      </Modal>

      {/* ── Program list ── */}
      <div>
        <h3 className="text-sm font-extrabold mb-3 flex items-center gap-2" style={{ fontFamily: "var(--font-heading)", color: "var(--gray-950)" }}>
          All programs
          <span
            className="inline-flex items-center justify-center rounded-full px-2 py-0.5 text-[10px] font-bold"
            style={{ background: "var(--ff-100)", color: "var(--ff-700)" }}
          >
            {programs.length}
          </span>
        </h3>

        {programs.length === 0 ? (
          <div
            className="rounded-[26px] py-14 text-center"
            style={{
              background: "rgba(255,255,255,0.7)",
              border: "1px dashed var(--gray-300)",
            }}
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
              No programs yet
            </p>
            <p className="mt-0.5 text-xs" style={{ color: "var(--gray-500)" }}>
              Create your first one with the button above.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {programs.map((program) => {
              return (
                <div
                  key={program.id}
                  className="rounded-[22px] p-4 transition-shadow duration-300 hover:shadow-[0_20px_44px_-28px_rgba(0,61,56,0.45)]"
                  style={{
                    background: "rgba(255,255,255,0.85)",
                    backdropFilter: "blur(12px) saturate(140%)",
                    WebkitBackdropFilter: "blur(12px) saturate(140%)",
                    border: `1px solid ${program.published ? "var(--ff-100)" : "var(--gray-100)"}`,
                    boxShadow: "0 2px 10px rgba(0,61,56,0.05)",
                  }}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    <div
                      className="relative h-[72px] w-[72px] shrink-0 rounded-2xl overflow-hidden flex items-center justify-center"
                      style={{ background: "var(--ff-50)", border: "1px solid var(--gray-100)" }}
                    >
                      {program.img ? (
                        <Image src={program.img} alt="" fill unoptimized sizes="72px" className="object-cover" />
                      ) : (
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--gray-300)" }} aria-hidden="true">
                          <rect x="3" y="3" width="18" height="18" rx="2" />
                          <circle cx="8.5" cy="8.5" r="1.5" />
                          <path d="M21 15l-5-5L5 21" />
                        </svg>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-extrabold truncate" style={{ fontFamily: "var(--font-heading)", color: "var(--gray-950)" }}>
                          {program.title}
                        </p>
                        {program.tag && (
                          <span
                            className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full"
                            style={{ background: "var(--ff-50, #f0f7f6)", color: "var(--ff-600, #005850)", border: "1px solid var(--ff-100, #d7ebe8)" }}
                          >
                            {program.tag}
                          </span>
                        )}
                      </div>
                      {program.description && (
                        <p className="text-xs mt-1 line-clamp-2" style={{ color: "var(--gray-500)" }}>
                          {program.description}
                        </p>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-2 sm:justify-end shrink-0">
                      {/* Publish / draft switch */}
                      <button
                        type="button"
                        role="switch"
                        aria-checked={program.published}
                        onClick={() => togglePublished(program)}
                        disabled={busy === `toggle:${program.id}`}
                        title={program.published ? "Unpublish (hide from the site)" : "Publish (show on the site)"}
                        className="inline-flex items-center gap-2.5 rounded-full pl-3 pr-1.5 py-1.5 cursor-pointer transition-colors duration-200 disabled:opacity-60"
                        style={{
                          fontFamily: "var(--font-heading)",
                          background: program.published ? "var(--ff-50)" : "var(--gray-100)",
                          border: `1px solid ${program.published ? "var(--ff-200)" : "var(--gray-100)"}`,
                        }}
                      >
                        <span
                          className="text-[11px] font-bold"
                          style={{ color: program.published ? "var(--ff-700)" : "var(--gray-500)" }}
                        >
                          {busy === `toggle:${program.id}` ? "Saving…" : program.published ? "Published" : "Draft"}
                        </span>
                        <span
                          className="relative h-5 w-9 rounded-full transition-colors duration-300 shrink-0"
                          style={{
                            background: program.published
                              ? "linear-gradient(135deg, var(--ff-500), var(--ff-700))"
                              : "var(--gray-300)",
                          }}
                          aria-hidden="true"
                        >
                          <span
                            className="absolute top-0.5 left-0.5 h-4 w-4 rounded-full transition-transform duration-300"
                            style={{
                              background: "#fff",
                              boxShadow: "0 1px 4px rgba(0,0,0,0.25)",
                              transform: program.published ? "translateX(16px)" : "none",
                            }}
                          />
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => startEdit(program)}
                        className="inline-flex items-center gap-1.5 text-xs font-bold px-3.5 py-2 rounded-full cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:border-[var(--ff-300)] hover:text-[var(--ff-700)]"
                        style={{ fontFamily: "var(--font-heading)", background: "transparent", border: "1.5px solid var(--gray-100)", color: "var(--gray-700)" }}
                      >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="M12 20h9" />
                          <path d="M16.5 3.5a2.12 2.12 0 013 3L7 19l-4 1 1-4z" />
                        </svg>
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => { setDeleteTarget(program); setMessage(null); }}
                        disabled={busy === `delete:${program.id}`}
                        className="inline-flex items-center gap-1.5 text-xs font-bold px-3.5 py-2 rounded-full cursor-pointer transition-all duration-200 hover:-translate-y-0.5 disabled:opacity-60"
                        style={{ fontFamily: "var(--font-heading)", background: "#fff1f1", border: "1px solid #ffd7d7", color: "#b42318" }}
                      >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="M3 6h18" />
                          <path d="M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                          <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
                        </svg>
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
