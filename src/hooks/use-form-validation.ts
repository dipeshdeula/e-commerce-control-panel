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

const validateName = (name: string): string | undefined => {
  if (!name.trim()) return "Name is required";
  if (!/^[a-zA-Z]+(\s[a-zA-Z]+)*$/.test(name)) return "Name must begin with letters and can contain spaces between words";
  if (name.trim().length < 3) return "Name must be at least 3 characters long";
  return undefined;
};

const validateEmail = (email: string): string | undefined => {
  if (!email.trim()) return "Email is required";
  if (!email || email.trim().length < 6) return "Email must be at least 6 characters";
  if (!/^(?=.{6,254}$)[A-Za-z]{3,}[A-Za-z0-9._%+-]*@([A-Za-z0-9-]+\.)+[A-Za-z]{2,}$/.test(email.trim()))
    return "Email must start with at least 3 letters, contain no spaces, and have a valid domain";
  if (/\s/.test(email)) return "Email cannot contain spaces";
  return undefined;
};

const validatePassword = (password: string): string | undefined => {
  if (!password) return "Password is required";
  if (password.length < 8) return "Password must be 8 characters long.";
  if (!/[A-Z]/.test(password)) return "Password must contain at least one uppercase letter";
  if (!/[a-z]/.test(password)) return "Password must contain at least one lowercase letter";
  if (!/[0-9]/.test(password)) return "Password must contain at least one digit";
  if (!/[^a-zA-Z0-9]/.test(password)) return "Password must contain at least one special character";
  return undefined;
};

const validateContact = (contact: string): string | undefined => {
  if (!contact.trim()) return "Contact is required";
  if (!/^9[78]\d{8}$/.test(contact.trim())) return "Contact must be 10 digits and start with 97 or 98";
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
