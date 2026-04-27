import clsx from 'clsx'

const sizes = {
  sm: 'h-4 w-4 border-2',
  md: 'h-8 w-8 border-2',
  lg: 'h-12 w-12 border-4',
}

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg'
}

export default function Spinner({ size = 'md' }: SpinnerProps) {
  return (
    <div
      role="status"
      className={clsx(
        'animate-spin rounded-full border-current border-t-transparent',
        sizes[size]
      )}
    />
  )
}
