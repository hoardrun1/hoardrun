import { WebSocketServer, WebSocket } from 'ws'
import { verify } from 'jsonwebtoken'
import { z } from 'zod'

// Validation schemas
const messageSchema = z.object({
  type: z.enum(['balance', 'transaction', 'notification']),
  data: z.any()
})

interface AuthenticatedWebSocket extends WebSocket {
  userId?: string
  isAlive: boolean
}

class FinanceWebSocketServer {
  private wss: WebSocketServer
  private clients: Map<string, Set<AuthenticatedWebSocket>> = new Map()
  private pingInterval: NodeJS.Timeout

  constructor(server: any) {
    this.wss = new WebSocketServer({ server })
    this.initialize()
    
    // Setup ping interval to keep connections alive
    this.pingInterval = setInterval(() => {
      this.wss.clients.forEach((ws: AuthenticatedWebSocket) => {
        if (!ws.isAlive) {
          ws.terminate()
          return
        }
        ws.isAlive = false
        ws.ping()
      })
    }, 30000)
  }

  private initialize() {
    this.wss.on('connection', async (ws: AuthenticatedWebSocket, request) => {
      try {
        // Authenticate connection
        const token = request.url?.split('token=')[1]
        if (!token) {
          ws.close(4001, 'Authentication required')
          return
        }

        const decoded = await this.verifyToken(token)
        ws.userId = decoded.userId
        ws.isAlive = true

        // Add client to clients map
        if (!this.clients.has(decoded.userId)) {
          this.clients.set(decoded.userId, new Set())
        }
        this.clients.get(decoded.userId)?.add(ws)

        // Setup handlers
        ws.on('message', (data: string) => this.handleMessage(ws, data))
        ws.on('pong', () => { ws.isAlive = true })
        ws.on('close', () => this.handleClose(ws))
        ws.on('error', this.handleError)

        // Send initial state
        this.sendInitialState(ws)
      } catch (error) {
        console.error('WebSocket connection error:', error)
        ws.close(4002, 'Authentication failed')
      }
    })
  }

  private async verifyToken(token: string) {
    try {
      return verify(token, process.env.JWT_SECRET!) as { userId: string }
    } catch (error) {
      throw new Error('Invalid token')
    }
  }

  private async sendInitialState(ws: AuthenticatedWebSocket) {
    if (!ws.userId) return

    try {
      // Fetch user's financial data
      const [balance, transactions] = await Promise.all([
        this.fetchUserBalance(ws.userId),
        this.fetchRecentTransactions(ws.userId)
      ])

      // Send initial state
      ws.send(JSON.stringify({
        type: 'initial_state',
        data: { balance, transactions }
      }))
    } catch (error) {
      console.error('Error sending initial state:', error)
    }
  }

  private async handleMessage(ws: AuthenticatedWebSocket, data: string) {
    try {
      const message = JSON.parse(data)
      const validated = messageSchema.parse(message)

      switch (validated.type) {
        case 'balance':
          await this.handleBalanceUpdate(ws, validated.data)
          break
        case 'transaction':
          await this.handleTransaction(ws, validated.data)
          break
        case 'notification':
          await this.handleNotification(ws, validated.data)
          break
        default:
          console.warn('Unknown message type:', validated.type)
      }
    } catch (error) {
      console.error('Error handling message:', error)
      ws.send(JSON.stringify({
        type: 'error',
        data: { message: 'Invalid message format' }
      }))
    }
  }

  private async handleBalanceUpdate(ws: AuthenticatedWebSocket, data: any) {
    if (!ws.userId) return

    try {
      // Update balance in database
      const newBalance = await this.updateUserBalance(ws.userId, data.amount)

      // Notify all user's connected clients
      this.broadcastToUser(ws.userId, {
        type: 'balance',
        data: { balance: newBalance }
      })
    } catch (error) {
      console.error('Error updating balance:', error)
      ws.send(JSON.stringify({
        type: 'error',
        data: { message: 'Failed to update balance' }
      }))
    }
  }

  private async handleTransaction(ws: AuthenticatedWebSocket, data: any) {
    if (!ws.userId) return

    try {
      // Process transaction
      const transaction = await this.processTransaction(ws.userId, data)

      // Notify all user's connected clients
      this.broadcastToUser(ws.userId, {
        type: 'transaction',
        data: { transaction }
      })
    } catch (error) {
      console.error('Error processing transaction:', error)
      ws.send(JSON.stringify({
        type: 'error',
        data: { message: 'Failed to process transaction' }
      }))
    }
  }

  private handleClose(ws: AuthenticatedWebSocket) {
    if (ws.userId) {
      this.clients.get(ws.userId)?.delete(ws)
      if (this.clients.get(ws.userId)?.size === 0) {
        this.clients.delete(ws.userId)
      }
    }
  }

  private handleError(error: Error) {
    console.error('WebSocket error:', error)
  }

  private broadcastToUser(userId: string, message: any) {
    this.clients.get(userId)?.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(message))
      }
    })
  }

  // Database interaction methods (implement these based on your database)
  private async fetchUserBalance(userId: string): Promise<number> {
    // Implement balance fetch from database
    return 0
  }

  private async fetchRecentTransactions(userId: string): Promise<any[]> {
    // Implement transactions fetch from database
    return []
  }

  private async updateUserBalance(userId: string, amount: number): Promise<number> {
    // Implement balance update in database
    return 0
  }

  private async processTransaction(userId: string, data: any): Promise<any> {
    // Implement transaction processing in database
    return {}
  }

  // Cleanup
  public close() {
    clearInterval(this.pingInterval)
    this.wss.close()
  }
}

export default FinanceWebSocketServer 