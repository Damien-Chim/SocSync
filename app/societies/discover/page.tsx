"use client";

import { SocietyCard } from "@/components/society-card";
import { mockSocieties, mockUser } from "@/lib/mock-data";

export default function DiscoverSocietiesPage() {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {mockSocieties.map((society) => {
        const isFollowed = mockUser.likedSocieties.includes(society.id);
        return (
          <SocietyCard
            key={society.id}
            society={society}
            initialFollowed={isFollowed}
          />
        );
      })}
    </div>
  );
}
