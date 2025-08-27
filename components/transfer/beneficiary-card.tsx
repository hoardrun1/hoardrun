'use client'

import { useState } from 'react'
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Send, Star, StarOff, MoreVertical } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { type Beneficiary } from '@/services/transfer-service'
import { TransferModal } from './transfer-modal'

interface BeneficiaryCardProps {
  beneficiary: Beneficiary
  onFavorite: (id: string, favorite: boolean) => void
  onDelete: (id: string) => void
  onSuccess?: () => void
}

export function BeneficiaryCard({
  beneficiary,
  onFavorite,
  onDelete,
  onSuccess,
}: BeneficiaryCardProps) {
  const [showTransferModal, setShowTransferModal] = useState(false)

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
  }

  const formatAccountNumber = (accountNumber: string) => {
    return `****${accountNumber.slice(-4)}`
  }

  return (
    <>
      <Card className="w-full max-w-sm hover:shadow-md transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="flex items-center space-x-4">
            <Avatar className="h-12 w-12">
              <AvatarImage src={beneficiary.avatar} />
              <AvatarFallback>{getInitials(beneficiary.name)}</AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold text-lg">{beneficiary.name}</h3>
              <p className="text-sm text-gray-500">
                {formatAccountNumber(beneficiary.accountNumber)}
              </p>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => onFavorite(beneficiary.id, !beneficiary.isFavorite)}
              >
                {beneficiary.isFavorite ? (
                  <>
                    <StarOff className="mr-2 h-4 w-4" />
                    Remove from favorites
                  </>
                ) : (
                  <>
                    <Star className="mr-2 h-4 w-4" />
                    Add to favorites
                  </>
                )}
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-gray-600"
                onClick={() => onDelete(beneficiary.id)}
              >
                Delete beneficiary
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </CardHeader>
        <CardContent className="py-4">
          <div className="flex flex-wrap gap-2">
            {beneficiary.isFavorite && (
              <Badge variant="secondary">
                <Star className="mr-1 h-3 w-3" />
                Favorite
              </Badge>
            )}
            <Badge variant="outline">{beneficiary.bankName}</Badge>
            {beneficiary.recentTransfer && (
              <Badge variant="secondary">Recent</Badge>
            )}
          </div>
        </CardContent>
        <CardFooter>
          <Button
            className="w-full"
            onClick={() => setShowTransferModal(true)}
          >
            <Send className="mr-2 h-4 w-4" />
            Send Money
          </Button>
        </CardFooter>
      </Card>

      <TransferModal
        open={showTransferModal}
        onOpenChange={setShowTransferModal}
        beneficiary={beneficiary}
        onSuccess={onSuccess}
      />
    </>
  )
} 