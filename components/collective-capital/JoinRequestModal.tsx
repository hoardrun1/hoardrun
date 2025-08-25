'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { UserPlus, MessageSquare, Send, AlertCircle } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { CollectiveCircle } from '@/types/collective-capital'

interface JoinRequestModalProps {
  circle: CollectiveCircle
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function JoinRequestModal({ circle, open, onOpenChange, onSuccess }: JoinRequestModalProps) {
  const [message, setMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { addToast } = useToast()

  const handleSubmit = async () => {
    if (!message.trim()) {
      addToast({
        title: "Message Required",
        description: "Please provide a message explaining why you want to join this circle",
        variant: "destructive"
      })
      return
    }

    setIsLoading(true)
    try {
      // API call to submit join request
      await new Promise(resolve => setTimeout(resolve, 1500)) // Mock delay
      
      addToast({
        title: "Request Sent!",
        description: "Your join request has been sent to the circle administrators",
      })
      
      onSuccess()
    } catch (error) {
      addToast({
        title: "Error",
        description: "Failed to send join request",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-blue-600" />
            Request to Join
          </DialogTitle>
          <DialogDescription>
            Send a request to join "{circle.name}"
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Card className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="font-medium text-blue-900 dark:text-blue-100">
                    Private Circle
                  </h4>
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    This is a private investment circle. Your request will be reviewed by the circle administrators.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-2">
            <Label htmlFor="message">
              Message to Administrators *
            </Label>
            <Textarea
              id="message"
              placeholder="Tell the administrators why you want to join this circle, your investment experience, and what you can contribute..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              className="resize-none"
            />
            <p className="text-xs text-gray-500">
              {message.length}/500 characters
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="font-medium">Circle Requirements:</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Minimum contribution: ${circle.minimumContribution.toLocaleString()}</li>
              <li>• Investment focus: {circle.category.replace('_', ' ')}</li>
              <li>• Active participation in voting</li>
              <li>• Commitment to circle guidelines</li>
            </ul>
          </div>
        </div>

        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={isLoading || !message.trim() || message.length > 500}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {isLoading ? (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="mr-2"
                >
                  <Send className="h-4 w-4" />
                </motion.div>
                Sending...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Send Request
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
