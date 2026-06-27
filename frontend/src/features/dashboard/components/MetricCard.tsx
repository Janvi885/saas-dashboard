import { type LucideIcon, ArrowDownRight, ArrowUpRight } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

type MetricCardProps = {
  title: string
  value: string | number
  icon: LucideIcon
  trend?: number
  loading?: boolean
  iconClassName?: string
}

export function MetricCard({
  title,
  value,
  icon: Icon,
  trend,
  loading = false,
  iconClassName = 'bg-primary/10 text-primary',
}: MetricCardProps) {
  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center gap-4 p-6">
          <Skeleton className="h-12 w-12 shrink-0 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-3 w-16" />
          </div>
        </CardContent>
      </Card>
    )
  }

  const trendPositive = trend !== undefined && trend >= 0
  const trendNegative = trend !== undefined && trend < 0

  return (
    <Card>
      <CardContent className="flex items-center gap-4 p-6">
        <div
          className={cn(
            'flex h-12 w-12 shrink-0 items-center justify-center rounded-full',
            iconClassName,
          )}
        >
          <Icon className="h-6 w-6" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="truncate text-2xl font-bold tracking-tight">{value}</p>
          {trend !== undefined && (
            <div
              className={cn(
                'mt-1 flex items-center gap-1 text-xs font-medium',
                trendPositive && 'text-emerald-600',
                trendNegative && 'text-red-600',
              )}
            >
              {trendPositive ? (
                <ArrowUpRight className="h-3.5 w-3.5" />
              ) : (
                <ArrowDownRight className="h-3.5 w-3.5" />
              )}
              <span>
                {trendPositive ? '+' : ''}
                {trend.toFixed(1)}%
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
