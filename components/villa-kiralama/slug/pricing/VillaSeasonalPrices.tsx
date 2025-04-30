'use client';

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { SeasonalPrice } from "@/types/seasonal-price";
import { Loader2 } from "lucide-react";
import { useVillaSeasonalPrices } from "@/hooks/use-seasonal-price-queries";

interface VillaSeasonalPricesProps {
  villaId: string;
}

export default function VillaSeasonalPrices({ villaId }: VillaSeasonalPricesProps) {
  // useVillaSeasonalPrices hook'unu kullanarak verileri al
  const { data: seasonalPrices, isLoading, error } = useVillaSeasonalPrices(villaId);
  
  // Sezonluk fiyat yoksa veya yükleniyorsa uygun mesajı göster
  if (isLoading) {
    return (
      <Card className="overflow-hidden bg-white shadow-sm">
        <CardHeader className="pb-2 sm:pb-3">
          <CardTitle className="text-lg sm:text-xl">Sezonluk Fiyatlar</CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center items-center py-6">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }
  
  if (error) {
    return (
      <Card className="overflow-hidden bg-white shadow-sm">
        <CardHeader className="pb-2 sm:pb-3">
          <CardTitle className="text-lg sm:text-xl">Sezonluk Fiyatlar</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-red-500">
            {error instanceof Error ? error.message : 'Sezonluk fiyatlar yüklenirken bir hata oluştu'}
          </p>
        </CardContent>
      </Card>
    );
  }
  
  // Sezonluk fiyat yoksa bileşeni gösterme
  if (!seasonalPrices || seasonalPrices.length === 0) {
    return null;
  }
  
  // Tarihleri formatlayan yardımcı fonksiyon
  const formatDate = (dateStr: string | Date) => {
    const date = typeof dateStr === 'string' ? new Date(dateStr) : dateStr;
    return date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long' });
  };
  
  // Fiyatları formatlayan yardımcı fonksiyon
  const formatPrice = (price: number, season: SeasonalPrice) => {
    const currency = season.currency || { code: 'TRY', symbol: '₺' };
    
    const formatter = new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: currency.code || 'TRY',
      minimumFractionDigits: 0
    });
    
    return formatter.format(price).replace('₺', currency.symbol || '₺');
  };
  
  // Sezonları başlangıç tarihine göre sırala
  const sortedPrices = [...seasonalPrices].sort((a, b) => {
    const dateA = new Date(a.startDate);
    const dateB = new Date(b.startDate);
    return dateA.getTime() - dateB.getTime();
  });

  return (
    <Card className="overflow-hidden bg-white shadow-sm">
      <CardHeader className="pb-2 sm:pb-3">
        <CardTitle className="text-lg sm:text-xl">Sezonluk Fiyatlar</CardTitle>
      </CardHeader>
      
      <CardContent>
        <div className="overflow-x-auto -mx-4 sm:mx-0">
          <div className="inline-block min-w-full align-middle p-4 sm:p-0">
            <Table>
              <TableHeader>
                <TableRow className="border-b border-gray-200">
                  <TableHead className="py-3 px-4 text-sm font-medium text-gray-900">
                    Tarih Aralığı
                  </TableHead>
                  <TableHead className="py-3 px-4 text-sm font-medium text-gray-900">
                    Gecelik
                  </TableHead>
                  <TableHead className="py-3 px-4 text-sm font-medium text-gray-900">
                    Haftalık
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedPrices.map((season) => (
                  <TableRow 
                    key={season.id}
                    className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                  >
                    <TableCell className="py-3 px-4 text-sm">
                      <div className="font-medium text-gray-900">
                        {formatDate(season.startDate)}
                      </div>
                      <div className="text-gray-500">
                        {formatDate(season.endDate)}
                      </div>
                    </TableCell>
                    <TableCell className="py-3 px-4 text-sm">
                      <span className="font-medium text-gray-900">
                        {formatPrice(season.nightlyPrice, season)}
                      </span>
                    </TableCell>
                    <TableCell className="py-3 px-4 text-sm">
                      <span className="font-medium text-gray-900">
                        {season.weeklyPrice ? formatPrice(season.weeklyPrice, season) : ''}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
        
        <p className="text-xs sm:text-sm text-gray-500 mt-3 sm:mt-4 px-4 sm:px-0">
          * Fiyatlar seçilen tarihlere göre değişiklik gösterebilir. Kesin fiyat için rezervasyon formunu kullanınız.
        </p>
      </CardContent>
    </Card>
  );
} 