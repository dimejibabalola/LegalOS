import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export function StatCard({
  title,
  value,
  description,
  trend,
  trendValue,
  icon: Icon,
  className,
  variant = 'default',
}) {
  const getTrendIcon = () => {
    if (trend === 'up') return <TrendingUp className="h-4 w-4 text-green-500" />
    if (trend === 'down') return <TrendingDown className="h-4 w-4 text-red-500" />
    return <Minus className="h-4 w-4 text-slate-400" />
  }

  const getTrendColor = () => {
    if (trend === 'up') return 'text-green-600'
    if (trend === 'down') return 'text-red-600'
    return 'text-slate-500'
  }

  const variantStyles = {
    default: 'bg-white',
    primary: 'bg-blue-600 text-white',
    success: 'bg-green-50 border-green-200',
    warning: 'bg-amber-50 border-amber-200',
    danger: 'bg-red-50 border-red-200',
  }

  return (
    <Card className={cn(variantStyles[variant], className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle
          className={cn(
            'text-sm font-medium',
            variant === 'primary' ? 'text-blue-100' : 'text-slate-600'
          )}
        >
          {title}
        </CardTitle>
        {Icon && (
          <Icon
            className={cn(
              'h-4 w-4',
              variant === 'primary' ? 'text-blue-200' : 'text-slate-400'
            )}
          />
        )}
      </CardHeader>
      <CardContent>
        <div
          className={cn(
            'text-2xl font-bold',
            variant === 'primary' ? 'text-white' : 'text-slate-900'
          )}
        >
          {value}
        </div>
        {(description || trend) && (
          <div className="flex items-center gap-2 mt-1">
            {trend && (
              <div className={cn('flex items-center gap-1', getTrendColor())}>
                {getTrendIcon()}
                <span className="text-xs font-medium">{trendValue}</span>
              </div>
            )}
            {description && (
              <p
                className={cn(
                  'text-xs',
                  variant === 'primary' ? 'text-blue-200' : 'text-slate-500'
                )}
              >
                {description}
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
