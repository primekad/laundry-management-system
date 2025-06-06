import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import type { LucideIcon } from "lucide-react"
import { TrendingUp, TrendingDown } from "lucide-react"

interface MetricCardProps {
  title: string
  value: string | number
  change?: {
    value: string
    trend: "up" | "down" | "neutral"
  }
  icon: LucideIcon
  gradient?: string
  className?: string
}

export function MetricCard({
  title,
  value,
  change,
  icon: Icon,
  gradient = "from-blue-500 to-blue-600",
  className,
}: MetricCardProps) {
  return (
    <Card
      className={cn(
        "relative overflow-hidden border-0 shadow-card hover:shadow-lg transition-all duration-300",
        className,
      )}
    >
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-3">
            <p className="text-sm font-medium text-slate-600">{title}</p>
            <div className="space-y-1">
              <p className="text-3xl font-bold text-slate-900">{value}</p>
              {change && (
                <div className="flex items-center gap-1">
                  {change.trend === "up" ? (
                    <TrendingUp className="h-4 w-4 text-emerald-600" />
                  ) : change.trend === "down" ? (
                    <TrendingDown className="h-4 w-4 text-red-500" />
                  ) : null}
                  <span
                    className={cn(
                      "text-sm font-medium",
                      change.trend === "up" && "text-emerald-600",
                      change.trend === "down" && "text-red-500",
                      change.trend === "neutral" && "text-slate-500",
                    )}
                  >
                    {change.value}
                  </span>
                </div>
              )}
            </div>
          </div>
          <div
            className={cn(
              "h-14 w-14 rounded-2xl bg-gradient-to-br flex items-center justify-center shadow-lg",
              gradient,
            )}
          >
            <Icon className="h-7 w-7 text-white" />
          </div>
        </div>

        {/* Subtle background pattern */}
        <div className="absolute top-0 right-0 w-32 h-32 opacity-5">
          <Icon className="w-full h-full text-slate-900" />
        </div>
      </CardContent>
    </Card>
  )
}
