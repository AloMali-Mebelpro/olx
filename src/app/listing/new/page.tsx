"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "@/lib/i18n/client";
import MapPicker from "@/components/MapPicker";

type Category = { id: string; name: string; icon: string | null };

export default function NewListingPage() {
  const router = useRouter();
  const { dict } = useLocale();
  const [categories, setCategories] = useState<Category[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [form, setForm] = useState({
    title: "",
    description: "",
    price: "",
    currency: "USD",
    location: "",
    imageUrl: "",
    categoryId: "",
    lat: null as number | null,
    lng: null as number | null,
  });

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError(null);

    const body = new FormData();
    body.append("file", file);

    const res = await fetch("/api/upload", { method: "POST", body });
    const data = await res.json().catch(() => ({}));

    setUploading(false);

    if (!res.ok) {
      setError(data.error || "Не удалось загрузить фото");
      return;
    }

    setForm((f) => ({ ...f, imageUrl: data.url }));
  }

  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then((data: Category[]) => {
        setCategories(data);
        if (data.length > 0) {
          setForm((f) => ({ ...f, categoryId: data[0].id }));
        }
      });
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const res = await fetch("/api/listings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    setSubmitting(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error || dict.newListing.genericError);
      return;
    }

    const listing = await res.json();
    router.push(`/listing/${listing.id}`);
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-xl">
      <h1 className="mb-4 text-2xl font-bold">{dict.newListing.title}</h1>
      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-4 rounded-lg border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900"
      >
        {error && (
          <p className="rounded bg-red-100 px-3 py-2 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
            {error}
          </p>
        )}

        <label className="flex flex-col gap-1 text-sm">
          {dict.newListing.titleField}
          <input
            required
            className="rounded border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-950"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />
        </label>

        <label className="flex flex-col gap-1 text-sm">
          {dict.newListing.category}
          <select
            required
            className="rounded border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-950"
            value={form.categoryId}
            onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
          >
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.icon} {c.name}
              </option>
            ))}
          </select>
        </label>

        <div className="flex gap-3">
          <label className="flex flex-1 flex-col gap-1 text-sm">
            {dict.newListing.price}
            <input
              required
              type="number"
              min={0}
              className="rounded border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-950"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            {dict.newListing.currency}
            <select
              className="rounded border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-950"
              value={form.currency}
              onChange={(e) => setForm({ ...form, currency: e.target.value })}
            >
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
              <option value="UAH">UAH</option>
              <option value="AFN">AFN</option>
            </select>
          </label>
        </div>

        <label className="flex flex-col gap-1 text-sm">
          {dict.newListing.location}
          <input
            required
            className="rounded border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-950"
            value={form.location}
            onChange={(e) => setForm({ ...form, location: e.target.value })}
          />
        </label>

        <div className="flex flex-col gap-1 text-sm">
          Адрес на карте (необязательно)
          <MapPicker
            value={
              form.lat != null && form.lng != null
                ? { lat: form.lat, lng: form.lng }
                : null
            }
            onChange={({ lat, lng }) => setForm((f) => ({ ...f, lat, lng }))}
          />
        </div>

        <label className="flex flex-col gap-1 text-sm">
          Фото объявления
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="rounded border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
            onChange={handleFileChange}
          />
          {uploading && <span className="text-xs text-zinc-500">Загрузка...</span>}
          {form.imageUrl && !uploading && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={form.imageUrl}
              alt="Предпросмотр"
              className="mt-2 h-32 w-32 rounded object-cover"
            />
          )}
        </label>

        <label className="flex flex-col gap-1 text-sm">
          {dict.newListing.description}
          <textarea
            required
            rows={5}
            className="rounded border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-950"
            value={form.description}
            onChange={(e) =>
              setForm({ ...form, description: e.target.value })
            }
          />
        </label>

        <button
          type="submit"
          disabled={submitting || uploading}
          className="rounded-full bg-emerald-600 py-2 font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
        >
          {submitting ? dict.newListing.submitting : dict.newListing.submit}
        </button>
      </form>
    </div>
  );
}
