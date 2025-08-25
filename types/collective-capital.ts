export interface CollectiveCircle {
  id: string
  name: string
  description: string
  category: InvestmentCategory
  createdBy: string
  createdAt: Date
  updatedAt: Date
  isPrivate: boolean
  inviteCode?: string
  maxMembers: number
  currentMembers: number
  totalPoolValue: number
  minimumContribution: number
  status: 'ACTIVE' | 'PAUSED' | 'CLOSED' | 'PENDING'
  
  // Blockchain integration
  contractAddress?: string
  blockchainNetwork: 'ETHEREUM' | 'POLYGON' | 'BSC'
  
  // Circle settings
  votingThreshold: number // Percentage needed to approve investment
  proposalDuration: number // Hours for voting
  autoDistribution: boolean
  
  // Performance metrics
  totalReturns: number
  averageReturn: number
  riskScore: number
  
  // AI recommendations
  aiRecommendations: AIRecommendation[]
  
  members: CircleMember[]
  investments: CircleInvestment[]
  proposals: InvestmentProposal[]
  activities: CircleActivity[]
}

export interface CircleMember {
  id: string
  userId: string
  userName: string
  userAvatar?: string
  joinedAt: Date
  role: 'CREATOR' | 'ADMIN' | 'MEMBER'
  totalContributed: number
  currentStake: number // Percentage of total pool
  votingPower: number
  loyaltyPoints: number
  badges: LoyaltyBadge[]
  isActive: boolean
  
  // Performance tracking
  personalReturns: number
  investmentHistory: MemberInvestmentHistory[]
}

export interface InvestmentProposal {
  id: string
  circleId: string
  proposedBy: string
  proposerName: string
  title: string
  description: string
  investmentType: InvestmentType
  targetAmount: number
  minimumAmount: number
  expectedReturn: number
  riskLevel: 'LOW' | 'MODERATE' | 'HIGH' | 'VERY_HIGH'
  duration: number // months
  
  // Proposal details
  assetDetails: AssetDetails
  marketAnalysis: string
  riskAnalysis: string
  exitStrategy: string
  
  // Voting
  votingDeadline: Date
  votes: ProposalVote[]
  currentVotes: {
    yes: number
    no: number
    abstain: number
  }
  requiredVotes: number
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'EXPIRED' | 'EXECUTED'
  
  // AI analysis
  aiScore: number
  aiRecommendation: 'APPROVE' | 'REJECT' | 'CAUTION'
  aiAnalysis: string
  
  createdAt: Date
  updatedAt: Date
}

export interface CircleInvestment {
  id: string
  circleId: string
  proposalId: string
  assetType: InvestmentType
  assetSymbol: string
  assetName: string
  totalAmount: number
  purchasePrice: number
  currentPrice: number
  quantity: number
  
  // Performance
  currentValue: number
  totalReturn: number
  returnPercentage: number
  
  // Blockchain tracking
  transactionHash?: string
  blockNumber?: number
  
  // Distribution
  lastDistribution?: Date
  totalDistributed: number
  
  status: 'ACTIVE' | 'SOLD' | 'PARTIAL_SOLD'
  purchaseDate: Date
  updatedAt: Date
}

export interface ProposalVote {
  id: string
  proposalId: string
  voterId: string
  voterName: string
  vote: 'YES' | 'NO' | 'ABSTAIN'
  votingPower: number
  comment?: string
  votedAt: Date
}

export interface CircleActivity {
  id: string
  circleId: string
  type: ActivityType
  userId: string
  userName: string
  description: string
  metadata?: Record<string, any>
  createdAt: Date
}

export interface LoyaltyBadge {
  id: string
  name: string
  description: string
  icon: string
  color: string
  earnedAt: Date
  rarity: 'COMMON' | 'RARE' | 'EPIC' | 'LEGENDARY'
}

export interface AIRecommendation {
  id: string
  type: 'INVESTMENT_OPPORTUNITY' | 'RISK_WARNING' | 'PORTFOLIO_OPTIMIZATION' | 'MARKET_INSIGHT'
  title: string
  description: string
  confidence: number // 0-100
  category: InvestmentCategory
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
  actionRequired: boolean
  createdAt: Date
  expiresAt?: Date
}

export interface JoinRequest {
  id: string
  circleId: string
  userId: string
  userName: string
  userAvatar?: string
  message: string
  status: 'PENDING' | 'APPROVED' | 'REJECTED'
  requestedAt: Date
  reviewedAt?: Date
  reviewedBy?: string
}

export interface AssetDetails {
  symbol: string
  name: string
  type: InvestmentType
  exchange?: string
  sector?: string
  marketCap?: number
  pe_ratio?: number
  dividend_yield?: number
  beta?: number
  description?: string
  fundamentals?: Record<string, any>
}

export interface MemberInvestmentHistory {
  investmentId: string
  amount: number
  returns: number
  date: Date
}

export type InvestmentCategory = 
  | 'STOCKS' 
  | 'CRYPTO' 
  | 'REAL_ESTATE' 
  | 'BONDS' 
  | 'COMMODITIES' 
  | 'STARTUPS' 
  | 'GREEN_TECH' 
  | 'AI_TECH' 
  | 'HEALTHCARE' 
  | 'ENERGY'

export type InvestmentType = InvestmentCategory

export type ActivityType = 
  | 'MEMBER_JOINED' 
  | 'MEMBER_LEFT' 
  | 'PROPOSAL_CREATED' 
  | 'PROPOSAL_VOTED' 
  | 'INVESTMENT_EXECUTED' 
  | 'RETURNS_DISTRIBUTED' 
  | 'CIRCLE_CREATED' 
  | 'CIRCLE_UPDATED'

export interface CircleFilters {
  category?: InvestmentCategory[]
  minPoolValue?: number
  maxPoolValue?: number
  riskLevel?: string[]
  memberCount?: {
    min?: number
    max?: number
  }
  returns?: {
    min?: number
    max?: number
  }
  status?: string[]
}

export interface CircleStats {
  totalCircles: number
  totalMembers: number
  totalPoolValue: number
  averageReturn: number
  topPerformingCircle: CollectiveCircle
  userCircles: number
  userTotalInvested: number
  userTotalReturns: number
}
