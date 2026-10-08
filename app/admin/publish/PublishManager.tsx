"use client";

import Image from "next/image";
import { useState } from "react";

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

const cardStyle: React.CSSProperties = {
  background: "var(--white)",
  border: "1px solid var(--gray-100)",
};

const inputStyle: React.CSSProperties = {
  background: "white",
  border: "1.5px solid var(--gray-100)",
  color: "var(--gray-900)",
  fontFamily: "var(--font-body)",
};

const labelStyle: React.CSSProperties = {
  color: "var(--gray-700)",
  fontFamily: "var(--font-heading)",
};

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
          className="w-full rounded-xl px-4 py-2.5 text-sm outline-none resize-y"
          style={inputStyle}
        />
      ) : (
        <input
          id={id}
          type="text"
          required={required}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full rounded-xl px-4 py-2.5 text-sm outline-none"
          style={inputStyle}
        />
      )}
    </div>
  );
}

function ProgramFormFields({
  form,
  setForm,
  idPrefix,
}: {
  form: ProgramForm;
  setForm: (f: ProgramForm) => void;
  idPrefix: string;
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
      <Field
        id={`${idPrefix}-img`}
        label="Image URL"
        value={form.img}
        onChange={(v) => setForm({ ...form, img: v })}
        placeholder="https://example.com/photo.jpg"
      />
    </>
  );
}

export default function PublishManager({ initial }: { initial: Program[] }) {
  const [programs, setPrograms] = useState(initial);
  const [showForm, setShowForm] = useState(false);
  const [createForm, setCreateForm] = useState<ProgramForm>(EMPTY_FORM);
  const [createPublish, setCreatePublish] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<ProgramForm>(EMPTY_FORM);
  const [busy, setBusy] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: "ok" | "error"; text: string } | null>(null);

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

  const removeProgram = async (program: Program) => {
    if (!window.confirm(`Delete "${program.title}"? This cannot be undone.`)) return;
    setBusy(`delete:${program.id}`);
    setMessage(null);
    try {
      const res = await fetch(`/api/programs/${program.id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Delete failed.");

      setPrograms((current) => current.filter((p) => p.id !== program.id));
      setMessage({ type: "ok", text: "Program deleted." });
    } catch (err) {
      setMessage({ type: "error", text: err instanceof Error ? err.message : "Delete failed." });
    } finally {
      setBusy(null);
    }
  };

  const publishedCount = programs.filter((p) => p.published).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-extrabold" style={{ fontFamily: "var(--font-heading)", color: "var(--gray-950)" }}>
            Publish programs
          </h2>
          <p className="text-sm" style={{ color: "var(--gray-500)" }}>
            Published programs appear on the home page, the programs page, and the apply form.
            {publishedCount} of {programs.length} published.
          </p>
        </div>
        <button
          type="button"
          onClick={() => { setShowForm((v) => !v); setMessage(null); }}
          className="btn-brand"
        >
          {showForm ? "Cancel" : "New program"}
        </button>
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

      {showForm && (
        <form onSubmit={createProgram} className="rounded-2xl p-5 space-y-4" style={cardStyle}>
          <h3 className="text-sm font-extrabold" style={{ fontFamily: "var(--font-heading)", color: "var(--gray-950)" }}>
            New program
          </h3>
          <ProgramFormFields form={createForm} setForm={setCreateForm} idPrefix="new" />
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
      )}

      <div>
        <h3 className="text-sm font-extrabold mb-3" style={{ fontFamily: "var(--font-heading)", color: "var(--gray-950)" }}>
          All programs ({programs.length})
        </h3>

        {programs.length === 0 ? (
          <div className="rounded-2xl py-14 text-center" style={cardStyle}>
            <p className="text-sm" style={{ color: "var(--gray-500)" }}>
              No programs yet — create your first one above.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {programs.map((program) => {
              const isEditing = editingId === program.id;
              return (
                <div key={program.id} className="rounded-2xl p-4 sm:p-5" style={cardStyle}>
                  {isEditing ? (
                    <form onSubmit={saveEdit} className="space-y-4">
                      <ProgramFormFields form={editForm} setForm={setEditForm} idPrefix={`edit-${program.id}`} />
                      <div className="flex gap-3">
                        <button
                          type="submit"
                          disabled={busy === `edit:${program.id}`}
                          className="btn-brand disabled:opacity-70"
                        >
                          {busy === `edit:${program.id}` ? "Saving…" : "Save changes"}
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
                  ) : (
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                      <div
                        className="relative h-16 w-16 shrink-0 rounded-xl overflow-hidden flex items-center justify-center"
                        style={{ background: "var(--ff-50)", border: "1px solid var(--gray-100)" }}
                      >
                        {program.img ? (
                          <Image src={program.img} alt="" fill unoptimized sizes="64px" className="object-cover" />
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
                          <span
                            className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full"
                            style={
                              program.published
                                ? { background: "#e6f4ea", color: "#137333", border: "1px solid #c3e6cb" }
                                : { background: "var(--gray-100)", color: "var(--gray-500)", border: "1px solid var(--gray-300, #d9d9d9)" }
                            }
                          >
                            {program.published ? "Published" : "Draft"}
                          </span>
                        </div>
                        {program.description && (
                          <p className="text-xs mt-1 line-clamp-2" style={{ color: "var(--gray-500)" }}>
                            {program.description}
                          </p>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-2 sm:justify-end shrink-0">
                        <button
                          type="button"
                          onClick={() => startEdit(program)}
                          className="text-xs font-bold px-3.5 py-2 rounded-full cursor-pointer"
                          style={{ fontFamily: "var(--font-heading)", background: "transparent", border: "1.5px solid var(--gray-100)", color: "var(--gray-700)" }}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => togglePublished(program)}
                          disabled={busy === `toggle:${program.id}`}
                          className="text-xs font-bold px-3.5 py-2 rounded-full cursor-pointer disabled:opacity-60"
                          style={
                            program.published
                              ? { fontFamily: "var(--font-heading)", background: "transparent", border: "1.5px solid var(--gray-100)", color: "var(--gray-700)" }
                              : { fontFamily: "var(--font-heading)", background: "linear-gradient(135deg, var(--ff-500), var(--ff-700))", border: "none", color: "#fff" }
                          }
                        >
                          {busy === `toggle:${program.id}` ? "Saving…" : program.published ? "Unpublish" : "Publish"}
                        </button>
                        <button
                          type="button"
                          onClick={() => removeProgram(program)}
                          disabled={busy === `delete:${program.id}`}
                          className="text-xs font-bold px-3.5 py-2 rounded-full cursor-pointer disabled:opacity-60"
                          style={{ fontFamily: "var(--font-heading)", background: "#fff1f1", border: "1px solid #ffd7d7", color: "#b42318" }}
                        >
                          {busy === `delete:${program.id}` ? "Deleting…" : "Delete"}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
