import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp } from "lucide-react"

interface InsightsTabProps {
  insights: Array<{ title: string; description: string }>
}

export function InsightsTab({ insights }: InsightsTabProps) {
  return (
    <Card className="border-border/50">
      <CardHeader className="p-3 sm:p-4">
        <CardTitle className="text-base sm:text-lg">Savings Insights</CardTitle>
        <CardDescription className="text-xs sm:text-sm">
          Track progress and get personalized recommendations
        </CardDescription>
      </CardHeader>
      <CardContent className="p-3 sm:p-4 pt-0">
        <div className="space-y-2 sm:space-y-3">
          {insights.map((insight, index) => (
            <div
              key={index}
              className="flex items-start gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg bg-muted/50 border border-border/50 hover:bg-muted transition-colors"
            >
              <div className="bg-foreground/10 p-1.5 sm:p-2 rounded-lg flex-shrink-0">
                <TrendingUp className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-foreground" />
              </div>
              <div className="space-y-0.5 flex-1 min-w-0">
                <h4 className="text-xs sm:text-sm font-semibold">{insight.title}</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">{insight.description}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
