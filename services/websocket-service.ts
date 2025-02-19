import { toast } from '@/components/ui/use-toast'

interface WebSocketMessage {
  type: 'balance' | 'transaction' | 'notification'
  data: any
}

class WebSocketService {
  private ws: WebSocket | null = null
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectDelay = 3000
  private subscribers: Map<string, Set<(data: any) => void>> = new Map()

  constructor() {
    this.initialize()
  }

  private initialize() {
    try {
      this.ws = new WebSocket(process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3001')
      
      this.ws.onopen = () => {
        console.log('WebSocket connected')
        this.reconnectAttempts = 0
      }

      this.ws.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data)
          this.notifySubscribers(message.type, message.data)
        } catch (error) {
          console.error('Error parsing WebSocket message:', error)
        }
      }

      this.ws.onclose = () => {
        console.log('WebSocket disconnected')
        this.handleReconnect()
      }

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error)
        toast({
          title: "Connection Error",
          description: "Lost connection to server. Attempting to reconnect...",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error initializing WebSocket:', error)
    }
  }

  private handleReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++
      setTimeout(() => {
        console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})`)
        this.initialize()
      }, this.reconnectDelay)
    } else {
      toast({
        title: "Connection Failed",
        description: "Unable to connect to server. Please refresh the page.",
        variant: "destructive",
        duration: 0
      })
    }
  }

  subscribe(type: string, callback: (data: any) => void) {
    if (!this.subscribers.has(type)) {
      this.subscribers.set(type, new Set())
    }
    this.subscribers.get(type)?.add(callback)

    // Return unsubscribe function
    return () => {
      this.subscribers.get(type)?.delete(callback)
    }
  }

  private notifySubscribers(type: string, data: any) {
    this.subscribers.get(type)?.forEach(callback => callback(data))
  }

  send(type: string, data: any) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type, data }))
    } else {
      console.error('WebSocket is not connected')
      toast({
        title: "Error",
        description: "Unable to send data. Please try again.",
        variant: "destructive"
      })
    }
  }
}

export const wsService = new WebSocketService() 