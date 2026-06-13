interface StepProgressBarProps {
  currentStep: 1 | 2
  totalSteps?: number
}

export default function StepProgressBar({
  currentStep,
  totalSteps = 2,
}: StepProgressBarProps) {
  return (
    <div
      style={{
        padding: '0',
        paddingBottom: '20px',
      }}
    >
      {/* Step labels and number */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '10px',
        }}
      >
        {/* Step labels */}
        <div style={{ display: 'flex', gap: '24px' }}>
          <span
            style={{
              fontFamily: 'var(--font-montserrat)',
              fontSize: '10px',
              fontWeight: 700,
              letterSpacing: '0.1em',
              textTransform: 'uppercase' as const,
              color: '#3D0C1F',
              borderBottom: currentStep === 1 ? '2px solid #3D0C1F' : '2px solid transparent',
              paddingBottom: '2px',
            }}
          >
            01. Account Details
          </span>
          <span
            style={{
              fontFamily: 'var(--font-montserrat)',
              fontSize: '10px',
              fontWeight: currentStep === 2 ? 700 : 500,
              letterSpacing: '0.1em',
              textTransform: 'uppercase' as const,
              color: currentStep === 2 ? '#3D0C1F' : '#9CA3AF',
              borderBottom: currentStep === 2 ? '2px solid #3D0C1F' : '2px solid transparent',
              paddingBottom: '2px',
            }}
          >
            02. Profile & Location
          </span>
        </div>

        {/* Step number */}
        <span
          style={{
            fontFamily: 'var(--font-montserrat)',
            fontSize: '10px',
            fontWeight: 600,
            letterSpacing: '0.08em',
            color: '#9CA3AF',
          }}
        >
          STEP {currentStep} OF {totalSteps}
        </span>
      </div>

      {/* Progress bar */}
      <div
        style={{
          width: '100%',
          height: '3px',
          backgroundColor: '#F0EDEA',
          borderRadius: '2px',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            height: '100%',
            width: currentStep === 1 ? '50%' : '100%',
            backgroundColor: '#3D0C1F',
            borderRadius: '2px',
            transition: 'width 0.4s ease',
          }}
        />
      </div>
    </div>
  )
}