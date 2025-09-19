import { useState, useEffect } from 'react';

export interface ProductFormValues {
  name: string;
  description: string;
  marketPrice: string;
  costPrice: string;
  discountPercentage: string;
  stockQuantity: string;
  sku: string;
  weight: string;
  dimensions: string;
  categoryId: string;
  subCategoryId: string;
  subSubCategoryId: string;
}

export interface ProductValidationErrors {
  name?: string;
  description?: string;
  marketPrice?: string;
  costPrice?: string;
  discountPercentage?: string;
  stockQuantity?: string;
  sku?: string;
  weight?: string;
  dimensions?: string;
  categoryId?: string;
  subCategoryId?: string;
  subSubCategoryId?: string;
}

export const useProductValidation = (
  form: ProductFormValues,
  isCreate: boolean = true
) => {
  const [errors, setErrors] = useState<ProductValidationErrors>({});
  const [isValid, setIsValid] = useState(false);

  useEffect(() => {
    const newErrors: ProductValidationErrors = {};

    // Category
    if (!form.categoryId || isNaN(Number(form.categoryId)) || Number(form.categoryId) <= 0) {
      newErrors.categoryId = "Category is required.";
    }

    // Name
    if (!form.name.trim()) newErrors.name = "Product name is required.";
    else if (form.name.length > (isCreate ? 150 : 100)) newErrors.name = isCreate
      ? "Name must be 150 characters or fewer."
      : "Name cannot exceed 100 characters.";

    // Description
    if (!form.description.trim()) newErrors.description = "Description is required.";
    else if (form.description.length > (isCreate ? 2000 : 1000)) newErrors.description = isCreate
      ? "Description cannot exceed 2000 characters."
      : "Description cannot exceed 1000 characters.";

    // Market Price
    if (!form.marketPrice || isNaN(Number(form.marketPrice)) || Number(form.marketPrice) < 0) {
      newErrors.marketPrice = "Market price must be a non-negative number.";
    }

    // Cost Price
    if (!form.costPrice || isNaN(Number(form.costPrice)) || Number(form.costPrice) < 0) {
      newErrors.costPrice = "Cost price must be a non-negative number.";
    }

    // Discount Percentage
    if (form.discountPercentage !== '' && (isNaN(Number(form.discountPercentage)) || Number(form.discountPercentage) < 0 || Number(form.discountPercentage) > 100)) {
      newErrors.discountPercentage = "Discount percentage must be between 0 and 100.";
    }

    // Stock Quantity
    if (!form.stockQuantity || isNaN(Number(form.stockQuantity)) || Number(form.stockQuantity) < 0) {
      newErrors.stockQuantity = "Stock quantity cannot be negative.";
    }

    // SKU
    if (!form.sku.trim()) newErrors.sku = "SKU is required.";

    // Weight
    if (!form.weight.trim()) newErrors.weight = "Weight is required.";

    // Dimensions
    if (!form.dimensions.trim()) newErrors.dimensions = "Dimensions are required.";

    setErrors(newErrors);
    setIsValid(Object.keys(newErrors).length === 0);
  }, [form, isCreate]);

  return { errors, isValid, setErrors };
};