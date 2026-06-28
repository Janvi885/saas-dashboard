import { CircleHelp } from 'lucide-react'
import { FormLabel } from '@/components/ui/form'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'

type FormFieldLabelProps = {
  label: string
  required?: boolean
  tooltip?: string
  className?: string
}

export function FormFieldLabel({
  label,
  required = false,
  tooltip,
  className,
}: FormFieldLabelProps) {
  return (
    <div className="flex items-center gap-1.5">
      <FormLabel className={cn('flex items-center gap-1', className)}>
        {label}
        {required && (
          <span className="text-destructive" aria-hidden="true">
            *
          </span>
        )}
        {required && <span className="sr-only">(required)</span>}
      </FormLabel>
      {tooltip && (
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              className="inline-flex rounded-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              aria-label={`${label} field help`}
            >
              <CircleHelp className="h-3.5 w-3.5" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="top" className="max-w-xs text-xs">
            {tooltip}
          </TooltipContent>
        </Tooltip>
      )}
    </div>
  )
}
