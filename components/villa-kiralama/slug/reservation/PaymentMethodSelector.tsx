import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { CreditCard, Building } from "lucide-react";

// Bu enum değerleri schema.prisma'daki ile aynı olmalı
export enum PaymentMethod {
  CREDIT_CARD = "CREDIT_CARD",
  BANK_TRANSFER = "BANK_TRANSFER"
}

interface PaymentMethodSelectorProps {
  selectedMethod: PaymentMethod;
  onMethodChange: (method: PaymentMethod) => void;
  isEnabled?: boolean;
  className?: string;
}

export default function PaymentMethodSelector({
  selectedMethod,
  onMethodChange,
  isEnabled = true,
  className = ""
}: PaymentMethodSelectorProps) {
  if (!isEnabled) {
    return (
      <div className="text-xs sm:text-sm text-muted-foreground p-2 sm:p-3 bg-muted/50 rounded-md">
        Ödeme yöntemi seçimi, rezervasyonunuz onaylandıktan sonra aktif olacaktır.
      </div>
    );
  }

  return (
    <div className={`space-y-2 sm:space-y-4 ${className}`}>
      <div className="text-xs sm:text-sm font-medium">Ödeme Yöntemi</div>
      
      <RadioGroup 
        value={selectedMethod} 
        onValueChange={(value) => onMethodChange(value as PaymentMethod)}
        className="grid grid-cols-1 gap-2 sm:gap-3"
      >
        <div className="flex items-center space-x-2 border rounded-md p-2 sm:p-3 hover:bg-muted/30 transition-colors">
          <RadioGroupItem value={PaymentMethod.BANK_TRANSFER} id="bank-transfer" className="flex-shrink-0" />
          <Label htmlFor="bank-transfer" className="flex items-center gap-1 sm:gap-2 cursor-pointer">
            <Building className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-blue-600 flex-shrink-0" />
            <div>
              <div className="text-xs sm:text-sm font-medium">Banka Havalesi</div>
              <div className="text-[9px] sm:text-xs text-muted-foreground">Verilen IBAN numarasına havale yapın</div>
            </div>
          </Label>
        </div>
        
        <div className="flex items-center space-x-2 border rounded-md p-2 sm:p-3 hover:bg-muted/30 transition-colors">
          <RadioGroupItem value={PaymentMethod.CREDIT_CARD} id="credit-card" className="flex-shrink-0" />
          <Label htmlFor="credit-card" className="flex items-center gap-1 sm:gap-2 cursor-pointer">
            <CreditCard className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-purple-600 flex-shrink-0" />
            <div>
              <div className="text-xs sm:text-sm font-medium">Kredi Kartı</div>
              <div className="text-[9px] sm:text-xs text-muted-foreground">Güvenli ödeme sayfasında kredi kartı ile ödeyin</div>
            </div>
          </Label>
        </div>
      </RadioGroup>
    </div>
  );
} 