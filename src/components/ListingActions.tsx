"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import FavoriteButton from "@/components/FavoriteButton";

export default function ListingActions({ listingId }: { listingId: string }) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    if (!confirm("Удалить это объявление? Это действие нельзя отменить.")) {
      return;
    }
    setDeleting(true);
    const res = await fetch(`/api/listings/${listingId}`, {
      method: "DELETE",
    });
    if (res.ok) {
      router.push("/");
      router.refresh();
    } else {
      setDeleting(false);
      alert("Не удалось удалить объявление");
    }
  }

  return (
    <div className="flex items-center gap-2">
      <FavoriteButton listingId={listingId} />
      <button
        type="button"
        onClick={handleDelete}
        disabled={deleting}
        className="rounded-full border border-red-300 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-50 dark:border-red-800 dark:hover:bg-red-950"
      >
        {deleting ? "Удаление..." : "Удалить объявление"}
      </button>
    </div>
  );
}
