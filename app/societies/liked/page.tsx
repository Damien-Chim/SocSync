"use client";

import { SocietyCard } from "@/components/society-card";
import { mockSocieties, mockUser } from "@/lib/mock-data";

export default function LikedSocietiesPage() {
  const likedSocieties = mockSocieties.filter((society) =>
    mockUser.likedSocieties.includes(society.id)
  );

  return (
    <>
      {likedSocieties.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {likedSocieties.map((society) => (
            <SocietyCard key={society.id} society={society} initialFollowed={true} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
            <span className="text-3xl">💜</span>
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-1">
            No societies followed yet
          </h3>
          <p className="text-sm text-muted-foreground">
            Start following societies to get notified about their events
          </p>
        </div>
      )}
    </>
  );
}
