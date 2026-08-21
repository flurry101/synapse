import { Box } from '@mui/material'
import { useEffect, useMemo, useState } from 'react'

interface PerspectiveGridProps {
  /** Additional CSS styles or class for the container */
  sx?: object
  className?: string
  /** Number of tiles per row/column (default: 32 for optimal performance) */
  gridSize?: number
  /** Whether to show the gradient overlay (default: true) */
  showOverlay?: boolean
  /** Fade radius percentage for the gradient overlay (default: 80) */
  fadeRadius?: number
}

export function PerspectiveGrid({
  sx,
  className,
  gridSize = 30,
  showOverlay = true,
  fadeRadius = 75,
}: PerspectiveGridProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Memoize tiles array to prevent unnecessary re-renders
  const tiles = useMemo(() => Array.from({ length: gridSize * gridSize }), [gridSize])

  return (
    <Box
      className={className}
      sx={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        bgcolor: '#090d16',
        perspective: '2000px',
        transformStyle: 'preserve-3d',
        pointerEvents: 'auto',
        zIndex: 0,
        ...sx,
      }}
      aria-hidden='true'
    >
      {/* 3D Perspective Grid Plane */}
      <Box
        sx={{
          position: 'absolute',
          width: { xs: '60rem', sm: '75rem', md: '90rem' },
          aspectRatio: '1 / 1',
          left: '50%',
          top: '40%',
          transform:
            'translate(-50%, -50%) rotateX(32deg) rotateY(-4deg) rotateZ(18deg) scale(1.6)',
          transformStyle: 'preserve-3d',
          transformOrigin: 'center center',
          display: 'grid',
          gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
          gridTemplateRows: `repeat(${gridSize}, 1fr)`,
        }}
      >
        {mounted &&
          tiles.map((_, i) => (
            <Box
              key={i}
              sx={{
                border: '1px solid rgba(56, 189, 248, 0.12)',
                backgroundColor: 'transparent',
                transition: 'background-color 1.5s ease, border-color 1.5s ease',
                '&:hover': {
                  backgroundColor: 'rgba(244, 114, 182, 0.35)',
                  borderColor: 'rgba(244, 114, 182, 0.8)',
                  transition: 'none',
                  boxShadow: '0 0 12px rgba(244, 114, 182, 0.5)',
                },
              }}
            />
          ))}
      </Box>

      {/* Radial Gradient Mask (Overlay) */}
      {showOverlay && (
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            pointerEvents: 'none',
            zIndex: 1,
            background: `radial-gradient(ellipse 80% 70% at 50% 35%, transparent 20%, #090d16 ${fadeRadius}%)`,
          }}
        />
      )}
    </Box>
  )
}

export default PerspectiveGrid
