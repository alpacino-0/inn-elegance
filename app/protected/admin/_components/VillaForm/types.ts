import type { CreateVillaDto, Villa } from '@/types/villa';

export interface FormHelpers {
  mainRegions: Array<{ id: string; name: string }>;
  subRegions: Array<{ id: string; name: string }>;
  isRegionSelected: boolean;
  showSubRegionSelect: boolean;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  handleSelectChange: (name: string, value: string) => void;
  handleCheckboxChange: (name: string, checked: boolean) => void;
  handleArrayChange: (name: string, value: string) => void;
  handleTranslationsChange: (value: string) => void;
  updateFormData: (newData: Partial<CreateVillaDto>) => void;
  initialData?: Villa | null;
}

export interface TabProps {
  formData: CreateVillaDto;
  helpers: FormHelpers;
} 