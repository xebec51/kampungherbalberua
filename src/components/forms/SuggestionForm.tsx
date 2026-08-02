"use client";

import { type FormEvent, type ReactNode, useState } from "react";
import { submitSuggestionAction } from "@/app/kotak-saran/actions";

type SubmitStatus = "idle" | "submitting" | "success" | "error";

type FormState = {
  category: string;
  title: string;
  content: string;
  location: string;
  name: string;
  contact: string;
  anonymous: boolean;
  consent: boolean;
};

type FormErrors = Partial<Record<keyof FormState, string>>;

const initialState: FormState = {
  category: "",
  title: "",
  content: "",
  location: "",
  name: "",
  contact: "",
  anonymous: false,
  consent: false,
};

const categories = [
  "Lingkungan",
  "Jalan dan drainase",
  "Tanaman herbal",
  "Kebersihan",
  "Keamanan",
  "Pelayanan warga",
  "Produk warga",
  "Lainnya",
];

const successMessage =
  "Terima kasih, saran Anda sudah terkirim dan akan ditinjau oleh pengurus Kampung Herbal Berua.";

export function SuggestionForm() {
  const [form, setForm] = useState<FormState>(initialState);
  const [errors, setErrors] = useState<FormErrors>({});
  const [status, setStatus] = useState<SubmitStatus>("idle");
  const [notice, setNotice] = useState("");

  function updateField<K extends keyof FormState>(field: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function validateForm() {
    const nextErrors: FormErrors = {};

    if (!form.category) {
      nextErrors.category = "Kategori wajib dipilih.";
    }

    if (!form.title.trim()) {
      nextErrors.title = "Judul wajib diisi.";
    }

    if (!form.content.trim()) {
      nextErrors.content = "Isi saran wajib diisi.";
    }

    if (!form.consent) {
      nextErrors.consent = "Persetujuan pemrosesan data wajib dicentang.";
    }

    return nextErrors;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setNotice("");

    const nextErrors = validateForm();
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    setStatus("submitting");

    const result = await submitSuggestionAction({
      category: form.category,
      title: form.title,
      content: form.content,
      location: form.location,
      name: form.name,
      contact: form.contact,
      anonymous: form.anonymous,
    });

    if (result.status === "success") {
      setStatus("success");
      setNotice(successMessage);
      setForm(initialState);
      setErrors({});
      return;
    }

    setStatus("error");
    setNotice(result.message);
  }

  function handleAnonymousChange(checked: boolean) {
    setForm((current) => ({
      ...current,
      anonymous: checked,
      contact: checked ? "" : current.contact,
      name: checked ? "" : current.name,
    }));
  }

  return (
    <form
      className="mt-8 rounded-md border border-herbal-green/10 bg-white p-5 shadow-sm sm:p-6"
      noValidate
      onSubmit={handleSubmit}
    >
      <div className="grid gap-5">
        <FieldWrapper error={errors.category} id="category" label="Kategori" required>
          <select
            aria-describedby={errors.category ? "category-error" : undefined}
            className="mt-2 h-11 w-full rounded-md border border-herbal-green/20 bg-white px-3 text-sm text-herbal-ink outline-none transition focus:border-herbal-green focus:ring-2 focus:ring-herbal-green/20"
            id="category"
            onChange={(event) => updateField("category", event.target.value)}
            value={form.category}
          >
            <option value="">Pilih kategori</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </FieldWrapper>

        <FieldWrapper error={errors.title} id="title" label="Judul saran" required>
          <input
            aria-describedby={errors.title ? "title-error" : undefined}
            className="mt-2 h-11 w-full rounded-md border border-herbal-green/20 bg-white px-3 text-sm text-herbal-ink outline-none transition placeholder:text-herbal-muted/70 focus:border-herbal-green focus:ring-2 focus:ring-herbal-green/20"
            id="title"
            onChange={(event) => updateField("title", event.target.value)}
            placeholder="Contoh: Perawatan tanaman di lorong"
            type="text"
            value={form.title}
          />
        </FieldWrapper>

        <FieldWrapper error={errors.content} id="content" label="Isi saran" required>
          <textarea
            aria-describedby={errors.content ? "content-error" : undefined}
            className="mt-2 min-h-36 w-full rounded-md border border-herbal-green/20 bg-white px-3 py-3 text-sm text-herbal-ink outline-none transition placeholder:text-herbal-muted/70 focus:border-herbal-green focus:ring-2 focus:ring-herbal-green/20"
            id="content"
            onChange={(event) => updateField("content", event.target.value)}
            placeholder="Tuliskan saran dengan jelas dan sopan."
            value={form.content}
          />
        </FieldWrapper>

        <FieldWrapper id="location" label="Lokasi terkait">
          <input
            className="mt-2 h-11 w-full rounded-md border border-herbal-green/20 bg-white px-3 text-sm text-herbal-ink outline-none transition placeholder:text-herbal-muted/70 focus:border-herbal-green focus:ring-2 focus:ring-herbal-green/20"
            id="location"
            onChange={(event) => updateField("location", event.target.value)}
            placeholder="Opsional, contoh: sekitar kebun TOGA"
            type="text"
            value={form.location}
          />
        </FieldWrapper>

        <div className="grid gap-5 sm:grid-cols-2">
          <FieldWrapper id="name" label="Nama">
            <input
              className="mt-2 h-11 w-full rounded-md border border-herbal-green/20 bg-white px-3 text-sm text-herbal-ink outline-none transition placeholder:text-herbal-muted/70 focus:border-herbal-green focus:ring-2 focus:ring-herbal-green/20 disabled:cursor-not-allowed disabled:bg-herbal-soft"
              disabled={form.anonymous}
              id="name"
              onChange={(event) => updateField("name", event.target.value)}
              placeholder="Opsional"
              type="text"
              value={form.name}
            />
          </FieldWrapper>
          <FieldWrapper id="contact" label="Kontak">
            <input
              className="mt-2 h-11 w-full rounded-md border border-herbal-green/20 bg-white px-3 text-sm text-herbal-ink outline-none transition placeholder:text-herbal-muted/70 focus:border-herbal-green focus:ring-2 focus:ring-herbal-green/20 disabled:cursor-not-allowed disabled:bg-herbal-soft"
              disabled={form.anonymous}
              id="contact"
              onChange={(event) => updateField("contact", event.target.value)}
              placeholder="Opsional"
              type="text"
              value={form.contact}
            />
          </FieldWrapper>
        </div>

        <div className="grid gap-3">
          <label className="flex gap-3 text-sm leading-6 text-herbal-muted" htmlFor="anonymous">
            <input
              checked={form.anonymous}
              className="mt-1 h-4 w-4 rounded border-herbal-green/30 text-herbal-green focus:ring-herbal-green"
              id="anonymous"
              onChange={(event) => handleAnonymousChange(event.target.checked)}
              type="checkbox"
            />
            <span>Kirim secara anonim. Nama dan kontak tidak akan digunakan.</span>
          </label>

          <label className="flex gap-3 text-sm leading-6 text-herbal-muted" htmlFor="consent">
            <input
              aria-describedby={errors.consent ? "consent-error" : undefined}
              checked={form.consent}
              className="mt-1 h-4 w-4 rounded border-herbal-green/30 text-herbal-green focus:ring-herbal-green"
              id="consent"
              onChange={(event) => updateField("consent", event.target.checked)}
              type="checkbox"
            />
            <span>
              Saya setuju data pada formulir ini disimpan dan digunakan oleh
              pengurus Kampung Herbal Berua untuk menindaklanjuti saran ini.
              <span className="text-herbal-brown"> *</span>
            </span>
          </label>
          {errors.consent ? (
            <p className="text-sm font-medium text-herbal-brown" id="consent-error">
              {errors.consent}
            </p>
          ) : null}
        </div>
      </div>

      {notice ? (
        <div
          className={
            status === "error"
              ? "mt-6 rounded-md border border-herbal-brown/20 bg-[#F5E9DF] p-4 text-sm font-medium leading-6 text-herbal-brown"
              : "mt-6 rounded-md border border-herbal-green/20 bg-herbal-soft p-4 text-sm font-medium leading-6 text-herbal-deep"
          }
          role={status === "error" ? "alert" : "status"}
        >
          {notice}
        </div>
      ) : null}

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <button
          className="inline-flex min-h-11 items-center justify-center rounded-md bg-herbal-green px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-herbal-deep focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-herbal-brown disabled:cursor-not-allowed disabled:opacity-70"
          disabled={status === "submitting"}
          type="submit"
        >
          {status === "submitting" ? "Mengirim..." : "Kirim Saran"}
        </button>
      </div>
    </form>
  );
}

type FieldWrapperProps = {
  children: ReactNode;
  error?: string;
  id: string;
  label: string;
  required?: boolean;
};

function FieldWrapper({
  children,
  error,
  id,
  label,
  required = false,
}: FieldWrapperProps) {
  return (
    <div>
      <label className="block text-sm font-semibold text-herbal-ink" htmlFor={id}>
        {label}
        {required ? <span className="text-herbal-brown"> *</span> : null}
      </label>
      {children}
      {error ? (
        <p className="mt-2 text-sm font-medium text-herbal-brown" id={`${id}-error`}>
          {error}
        </p>
      ) : null}
    </div>
  );
}
