import { Card, CardContent } from "@/components/ui/card"
import { Target } from "lucide-react"

export function CompletedTab() {
  return (
    <Card className="border-dashed">
      <CardContent className="flex flex-col items-center justify-center py-8 sm:py-12">
        <div className="rounded-full bg-muted p-3 sm:p-4 mb-3 sm:mb-4">
          <Target className="h-6 w-6 sm:h-8 sm:w-8 text-muted-foreground" />
        </div>
        <h3 className="text-sm sm:text-base font-semibold mb-1">No Completed Goals</h3>
        <p className="text-xs sm:text-sm text-muted-foreground text-center">Completed savings goals will appear here</p>
      </CardContent>
    </Card>
  )
}
