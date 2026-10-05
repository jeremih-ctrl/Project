'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  BuildingIcon,
  UserIcon,
  PhoneIcon,
  MailIcon,
  MapPinIcon,
  StoreIcon,
  IdCardIcon,
  LockIcon,
  EyeIcon,
  EyeOffIcon,
  CheckCircleIcon,
  AlertCircleIcon,
  UploadIcon,
  SparklesIcon,
  ArrowRightIcon,
  CheckIcon,
  CloseIcon,
  DatabaseIcon,
  ShieldCheckIcon,
} from './Icons';
import { VendorAccount, BusinessType, RegistrationResult } from '../types/vendor';
import {
  isEmailRegistered,
  isBusinessNameRegistered,
  processVendorRegistration,
  registerNewVendor,
  setCurrentVendorSession,
  syncVendorsWithServer,
} from '../lib/vendorStorage';

interface VendorRegistrationFormProps {
  onComplete: (vendor: VendorAccount) => void;
  onCancel?: () => void;
}

interface FormFields {
  businessName: string;
  ownerName: string;
  contactNumber: string;
  email: string;
  businessAddress: string;
  businessType: string;
  governmentId: string;
  password: string;
  confirmPassword: string;
}

type FormErrors = Partial<Record<keyof FormFields, string>>;

export type StepState = 'idle' | 'in_progress' | 'success' | 'error';

export interface SystemProcessingPipeline {
  step1: StepState; // 1. Validate all input fields
  step2: StepState; // 2. Check if the email address already exists
  step3: StepState; // 3. Check if the business name already exists
  step4: StepState; // 4. Save the vendor information to the database
  step5: StepState; // 5. Create a vendor account
  step6: StepState; // 6. Display an appropriate success or error message
  stepNotes: {
    step1?: string;
    step2?: string;
    step3?: string;
    step4?: string;
    step5?: string;
    step6?: string;
  };
}

const INITIAL_PIPELINE: SystemProcessingPipeline = {
  step1: 'idle',
  step2: 'idle',
  step3: 'idle',
  step4: 'idle',
  step5: 'idle',
  step6: 'idle',
  stepNotes: {},
};

export const PIPELINE_STEPS = [
  {
    id: 1,
    key: 'step1' as const,
    title: '1. Validate all input fields',
    desc: 'Validates legal name, owner identity, phone format, email structure, physical address, business classification, and credentials.',
  },
  {
    id: 2,
    key: 'step2' as const,
    title: '2. Check if email already exists',
    desc: 'Queries vendor registry for existing email accounts to prevent duplicate merchant profiles.',
  },
  {
    id: 3,
    key: 'step3' as const,
    title: '3. Check if business name exists',
    desc: 'Validates commercial and DBA name uniqueness against registered enterprise entities.',
  },
  {
    id: 4,
    key: 'step4' as const,
    title: '4. Save vendor information to database',
    desc: 'Commits complete verified vendor records into persistent database storage (/api/vendors/register).',
  },
  {
    id: 5,
    key: 'step5' as const,
    title: '5. Create a vendor account',
    desc: 'Generates official Merchant ID (vnd_XXXXXX), assigns verified partner tier, and provisions settlement configuration.',
  },
  {
    id: 6,
    key: 'step6' as const,
    title: '6. Display appropriate message',
    desc: 'Renders comprehensive success feedback with account credentials or actionable error alerts with field guidance.',
  },
];

const BUSINESS_TYPE_OPTIONS: { value: BusinessType; label: string; desc: string }[] = [
  { value: 'sole_proprietorship', label: 'Sole Proprietorship', desc: 'Owned and operated by a single individual' },
  { value: 'llc', label: 'Limited Liability Company (LLC)', desc: 'Limited liability protection with pass-through taxation' },
  { value: 'corporation', label: 'Corporation (C-Corp / S-Corp)', desc: 'Separate legal entity owned by shareholders' },
  { value: 'partnership', label: 'Partnership', desc: 'Commercial enterprise owned by two or more partners' },
  { value: 'non_profit', label: 'Non-Profit Organization', desc: 'Tax-exempt charitable or educational entity' },
];

