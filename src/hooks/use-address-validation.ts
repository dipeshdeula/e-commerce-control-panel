import { useState, useEffect } from 'react';
import { NEPAL_PROVINCES, getCitiesByProvince } from '@/constants/nepal-locations';

export interface AddressFormValues {
  label: string;
  street: string;
  city: string;
  province: string;
  postalCode: string;
  latitude?: number;
  longitude?: number;
  isDefault?: boolean;
}

export interface AddressValidationErrors {
  label?: string;
  street?: string;
  city?: string;
  province?: string;
  postalCode?: string;
  latitude?: string;
  longitude?: string;
}

export const useAddressValidation = (form:AddressFormValues)=>{
    const[errors,setErrors] = useState<AddressValidationErrors>({});
    const[isValid,setIsValid] = useState<boolean>(false);

    useEffect(()=>{
        const newErrors : AddressValidationErrors = {};

        /// Provinces and Cities from backend
    const provinces = NEPAL_PROVINCES.map(p => p.value);
    const cities = getCitiesByProvince(form.province).map(c => c.value);

    // Label
    if (!form.label.trim()) newErrors.label = "Label is required.";
    else if (form.label.length > 50) newErrors.label = "Label must not exceed 50 characters.";

    // Street
    if (!form.street.trim()) newErrors.street = "Street is required.";
    else if (form.street.length > 100) newErrors.street = "Street must not exceed 100 characters.";

    // City
    if (!form.city.trim()) newErrors.city = "City is required.";
    else if (form.city.length > 50) newErrors.city = "City must not exceed 50 characters.";
    else if (!cities.includes(form.city)) newErrors.city = "City must be valid for selected province.";

    // Province
    if (!form.province.trim()) newErrors.province = "Province is required.";
    else if (!provinces.includes(form.province)) newErrors.province = "Province must be valid.";

    // Postal Code
    if (!form.postalCode.trim()) newErrors.postalCode = "Postal code is required.";
    else if (!/^\d{5}$/.test(form.postalCode)) newErrors.postalCode = "Postal code must be a 5-digit number.";

    // Latitude
    if (form.latitude === undefined || form.latitude === null) newErrors.latitude = "Latitude is required.";
    else if (typeof form.latitude === 'number' && (form.latitude < -90 || form.latitude > 90)) newErrors.latitude = "Latitude must be between -90 and 90.";

    // Longitude
    if (form.longitude === undefined || form.longitude === null) newErrors.longitude = "Longitude is required.";
    else if (typeof form.longitude === 'number' && (form.longitude < -180 || form.longitude > 180)) newErrors.longitude = "Longitude must be between -180 and 180.";

    setErrors(newErrors);
    setIsValid(Object.keys(newErrors).length === 0);
  }, [form]);

  return {errors,isValid,setErrors};
};
