import { useState, useEffect } from 'react';

export interface CategoryFormValues {
  name: string;
  slug: string;
  description: string;
  file?: File | null;
}

export interface CategoryValidationErrors {
  name?: string;
  slug?: string;
  description?: string;
  file?: string;
}

const allowedImageTypes = ['image/jpeg', 'image/png', 'image/jpg'];

export const useCategoryValidation = (form: CategoryFormValues, isCreate: boolean = true) => {
  const [errors, setErrors] = useState<CategoryValidationErrors>({});
  const [isValid, setIsValid] = useState(false);

  useEffect(() => {
    const newErrors: CategoryValidationErrors = {};

    // Name
    if (!form.name.trim()) newErrors.name = "Name is required.";
    else if (form.name.length < 3) newErrors.name = "Name must be at least 3 characters long.";
    else if (form.name.length > 100) newErrors.name = "Name cannot exceed 100 characters.";

    // Slug
    if (!form.slug.trim()) newErrors.slug = "Slug is required.";
    else if (form.slug.length < 3) newErrors.slug = "Slug must be at least 3 characters long.";
    else if (form.slug.length > 100) newErrors.slug = "Slug cannot exceed 100 characters.";

    // Description
  if (!form.description.trim()) newErrors.description = "Description is required.";
    else if (form.description.length < 50) newErrors.description = "Description must be at least 50 characters long.";
    else if (form.description.length > 2000) newErrors.description = "Description cannot exceed 2000 characters.";

    // File (image)
    if (isCreate) {
      if (!form.file) newErrors.file = "File is required.";
      else if (!allowedImageTypes.includes(form.file.type)) newErrors.file = "Only image files (jpg, jpeg, png) are allowed.";
    } else if (form.file && !allowedImageTypes.includes(form.file.type)) {
      newErrors.file = "Only image files (jpg, jpeg, png) are allowed.";
    }

    setErrors(newErrors);
    setIsValid(Object.keys(newErrors).length === 0);
  }, [form, isCreate]);

  return { errors, isValid, setErrors };
};