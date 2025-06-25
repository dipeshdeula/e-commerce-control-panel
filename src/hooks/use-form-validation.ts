import { useState, useEffect } from 'react';

export interface ValidationRules {
  name?: boolean;
  email?: boolean;
  password?: boolean;
  contact?: boolean;
}

export interface FormData {
  name: string;
  email: string;
  password: string;
  contact: string;
}

export interface ValidationErrors {
  name?: string;
  email?: string;
  password?: string;
  contact?: string;
}

export const useFormValidation = (formData: FormData, rules: ValidationRules = {}) => {
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [isValid, setIsValid] = useState(false);

  // Validation functions
  const validateName = (name: string): string | undefined => {
    if (!name.trim()) return "Name is required";
    if (!/^[a-zA-Z\s]+$/.test(name)) return "Name must contain only alphabetic characters and spaces";
    if (name.trim().length < 2) return "Name must be at least 2 characters long";
    return undefined;
  };

  const validateEmail = (email: string): string | undefined => {
    if (!email.trim()) return "Email is required";
    if (/^\d/.test(email)) return "Email cannot start with a number";
    const emailRegex = /^[a-zA-Z][a-zA-Z0-9._-]*@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) return "Please enter a valid email address";
    return undefined;
  };

  const validatePassword = (password: string): string | undefined => {
    if (!password) return "Password is required";
    if (password.length < 8) return "Password must be at least 8 characters long";
    if (!/(?=.*[a-z])/.test(password)) return "Password must contain at least one lowercase letter";
    if (!/(?=.*[A-Z])/.test(password)) return "Password must contain at least one uppercase letter";
    if (!/(?=.*[!@#$%^&*(),.?":{}|<>])/.test(password)) return "Password must contain at least one special character";
    return undefined;
  };

  const validateContact = (contact: string): string | undefined => {
    if (!contact.trim()) return "Contact number is required";
    // Remove any spaces, dashes, or plus signs for validation
    const cleanContact = contact.replace(/[\s\-+]/g, '');
    
    if (!/^\d{10}$/.test(cleanContact)) return "Contact number must be exactly 10 digits";
    if (!cleanContact.startsWith('97') && !cleanContact.startsWith('98')) {
      return "Contact number must start with 97 or 98";
    }
    return undefined;
  };

  useEffect(() => {
    const newErrors: ValidationErrors = {};

    // Validate each field based on rules
    if (rules.name) {
      const nameError = validateName(formData.name);
      if (nameError) newErrors.name = nameError;
    }

    if (rules.email) {
      const emailError = validateEmail(formData.email);
      if (emailError) newErrors.email = emailError;
    }

    if (rules.password) {
      const passwordError = validatePassword(formData.password);
      if (passwordError) newErrors.password = passwordError;
    }

    if (rules.contact) {
      const contactError = validateContact(formData.contact);
      if (contactError) newErrors.contact = contactError;
    }

    setErrors(newErrors);
    setIsValid(Object.keys(newErrors).length === 0);
  }, [formData, rules]);

  // For update form validation (only validate fields that are not empty)
  const validateForUpdate = (): ValidationErrors => {
    const newErrors: ValidationErrors = {};

    if (formData.name.trim()) {
      const nameError = validateName(formData.name);
      if (nameError) newErrors.name = nameError;
    }

    if (formData.email.trim()) {
      const emailError = validateEmail(formData.email);
      if (emailError) newErrors.email = emailError;
    }

    if (formData.password.trim()) {
      const passwordError = validatePassword(formData.password);
      if (passwordError) newErrors.password = passwordError;
    }

    if (formData.contact.trim()) {
      const contactError = validateContact(formData.contact);
      if (contactError) newErrors.contact = contactError;
    }

    return newErrors;
  };

  return {
    errors,
    isValid,
    validateForUpdate,
    setErrors
  };
};
