"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import FavoriteButton from "@/components/FavoriteButton";
import { useLocale } from "@/lib/i18n/client";

export default function ListingActions({ listingId }: { listingId: string }) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);
  const { dict } = useLocale();

  async function handleDelete() {
    if (!confirm(dict.listingDetail.confirmDelete)) {
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
      alert(dict.listingDetail.deleteFailed);
    }
  }

  return (
    <div className="flex items-center gap-2">
      <FavoriteButton listingId={listingId} />
      <Link
        href={`/listing/${listingId}/promote`}
        className="rounded-full border border-amber-400 px-3 py-1.5 text-xs font-medium text-amber-600 hover:bg-amber-50 dark:border-amber-700 dark:hover:bg-amber-950"
      >
        🔝 Поднять в топ
      </Link>
      <button
        type="button"
        onClick={handleDelete}
        disabled={deleting}
        className="rounded-full border border-red-300 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-50 dark:border-red-800 dark:hover:bg-red-950"
      >
        {deleting ? dict.listingDetail.deleting : dict.listingDetail.deleteListing}
      </button>
    </div>
  );
}
