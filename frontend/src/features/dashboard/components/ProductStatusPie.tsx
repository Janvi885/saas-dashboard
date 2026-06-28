import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

type ProductStatusPieProps = {
  activeCount: number
  inactiveCount: number
  loading?: boolean
}

const LEGEND_DOT_CLASS = {
  Active: 'bg-green-500',
  Inactive: 'bg-slate-400',
} as const

export function ProductStatusPie({
  activeCount,
  inactiveCount,
  loading = false,
}: ProductStatusPieProps) {
  const total = activeCount + inactiveCount

  const data = [
    { name: 'Active' as const, value: activeCount, fill: '#22c55e' },
    { name: 'Inactive' as const, value: inactiveCount, fill: '#94a3b8' },
  ]

  if (loading) {
    return (
      <Card className="h-full">
        <CardHeader>
          <Skeleton className="h-6 w-36" />
          <Skeleton className="h-4 w-48" />
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-4">
          <Skeleton className="h-[220px] w-[220px] rounded-full" />
          <div className="flex gap-4">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-20" />
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Product Status</CardTitle>
        <CardDescription>Active vs inactive products</CardDescription>
      </CardHeader>
      <CardContent>
        {total === 0 ? (
          <p className="py-16 text-center text-sm text-muted-foreground">
            No product data yet
          </p>
        ) : (
          <>
            <div className="relative mx-auto h-[220px] w-full max-w-[240px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={58}
                    outerRadius={88}
                    paddingAngle={2}
                    strokeWidth={0}
                  >
                    {data.map((entry) => (
                      <Cell key={entry.name} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value, name) => [
                      typeof value === 'number' ? value : 0,
                      String(name),
                    ]}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-bold">{total}</span>
                <span className="text-xs text-muted-foreground">Total</span>
              </div>
            </div>
            <div className="mt-4 flex justify-center gap-6">
              {data.map((entry) => (
                <div key={entry.name} className="flex items-center gap-2 text-sm">
                  <span
                    className={cn(
                      'h-3 w-3 rounded-full',
                      LEGEND_DOT_CLASS[entry.name],
                    )}
                  />
                  <span className="text-muted-foreground">{entry.name}</span>
                  <span className="font-medium">{entry.value}</span>
                </div>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
