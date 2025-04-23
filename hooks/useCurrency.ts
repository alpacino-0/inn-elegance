import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { currencyApi } from '@/utils/api-client';
import type { Currency, CreateCurrencyDto, UpdateCurrencyDto, CurrencyFilters } from '@/types/currency';

// Para birimleri listesini getirmek için hook
export const useCurrencies = (filters?: CurrencyFilters) => {
  return useQuery({
    queryKey: ['currencies', filters],
    queryFn: async () => {
      const response = await currencyApi.getCurrencies(filters);
      if (response.error) throw new Error(response.error.message);
      return response.data as Currency[];
    },
    staleTime: 5 * 60 * 1000, // 5 dakika
  });
};

// Aktif para birimleri listesini getirmek için hook
export const useActiveCurrencies = () => {
  return useCurrencies({ isActive: true });
};

// Varsayılan para birimini getirmek için hook
export const useDefaultCurrency = () => {
  return useQuery({
    queryKey: ['currencies', 'default'],
    queryFn: async () => {
      const response = await currencyApi.getDefaultCurrency();
      if (response.error) throw new Error(response.error.message);
      if (!response.data) throw new Error('Varsayılan para birimi bulunamadı');
      return response.data as Currency;
    },
    staleTime: 10 * 60 * 1000, // 10 dakika
  });
};

// Belirli bir para birimini ID'ye göre getirmek için hook
export const useCurrencyById = (id?: string) => {
  return useQuery({
    queryKey: ['currency', id],
    queryFn: async () => {
      if (!id) throw new Error('Para birimi ID\'si belirtilmedi');
      const response = await currencyApi.getCurrencyById(id);
      if (response.error) throw new Error(response.error.message);
      return response.data as Currency;
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 dakika
  });
};

// Belirli bir para birimini koda göre getirmek için hook
export const useCurrencyByCode = (code?: string) => {
  return useQuery({
    queryKey: ['currency', 'code', code],
    queryFn: async () => {
      if (!code) throw new Error('Para birimi kodu belirtilmedi');
      const response = await currencyApi.getCurrencyByCode(code);
      if (response.error) throw new Error(response.error.message);
      return response.data as Currency;
    },
    enabled: !!code,
    staleTime: 5 * 60 * 1000, // 5 dakika
  });
};

// Yeni para birimi eklemek için mutation hook'u
export const useCreateCurrency = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (currencyData: CreateCurrencyDto) => {
      const response = await currencyApi.createCurrency(currencyData);
      if (response.error) throw new Error(response.error.message);
      return response.data as Currency;
    },
    onSuccess: () => {
      // Tüm para birimi listelerini geçersiz kıl
      queryClient.invalidateQueries({ queryKey: ['currencies'] });
    },
  });
};

// Para birimi güncellemek için mutation hook'u
export const useUpdateCurrency = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: UpdateCurrencyDto }) => {
      const response = await currencyApi.updateCurrency(id, updates);
      if (response.error) throw new Error(response.error.message);
      return response.data as Currency;
    },
    onSuccess: (_, variables) => {
      // İlgili para birimi sorgularını geçersiz kıl
      queryClient.invalidateQueries({ queryKey: ['currencies'] });
      queryClient.invalidateQueries({ queryKey: ['currency', variables.id] });
      // Eğer varsayılan değiştiyse varsayılan para birimi sorgusunu da geçersiz kıl
      if (variables.updates.isDefault) {
        queryClient.invalidateQueries({ queryKey: ['currencies', 'default'] });
      }
    },
  });
};

// Para birimi silmek için mutation hook'u
export const useDeleteCurrency = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await currencyApi.deleteCurrency(id);
      if (response.error) throw new Error(response.error.message);
      return response.data;
    },
    onSuccess: () => {
      // Tüm para birimi listelerini geçersiz kıl
      queryClient.invalidateQueries({ queryKey: ['currencies'] });
    },
  });
};

// Para birimini devre dışı bırakmak için mutation hook'u
export const useDeactivateCurrency = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await currencyApi.deactivateCurrency(id);
      if (response.error) throw new Error(response.error.message);
      return response.data;
    },
    onSuccess: (_, id) => {
      // İlgili para birimi sorgularını geçersiz kıl
      queryClient.invalidateQueries({ queryKey: ['currencies'] });
      queryClient.invalidateQueries({ queryKey: ['currency', id] });
    },
  });
};

// Para birimi dönüşümü için hook
export const useConvertCurrency = () => {
  return useMutation({
    mutationFn: async ({ amount, fromCurrency, toCurrency }: { 
      amount: number; 
      fromCurrency: string; 
      toCurrency: string; 
    }) => {
      const response = await currencyApi.convertCurrency(amount, fromCurrency, toCurrency);
      if (response.error) throw new Error(response.error.message);
      return response.data;
    },
  });
}; 