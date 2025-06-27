import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { useToast } from '@/hooks/use-toast'
import { useAuthStore } from '@/stores/authStore'
import { tokenService } from '@/lib/services/tokenService'
import { countryService } from '@/lib/services/countryService'
import { TOKEN_PRICING } from '@/lib/constants'
import { 
  CreditCard, 
  DollarSign, 
  CheckCircle, 
  Copy, 
  ExternalLink,
  Phone,
  Mail,
  MessageCircle
} from 'lucide-react'

export default function TokenPurchase() {
  const { user } = useAuthStore()
  const { toast } = useToast()
  const [selectedPackage, setSelectedPackage] = useState<keyof typeof TOKEN_PRICING | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [escrowDetails, setEscrowDetails] = useState<any>(null)
  const [transactionId, setTransactionId] = useState<string | null>(null)

  const userCountry = countryService.getUserCountry()
  const countryConfig = countryService.getCountryConfig()
  const supportContacts = countryService.getSupportContacts()

  const handlePackageSelect = (packageType: keyof typeof TOKEN_PRICING) => {
    setSelectedPackage(packageType)
    setEscrowDetails(null)
    setTransactionId(null)
  }

  const handlePurchase = async () => {
    if (!selectedPackage || !user) {
      toast({
        title: 'Error',
        description: 'Please select a package and ensure you are logged in.',
        variant: 'destructive',
      })
      return
    }

    setIsProcessing(true)
    try {
      const result = await tokenService.createTokenPurchase({
        packageType: selectedPackage,
        paymentMethod: 'escrow',
      })

      if (result.success && result.escrowDetails) {
        setEscrowDetails(result.escrowDetails)
        setTransactionId(result.transactionId || null)
        toast({
          title: 'Success',
          description: 'Token purchase request created. Please follow the payment instructions.',
        })
      } else {
        toast({
          title: 'Error',
          description: result.error || 'Failed to create token purchase request.',
          variant: 'destructive',
        })
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'An unexpected error occurred.',
        variant: 'destructive',
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: 'Copied',
      description: `${label} copied to clipboard`,
    })
  }

  const openWhatsApp = (number: string) => {
    const message = `Hi, I need help with my token purchase. Transaction ID: ${transactionId}`
    const url = `https://wa.me/${number}?text=${encodeURIComponent(message)}`
    window.open(url, '_blank')
  }

  const openEmail = (email: string) => {
    const subject = 'Token Purchase Support'
    const body = `Hi, I need help with my token purchase.\n\nTransaction ID: ${transactionId}\n\nPlease assist me.`
    const url = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
    window.open(url)
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Purchase Tokens</h1>
        <p className="text-muted-foreground">
          Buy tokens to access premium features and submit proposals
        </p>
      </div>

      {/* Current Balance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <DollarSign className="h-5 w-5" />
            <span>Current Balance</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {user?.tokens || 0} Tokens
          </div>
          <p className="text-sm text-muted-foreground">
            Available for opportunities and proposals
          </p>
        </CardContent>
      </Card>

      {/* Token Packages */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Object.entries(TOKEN_PRICING).map(([key, packageData]) => (
          <Card 
            key={key}
            className={`cursor-pointer transition-all ${
              selectedPackage === key 
                ? 'ring-2 ring-primary border-primary' 
                : 'hover:shadow-md'
            }`}
            onClick={() => handlePackageSelect(key as keyof typeof TOKEN_PRICING)}
          >
            <CardHeader className="text-center">
              <CardTitle className="text-lg">{packageData.tokens} Tokens</CardTitle>
              <CardDescription>{packageData.description}</CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <div className="text-2xl font-bold text-primary">
                {countryConfig.currency_symbol}{packageData.price_usd}
              </div>
              {selectedPackage === key && (
                <CheckCircle className="h-6 w-6 text-green-500 mx-auto mt-2" />
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Purchase Button */}
      {selectedPackage && (
        <div className="text-center">
          <Button 
            onClick={handlePurchase} 
            disabled={isProcessing}
            size="lg"
            className="px-8"
          >
            {isProcessing ? 'Processing...' : `Purchase ${TOKEN_PRICING[selectedPackage].tokens} Tokens`}
          </Button>
        </div>
      )}

      {/* Escrow Payment Instructions */}
      {escrowDetails && (
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-green-800">
              <CreditCard className="h-5 w-5" />
              <span>Payment Instructions</span>
            </CardTitle>
            <CardDescription className="text-green-700">
              Follow these steps to complete your token purchase
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Transaction Details */}
            <div className="bg-white p-4 rounded-lg border">
              <h3 className="font-semibold mb-2">Transaction Details</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Transaction ID:</span>
                  <span className="font-mono">{transactionId}</span>
                </div>
                <div className="flex justify-between">
                  <span>Amount:</span>
                  <span>{countryConfig.currency_symbol}{escrowDetails.amount}</span>
                </div>
                <div className="flex justify-between">
                  <span>Reference:</span>
                  <span className="font-mono">{escrowDetails.reference}</span>
                </div>
              </div>
            </div>

            {/* Payment Account */}
            <div className="bg-white p-4 rounded-lg border">
              <h3 className="font-semibold mb-2">Payment Account</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Account Name:</span>
                  <span>{escrowDetails.accountName}</span>
                </div>
                <div className="flex justify-between">
                  <span>Account Number:</span>
                  <span className="font-mono">{escrowDetails.accountNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span>Account Type:</span>
                  <span className="capitalize">{escrowDetails.accountType.replace('_', ' ')}</span>
                </div>
                {escrowDetails.provider && (
                  <div className="flex justify-between">
                    <span>Provider:</span>
                    <span>{escrowDetails.provider}</span>
                  </div>
                )}
                {escrowDetails.phoneNumber && (
                  <div className="flex justify-between">
                    <span>Phone:</span>
                    <span>{escrowDetails.phoneNumber}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Instructions */}
            <div className="bg-white p-4 rounded-lg border">
              <h3 className="font-semibold mb-2">Payment Steps</h3>
              <div className="space-y-2 text-sm">
                {escrowDetails.instructions.split('\n').map((instruction: string, index: number) => (
                  <div key={index} className="flex items-start space-x-2">
                    <span className="text-primary font-bold">{index + 1}.</span>
                    <span>{instruction}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Support Contacts */}
            {supportContacts.length > 0 && (
              <div className="bg-white p-4 rounded-lg border">
                <h3 className="font-semibold mb-2">Need Help?</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Contact our support team for assistance with your payment
                </p>
                <div className="space-y-2">
                  {supportContacts.map((contact, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Phone className="h-4 w-4" />
                        <span className="text-sm">{contact.phone}</span>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(contact.phone, 'Phone number')}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                  {supportContacts.map((contact, index) => (
                    <div key={`email-${index}`} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Mail className="h-4 w-4" />
                        <span className="text-sm">{contact.email}</span>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEmail(contact.email)}
                      >
                        <ExternalLink className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                  {supportContacts.map((contact, index) => (
                    <div key={`whatsapp-${index}`} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <MessageCircle className="h-4 w-4" />
                        <span className="text-sm">WhatsApp</span>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openWhatsApp(contact.whatsapp.replace('wa.me/', ''))}
                      >
                        <ExternalLink className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Payment Methods Info */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Methods</CardTitle>
          <CardDescription>
            Currently available payment options for {countryConfig.name}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <CreditCard className="h-5 w-5 text-primary" />
              <div>
                <h4 className="font-semibold">Escrow Payment</h4>
                <p className="text-sm text-muted-foreground">
                  Secure manual payment through our escrow accounts. 
                  Tokens are credited within 24 hours after payment verification.
                </p>
              </div>
            </div>
            <Separator />
            <div className="text-sm text-muted-foreground">
              <p>• Payment verification typically takes 24 hours</p>
              <p>• Always include the reference number in your payment</p>
              <p>• Keep proof of payment for verification</p>
              <p>• Contact support if you need assistance</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 