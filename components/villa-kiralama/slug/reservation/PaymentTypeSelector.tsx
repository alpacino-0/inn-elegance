'use client';

import React from "react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { CheckCircle } from "lucide-react";

// Ödeme tipi - Kullanıcının UI'de seçeceği değer
export enum PaymentType {
  ADVANCE = 'ADVANCE', // %20 ön ödeme
  FULL = 'FULL'       // Tam ödeme
}

interface PaymentTypeSelectorProps {
  selectedPaymentType: PaymentType;
  onPaymentTypeChange: (paymentType: PaymentType) => void;
  advanceAmount?: number;
  remainingAmount?: number;
  totalAmount: number;
}

export default function PaymentTypeSelector({
  selectedPaymentType,
  onPaymentTypeChange,
  advanceAmount = 0,
  remainingAmount = 0,
  totalAmount
}: PaymentTypeSelectorProps) {
  return (
    <div className="space-y-2 sm:space-y-3">
      <Label className="text-sm sm:text-base font-medium">Ödeme Seçenekleri</Label>
      
      <RadioGroup 
        value={selectedPaymentType}
        onValueChange={(value) => onPaymentTypeChange(value as PaymentType)}
        className="flex flex-col space-y-2 sm:space-y-3"
      >
        {/* Ön Ödeme Seçeneği */}
        <div>
          <RadioGroupItem
            value={PaymentType.ADVANCE}
            id="payment-advance"
            className="peer sr-only"
          />
          <Label
            htmlFor="payment-advance"
            className="flex items-start p-2 sm:p-3 border rounded-md peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 cursor-pointer hover:bg-gray-50 transition-colors"
          >
            <div className="flex-1">
              <div className="flex items-center">
                <span className="text-xs sm:text-sm font-medium">Ön Ödeme ile Rezervasyon</span>
                {selectedPaymentType === PaymentType.ADVANCE && (
                  <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 ml-1 sm:ml-2 text-primary flex-shrink-0" />
                )}
              </div>
              <p className="text-[10px] sm:text-sm text-gray-600 mt-0.5 sm:mt-1 leading-tight sm:leading-normal">
                Konaklama bedelinin %20&apos;sini şimdi ödeyin, kalan tutarı giriş günü nakit veya havale ile ödeyin.
              </p>
              {advanceAmount > 0 && (
                <div className="text-[10px] sm:text-sm font-medium text-primary mt-1 sm:mt-2">
                  <span className="inline-block">Şimdi: {advanceAmount.toLocaleString('tr-TR')} ₺,</span>
                  <span className="inline-block ml-1">Kalan: {remainingAmount.toLocaleString('tr-TR')} ₺</span>
                </div>
              )}
            </div>
          </Label>
        </div>
        
        {/* Tam Ödeme Seçeneği */}
        <div>
          <RadioGroupItem
            value={PaymentType.FULL}
            id="payment-full"
            className="peer sr-only"
          />
          <Label
            htmlFor="payment-full"
            className="flex items-start p-2 sm:p-3 border rounded-md peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 cursor-pointer hover:bg-gray-50 transition-colors"
          >
            <div className="flex-1">
              <div className="flex items-center">
                <span className="text-xs sm:text-sm font-medium">Tam Ödeme</span>
                {selectedPaymentType === PaymentType.FULL && (
                  <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 ml-1 sm:ml-2 text-primary flex-shrink-0" />
                )}
              </div>
              <p className="text-[10px] sm:text-sm text-gray-600 mt-0.5 sm:mt-1 leading-tight sm:leading-normal">
                Rezervasyon tutarının tamamını şimdi ödeyin ve işleminizi hemen tamamlayın.
              </p>
              {totalAmount > 0 && (
                <div className="text-[10px] sm:text-sm font-medium text-primary mt-1 sm:mt-2">
                  Toplam: {totalAmount.toLocaleString('tr-TR')} ₺
                </div>
              )}
            </div>
          </Label>
        </div>
      </RadioGroup>
    </div>
  );
} 