"use client";

import { useEffect, useState } from "react";
import { useLocale } from "@/lib/i18n/client";

type Ad = {
  id: string;
  title: string;
  imageUrl: string;
  linkUrl: string;
  position: string;
  isActive: boolean;
};

const POSITION_VALUES = [
  "BANNER_TOP",
  "SIDEBAR_LEFT",
  "SIDEBAR_RIGHT",
  "IN_FEED",
] as const;

export default function AdminAdsPage() {
  const { dict } = useLocale();
  const [ads, setAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: "",
    imageUrl: "",
    linkUrl: "",
    position: "BANNER_TOP",
  });

  async function load() {
    setLoading(true);
    const res = await fetch("/api/ads");
    setAds(await res.json());
    setLoading(false);
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const res = await fetch("/api/ads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error || dict.admin.genericError);
      return;
    }
    setForm({ title: "", imageUrl: "", linkUrl: "", position: form.position });
    load();
  }

  async function toggleActive(ad: Ad) {
    await fetch(`/api/ads/${ad.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !ad.isActive }),
    });
    load();
  }

  async function remove(ad: Ad) {
    if (!confirm(dict.admin.confirmDelete(ad.title))) return;
    await fetch(`/api/ads/${ad.id}`, { method: "DELETE" });
    load();
  }

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="mb-4 text-2xl font-bold">{dict.admin.title}</h1>

      <form
        onSubmit={handleSubmit}
        className="mb-8 flex flex-col gap-4 rounded-lg border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900"
      >
        {error && (
          <p className="rounded bg-red-100 px-3 py-2 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
            {error}
          </p>
        )}
        <label className="flex flex-col gap-1 text-sm">
          {dict.admin.adTitle}
          <input
            required
            className="rounded border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-950"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          {dict.admin.position}
          <select
            className="rounded border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-950"
            value={form.position}
            onChange={(e) => setForm({ ...form, position: e.target.value })}
          >
            {POSITION_VALUES.map((value) => (
              <option key={value} value={value}>
                {dict.admin.positions[value]}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-sm">
          {dict.admin.imageUrl}
          <input
            required
            placeholder="https://..."
            className="rounded border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-950"
            value={form.imageUrl}
            onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          {dict.admin.linkUrl}
          <input
            required
            placeholder="https://..."
            className="rounded border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-950"
            value={form.linkUrl}
            onChange={(e) => setForm({ ...form, linkUrl: e.target.value })}
          />
        </label>
        <button
          type="submit"
          className="rounded-full bg-emerald-600 py-2 font-semibold text-white hover:bg-emerald-700"
        >
          {dict.admin.addAd}
        </button>
      </form>

      <h2 className="mb-3 text-lg font-semibold">{dict.admin.currentAds}</h2>
      {loading ? (
        <p className="text-zinc-500">{dict.admin.loading}</p>
      ) : ads.length === 0 ? (
        <p className="text-zinc-500">{dict.admin.empty}</p>
      ) : (
        <div className="flex flex-col gap-3">
          {ads.map((ad) => (
            <div
              key={ad.id}
              className="flex items-center gap-3 rounded-lg border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-900"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={ad.imageUrl}
                alt={ad.title}
                className="h-14 w-24 rounded object-cover"
              />
              <div className="flex-1">
                <p className="font-medium">{ad.title}</p>
                <p className="text-xs text-zinc-500">
                  {dict.admin.positions[
                    ad.position as (typeof POSITION_VALUES)[number]
                  ] ?? ad.position}{" "}
                  · {ad.isActive ? dict.admin.active : dict.admin.inactive}
                </p>
              </div>
              <button
                onClick={() => toggleActive(ad)}
                className="rounded-full border border-zinc-300 px-3 py-1 text-xs hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
              >
                {ad.isActive ? dict.admin.disable : dict.admin.enable}
              </button>
              <button
                onClick={() => remove(ad)}
                className="rounded-full border border-red-300 px-3 py-1 text-xs text-red-600 hover:bg-red-50 dark:border-red-800 dark:hover:bg-red-950"
              >
                {dict.admin.delete}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
