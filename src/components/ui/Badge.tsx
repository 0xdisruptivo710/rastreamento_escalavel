interface BadgeProps {
  variant: 'pending' | 'provisioning' | 'active' | 'error' | 'inactive'
  children: React.ReactNode
}

const VARIANT_STYLES: Record<BadgeProps['variant'], string> = {
  pending: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
  provisioning: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  active: 'bg-green-500/10 text-green-500 border-green-500/20',
  error: 'bg-red-500/10 text-red-500 border-red-500/20',
  inactive: 'bg-gray-500/10 text-gray-500 border-gray-500/20',
}

export function Badge({ variant, children }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${VARIANT_STYLES[variant]}`}
    >
      {variant === 'provisioning' && (
        <span className="w-2 h-2 mr-1.5 rounded-full bg-blue-500 animate-pulse" />
      )}
      {children}
    </span>
  )
}
