"use client";

import { useEffect, useState } from "react";

import {
  getStaffSupportReviews,
  type StaffReview,
} from "@/features/staff/api/staff-api";
import {
  StaffEmpty,
  StaffLoading,
  StaffPageTitle,
} from "@/features/staff/ui/staff-dashboard";

export function StaffSupportView() {
  const [reviews, setReviews] = useState<StaffReview[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getStaffSupportReviews()
      .then(setReviews)
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return <StaffLoading label="Dang tai yeu cau ho tro..." />;
  }

  return (
    <section>
      <StaffPageTitle eyebrow="Ho tro" title="Review can xem" />

      <div className="mt-8 grid gap-4 md:grid-cols-2">
        {reviews.length ? (
          reviews.map((review) => (
            <article
              key={review.id}
              className="rounded-lg border border-amber-900/10 bg-white p-5 shadow-sm"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-semibold">{review.productName}</p>
                  <p className="mt-1 text-sm font-semibold text-amber-800">
                    {review.rating}/5 sao
                  </p>
                </div>
                <span className="rounded-full bg-red-50 px-3 py-2 text-xs font-semibold text-red-700">
                  Chua duyet
                </span>
              </div>
              {review.title ? (
                <h2 className="mt-4 font-semibold">{review.title}</h2>
              ) : null}
              <p className="mt-2 text-sm leading-6 text-stone-600">
                {review.content ?? "Khong co noi dung."}
              </p>
            </article>
          ))
        ) : (
          <StaffEmpty label="Khong co review can xem." />
        )}
      </div>
    </section>
  );
}
