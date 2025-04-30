'use client';

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, AlertTriangle, CheckCircle } from "lucide-react";

interface VillaRulesProps {
  checkInTime?: string;
  checkOutTime?: string;
  rules?: string[];
  customRules?: string[];
}

export default function VillaRules({ 
  checkInTime = "15:00", 
  checkOutTime = "11:00", 
  rules = [],
  customRules = []
}: VillaRulesProps) {
  
  // Tüm kuralları birleştir
  const allRules = [...rules, ...customRules].filter(Boolean);
  
  return (
    <Card className="overflow-hidden bg-white shadow-sm">
      <CardHeader className="pb-2 sm:pb-3">
        <CardTitle className="text-lg sm:text-xl">Villa Kuralları ve Bilgileri</CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4 sm:space-y-6">
        {/* Check-in ve Check-out Bilgileri */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          <div className="flex items-start gap-2 sm:gap-3 flex-1 p-2 sm:p-3 rounded-lg hover:bg-gray-50 transition-colors">
            <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-primary mt-0.5" />
            <div>
              <h3 className="font-medium text-sm">Giriş Saati</h3>
              <p className="text-sm text-gray-600">{checkInTime || "15:00"}&apos;dan sonra</p>
            </div>
          </div>
          
          <div className="flex items-start gap-2 sm:gap-3 flex-1 p-2 sm:p-3 rounded-lg hover:bg-gray-50 transition-colors">
            <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-primary mt-0.5" />
            <div>
              <h3 className="font-medium text-sm">Çıkış Saati</h3>
              <p className="text-sm text-gray-600">{checkOutTime || "11:00"}&apos;dan önce</p>
            </div>
          </div>
        </div>
        
        {/* Villa Kuralları */}
        {allRules.length > 0 && (
          <div>
            <h3 className="font-medium text-sm mb-2 sm:mb-3">Villa Kuralları</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
              {allRules.map((rule) => (
                <div 
                  key={rule} 
                  className="flex items-start gap-2 p-2 sm:p-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  {rule.startsWith("!") ? (
                    <>
                      <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-gray-700">{rule.substring(1)}</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-gray-700">{rule}</span>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 