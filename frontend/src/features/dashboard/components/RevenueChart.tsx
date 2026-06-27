import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { formatCurrency } from '@/utils/formatters'

const REVENUE_DATA = [
  { month: 'Jan', revenue: 8420 },
  { month: 'Feb', revenue: 9150 },
  { month: 'Mar', revenue: 8890 },
  { month: 'Apr', revenue: 10240 },
  { month: 'May', revenue: 9780 },
  { month: 'Jun', revenue: 11250 },
  { month: 'Jul', revenue: 10980 },
  { month: 'Aug', revenue: 12140 },
  { month: 'Sep', revenue: 11820 },
  { month: 'Oct', revenue: 13260 },
  { month: 'Nov', revenue: 14180 },
  { month: 'Dec', revenue: 15640 },
] as const

type TooltipPayload = {
  value?: number
  payload?: { month: string; revenue: number }
}

function RevenueTooltip({
  active,
  payload,
}: {
  active?: boolean
  payload?: TooltipPayload[]
}) {
  if (!active || !payload?.length) {
    return null
  }

  const value = payload[0]?.value ?? 0
  const month = payload[0]?.payload?.month ?? ''

  return (
    <div className="rounded-lg border bg-background px-3 py-2 shadow-md">
      <p className="text-xs text-muted-foreground">{month}</p>
      <p className="text-sm font-semibold">{formatCurrency(value)}</p>
    </div>
  )
}

function formatYAxis(value: number): string {
  if (value >= 1000) {
    return `$${(value / 1000).toFixed(0)}k`
  }
  return `$${value}`
}

export function RevenueChart() {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Revenue Overview</CardTitle>
        <CardDescription>Monthly recurring revenue (last 12 months)</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={[...REVENUE_DATA]} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.35} />
                <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" vertical={false} />
            <XAxis
              dataKey="month"
              tick={{ fontSize: 12 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tickFormatter={formatYAxis}
              tick={{ fontSize: 12 }}
              axisLine={false}
              tickLine={false}
              width={48}
            />
            <Tooltip content={<RevenueTooltip />} />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              fill="url(#revenueGradient)"
              dot={false}
              activeDot={{ r: 4, strokeWidth: 0 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
