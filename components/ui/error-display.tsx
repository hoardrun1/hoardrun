import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface ErrorDisplayProps {
  message: string
  onRetry?: () => void
}

export function ErrorDisplay({ message, onRetry }: ErrorDisplayProps) {
  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="max-w-lg mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center text-destructive">
            <AlertCircle className="h-5 w-5 mr-2" />
            Error
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert variant="destructive">
            <AlertDescription>{message}</AlertDescription>
          </Alert>
          {onRetry && (
            <Button onClick={onRetry} variant="outline" className="w-full">
              Try Again
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 