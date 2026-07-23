import React from 'react'

// Shaped like a PostCard so the column doesn't jump
const FeedSkeletonCard = () => (
  <div className="bg-white rounded-3xl border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.01)] overflow-hidden">
    <div className="p-5 flex items-center gap-3.5">
      <div className="skeleton w-11 h-11 rounded-full shrink-0" />
      <div className="flex-1 flex flex-col gap-2">
        <div className="skeleton h-2.5 w-1/3 rounded" />
        <div className="skeleton h-2 w-1/5 rounded" />
      </div>
    </div>

    <div className="skeleton w-full aspect-[4/3]" />

    <div className="p-5 flex flex-col gap-3">
      <div className="flex gap-2">
        <div className="skeleton h-5 w-20 rounded-full" />
        <div className="skeleton h-5 w-24 rounded-full" />
      </div>
      <div className="skeleton h-2.5 w-4/5 rounded" />
      <div className="skeleton h-2.5 w-2/3 rounded" />
    </div>
  </div>
)

export default function FeedSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="flex flex-col gap-8">
      {Array.from({ length: count }, (_, i) => (
        <FeedSkeletonCard key={i} />
      ))}
    </div>
  )
}
