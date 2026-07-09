import { Fragment } from 'react'
import { Check, X } from 'lucide-react'

type OrderStatus = 'pending' | 'accepted' | 'crafting' | 'shipped' | 'completed' | 'cancelled'

const MILESTONES: { key: OrderStatus; label: string }[] = [
  { key: 'pending', label: 'Requested' },
  { key: 'accepted', label: 'Accepted' },
  { key: 'crafting', label: 'Crafting' },
  { key: 'shipped', label: 'Shipped' },
  { key: 'completed', label: 'Delivered' },
]

interface OrderMilestoneStepsProps {
  status: OrderStatus
  variant?: 'compact' | 'detailed'
  orientation?: 'horizontal' | 'vertical'
}

export default function OrderMilestoneSteps({
  status,
  variant = 'compact',
  orientation = 'horizontal',
}: OrderMilestoneStepsProps) {
  if (status === 'cancelled') {
    return (
      <div className={`flex items-center justify-center gap-1.5 py-1 ${orientation === 'vertical' ? 'h-full flex-col' : ''}`}>
        <X className="w-3.5 h-3.5 text-rose-400" />
        <span className="text-[9px] font-extrabold text-rose-400 uppercase tracking-widest font-sans text-center">
          Order Cancelled
        </span>
      </div>
    )
  }

  const currentIndex = MILESTONES.findIndex(m => m.key === status)

  if (orientation === 'vertical') {
    return (
      <div className="flex flex-col h-full">
        {MILESTONES.map((m, i) => {
          const isDone = i < currentIndex || status === 'completed'
          const isCurrent = i === currentIndex && status !== 'completed'
          const connectorFilled = i - 1 < currentIndex || status === 'completed'
          return (
            <Fragment key={m.key}>
              {i > 0 && (
                <div
                  className={`flex-1 min-h-[12px] ml-[13px] ${
                    connectorFilled
                      ? 'w-[2px] bg-[#5F3041] rounded-full'
                      : 'w-0 border-l-2 border-dashed border-gray-200'
                  }`}
                />
              )}
              <div className="flex items-center gap-3">
                <div
                  className={`flex items-center justify-center rounded-full shrink-0 w-7 h-7 transition-all ${
                    isDone
                      ? 'bg-[#5F3041] text-white'
                      : isCurrent
                      ? 'bg-white border-2 border-[#5F3041] ring-4 ring-[#5F3041]/10'
                      : 'bg-white border-2 border-gray-200'
                  }`}
                >
                  {isDone ? (
                    <Check className="w-3.5 h-3.5" strokeWidth={3} />
                  ) : (
                    <span className={`rounded-full w-2 h-2 ${isCurrent ? 'bg-[#5F3041] animate-pulse' : 'bg-gray-200'}`} />
                  )}
                </div>
                <div className="flex flex-col items-start text-left leading-tight">
                  <span
                    className={`text-[9px] font-extrabold uppercase tracking-wider font-sans ${
                      isDone || isCurrent ? 'text-[#5F3041]' : 'text-gray-300'
                    }`}
                  >
                    {m.label}
                  </span>
                  {isCurrent && (
                    <span className="text-[8px] font-bold text-[#C5A880] uppercase tracking-wider font-sans">
                      In progress
                    </span>
                  )}
                </div>
              </div>
            </Fragment>
          )
        })}
      </div>
    )
  }

  const circleSize = variant === 'detailed' ? 'w-7 h-7' : 'w-5 h-5'
  const checkSize = variant === 'detailed' ? 'w-3.5 h-3.5' : 'w-2.5 h-2.5'
  const dotSize = variant === 'detailed' ? 'w-2 h-2' : 'w-1.5 h-1.5'

  return (
    <div className="w-full">
      <div className="flex items-center">
        {MILESTONES.map((m, i) => {
          const isDone = i < currentIndex || status === 'completed'
          const isCurrent = i === currentIndex && status !== 'completed'
          return (
            <div key={m.key} className="flex items-center flex-1 last:flex-none">
              <div
                className={`flex items-center justify-center rounded-full shrink-0 transition-all ${circleSize} ${
                  isDone
                    ? 'bg-[#5F3041] text-white'
                    : isCurrent
                    ? 'bg-white border-2 border-[#5F3041] ring-4 ring-[#5F3041]/10'
                    : 'bg-white border-2 border-gray-200'
                }`}
              >
                {isDone ? (
                  <Check className={checkSize} strokeWidth={3} />
                ) : (
                  <span className={`rounded-full ${dotSize} ${isCurrent ? 'bg-[#5F3041] animate-pulse' : 'bg-gray-200'}`} />
                )}
              </div>
              {i < MILESTONES.length - 1 && (
                <div
                  className={`flex-1 h-[2px] mx-1 rounded-full ${
                    i < currentIndex || status === 'completed'
                      ? 'bg-[#5F3041]'
                      : 'border-t-2 border-dashed border-gray-200'
                  }`}
                />
              )}
            </div>
          )
        })}
      </div>

      {variant === 'detailed' && (
        <div className="grid mt-1.5" style={{ gridTemplateColumns: `repeat(${MILESTONES.length}, 1fr)` }}>
          {MILESTONES.map((m, i) => {
            const isDone = i < currentIndex || status === 'completed'
            const isCurrent = i === currentIndex && status !== 'completed'
            return (
              <span
                key={m.key}
                className={`text-[8px] font-extrabold uppercase tracking-wider font-sans text-center ${
                  isDone || isCurrent ? 'text-[#5F3041]' : 'text-gray-300'
                }`}
              >
                {m.label}
              </span>
            )
          })}
        </div>
      )}
    </div>
  )
}