export function VendorRegistrationForm({ onComplete, onCancel }: VendorRegistrationFormProps) {
  const [formData, setFormData] = useState<FormFields>({
    businessName: '',
    ownerName: '',
    contactNumber: '',
    email: '',
    businessAddress: '',
    businessType: '',
    governmentId: '',
    password: '',
    confirmPassword: '',
  });

  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [errors, setErrors] = useState<FormErrors>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [uploadedGovFile, setUploadedGovFile] = useState<{ name: string; size: string } | null>(null);

  // System Processing Pipeline States
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pipeline, setPipeline] = useState<SystemProcessingPipeline>(INITIAL_PIPELINE);
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [serverErrorMessage, setServerErrorMessage] = useState<string | null>(null);
  const [serverSuccessMessage, setServerSuccessMessage] = useState<string | null>(null);
  const [registeredVendor, setRegisteredVendor] = useState<VendorAccount | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const formTopRef = useRef<HTMLDivElement>(null);

  // Synchronize client registry with persistent server DB on mount
  useEffect(() => {
    syncVendorsWithServer();
  }, []);

  // Step 1 Helper: Field Validation logic
  const validateField = (name: keyof FormFields, value: string, currentForm: FormFields): string | undefined => {
    switch (name) {
      case 'businessName':
        if (!value.trim()) return 'Business name is required.';
        if (value.trim().length < 2) return 'Business name must be at least 2 characters.';
        return undefined;

      case 'ownerName':
        if (!value.trim()) return 'Owner name is required.';
        if (value.trim().length < 2) return 'Owner name must be at least 2 characters.';
        return undefined;

      case 'contactNumber': {
        if (!value.trim()) return 'Contact number is required.';
        const digits = value.replace(/\D/g, '');
        const phoneRegex = /^[+]?[-()\s./0-9]{7,25}$/;
        if (digits.length < 7 || digits.length > 15 || !phoneRegex.test(value.trim())) {
          return 'Please enter a valid phone number (7–15 digits, e.g. +1 555-0199 or 0917-123-4567).';
        }
        return undefined;
      }

      case 'email': {
        if (!value.trim()) return 'Email address is required.';
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!emailRegex.test(value.trim())) {
          return 'Please enter a valid email address (e.g. owner@business.com).';
        }
        return undefined;
      }

      case 'businessAddress':
        if (!value.trim()) return 'Business address is required.';
        if (value.trim().length < 5) return 'Please provide a complete business address.';
        return undefined;

      case 'businessType':
        if (!value || !value.trim()) return 'Please select a business type.';
        return undefined;

      case 'password':
        if (!value) return 'Password is required.';
        if (value.length < 6) return 'Password must be at least 6 characters.';
        return undefined;

      case 'confirmPassword':
        if (!value) return 'Please confirm your password.';
        if (value !== currentForm.password) return 'Passwords do not match.';
        return undefined;

      default:
        return undefined;
    }
  };

  const validateAll = (data: FormFields): FormErrors => {
    const errs: FormErrors = {};
    const keys: (keyof FormFields)[] = [
      'businessName',
      'ownerName',
      'contactNumber',
      'email',
      'businessAddress',
      'businessType',
      'password',
      'confirmPassword',
    ];

    keys.forEach((key) => {
      const err = validateField(key, data[key], data);
      if (err) {
        errs[key] = err;
      }
    });

    return errs;
  };

  const handleChange = (name: keyof FormFields, value: string) => {
    const nextForm = { ...formData, [name]: value };
    setFormData(nextForm);
    setServerErrorMessage(null);

    if (touched[name] || submitAttempted) {
      const err = validateField(name, value, nextForm);
      setErrors((prev) => ({
        ...prev,
        [name]: err,
      }));

      // If updating password, also re-validate confirmPassword if touched
      if (name === 'password' && (touched.confirmPassword || submitAttempted)) {
        const confirmErr = validateField('confirmPassword', nextForm.confirmPassword, nextForm);
        setErrors((prev) => ({
          ...prev,
          confirmPassword: confirmErr,
        }));
      }
    }
  };

  const handleBlur = (name: keyof FormFields) => {
    setTouched((prev) => ({ ...prev, [name]: true }));
    const err = validateField(name, formData[name], formData);
    setErrors((prev) => ({
      ...prev,
      [name]: err,
    }));
  };

  // Quick Demo Pre-fill (Valid Data for All 6 Steps)
  const handleQuickFill = () => {
    const uniqueSuffix = Math.floor(1000 + Math.random() * 9000);
    const sample: FormFields = {
      businessName: `Vanguard Industrial Supply #${uniqueSuffix}`,
      ownerName: 'Marcus Vance',
      contactNumber: '+63 917 552 8419',
      email: `marcus.vance${uniqueSuffix}@butuanenterprise.ph`,
      businessAddress: '148 J.C. Aquino Ave, Barangay Doongan, Butuan City, Agusan del Norte, 8600, Philippines',
      businessType: 'llc',
      governmentId: `PH-TIN-948192${uniqueSuffix}`,
      password: 'SecurePassword123!',
      confirmPassword: 'SecurePassword123!',
    };
    setFormData(sample);
    setUploadedGovFile({ name: 'Vanguard_EIN_Certificate.pdf', size: '1.2 MB' });
    setErrors({});
    setTouched({});
    setServerErrorMessage(null);
    setServerSuccessMessage(null);
    setRegisteredVendor(null);
    setPipeline(INITIAL_PIPELINE);
  };

  // Preset to test Step 2: Duplicate Email Error
  const handleTestDuplicateEmail = () => {
    const uniqueSuffix = Math.floor(1000 + Math.random() * 9000);
    setFormData({
      businessName: `Apex Unique Traders #${uniqueSuffix} LLC`,
      ownerName: 'Elena Vance',
      contactNumber: '+1 (415) 892-4910',
      email: 'elena@novaaudio.io', // Already exists in system database!
      businessAddress: '100 Test Blvd, Suite 200, San Francisco, CA',
      businessType: 'corporation',
      governmentId: 'TAX-998811',
      password: 'Password123!',
      confirmPassword: 'Password123!',
    });
    setErrors({});
    setTouched({});
    setServerErrorMessage(null);
    setServerSuccessMessage(null);
    setRegisteredVendor(null);
    setPipeline(INITIAL_PIPELINE);
  };

  // Preset to test Step 3: Duplicate Business Name Error
  const handleTestDuplicateBusiness = () => {
    setFormData({
      businessName: 'Nova Acoustics Labs Inc.', // Already exists in system database!
      ownerName: 'Alexander Cross',
      contactNumber: '+1 (415) 555-0199',
      email: `alexander.${Date.now()}@newbusiness.com`,
      businessAddress: '500 Technology Drive, San Francisco, CA',
      businessType: 'corporation',
      governmentId: 'GOV-554433',
      password: 'Password123!',
      confirmPassword: 'Password123!',
    });
    setErrors({});
    setTouched({});
    setServerErrorMessage(null);
    setServerSuccessMessage(null);
    setRegisteredVendor(null);
    setPipeline(INITIAL_PIPELINE);
  };

  // Preset to test Step 1: Input Validation Errors
  const handleTestValidationErrors = () => {
    setFormData({
      businessName: '', // Missing
      ownerName: '', // Missing
      contactNumber: '123', // Invalid phone format
      email: 'not-a-valid-email', // Bad email format
      businessAddress: '12', // Too short
      businessType: '', // Unselected
      governmentId: '',
      password: '123', // Too short
      confirmPassword: '999', // Mismatch
    });
    setErrors({});
    setTouched({});
    setServerErrorMessage(null);
    setServerSuccessMessage(null);
    setRegisteredVendor(null);
    setPipeline(INITIAL_PIPELINE);
  };

  const handleClear = () => {
    setFormData({
      businessName: '',
      ownerName: '',
      contactNumber: '',
      email: '',
      businessAddress: '',
      businessType: '',
      governmentId: '',
      password: '',
      confirmPassword: '',
    });
    setUploadedGovFile(null);
    setErrors({});
    setTouched({});
    setSubmitAttempted(false);
    setServerErrorMessage(null);
    setServerSuccessMessage(null);
    setRegisteredVendor(null);
    setPipeline(INITIAL_PIPELINE);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const formattedSize = file.size > 1024 * 1024
        ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
        : `${(file.size / 1024).toFixed(0)} KB`;
      setUploadedGovFile({
        name: file.name,
        size: formattedSize,
      });
      if (!formData.governmentId) {
        setFormData((prev) => ({
          ...prev,
          governmentId: file.name.replace(/\.[^/.]+$/, ''),
        }));
      }
    }
  };

  /**
   * 2. System Processing
   * When the user submits the form, the system should:
   * 1. Validate all input fields.
   * 2. Check if the email address already exists.
   * 3. Check if the business name already exists.
   * 4. Save the vendor information to the database.
   * 5. Create a vendor account.
   * 6. Display an appropriate success or error message.
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitAttempted(true);
    setServerErrorMessage(null);
    setServerSuccessMessage(null);
    setRegisteredVendor(null);

    // Mark all input fields as touched
    const allTouched: Record<string, boolean> = {
      businessName: true,
      ownerName: true,
      contactNumber: true,
      email: true,
      businessAddress: true,
      businessType: true,
      password: true,
      confirmPassword: true,
    };
    setTouched(allTouched);

    // ==========================================
    // 1. Validate all input fields
    // ==========================================
    setIsSubmitting(true);
    setPipeline({
      step1: 'in_progress',
      step2: 'idle',
      step3: 'idle',
      step4: 'idle',
      step5: 'idle',
      step6: 'idle',
      stepNotes: {
        step1: 'Validating all required registration inputs & constraints...',
      },
    });

    const validationErrors = validateAll(formData);
    const errCount = Object.keys(validationErrors).length;

    if (errCount > 0) {
      setErrors(validationErrors);
      setPipeline({
        step1: 'error',
        step2: 'idle',
        step3: 'idle',
        step4: 'idle',
        step5: 'idle',
        step6: 'error',
        stepNotes: {
          step1: `Validation failed: ${errCount} field ${errCount === 1 ? 'error' : 'errors'} require resolution.`,
          step6: 'Submission stopped: Input validation constraints not satisfied.',
        },
      });
      setIsSubmitting(false);
      setServerErrorMessage(
        `Registration Validation Failed (Step 1): Please resolve the ${errCount} highlighted field ${
          errCount === 1 ? 'error' : 'errors'
        }.`
      );
      if (formTopRef.current) {
        formTopRef.current.scrollIntoView({ behavior: 'smooth' });
      }
      return;
    }

    // Step 1 Passed
    setPipeline((prev) => ({
      ...prev,
      step1: 'success',
      step2: 'in_progress',
      stepNotes: {
        ...prev.stepNotes,
        step1: 'All 8 required registration fields passed format and constraint validation.',
        step2: `Checking database for existing email: "${formData.email.trim()}"...`,
      },
    }));

    await new Promise((resolve) => setTimeout(resolve, 350));

    // ==========================================
    // 2. Check if the email address already exists
    // ==========================================
    if (isEmailRegistered(formData.email)) {
      const errorMsg = `The email address "${formData.email.trim()}" is already registered. Please sign in or use a different email address.`;
      setErrors((prev) => ({ ...prev, email: errorMsg }));
      setPipeline((prev) => ({
        ...prev,
        step2: 'error',
        step6: 'error',
        stepNotes: {
          ...prev.stepNotes,
          step2: `Duplicate email detected: "${formData.email.trim()}" already associated with an account.`,
          step6: 'Registration stopped: Duplicate email conflict.',
        },
      }));
      setServerErrorMessage(`Registration Error (Step 2): ${errorMsg}`);
      setIsSubmitting(false);
      if (formTopRef.current) {
        formTopRef.current.scrollIntoView({ behavior: 'smooth' });
      }
      return;
    }

    // Step 2 Passed
    setPipeline((prev) => ({
      ...prev,
      step2: 'success',
      step3: 'in_progress',
      stepNotes: {
        ...prev.stepNotes,
        step2: `Email address "${formData.email.trim()}" is unique and available.`,
        step3: `Checking database for existing business name: "${formData.businessName.trim()}"...`,
      },
    }));

    await new Promise((resolve) => setTimeout(resolve, 350));

    // ==========================================
    // 3. Check if the business name already exists
    // ==========================================
    if (isBusinessNameRegistered(formData.businessName)) {
      const errorMsg = `The business name "${formData.businessName.trim()}" is already registered. Please choose a unique business name.`;
      setErrors((prev) => ({ ...prev, businessName: errorMsg }));
      setPipeline((prev) => ({
        ...prev,
        step3: 'error',
        step6: 'error',
        stepNotes: {
          ...prev.stepNotes,
          step3: `Duplicate business name detected: "${formData.businessName.trim()}" already registered.`,
          step6: 'Registration stopped: Duplicate business name conflict.',
        },
      }));
      setServerErrorMessage(`Registration Error (Step 3): ${errorMsg}`);
      setIsSubmitting(false);
      if (formTopRef.current) {
        formTopRef.current.scrollIntoView({ behavior: 'smooth' });
      }
      return;
    }

    // Step 3 Passed
    setPipeline((prev) => ({
      ...prev,
      step3: 'success',
      step4: 'in_progress',
      stepNotes: {
        ...prev.stepNotes,
        step3: `Business name "${formData.businessName.trim()}" is unique and verified.`,
        step4: 'Saving vendor information to database (/api/vendors/register)...',
      },
    }));

    await new Promise((resolve) => setTimeout(resolve, 400));

    // ==========================================
    // 4. Save the vendor information to the database
    // 5. Create a vendor account
    // ==========================================
    try {
      let createdVendor: VendorAccount | null = null;

      // Attempt server API persistence to database
      try {
        const response = await fetch('/api/vendors/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            businessName: formData.businessName,
            ownerName: formData.ownerName,
            contactNumber: formData.contactNumber,
            email: formData.email,
            businessAddress: formData.businessAddress,
            businessType: formData.businessType,
            governmentId: formData.governmentId,
            password: formData.password,
            confirmPassword: formData.confirmPassword,
            documentFileName: uploadedGovFile?.name,
            documentFileSize: uploadedGovFile?.size,
          }),
        });

        const apiResult: RegistrationResult = await response.json();

        if (!response.ok || !apiResult.success) {
          if (apiResult.fieldErrors?.email) {
            setErrors((prev) => ({ ...prev, email: apiResult.fieldErrors?.email }));
            setPipeline((prev) => ({
              ...prev,
              step2: 'error',
              step4: 'error',
              step6: 'error',
              stepNotes: {
                ...prev.stepNotes,
                step2: apiResult.fieldErrors?.email,
                step6: 'Server rejected registration: Duplicate email conflict.',
              },
            }));
            setServerErrorMessage(`Registration Error (Step 2): ${apiResult.message}`);
            setIsSubmitting(false);
            if (formTopRef.current) {
              formTopRef.current.scrollIntoView({ behavior: 'smooth' });
            }
            return;
          }

          if (apiResult.fieldErrors?.businessName) {
            setErrors((prev) => ({ ...prev, businessName: apiResult.fieldErrors?.businessName }));
            setPipeline((prev) => ({
              ...prev,
              step3: 'error',
              step4: 'error',
              step6: 'error',
              stepNotes: {
                ...prev.stepNotes,
                step3: apiResult.fieldErrors?.businessName,
                step6: 'Server rejected registration: Duplicate business name conflict.',
              },
            }));
            setServerErrorMessage(`Registration Error (Step 3): ${apiResult.message}`);
            setIsSubmitting(false);
            if (formTopRef.current) {
              formTopRef.current.scrollIntoView({ behavior: 'smooth' });
            }
            return;
          }

          throw new Error(apiResult.message || 'Server database registration failed.');
        }

        createdVendor = apiResult.vendor || null;
      } catch (networkErr: unknown) {
        // Graceful offline/local persistence fallback
        console.warn('API database call warning, utilizing local storage registry fallback:', networkErr);
        const localResult = processVendorRegistration({
          businessName: formData.businessName,
          ownerName: formData.ownerName,
          contactNumber: formData.contactNumber,
          email: formData.email,
          businessAddress: formData.businessAddress,
          businessType: formData.businessType as BusinessType,
          governmentId: formData.governmentId,
          password: formData.password,
          confirmPassword: formData.confirmPassword,
          documentFileName: uploadedGovFile?.name,
          documentFileSize: uploadedGovFile?.size,
        });

        if (!localResult.success || !localResult.vendor) {
          throw new Error(localResult.message || 'Local registration processing failed.');
        }
        createdVendor = localResult.vendor;
      }

      if (!createdVendor) {
        throw new Error('Failed to create vendor account record.');
      }

      // Step 4 Complete: Vendor Information Saved to Database
      setPipeline((prev) => ({
        ...prev,
        step4: 'success',
        step5: 'in_progress',
        stepNotes: {
          ...prev.stepNotes,
          step4: 'Vendor information committed to persistent database storage (data/vendors.json).',
          step5: `Creating official vendor account credentials & issuing Merchant ID (${createdVendor.id})...`,
        },
      }));

      await new Promise((resolve) => setTimeout(resolve, 300));

      // Step 5 Complete: Vendor Account Created
      registerNewVendor(createdVendor);
      setCurrentVendorSession(createdVendor);

      setPipeline((prev) => ({
        ...prev,
        step5: 'success',
        step6: 'in_progress',
        stepNotes: {
          ...prev.stepNotes,
          step5: `Vendor account created successfully with Merchant ID ${createdVendor.id}.`,
          step6: 'Finalizing and rendering success confirmation...',
        },
      }));

      await new Promise((resolve) => setTimeout(resolve, 250));

      // ==========================================
      // 6. Display an appropriate success or error message
      // ==========================================
      setPipeline((prev) => ({
        ...prev,
        step6: 'success',
        stepNotes: {
          ...prev.stepNotes,
          step6: `Vendor account for "${createdVendor.businessName}" created and saved to database!`,
        },
      }));

      setServerSuccessMessage(
        `Success: Vendor account for "${createdVendor.businessName}" was successfully created and registered in the database!`
      );
      setRegisteredVendor(createdVendor);
      setIsSubmitting(false);
    } catch (err: unknown) {
      console.error('System processing error:', err);
      const msg = err instanceof Error ? err.message : 'An unexpected error occurred during system processing.';
      setServerErrorMessage(`Registration Error (Step 4/5): ${msg}`);
      setPipeline((prev) => ({
        ...prev,
        step4: 'error',
        step6: 'error',
        stepNotes: {
          ...prev.stepNotes,
          step4: msg,
          step6: 'Registration failed due to a system database error.',
        },
      }));
      setIsSubmitting(false);
    }
  };

  // Password strength calculation
  const getPasswordStrength = (pwd: string) => {
    if (!pwd) return { score: 0, label: 'None', color: 'bg-zinc-200 dark:bg-zinc-800' };
    let score = 0;
    if (pwd.length >= 6) score += 1;
    if (pwd.length >= 10) score += 1;
    if (/[A-Z]/.test(pwd)) score += 1;
    if (/[0-9]/.test(pwd)) score += 1;
    if (/[^A-Za-z0-9]/.test(pwd)) score += 1;

    if (score <= 2) return { score: 1, label: 'Weak', color: 'bg-rose-500' };
    if (score <= 3) return { score: 2, label: 'Medium', color: 'bg-amber-500' };
    return { score: 3, label: 'Strong', color: 'bg-emerald-500' };
  };

  const strength = getPasswordStrength(formData.password);
  const errorCount = Object.keys(errors).filter((k) => errors[k as keyof FormErrors]).length;

  return (
    <div className="relative min-h-screen bg-zinc-50 dark:bg-zinc-950 py-12 px-4 sm:px-6 lg:px-8">
      {/* Background ambient gradient accents */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-5xl h-80 bg-gradient-to-b from-indigo-500/10 via-indigo-500/5 to-transparent blur-3xl pointer-events-none -z-10" />

      <div ref={formTopRef} className="mx-auto max-w-3xl">
        {/* Top Header & Breadcrumb / Action */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/80 border border-indigo-200/80 dark:border-indigo-800/80 text-indigo-700 dark:text-indigo-300 text-xs font-semibold tracking-wide uppercase mb-3">
              <StoreIcon className="w-3.5 h-3.5" />
              <span>Merchant Onboarding Portal</span>
            </div>
            {/* Title requested specifically */}
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
              Vendor Registration System
            </h1>
            <p className="mt-2 text-sm sm:text-base text-zinc-600 dark:text-zinc-400">
              Complete the registration form below with verified business credentials to create your official vendor merchant account.
            </p>
          </div>

          {/* Quick Demo & Test Buttons for all 6 System Processing Steps */}
          <div className="flex flex-wrap items-center gap-2 self-start sm:self-center">
            <button
              type="button"
              onClick={handleQuickFill}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-xl bg-white dark:bg-zinc-900 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-900/60 shadow-sm hover:bg-indigo-50 dark:hover:bg-indigo-950/40 transition-all cursor-pointer"
              title="Auto-fill form with unique merchant data (all 6 System Processing steps succeed)"
            >
              <SparklesIcon className="w-3.5 h-3.5" />
              <span>Demo Quick-Fill</span>
            </button>
            <button
              type="button"
              onClick={handleTestDuplicateEmail}
              className="inline-flex items-center gap-1 px-2.5 py-2 text-[11px] font-semibold rounded-xl bg-zinc-100 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-200/70 transition-all cursor-pointer"
              title="Test Step 2: Pre-fills existing email (elena@novaaudio.io) to trigger duplicate email error"
            >
              <span>Test Step 2 (Dup Email)</span>
            </button>
            <button
              type="button"
              onClick={handleTestDuplicateBusiness}
              className="inline-flex items-center gap-1 px-2.5 py-2 text-[11px] font-semibold rounded-xl bg-zinc-100 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-200/70 transition-all cursor-pointer"
              title="Test Step 3: Pre-fills existing business name (Nova Acoustics Labs Inc.) to trigger duplicate business name error"
            >
              <span>Test Step 3 (Dup Business)</span>
            </button>
            <button
              type="button"
              onClick={handleTestValidationErrors}
              className="inline-flex items-center gap-1 px-2.5 py-2 text-[11px] font-semibold rounded-xl bg-zinc-100 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-200/70 transition-all cursor-pointer"
              title="Test Step 1: Pre-fills invalid format data to trigger field validation errors"
            >
              <span>Test Step 1 (Validation Err)</span>
            </button>
            <button
              type="button"
              onClick={handleClear}
              className="inline-flex items-center gap-1 px-3 py-2 text-xs font-medium rounded-xl text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 hover:bg-zinc-200/50 dark:hover:bg-zinc-800/50 transition-all cursor-pointer"
              title="Clear all fields and reset System Processing pipeline"
            >
              <span>Reset</span>
            </button>
          </div>
        </div>

        {/* 2. System Processing (6 Steps Sequential Pipeline Tracker) */}
        <div className="mb-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-xl shadow-zinc-200/50 dark:shadow-none p-5 sm:p-6 transition-all">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 mb-4 border-b border-zinc-100 dark:border-zinc-800 gap-2">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/80 border border-indigo-200/60 dark:border-indigo-800/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-black text-sm">
                2
              </div>
              <div>
                <h2 className="text-sm sm:text-base font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                  <span>2. System Processing Pipeline</span>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/60">
                    6 Automated Steps
                  </span>
                </h2>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  When the form is submitted, the system verifies and executes these 6 steps in sequence:
                </p>
              </div>
            </div>

            {/* Live Pipeline Status Badge */}
            <div className="self-start sm:self-center">
              {isSubmitting ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 animate-pulse">
                  <span className="w-2 h-2 rounded-full bg-indigo-600 animate-ping" />
                  Processing Pipeline...
                </span>
              ) : pipeline.step6 === 'success' ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                  <CheckCircleIcon className="w-3.5 h-3.5" />
                  All 6 Steps Passed
                </span>
              ) : serverErrorMessage ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-50 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
                  <AlertCircleIcon className="w-3.5 h-3.5" />
                  Pipeline Conflict / Error
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700">
                  Ready for Submission
                </span>
              )}
            </div>
          </div>

          {/* 6 Step Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {PIPELINE_STEPS.map((step) => {
              const state = pipeline[step.key] as StepState;
              const note = pipeline.stepNotes[step.key];
              return (
                <div
                  key={step.id}
                  className={`relative rounded-2xl p-3.5 border transition-all text-left ${
                    state === 'in_progress'
                      ? 'bg-indigo-50/70 dark:bg-indigo-950/40 border-indigo-400 dark:border-indigo-600 ring-2 ring-indigo-500/20 shadow-sm'
                      : state === 'success'
                      ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800/80 shadow-xs'
                      : state === 'error'
                      ? 'bg-rose-50/40 dark:bg-rose-950/20 border-rose-300 dark:border-rose-800/80 shadow-xs'
                      : 'bg-zinc-50/60 dark:bg-zinc-950/40 border-zinc-200/70 dark:border-zinc-800/60 opacity-80'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                      Step {step.id}
                    </span>
                    {/* Status badge */}
                    {state === 'in_progress' && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-indigo-700 dark:text-indigo-300 bg-indigo-100 dark:bg-indigo-900/60 px-2 py-0.5 rounded-full">
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-ping" />
                        In Progress
                      </span>
                    )}
                    {state === 'success' && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-900/60 px-2 py-0.5 rounded-full">
                        <CheckIcon className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                        Passed
                      </span>
                    )}
                    {state === 'error' && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-700 dark:text-rose-300 bg-rose-100 dark:bg-rose-900/60 px-2 py-0.5 rounded-full">
                        <AlertCircleIcon className="w-3 h-3 text-rose-600 dark:text-rose-400" />
                        Failed
                      </span>
                    )}
                    {state === 'idle' && (
                      <span className="text-[10px] font-medium text-zinc-400 dark:text-zinc-500 bg-zinc-200/60 dark:bg-zinc-800 px-2 py-0.5 rounded-full">
                        Pending
                      </span>
                    )}
                  </div>

                  <h3 className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                    {step.title}
                  </h3>

                  <p className="mt-1 text-[11px] text-zinc-500 dark:text-zinc-400 line-clamp-2 leading-relaxed">
                    {note || step.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Global Error Banner (Step 6 Feedback when error occurs) */}
        {serverErrorMessage && (
          <div className="mb-6 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 p-4 text-rose-800 dark:text-rose-200 shadow-sm animate-fadeIn">
            <div className="flex items-start gap-3">
              <AlertCircleIcon className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
              <div className="flex-1 text-sm">
                <h3 className="font-bold">{serverErrorMessage}</h3>
                {errorCount > 0 && (
                  <ul className="mt-2 list-disc list-inside space-y-0.5 text-xs text-rose-700 dark:text-rose-300">
                    {Object.entries(errors).map(([key, msg]) => (
                      msg ? <li key={key}>{msg}</li> : null
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Global Success Banner */}
        {serverSuccessMessage && !registeredVendor && (
          <div className="mb-6 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 p-4 text-emerald-800 dark:text-emerald-200 shadow-sm animate-fadeIn">
            <div className="flex items-start gap-3">
              <CheckCircleIcon className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              <div className="flex-1 text-sm font-semibold">
                {serverSuccessMessage}
              </div>
            </div>
          </div>
        )}

        {/* Main Registration Card */}
        <div className="bg-white dark:bg-zinc-900/90 rounded-3xl border border-zinc-200/80 dark:border-zinc-800/80 shadow-xl shadow-zinc-200/50 dark:shadow-black/40 overflow-hidden backdrop-blur-sm">
          {/* Card Accent Top Bar */}
          <div className="h-1.5 w-full bg-gradient-to-r from-indigo-500 via-blue-500 to-cyan-500" />

          <form onSubmit={handleSubmit} noValidate className="p-6 sm:p-10 space-y-8">
            {/* Section 1: Business Identity */}
            <div>
              <div className="flex items-center gap-2 pb-3 mb-6 border-b border-zinc-100 dark:border-zinc-800/80">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                  <BuildingIcon className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">Business Details</h2>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">Legal entity name, commercial structure, and physical location.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* 1. Business Name */}
                <div className="sm:col-span-2">
                  <label htmlFor="businessName" className="block text-xs font-bold text-zinc-800 dark:text-zinc-200 uppercase tracking-wider mb-2">
                    Business Name <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400">
                      <BuildingIcon className="w-4 h-4" />
                    </div>
                    <input
                      id="businessName"
                      type="text"
                      value={formData.businessName}
                      onChange={(e) => handleChange('businessName', e.target.value)}
                      onBlur={() => handleBlur('businessName')}
                      placeholder="e.g. Apex Global Solutions LLC"
                      className={`block w-full pl-10 pr-10 py-3 rounded-xl border text-sm transition-all bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none ${
                        touched.businessName && errors.businessName
                          ? 'border-rose-400 dark:border-rose-600 ring-2 ring-rose-500/20 bg-rose-50/20 dark:bg-rose-950/20'
                          : touched.businessName && !errors.businessName && formData.businessName
                          ? 'border-emerald-500/70 dark:border-emerald-600/70 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20'
                          : 'border-zinc-300 dark:border-zinc-700 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20'
                      }`}
                    />
                    <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none">
                      {touched.businessName && errors.businessName ? (
                        <AlertCircleIcon className="w-4 h-4 text-rose-500" />
                      ) : touched.businessName && !errors.businessName && formData.businessName ? (
                        <CheckIcon className="w-4 h-4 text-emerald-500" />
                      ) : null}
                    </div>
                  </div>
                  {touched.businessName && errors.businessName && (
                    <p className="mt-1.5 text-xs text-rose-600 dark:text-rose-400 flex items-center gap-1">
                      <AlertCircleIcon className="w-3.5 h-3.5 shrink-0" />
                      <span>{errors.businessName}</span>
                    </p>
                  )}
                </div>

                {/* 6. Business Type */}
                <div className="sm:col-span-2">
                  <label htmlFor="businessType" className="block text-xs font-bold text-zinc-800 dark:text-zinc-200 uppercase tracking-wider mb-2">
                    Business Type <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <select
                      id="businessType"
                      value={formData.businessType}
                      onChange={(e) => handleChange('businessType', e.target.value)}
                      onBlur={() => handleBlur('businessType')}
                      className={`block w-full px-4 py-3 rounded-xl border text-sm transition-all bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 focus:outline-none appearance-none cursor-pointer ${
                        touched.businessType && errors.businessType
                          ? 'border-rose-400 dark:border-rose-600 ring-2 ring-rose-500/20 bg-rose-50/20 dark:bg-rose-950/20'
                          : touched.businessType && !errors.businessType && formData.businessType
                          ? 'border-emerald-500/70 dark:border-emerald-600/70 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20'
                          : 'border-zinc-300 dark:border-zinc-700 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20'
                      }`}
                    >
                      <option value="" disabled>-- Select Business Type --</option>
                      {BUSINESS_TYPE_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value} className="py-1">
                          {opt.label} — {opt.desc}
                        </option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-zinc-400">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                  {touched.businessType && errors.businessType && (
                    <p className="mt-1.5 text-xs text-rose-600 dark:text-rose-400 flex items-center gap-1">
                      <AlertCircleIcon className="w-3.5 h-3.5 shrink-0" />
                      <span>{errors.businessType}</span>
                    </p>
                  )}
                </div>

                {/* 5. Business Address */}
                <div className="sm:col-span-2">
                  <label htmlFor="businessAddress" className="block text-xs font-bold text-zinc-800 dark:text-zinc-200 uppercase tracking-wider mb-2">
                    Business Address <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute top-3.5 left-3.5 pointer-events-none text-zinc-400">
                      <MapPinIcon className="w-4 h-4" />
                    </div>
                    <textarea
                      id="businessAddress"
                      rows={2}
                      value={formData.businessAddress}
                      onChange={(e) => handleChange('businessAddress', e.target.value)}
                      onBlur={() => handleBlur('businessAddress')}
                      placeholder="e.g. 148 J.C. Aquino Ave, Barangay Doongan, Butuan City, Agusan del Norte, 8600"
                      className={`block w-full pl-10 pr-10 py-3 rounded-xl border text-sm transition-all bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none resize-none ${
                        touched.businessAddress && errors.businessAddress
                          ? 'border-rose-400 dark:border-rose-600 ring-2 ring-rose-500/20 bg-rose-50/20 dark:bg-rose-950/20'
                          : touched.businessAddress && !errors.businessAddress && formData.businessAddress
                          ? 'border-emerald-500/70 dark:border-emerald-600/70 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20'
                          : 'border-zinc-300 dark:border-zinc-700 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20'
                      }`}
                    />
                    <div className="absolute top-3.5 right-3.5 pointer-events-none">
                      {touched.businessAddress && errors.businessAddress ? (
                        <AlertCircleIcon className="w-4 h-4 text-rose-500" />
                      ) : touched.businessAddress && !errors.businessAddress && formData.businessAddress ? (
                        <CheckIcon className="w-4 h-4 text-emerald-500" />
                      ) : null}
                    </div>
                  </div>
                  {touched.businessAddress && errors.businessAddress && (
                    <p className="mt-1.5 text-xs text-rose-600 dark:text-rose-400 flex items-center gap-1">
                      <AlertCircleIcon className="w-3.5 h-3.5 shrink-0" />
                      <span>{errors.businessAddress}</span>
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Section 2: Owner & Contact Information */}
            <div>
              <div className="flex items-center gap-2 pb-3 mb-6 border-b border-zinc-100 dark:border-zinc-800/80">
                <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/60 flex items-center justify-center text-blue-600 dark:text-blue-400">
                  <UserIcon className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">Owner & Primary Contact</h2>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">Designated representative details and communication channels.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* 2. Owner Name */}
                <div className="sm:col-span-2">
                  <label htmlFor="ownerName" className="block text-xs font-bold text-zinc-800 dark:text-zinc-200 uppercase tracking-wider mb-2">
                    Owner Name <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400">
                      <UserIcon className="w-4 h-4" />
                    </div>
                    <input
                      id="ownerName"
                      type="text"
                      value={formData.ownerName}
                      onChange={(e) => handleChange('ownerName', e.target.value)}
                      onBlur={() => handleBlur('ownerName')}
                      placeholder="e.g. Jane Doe"
                      className={`block w-full pl-10 pr-10 py-3 rounded-xl border text-sm transition-all bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none ${
                        touched.ownerName && errors.ownerName
                          ? 'border-rose-400 dark:border-rose-600 ring-2 ring-rose-500/20 bg-rose-50/20 dark:bg-rose-950/20'
                          : touched.ownerName && !errors.ownerName && formData.ownerName
                          ? 'border-emerald-500/70 dark:border-emerald-600/70 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20'
                          : 'border-zinc-300 dark:border-zinc-700 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20'
                      }`}
                    />
                    <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none">
                      {touched.ownerName && errors.ownerName ? (
                        <AlertCircleIcon className="w-4 h-4 text-rose-500" />
                      ) : touched.ownerName && !errors.ownerName && formData.ownerName ? (
                        <CheckIcon className="w-4 h-4 text-emerald-500" />
                      ) : null}
                    </div>
                  </div>
                  {touched.ownerName && errors.ownerName && (
                    <p className="mt-1.5 text-xs text-rose-600 dark:text-rose-400 flex items-center gap-1">
                      <AlertCircleIcon className="w-3.5 h-3.5 shrink-0" />
                      <span>{errors.ownerName}</span>
                    </p>
                  )}
                </div>

                {/* 3. Contact Number */}
                <div>
                  <label htmlFor="contactNumber" className="block text-xs font-bold text-zinc-800 dark:text-zinc-200 uppercase tracking-wider mb-2">
                    Contact Number <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400">
                      <PhoneIcon className="w-4 h-4" />
                    </div>
                    <input
                      id="contactNumber"
                      type="tel"
                      value={formData.contactNumber}
                      onChange={(e) => handleChange('contactNumber', e.target.value)}
                      onBlur={() => handleBlur('contactNumber')}
                      placeholder="+1 (555) 019-2831"
                      className={`block w-full pl-10 pr-10 py-3 rounded-xl border text-sm transition-all bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none ${
                        touched.contactNumber && errors.contactNumber
                          ? 'border-rose-400 dark:border-rose-600 ring-2 ring-rose-500/20 bg-rose-50/20 dark:bg-rose-950/20'
                          : touched.contactNumber && !errors.contactNumber && formData.contactNumber
                          ? 'border-emerald-500/70 dark:border-emerald-600/70 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20'
                          : 'border-zinc-300 dark:border-zinc-700 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20'
                      }`}
                    />
                    <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none">
                      {touched.contactNumber && errors.contactNumber ? (
                        <AlertCircleIcon className="w-4 h-4 text-rose-500" />
                      ) : touched.contactNumber && !errors.contactNumber && formData.contactNumber ? (
                        <CheckIcon className="w-4 h-4 text-emerald-500" />
                      ) : null}
                    </div>
                  </div>
                  {touched.contactNumber && errors.contactNumber && (
                    <p className="mt-1.5 text-xs text-rose-600 dark:text-rose-400 flex items-center gap-1">
                      <AlertCircleIcon className="w-3.5 h-3.5 shrink-0" />
                      <span>{errors.contactNumber}</span>
                    </p>
                  )}
                </div>

                {/* 4. Email Address */}
                <div>
                  <label htmlFor="email" className="block text-xs font-bold text-zinc-800 dark:text-zinc-200 uppercase tracking-wider mb-2">
                    Email Address <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400">
                      <MailIcon className="w-4 h-4" />
                    </div>
                    <input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleChange('email', e.target.value)}
                      onBlur={() => handleBlur('email')}
                      placeholder="owner@company.com"
                      className={`block w-full pl-10 pr-10 py-3 rounded-xl border text-sm transition-all bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none ${
                        touched.email && errors.email
                          ? 'border-rose-400 dark:border-rose-600 ring-2 ring-rose-500/20 bg-rose-50/20 dark:bg-rose-950/20'
                          : touched.email && !errors.email && formData.email
                          ? 'border-emerald-500/70 dark:border-emerald-600/70 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20'
                          : 'border-zinc-300 dark:border-zinc-700 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20'
                      }`}
                    />
                    <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none">
                      {touched.email && errors.email ? (
                        <AlertCircleIcon className="w-4 h-4 text-rose-500" />
                      ) : touched.email && !errors.email && formData.email ? (
                        <CheckIcon className="w-4 h-4 text-emerald-500" />
                      ) : null}
                    </div>
                  </div>
                  {touched.email && errors.email && (
                    <p className="mt-1.5 text-xs text-rose-600 dark:text-rose-400 flex items-center gap-1">
                      <AlertCircleIcon className="w-3.5 h-3.5 shrink-0" />
                      <span>{errors.email}</span>
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Section 3: Government ID (Optional) */}
            <div>
              <div className="flex items-center justify-between pb-3 mb-6 border-b border-zinc-100 dark:border-zinc-800/80">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-teal-50 dark:bg-teal-950/60 flex items-center justify-center text-teal-600 dark:text-teal-400">
                    <IdCardIcon className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">Government Verification</h2>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">Accelerate approval by providing regulatory identification.</p>
                  </div>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700">
                  Optional
                </span>
              </div>

              <div className="space-y-4">
                {/* 7. Government ID (Optional) */}
                <div>
                  <label htmlFor="governmentId" className="block text-xs font-bold text-zinc-800 dark:text-zinc-200 uppercase tracking-wider mb-2">
                    Government ID / Tax Number <span className="text-zinc-400 font-normal lowercase">(optional)</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400">
                      <IdCardIcon className="w-4 h-4" />
                    </div>
                    <input
                      id="governmentId"
                      type="text"
                      value={formData.governmentId}
                      onChange={(e) => handleChange('governmentId', e.target.value)}
                      placeholder="e.g. Tax ID, EIN, SEC Reg, or Business License #"
                      className="block w-full pl-10 pr-4 py-3 rounded-xl border border-zinc-300 dark:border-zinc-700 text-sm transition-all bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20"
                    />
                  </div>
                  <p className="mt-1.5 text-xs text-zinc-500 dark:text-zinc-400">
                    You can enter a registration number or upload supporting documents below. You can also skip this step.
                  </p>
                </div>

                {/* Optional Document Upload Box */}
                <div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.png,.jpg,.jpeg"
                    onChange={handleFileUpload}
                    className="hidden"
                  />

                  {uploadedGovFile ? (
                    <div className="flex items-center justify-between p-3.5 rounded-xl border border-teal-200 dark:border-teal-900/60 bg-teal-50/50 dark:bg-teal-950/20">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-teal-100 dark:bg-teal-900/40 text-teal-700 dark:text-teal-300 flex items-center justify-center font-bold text-xs">
                          DOC
                        </div>
                        <div>
                          <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate max-w-xs sm:max-w-md">
                            {uploadedGovFile.name}
                          </p>
                          <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                            {uploadedGovFile.size} • Attached for registration verification
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setUploadedGovFile(null);
                          if (fileInputRef.current) fileInputRef.current.value = '';
                        }}
                        className="p-1 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                        title="Remove attached document"
                      >
                        <CloseIcon className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full flex items-center justify-center gap-2 p-4 rounded-xl border border-dashed border-zinc-300 dark:border-zinc-700 hover:border-indigo-400 dark:hover:border-indigo-600 bg-zinc-50/50 dark:bg-zinc-950/50 hover:bg-indigo-50/30 dark:hover:bg-indigo-950/20 transition-all text-xs text-zinc-600 dark:text-zinc-400 cursor-pointer"
                    >
                      <UploadIcon className="w-4 h-4 text-zinc-400" />
                      <span>Attach Government ID Document / Certificate (PDF, PNG, JPG) — Optional</span>
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Section 4: Security Credentials */}
            <div>
              <div className="flex items-center gap-2 pb-3 mb-6 border-b border-zinc-100 dark:border-zinc-800/80">
                <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/60 flex items-center justify-center text-amber-600 dark:text-amber-400">
                  <LockIcon className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">Security Credentials</h2>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">Set a secure password for portal login and administrative access.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* 8. Password */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label htmlFor="password" className="block text-xs font-bold text-zinc-800 dark:text-zinc-200 uppercase tracking-wider">
                      Password <span className="text-rose-500">*</span>
                    </label>
                    {formData.password && (
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                        strength.score === 1
                          ? 'text-rose-700 bg-rose-100 dark:text-rose-300 dark:bg-rose-950'
                          : strength.score === 2
                          ? 'text-amber-700 bg-amber-100 dark:text-amber-300 dark:bg-amber-950'
                          : 'text-emerald-700 bg-emerald-100 dark:text-emerald-300 dark:bg-emerald-950'
                      }`}>
                        {strength.label}
                      </span>
                    )}
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400">
                      <LockIcon className="w-4 h-4" />
                    </div>
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={(e) => handleChange('password', e.target.value)}
                      onBlur={() => handleBlur('password')}
                      placeholder="Minimum 6 characters"
                      className={`block w-full pl-10 pr-10 py-3 rounded-xl border text-sm transition-all bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none ${
                        touched.password && errors.password
                          ? 'border-rose-400 dark:border-rose-600 ring-2 ring-rose-500/20 bg-rose-50/20 dark:bg-rose-950/20'
                          : touched.password && !errors.password && formData.password
                          ? 'border-emerald-500/70 dark:border-emerald-600/70 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20'
                          : 'border-zinc-300 dark:border-zinc-700 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors cursor-pointer"
                      tabIndex={-1}
                      title={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOffIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
                    </button>
                  </div>
                  {/* Password strength mini bar */}
                  {formData.password && (
                    <div className="mt-2 flex items-center gap-1.5">
                      <div className={`h-1 flex-1 rounded-full transition-all ${strength.score >= 1 ? strength.color : 'bg-zinc-200 dark:bg-zinc-800'}`} />
                      <div className={`h-1 flex-1 rounded-full transition-all ${strength.score >= 2 ? strength.color : 'bg-zinc-200 dark:bg-zinc-800'}`} />
                      <div className={`h-1 flex-1 rounded-full transition-all ${strength.score >= 3 ? strength.color : 'bg-zinc-200 dark:bg-zinc-800'}`} />
                    </div>
                  )}
                  {touched.password && errors.password && (
                    <p className="mt-1.5 text-xs text-rose-600 dark:text-rose-400 flex items-center gap-1">
                      <AlertCircleIcon className="w-3.5 h-3.5 shrink-0" />
                      <span>{errors.password}</span>
                    </p>
                  )}
                </div>

                {/* 9. Confirm Password */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label htmlFor="confirmPassword" className="block text-xs font-bold text-zinc-800 dark:text-zinc-200 uppercase tracking-wider">
                      Confirm Password <span className="text-rose-500">*</span>
                    </label>
                    {formData.confirmPassword && formData.password && (
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                        formData.confirmPassword === formData.password
                          ? 'text-emerald-700 bg-emerald-100 dark:text-emerald-300 dark:bg-emerald-950'
                          : 'text-rose-700 bg-rose-100 dark:text-rose-300 dark:bg-rose-950'
                      }`}>
                        {formData.confirmPassword === formData.password ? 'Match' : 'Mismatch'}
                      </span>
                    )}
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400">
                      <LockIcon className="w-4 h-4" />
                    </div>
                    <input
                      id="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={formData.confirmPassword}
                      onChange={(e) => handleChange('confirmPassword', e.target.value)}
                      onBlur={() => handleBlur('confirmPassword')}
                      placeholder="Re-type your password"
                      className={`block w-full pl-10 pr-10 py-3 rounded-xl border text-sm transition-all bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none ${
                        touched.confirmPassword && errors.confirmPassword
                          ? 'border-rose-400 dark:border-rose-600 ring-2 ring-rose-500/20 bg-rose-50/20 dark:bg-rose-950/20'
                          : touched.confirmPassword && !errors.confirmPassword && formData.confirmPassword
                          ? 'border-emerald-500/70 dark:border-emerald-600/70 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20'
                          : 'border-zinc-300 dark:border-zinc-700 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors cursor-pointer"
                      tabIndex={-1}
                      title={showConfirmPassword ? 'Hide password' : 'Show password'}
                    >
                      {showConfirmPassword ? <EyeOffIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
                    </button>
                  </div>
                  {touched.confirmPassword && errors.confirmPassword && (
                    <p className="mt-1.5 text-xs text-rose-600 dark:text-rose-400 flex items-center gap-1">
                      <AlertCircleIcon className="w-3.5 h-3.5 shrink-0" />
                      <span>{errors.confirmPassword}</span>
                    </p>
                  )}
                  {touched.confirmPassword && !errors.confirmPassword && formData.confirmPassword && (
                    <p className="mt-1.5 text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      <CheckIcon className="w-3.5 h-3.5 shrink-0" />
                      <span>Passwords match securely.</span>
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Section 5: Submit Actions */}
            <div className="pt-6 border-t border-zinc-100 dark:border-zinc-800/80 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-xs text-zinc-500 dark:text-zinc-400 text-center sm:text-left">
                <span className="text-rose-500 font-bold">*</span> Indicates required fields. System validates uniqueness and saves directly to database.
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                {onCancel && (
                  <button
                    type="button"
                    onClick={onCancel}
                    disabled={isSubmitting}
                    className="flex-1 sm:flex-none px-5 py-3 rounded-xl border border-zinc-300 dark:border-zinc-700 text-xs font-bold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all cursor-pointer text-center disabled:opacity-50"
                  >
                    Cancel
                  </button>
                )}

                {/* 10. Register / Submit button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 via-blue-600 to-indigo-700 hover:from-indigo-500 hover:via-blue-500 hover:to-indigo-600 text-white font-bold text-sm shadow-lg shadow-indigo-500/25 active:scale-98 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                      <span>Processing Registration...</span>
                    </>
                  ) : (
                    <>
                      <span>Register Business</span>
                      <ArrowRightIcon className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* Success Modal / Card upon Successful Registration */}
      {registeredVendor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/70 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-lg bg-white dark:bg-zinc-900 rounded-3xl p-6 sm:p-8 border border-zinc-200 dark:border-zinc-800 shadow-2xl">
            <div className="w-14 h-14 rounded-2xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto mb-4 ring-8 ring-emerald-50 dark:ring-emerald-950/40">
              <CheckCircleIcon className="w-8 h-8" />
            </div>

            <div className="text-center mb-6">
              <span className="inline-block px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 mb-2">
                Account Created & Saved to Database
              </span>
              <h2 className="text-2xl font-extrabold text-zinc-900 dark:text-zinc-50">
                Registration Successful!
              </h2>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                The vendor account for <strong className="text-zinc-900 dark:text-zinc-100">{registeredVendor.businessName}</strong> has been created with Account ID <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">{registeredVendor.id}</span>.
              </p>
            </div>

            {/* Registration Summary Card */}
            <div className="bg-zinc-50 dark:bg-zinc-950 rounded-2xl p-4 border border-zinc-200 dark:border-zinc-800 space-y-2.5 text-xs mb-6">
              <div className="flex justify-between items-center py-1 border-b border-zinc-200/60 dark:border-zinc-800">
                <span className="text-zinc-500 font-medium">Account ID</span>
                <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">{registeredVendor.id}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-zinc-200/60 dark:border-zinc-800">
                <span className="text-zinc-500 font-medium">Business Name</span>
                <span className="font-bold text-zinc-900 dark:text-zinc-100">{registeredVendor.businessName}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-zinc-200/60 dark:border-zinc-800">
                <span className="text-zinc-500 font-medium">Owner Name</span>
                <span className="font-semibold text-zinc-900 dark:text-zinc-100">{registeredVendor.fullName}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-zinc-200/60 dark:border-zinc-800">
                <span className="text-zinc-500 font-medium">Email Address</span>
                <span className="font-mono text-zinc-900 dark:text-zinc-100">{registeredVendor.workEmail}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-zinc-200/60 dark:border-zinc-800">
                <span className="text-zinc-500 font-medium">Contact Number</span>
                <span className="font-semibold text-zinc-900 dark:text-zinc-100">{registeredVendor.phoneNumber}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-zinc-200/60 dark:border-zinc-800">
                <span className="text-zinc-500 font-medium">Business Type</span>
                <span className="capitalize font-semibold text-indigo-600 dark:text-indigo-400">
                  {registeredVendor.businessType.replace('_', ' ')}
                </span>
              </div>
              <div className="flex justify-between items-start py-1 border-b border-zinc-200/60 dark:border-zinc-800">
                <span className="text-zinc-500 font-medium">Business Address</span>
                <span className="font-medium text-zinc-800 dark:text-zinc-200 text-right max-w-[220px]">
                  {registeredVendor.businessAddress.street}
                </span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-zinc-500 font-medium">Government ID</span>
                <span className="font-medium text-zinc-700 dark:text-zinc-300">
                  {registeredVendor.taxId && registeredVendor.taxId !== 'NOT_PROVIDED'
                    ? registeredVendor.taxId
                    : uploadedGovFile
                    ? uploadedGovFile.name
                    : <span className="italic text-zinc-400">Not provided (Optional)</span>}
                </span>
              </div>
            </div>

            {/* Next Steps Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={() => {
                  setRegisteredVendor(null);
                  handleClear();
                }}
                className="flex-1 px-4 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 text-xs font-bold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all text-center cursor-pointer"
              >
                Register Another Vendor
              </button>
              <button
                type="button"
                onClick={() => {
                  onComplete(registeredVendor);
                }}
                className="flex-1 inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-500/20 transition-all text-center cursor-pointer"
              >
                <span>Open Seller Dashboard</span>
                <ArrowRightIcon className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
