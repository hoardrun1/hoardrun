import { Alert, AlertDescription } from "./alert";
import { AlertCircle } from "lucide-react";
import { Button } from "./button";
import { Card, CardContent, CardHeader, CardTitle } from "./card";

interface ErrorDisplayProps {
  title?: string;
  message: string;
  code?: string;
  onRetry?: () => void;
}

export function ErrorDisplay({ 
  title = 'Error',
  message, 
  code,
  onRetry 
}: ErrorDisplayProps) {
  return (
    <Card className="max-w-lg mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center text-destructive">
          <AlertCircle className="h-5 w-5 mr-2" />
          {title}
          {code && <span className="text-sm ml-2 opacity-75">({code})</span>}
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
  );
} 