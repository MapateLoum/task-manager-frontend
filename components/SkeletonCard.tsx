export default function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm">
      <div className="skeleton h-4 w-3/4 rounded-full mb-3" />
      <div className="skeleton h-3 w-1/2 rounded-full mb-2" />
      <div className="skeleton h-3 w-2/3 rounded-full" />
    </div>
  )
}