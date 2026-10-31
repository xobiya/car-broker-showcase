import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  Car, FileCheck, FileText, UploadCloud, Plus, X, ArrowRight, ArrowLeft,
  Check, AlertCircle, Loader2, MapPin, Eye, Sparkles, ShieldCheck, HelpCircle
} from "lucide-react";
import Combobox from "./Combobox";
import {
  BRANDS, LOCATIONS, FUEL_TYPES, TRANSMISSIONS, DRIVE_TYPES,
  CONDITIONS, BODY_TYPES, BRAND_MODELS, DOOR_OPTIONS, SEAT_OPTIONS,
  YEARS, ENGINE_SIZES, ENGINE_TYPES, COLOR_DETAILS
} from "../../lib/constants";
import { vehiclesApi } from "../../lib/api";
import type { VehicleListing } from "@autobroker/shared";

export interface VehicleFormModalProps {
  sellerId: string;
  editing: VehicleListing | null;
  onClose: () => void;
  onSaved: () => void;
  onNotify: (msg: string, type: "success" | "error" | "info") => void;
  role?: "buyer" | "seller" | "broker" | "admin";
}

const POPULAR_BRANDS = ["Toyota", "BYD", "Hyundai", "Suzuki", "Kia", "Honda", "Nissan", "Volkswagen"];
const POPULAR_LOCATIONS = ["Addis Ababa", "Hawassa", "Adama", "Bahir Dar", "Dire Dawa", "Bishoftu"];

export default function VehicleFormModal({
  sellerId,
  editing,
  onClose,
  onSaved,
  onNotify,
  role = "seller",
}: VehicleFormModalProps) {
  const isEditing = !!editing;
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Photos & Libre state
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [ownershipDoc, setOwnershipDoc] = useState<string>(editing?.ownershipDocumentUrl || "");
  const [ownershipDocName, setOwnershipDocName] = useState<string>(editing?.ownershipDocumentName || "");
  const [ownershipDocSize, setOwnershipDocSize] = useState<string>("");
  const [previewingDoc, setPreviewingDoc] = useState(false);

  // Form fields
  const [form, setForm] = useState({
    brand: editing?.brand || "Toyota",
    model: editing?.model || "",
    year: editing?.year || new Date().getFullYear(),
    regYear: (editing as any)?.registrationYear || editing?.year || new Date().getFullYear(),
    price: editing?.price || 0,
    originalPrice: editing?.originalPrice || 0,
    mileage: editing?.mileage || 0,
    fuelType: editing?.fuelType || "Gasoline",
    transmission: editing?.transmission || "Automatic",
    driveType: editing?.driveType || "FWD",
    condition: editing?.condition || "Used",
    bodyType: editing?.bodyType || "Sedan",
    color: editing?.color || "White",
    doors: editing?.doors || 4,
    seats: editing?.seats || 5,
    engineSize: editing?.engineSize || "1.8L",
    engineType: editing?.engineType || "V4",
    horsepower: editing?.horsepower || 130,
    location: editing?.location || "Addis Ababa",
    description: editing?.description || "",
    phone: (editing as any)?.phone || editing?.brokerPhone || "+251 ",
    chassisNumber: editing?.chassisNumber || "",
  });

  const scrollRef = useRef<HTMLDivElement>(null);

  // Initialize data if editing
  useEffect(() => {
    if (editing) {
      if (editing.imageUrl) {
        setUploadedImages([editing.imageUrl, ...(editing.gallery || [])]);
      }
      if (editing.ownershipDocumentUrl) {
        setOwnershipDoc(editing.ownershipDocumentUrl);
        setOwnershipDocName(editing.ownershipDocumentName || "Vehicle Libre (Title Deed)");
      }
    }
  }, [editing]);

  // Scroll to top of content when step changes
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 0;
    }
  }, [step]);

  const currentModels = useMemo(() => {
    return BRAND_MODELS[form.brand] || [];
  }, [form.brand]);

  const handleChange = (field: string, val: any) => {
    setForm(p => ({ ...p, [field]: val }));
    if (error) setError(null);
  };

  const handleLibreUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 12 * 1024 * 1024) {
      setError("Libre document file size must be less than 12MB.");
      return;
    }

    setOwnershipDocName(file.name);
    setOwnershipDocSize((file.size / (1024 * 1024)).toFixed(2) + " MB");

    const reader = new FileReader();
    reader.onload = (ev) => {
      if (ev.target?.result) {
        setOwnershipDoc(ev.target.result as string);
        setError(null);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const handleCarPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach((file: File) => {
      if (file.size > 10 * 1024 * 1024) {
        setError("Each photo must be under 10MB.");
        return;
      }
      const reader = new FileReader();
      reader.onload = (ev) => {
        if (ev.target?.result) {
          setUploadedImages(prev => [...prev, ev.target.result as string]);
          setError(null);
        }
      };
      reader.readAsDataURL(file);
    });
    e.target.value = "";
  };

  const setCoverImage = (index: number) => {
    if (index === 0) return;
    setUploadedImages(prev => {
      const selected = prev[index];
      const rest = prev.filter((_, i) => i !== index);
      return [selected, ...rest];
    });
  };

  const removeImage = (index: number) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index));
  };

  const validateStep = (currentStep: number): boolean => {
    setError(null);
    if (currentStep === 1) {
      if (!form.brand.trim()) {
        setError("Please choose a vehicle brand / manufacturer.");
        return false;
      }
      if (!form.model.trim()) {
        setError("Please select or enter a vehicle model.");
        return false;
      }
    } else if (currentStep === 2) {
      if (!form.location.trim()) {
        setError("Please select the vehicle location / city.");
        return false;
      }
    } else if (currentStep === 3) {
      if (!isEditing && !ownershipDoc) {
        setError("Official vehicle Libre (ownership document) is required so platform admins can verify ownership.");
        return false;
      }
      if (uploadedImages.length === 0) {
        setError("Please upload at least 1 car photo to show potential buyers.");
        return false;
      }
    }
    return true;
  };

  const handleNextStep = () => {
    if (validateStep(step)) {
      setStep(s => Math.min(s + 1, 4));
    }
  };

  const handlePrevStep = () => {
    setError(null);
    setStep(s => Math.max(s - 1, 1));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.brand || !form.model) {
      setError("Please select both Brand and Model.");
      setStep(1);
      return;
    }
    if (!isEditing && !ownershipDoc) {
      setError("Vehicle ownership document (Libre) is required for admin approval.");
      setStep(3);
      return;
    }
    if (form.price <= 0) {
      setError("Selling price must be greater than zero ETB.");
      setStep(4);
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const primaryImage = uploadedImages.length > 0 ? uploadedImages[0] : undefined;
      const body: Record<string, unknown> = {
        broker_id: sellerId,
        brand: form.brand,
        model: form.model,
        year: form.year,
        registration_year: form.regYear,
        price: form.price,
        original_price: form.originalPrice || form.price,
        mileage: form.mileage,
        fuel_type: form.fuelType,
        transmission: form.transmission,
        drive_type: form.driveType,
        location: form.location,
        description: form.description,
        image_url: primaryImage,
        gallery_images: uploadedImages.length > 1 ? JSON.stringify(uploadedImages) : undefined,
        ownership_document_url: ownershipDoc || undefined,
        ownership_document_name: ownershipDocName || "Vehicle Ownership Document (Libre)",
        condition: form.condition,
        body_type: form.bodyType,
        color: form.color,
        doors: form.doors,
        seats: form.seats,
        engine_size: form.engineSize,
        engine_type: form.engineType,
        horsepower: form.horsepower,
        phone: form.phone,
        chassis_number: form.chassisNumber,
        status: isEditing ? (editing?.status || "pending") : (role === "admin" ? "approved" : "pending"),
      };

      if (isEditing) {
        await vehiclesApi.update(editing!.id, body);
        onNotify("Vehicle listing updated successfully!", "success");
      } else {
        await vehiclesApi.create(body);
        onNotify("Vehicle listing submitted! Admin will verify your Libre and approve it shortly.", "success");
      }
      onSaved();
    } catch (err: any) {
      setError(err?.message || "Failed to submit vehicle listing. Please verify your details.");
    } finally {
      setSubmitting(false);
    }
  };

  const stepLabels = [
    { nr: 1, title: "Make & Model", desc: "Brand, Year & Body" },
    { nr: 2, title: "Specs & City", desc: "Engine, Fuel & Location" },
    { nr: 3, title: "Libre & Photos", desc: "Proof of Ownership" },
    { nr: 4, title: "Price & Review", desc: "Pricing & Publish" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-950/75 backdrop-blur-md p-0 sm:p-4 overflow-hidden animate-fadeIn">
      <div 
        className="relative w-full max-w-2xl bg-white dark:bg-[#0F172A] rounded-t-3xl sm:rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col h-[100dvh] sm:h-auto sm:max-h-[90vh] overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-labelledby="vehicle-modal-title"
        aria-describedby="vehicle-modal-description"
      >
        {/* Mobile Drag Sheet Handle */}
        <div className="sm:hidden pt-3 pb-1.5 flex justify-center bg-white dark:bg-[#0F172A] shrink-0">
          <div className="w-12 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full" />
        </div>

        {/* Modal Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-b border-slate-100 dark:border-slate-800/80 shrink-0 bg-white dark:bg-[#0F172A]">
          <div className="flex items-center gap-3 min-w-0">
            <div className="hidden sm:flex w-10 h-10 rounded-2xl bg-[#FF4846]/10 text-[#FF4846] items-center justify-center shrink-0">
              <Car size={20} />
            </div>
            <div className="min-w-0">
              <h2 id="vehicle-modal-title" className="text-sm sm:text-base font-black text-slate-900 dark:text-white sm:uppercase tracking-wide sm:tracking-wider truncate">
                {isEditing ? "Edit Car Listing" : "Sell Your Car (Add Listing)"}
              </h2>
              <p id="vehicle-modal-description" className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 font-medium truncate">
                Official Ethiopian Libre verification required for approval
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer shrink-0"
            aria-label="Close modal"
          >
            <X size={19} />
          </button>
        </div>

        {/* Responsive Stepper Navigation */}
        <div className="px-4 sm:px-6 py-3 bg-slate-50/80 dark:bg-slate-900/60 border-b border-slate-100 dark:border-slate-800/80 shrink-0">
          {/* Mobile Stepper Progress Bar */}
          <div className="sm:hidden space-y-2">
            <div className="flex items-center justify-between gap-3 text-xs font-black">
              <span className="text-[#FF4846] flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-[#FF4846] text-white flex items-center justify-center text-[10px]">
                  {step}
                </span>
                <span>Step {step} of 4</span>
              </span>
              <span className="text-right text-slate-800 dark:text-slate-200 truncate">
                {stepLabels[step - 1].title}
              </span>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-[#FF4846] h-full rounded-full transition-all duration-300"
                style={{ width: `${(step / 4) * 100}%` }}
              />
            </div>
          </div>

          {/* Desktop Step Cards */}
          <div className="hidden sm:grid grid-cols-4 gap-2">
            {stepLabels.map((s) => {
              const isCurrent = step === s.nr;
              const isCompleted = step > s.nr;
              return (
                <button
                  key={s.nr}
                  type="button"
                  onClick={() => {
                    if (s.nr < step) setStep(s.nr);
                    else if (s.nr === step + 1 && validateStep(step)) setStep(s.nr);
                  }}
                  className={`flex items-center gap-2.5 text-left p-2 rounded-2xl transition ${
                    isCurrent
                      ? "bg-[#FF4846]/10 text-[#FF4846] ring-1 ring-[#FF4846]/30"
                      : isCompleted
                      ? "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                      : "text-slate-400 dark:text-slate-500 opacity-60 cursor-default"
                  }`}
                >
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black shrink-0 ${
                      isCurrent
                        ? "bg-[#FF4846] text-white shadow-xs"
                        : isCompleted
                        ? "bg-emerald-500 text-white"
                        : "bg-slate-200 dark:bg-slate-700 text-slate-500"
                    }`}
                  >
                    {isCompleted ? <Check size={14} strokeWidth={3} /> : s.nr}
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] font-black truncate leading-tight">{s.title}</p>
                    <p className="text-[9px] text-slate-400 truncate mt-0.5">{s.desc}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Scrollable Form Body */}
        <div ref={scrollRef} className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-3 sm:px-6 py-4 sm:py-5 space-y-5">
          {error && (
            <div className="p-3.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs sm:text-sm rounded-2xl flex items-start gap-2.5 animate-fadeIn">
              <AlertCircle size={17} className="shrink-0 mt-0.5 text-rose-500" />
              <span className="font-medium">{error}</span>
            </div>
          )}

          {/* ════════════════════ STEP 1: MAKE & MODEL ════════════════════ */}
          {step === 1 && (
            <div className="space-y-4 sm:space-y-5 animate-fadeIn">
              {/* Quick Brand Selector Chips */}
              <div>
                <label className="text-[11px] font-black uppercase text-slate-500 dark:text-slate-400 tracking-wider mb-2 block">
                  Quick Select Popular Brand
                </label>
                <div className="flex flex-wrap gap-1.5 sm:gap-2">
                  {POPULAR_BRANDS.map(b => (
                    <button
                      key={b}
                      type="button"
                      onClick={() => {
                        const models = BRAND_MODELS[b] || [];
                        const stillValid = models.includes(form.model);
                        setForm(p => ({ ...p, brand: b, model: stillValid ? p.model : "" }));
                      }}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                        form.brand === b
                          ? "bg-[#FF4846] text-white shadow-xs scale-102"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                      }`}
                    >
                      {b}
                    </button>
                  ))}
                </div>
              </div>

              {/* Brand & Model Selectors */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="text-[11px] font-black uppercase text-slate-500 dark:text-slate-400 tracking-wider mb-1.5 block">
                    Brand / Manufacturer *
                  </label>
                  <Combobox
                    value={form.brand}
                    onChange={(v) => {
                      const models = BRAND_MODELS[v] || [];
                      const stillValid = models.includes(form.model);
                      setForm((p) => ({ ...p, brand: v, model: stillValid ? p.model : "" }));
                    }}
                    options={BRANDS}
                    placeholder="Search or choose brand..."
                    className="py-2.5 sm:py-2 text-base sm:text-sm font-semibold"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-black uppercase text-slate-500 dark:text-slate-400 tracking-wider mb-1.5 block">
                    Model Name *
                  </label>
                  <Combobox
                    value={form.model}
                    onChange={(v) => handleChange("model", v)}
                    options={currentModels}
                    placeholder={form.brand ? `Select ${form.brand} Model...` : "Choose brand first..."}
                    className="py-2.5 sm:py-2 text-base sm:text-sm font-semibold"
                  />
                  {currentModels.length > 0 && (
                    <div className="mt-1.5 flex flex-wrap gap-1">
                      <span className="text-[10px] text-slate-400 font-medium mr-1 py-0.5">Top:</span>
                      {currentModels.slice(0, 4).map((m) => (
                        <button
                          key={m}
                          type="button"
                          onClick={() => handleChange("model", m)}
                          className={`text-[10px] px-2 py-0.5 rounded-md font-semibold transition cursor-pointer ${
                            form.model === m
                              ? "bg-[#FF4846] text-white"
                              : "bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                          }`}
                        >
                          {m}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Year & Registration Year Dropdowns */}
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="text-[11px] font-black uppercase text-slate-500 dark:text-slate-400 tracking-wider mb-1.5 block">
                    Manufacture Year *
                  </label>
                  <select
                    value={form.year}
                    onChange={(e) => {
                      const yr = parseInt(e.target.value);
                      handleChange("year", yr);
                      if (form.regYear < yr) handleChange("regYear", yr);
                    }}
                    className="w-full text-base sm:text-sm p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-[#FF4846] font-semibold cursor-pointer"
                  >
                    {YEARS.map((y) => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-black uppercase text-slate-500 dark:text-slate-400 tracking-wider mb-1.5 block">
                    Registration Year
                  </label>
                  <select
                    value={form.regYear}
                    onChange={(e) => handleChange("regYear", parseInt(e.target.value))}
                    className="w-full text-base sm:text-sm p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-[#FF4846] font-semibold cursor-pointer"
                  >
                    {YEARS.map((y) => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Condition & Body Type Dropdowns */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="text-[11px] font-black uppercase text-slate-500 dark:text-slate-400 tracking-wider mb-1.5 block">
                    Vehicle Condition *
                  </label>
                  <select
                    value={form.condition}
                    onChange={(e) => handleChange("condition", e.target.value)}
                    className="w-full text-base sm:text-sm p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-[#FF4846] font-semibold cursor-pointer"
                  >
                    {CONDITIONS.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                  <div className="grid grid-cols-4 gap-1.5 mt-2">
                    {CONDITIONS.map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => handleChange("condition", c)}
                        className={`p-1.5 rounded-lg border text-center transition cursor-pointer text-[11px] font-bold ${
                          form.condition === c
                            ? "border-[#FF4846] bg-[#FF4846]/10 text-[#FF4846]"
                            : "border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300"
                        }`}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-black uppercase text-slate-500 dark:text-slate-400 tracking-wider mb-1.5 block">
                    Body Type *
                  </label>
                  <select
                    value={form.bodyType}
                    onChange={(e) => handleChange("bodyType", e.target.value)}
                    className="w-full text-base sm:text-sm p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-[#FF4846] font-semibold cursor-pointer"
                  >
                    {BODY_TYPES.map((b) => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                  <div className="grid grid-cols-4 gap-1.5 mt-2">
                    {BODY_TYPES.slice(0, 4).map((b) => (
                      <button
                        key={b}
                        type="button"
                        onClick={() => handleChange("bodyType", b)}
                        className={`p-1.5 rounded-lg border text-center transition cursor-pointer text-[11px] font-bold ${
                          form.bodyType === b
                            ? "border-[#FF4846] bg-[#FF4846]/10 text-[#FF4846]"
                            : "border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300"
                        }`}
                      >
                        {b}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Exterior Color Dropdown with visual swatches */}
              <div>
                <label className="text-[11px] font-black uppercase text-slate-500 dark:text-slate-400 tracking-wider mb-1.5 block">
                  Exterior Color *
                </label>
                <div className="relative">
                  <select
                    value={form.color}
                    onChange={(e) => handleChange("color", e.target.value)}
                    className="w-full text-base sm:text-sm p-3 pl-10 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-[#FF4846] font-semibold cursor-pointer"
                  >
                    {COLOR_DETAILS.map((c) => (
                      <option key={c.name} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                  <span
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border border-slate-300 dark:border-slate-600 pointer-events-none shadow-xs"
                    style={{ backgroundColor: COLOR_DETAILS.find((c) => c.name === form.color)?.hex || "#FFFFFF" }}
                  />
                </div>
                <div className="flex flex-wrap gap-2 mt-2 items-center">
                  <span className="text-[10px] text-slate-400 font-medium">Quick pick:</span>
                  {COLOR_DETAILS.slice(0, 8).map((c) => (
                    <button
                      key={c.name}
                      type="button"
                      title={c.name}
                      onClick={() => handleChange("color", c.name)}
                      className={`w-6 h-6 rounded-full border-2 transition cursor-pointer flex items-center justify-center ${
                        form.color === c.name
                          ? "border-[#FF4846] scale-110 shadow-sm"
                          : "border-slate-200 dark:border-slate-700 hover:scale-105"
                      }`}
                      style={{ backgroundColor: c.hex }}
                    >
                      {form.color === c.name && (
                        <Check size={11} className={c.hex === "#FFFFFF" || c.hex === "#E5D9C5" ? "text-slate-900" : "text-white"} strokeWidth={3} />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ════════════════════ STEP 2: SPECS & LOCATION ════════════════════ */}
          {step === 2 && (
            <div className="space-y-4 sm:space-y-5 animate-fadeIn">
              {/* Mileage & Fuel Type */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="text-[11px] font-black uppercase text-slate-500 dark:text-slate-400 tracking-wider mb-1.5 block">
                    Mileage (Kilometers) *
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min={0}
                      value={form.mileage || ""}
                      onChange={(e) => handleChange("mileage", parseInt(e.target.value) || 0)}
                      placeholder="e.g. 45000"
                      className="w-full text-base sm:text-sm p-3 pr-12 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-[#FF4846] font-semibold"
                    />
                    <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-black text-slate-400">
                      KM
                    </span>
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-black uppercase text-slate-500 dark:text-slate-400 tracking-wider mb-1.5 block">
                    Fuel Type *
                  </label>
                  <select
                    value={form.fuelType}
                    onChange={(e) => handleChange("fuelType", e.target.value)}
                    className="w-full text-base sm:text-sm p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-[#FF4846] font-semibold cursor-pointer"
                  >
                    {FUEL_TYPES.map(f => (
                      <option key={f} value={f}>{f}</option>
                    ))}
                  </select>
                  <div className="grid grid-cols-4 gap-1.5 mt-2">
                    {FUEL_TYPES.map(f => (
                      <button
                        key={f}
                        type="button"
                        onClick={() => handleChange("fuelType", f)}
                        className={`p-1.5 rounded-lg border text-center transition cursor-pointer text-[11px] font-bold ${
                          form.fuelType === f
                            ? "border-[#FF4846] bg-[#FF4846]/10 text-[#FF4846]"
                            : "border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300"
                        }`}
                      >
                        {f}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Transmission & Drive Type Dropdowns */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="text-[11px] font-black uppercase text-slate-500 dark:text-slate-400 tracking-wider mb-1.5 block">
                    Transmission *
                  </label>
                  <select
                    value={form.transmission}
                    onChange={(e) => handleChange("transmission", e.target.value)}
                    className="w-full text-base sm:text-sm p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-[#FF4846] font-semibold cursor-pointer"
                  >
                    {TRANSMISSIONS.map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {TRANSMISSIONS.map(t => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => handleChange("transmission", t)}
                        className={`p-2 rounded-lg border text-center transition cursor-pointer text-xs font-bold ${
                          form.transmission === t
                            ? "border-[#FF4846] bg-[#FF4846]/10 text-[#FF4846]"
                            : "border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300"
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-black uppercase text-slate-500 dark:text-slate-400 tracking-wider mb-1.5 block">
                    Drive Type *
                  </label>
                  <select
                    value={form.driveType}
                    onChange={(e) => handleChange("driveType", e.target.value)}
                    className="w-full text-base sm:text-sm p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-[#FF4846] font-semibold cursor-pointer"
                  >
                    {DRIVE_TYPES.map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                  <div className="grid grid-cols-4 gap-1.5 mt-2">
                    {DRIVE_TYPES.map(d => (
                      <button
                        key={d}
                        type="button"
                        onClick={() => handleChange("driveType", d)}
                        className={`p-2 rounded-lg border text-center transition cursor-pointer text-xs font-bold ${
                          form.driveType === d
                            ? "border-[#FF4846] bg-[#FF4846]/10 text-[#FF4846]"
                            : "border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300"
                        }`}
                      >
                        {d}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Engine Size & Engine Type Dropdowns */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="text-[11px] font-black uppercase text-slate-500 dark:text-slate-400 tracking-wider mb-1.5 block">
                    Engine Displacement / Size
                  </label>
                  <select
                    value={form.engineSize}
                    onChange={(e) => handleChange("engineSize", e.target.value)}
                    className="w-full text-base sm:text-sm p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-[#FF4846] font-semibold cursor-pointer"
                  >
                    {ENGINE_SIZES.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-black uppercase text-slate-500 dark:text-slate-400 tracking-wider mb-1.5 block">
                    Engine Type / Cylinders
                  </label>
                  <select
                    value={form.engineType}
                    onChange={(e) => handleChange("engineType", e.target.value)}
                    className="w-full text-base sm:text-sm p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-[#FF4846] font-semibold cursor-pointer"
                  >
                    {ENGINE_TYPES.map(et => (
                      <option key={et} value={et}>{et}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Doors & Seats Dropdowns */}
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="text-[11px] font-black uppercase text-slate-500 dark:text-slate-400 tracking-wider mb-1.5 block">
                    Doors
                  </label>
                  <select
                    value={form.doors}
                    onChange={(e) => handleChange("doors", parseInt(e.target.value))}
                    className="w-full text-base sm:text-sm p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold cursor-pointer"
                  >
                    {DOOR_OPTIONS.map((d) => (
                      <option key={d} value={d}>{d} Doors</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-black uppercase text-slate-500 dark:text-slate-400 tracking-wider mb-1.5 block">
                    Seats
                  </label>
                  <select
                    value={form.seats}
                    onChange={(e) => handleChange("seats", parseInt(e.target.value))}
                    className="w-full text-base sm:text-sm p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold cursor-pointer"
                  >
                    {SEAT_OPTIONS.map((s) => (
                      <option key={s} value={s}>{s} Seats</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Location with Searchable Combobox & Quick Chips */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-[11px] font-black uppercase text-slate-500 dark:text-slate-400 tracking-wider">
                    Location / City in Ethiopia *
                  </label>
                </div>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {POPULAR_LOCATIONS.map(loc => (
                    <button
                      key={loc}
                      type="button"
                      onClick={() => handleChange("location", loc)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1 ${
                        form.location === loc
                          ? "bg-[#FF4846] text-white shadow-xs"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                      }`}
                    >
                      <MapPin size={11} /> {loc}
                    </button>
                  ))}
                </div>
                <Combobox
                  value={form.location}
                  onChange={(v) => handleChange("location", v)}
                  options={LOCATIONS}
                  placeholder="Select or enter city..."
                  className="py-2.5 sm:py-2 text-base sm:text-sm font-semibold"
                />
              </div>

              {/* Chassis Number */}
              <div>
                <label className="text-[11px] font-black uppercase text-slate-500 dark:text-slate-400 tracking-wider mb-1.5 block flex items-center justify-between">
                  <span>Chassis / VIN Number (Optional)</span>
                  <span className="text-[10px] text-slate-400 normal-case font-normal">Matches Libre Booklet</span>
                </label>
                <input
                  type="text"
                  value={form.chassisNumber}
                  onChange={(e) => handleChange("chassisNumber", e.target.value.toUpperCase())}
                  placeholder="e.g. JT123456789ABC"
                  className="w-full text-base sm:text-sm p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                />
              </div>
            </div>
          )}

          {/* ════════════════════ STEP 3: LIBRE OWNERSHIP DOCUMENT & PHOTOS ════════════════════ */}
          {step === 3 && (
            <div className="space-y-6 animate-fadeIn">
              {/* ── OWNERSHIP LIBRE DOCUMENT UPLOAD (CORE REQUIREMENT) ── */}
              <div className="bg-gradient-to-br from-amber-500/5 via-emerald-500/5 to-transparent border-2 border-dashed border-[#FF4846]/40 dark:border-[#FF4846]/30 rounded-3xl p-4 sm:p-5 space-y-3.5">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-[#FF4846] text-white flex items-center justify-center shrink-0 shadow-md shadow-[#FF4846]/20 mt-0.5">
                      <FileCheck size={20} />
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">
                          Vehicle Libre / Title Deed (የባለቤትነት ማረጋገጫ ሊብሬ)
                        </h3>
                        <span className="text-[10px] bg-[#FF4846] text-white px-2 py-0.5 rounded-full font-black tracking-wide">
                          REQUIRED
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                        Upload a photo or PDF scan of your Ethiopian vehicle ownership booklet (Libre). This document proves legal ownership and is strictly confidential. Only platform administrators and assigned brokers inspect it to approve your car for listing.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Uploaded Document Card OR Dropzone */}
                {ownershipDoc ? (
                  <div className="bg-white dark:bg-slate-800 border border-emerald-200 dark:border-emerald-800/60 rounded-2xl p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
                    <div className="flex items-center gap-3 min-w-0">
                      {ownershipDoc.startsWith("data:image/") || ownershipDoc.startsWith("http") ? (
                        <img
                          src={ownershipDoc}
                          alt="Libre document preview"
                          className="w-14 h-14 object-cover rounded-xl border border-slate-200 dark:border-slate-700 shrink-0 cursor-pointer hover:opacity-90 transition"
                          onClick={() => setPreviewingDoc(true)}
                        />
                      ) : (
                        <div 
                          className="w-14 h-14 rounded-xl bg-red-100 dark:bg-red-950/60 text-red-600 flex items-center justify-center shrink-0 cursor-pointer"
                          onClick={() => setPreviewingDoc(true)}
                        >
                          <FileText size={24} />
                        </div>
                      )}
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <Check size={14} className="text-emerald-500 shrink-0" />
                          <p className="text-xs sm:text-sm font-black text-slate-900 dark:text-white truncate">
                            {ownershipDocName || "Vehicle Ownership Document (Libre)"}
                          </p>
                        </div>
                        <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold mt-0.5">
                          {ownershipDocSize ? `${ownershipDocSize} · ` : ""}Ready for admin verification
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto justify-end shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-700">
                      <button
                        type="button"
                        onClick={() => setPreviewingDoc(true)}
                        className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5 cursor-pointer transition"
                      >
                        <Eye size={13} />
                        <span>Preview</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setOwnershipDoc("");
                          setOwnershipDocName("");
                          setOwnershipDocSize("");
                        }}
                        className="px-3 py-1.5 rounded-xl border border-rose-200 dark:border-rose-900/60 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs font-bold cursor-pointer transition"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center p-6 sm:p-8 bg-white/90 dark:bg-slate-850/90 rounded-2xl border border-slate-200 dark:border-slate-700 hover:border-[#FF4846] transition-all cursor-pointer group text-center shadow-xs">
                    <div className="w-12 h-12 rounded-2xl bg-[#FF4846]/10 text-[#FF4846] flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                      <UploadCloud size={24} />
                    </div>
                    <span className="text-sm font-black text-slate-900 dark:text-white">
                      Tap or Drag to Upload Libre Document
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm">
                      Take a photo with your mobile camera or upload JPG, PNG, WebP, or PDF (up to 12MB)
                    </span>
                    <span className="mt-3 px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-black group-hover:bg-[#FF4846] group-hover:text-white transition">
                      Browse File / Camera
                    </span>
                    <input
                      type="file"
                      accept="image/*,application/pdf"
                      capture="environment"
                      onChange={handleLibreUpload}
                      className="hidden"
                    />
                  </label>
                )}

                <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
                  <ShieldCheck size={14} className="text-emerald-500 shrink-0" />
                  <span>Your document is encrypted and never shown publicly on the marketplace showroom.</span>
                </div>
              </div>

              {/* ── CAR PHOTOS UPLOAD ── */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-[11px] font-black uppercase text-slate-500 dark:text-slate-400 tracking-wider block">
                      Car Photos (At least 1 required) *
                    </label>
                    <span className="text-[11px] text-slate-400">
                      Tap any photo to set as cover picture
                    </span>
                  </div>
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800">
                    {uploadedImages.length} photo{uploadedImages.length === 1 ? "" : "s"} added
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {uploadedImages.map((img, i) => (
                    <div
                      key={i}
                      onClick={() => setCoverImage(i)}
                      className={`relative aspect-square rounded-2xl overflow-hidden border transition group bg-slate-100 dark:bg-slate-800 cursor-pointer ${
                        i === 0
                          ? "border-[#FF4846] ring-2 ring-[#FF4846]/20 shadow-md"
                          : "border-slate-200 dark:border-slate-700 hover:border-slate-400"
                      }`}
                    >
                      <img src={img} alt={`Upload ${i + 1}`} className="w-full h-full object-cover" />
                      
                      {/* Remove Button */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeImage(i);
                        }}
                        className="absolute top-2 right-2 w-8 h-8 bg-rose-600/90 text-white rounded-full flex items-center justify-center text-sm font-bold cursor-pointer shadow-lg active:scale-90 transition"
                        title="Remove photo"
                        aria-label={`Remove photo ${i + 1}`}
                      >
                        ×
                      </button>

                      {/* Main Cover Badge */}
                      {i === 0 ? (
                        <span className="absolute bottom-2 left-2 bg-[#FF4846] text-white text-[9px] font-black px-2 py-0.5 rounded-lg uppercase tracking-wider shadow-sm flex items-center gap-1">
                          <Check size={10} strokeWidth={3} /> Cover Photo
                        </span>
                      ) : (
                        <span className="absolute bottom-2 left-2 bg-slate-900/70 text-white text-[8px] font-bold px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition">
                          Set as Cover
                        </span>
                      )}
                    </div>
                  ))}

                  {/* Add More Photos Card */}
                  <label className="aspect-square rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-[#FF4846] bg-slate-50 dark:bg-slate-800/40 flex flex-col items-center justify-center gap-1.5 cursor-pointer transition text-center p-3 group">
                    <div className="w-10 h-10 rounded-2xl bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 group-hover:bg-[#FF4846] group-hover:text-white flex items-center justify-center transition">
                      <Plus size={18} />
                    </div>
                    <span className="text-xs font-black text-slate-700 dark:text-slate-300 group-hover:text-[#FF4846]">
                      Add Photos
                    </span>
                    <span className="text-[10px] text-slate-400">
                      Camera or Gallery
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      capture="environment"
                      className="hidden"
                      onChange={handleCarPhotoUpload}
                    />
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* ════════════════════ STEP 4: PRICE, CONTACT & REVIEW ════════════════════ */}
          {step === 4 && (
            <div className="space-y-4 sm:space-y-5 animate-fadeIn">
              {/* Selling Price in ETB */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="text-[11px] font-black uppercase text-slate-500 dark:text-slate-400 tracking-wider mb-1.5 block">
                    Selling Price (ETB) *
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      required
                      min={1000}
                      value={form.price || ""}
                      onChange={(e) => handleChange("price", parseInt(e.target.value) || 0)}
                      placeholder="e.g. 2800000"
                      className="w-full text-lg sm:text-base p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-[#FF4846] font-black"
                    />
                  </div>
                  {form.price > 0 && (
                    <p className="text-xs text-[#FF4846] font-bold mt-1.5 flex items-center gap-1">
                      <Sparkles size={13} />
                      <span>{form.price.toLocaleString()} ETB ({form.price >= 1000000 ? `${(form.price / 1000000).toFixed(2)} Million ETB` : `${(form.price / 1000).toFixed(0)}K ETB`})</span>
                    </p>
                  )}
                </div>

                <div>
                  <label className="text-[11px] font-black uppercase text-slate-500 dark:text-slate-400 tracking-wider mb-1.5 block">
                    Contact Phone Number *
                  </label>
                  <input
                    type="tel"
                    required
                    value={form.phone}
                    onChange={(e) => handleChange("phone", e.target.value)}
                    placeholder="+251 9XX XXX XXX"
                    className="w-full text-base sm:text-sm p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-[#FF4846] font-semibold"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">Buyers or brokers will contact this number.</p>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="text-[11px] font-black uppercase text-slate-500 dark:text-slate-400 tracking-wider mb-1.5 block">
                  Vehicle Description
                </label>
                <textarea
                  rows={3}
                  value={form.description}
                  onChange={(e) => handleChange("description", e.target.value)}
                  placeholder="Describe vehicle condition, service history, tax status, accident-free records..."
                  className="w-full text-base sm:text-sm p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-[#FF4846] resize-none"
                />
              </div>

              {/* Review Summary Card */}
              <div className="bg-slate-50 dark:bg-slate-800/60 rounded-3xl p-4 sm:p-5 border border-slate-200 dark:border-slate-700/80 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200/80 dark:border-slate-700">
                  <p className="text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Listing Review Summary
                  </p>
                  <span className="text-[10px] bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 px-2 py-0.5 rounded-full font-bold">
                    Pending Approval on Submit
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs sm:text-sm">
                  <div>
                    <span className="text-slate-400 text-[11px] block">Vehicle</span>
                    <strong className="text-slate-900 dark:text-white">
                      {form.brand} {form.model} ({form.year})
                    </strong>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[11px] block">Price</span>
                    <strong className="text-[#FF4846]">
                      {form.price.toLocaleString()} ETB
                    </strong>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[11px] block">Location & Specs</span>
                    <span className="font-semibold text-slate-700 dark:text-slate-300">
                      {form.location} · {form.condition} · {form.fuelType} · {form.color}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[11px] block">Libre Ownership Document</span>
                    <span className={`font-bold flex items-center gap-1 ${ownershipDoc ? "text-emerald-600 dark:text-emerald-400" : "text-rose-500"}`}>
                      {ownershipDoc ? <Check size={13} /> : <AlertCircle size={13} />}
                      {ownershipDoc ? "Libre Attached" : "Missing Document"}
                    </span>
                  </div>
                </div>

                {/* Important Trust Notice */}
                <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-start gap-2.5 text-xs text-amber-800 dark:text-amber-300">
                  <HelpCircle size={16} className="text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                  <p className="leading-relaxed">
                    Once submitted, your listing is routed directly to the <strong>Admin Panel</strong> for review. Our team will verify your vehicle Libre before approving it for the marketplace showroom.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Fixed Safe-Area Action Bar (Direct Sibling, Stays In View on Mobile) */}
        <div className="shrink-0 bg-white dark:bg-[#0F172A] border-t border-slate-100 dark:border-slate-800 px-3 sm:px-6 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] flex items-center justify-between gap-2 sm:gap-3 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
          <button
            type="button"
            onClick={step === 1 ? onClose : handlePrevStep}
            className="flex-1 sm:flex-none px-3 sm:px-4 py-3.5 sm:py-3 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer flex items-center gap-1.5 sm:min-w-[80px] justify-center"
          >
            {step > 1 && <ArrowLeft size={15} />}
            <span>{step === 1 ? "Cancel" : "Back"}</span>
          </button>

          {step < 4 ? (
            <button
              type="button"
              onClick={handleNextStep}
              className="px-6 py-3 rounded-2xl bg-[#FF4846] hover:bg-[#E63D3B] text-white text-xs sm:text-sm font-black transition cursor-pointer shadow-md shadow-[#FF4846]/20 active:scale-95 flex items-center gap-2"
            >
              <span className="sm:hidden">Next</span>
              <span className="hidden sm:inline">Continue</span>
              <ArrowRight size={15} />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting}
              className="flex-1 sm:flex-none px-3 sm:px-6 py-3.5 sm:py-3 rounded-2xl bg-[#FF4846] hover:bg-[#E63D3B] text-white text-xs sm:text-sm font-black transition cursor-pointer shadow-md shadow-[#FF4846]/20 active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Submitting Listing...</span>
                </>
              ) : (
                <>
                  <Check size={16} />
                  <span>{isEditing ? "Save Changes" : "Submit Listing"}</span>
                </>
              )}
            </button>
          )}
        </div>

        {/* In-Modal Libre Document Preview Modal */}
        {previewingDoc && ownershipDoc && (
          <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-fadeIn">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-xl w-full max-h-[85vh] flex flex-col overflow-hidden shadow-2xl">
              <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <FileText size={18} className="text-[#FF4846]" />
                  <h3 className="text-sm font-black text-slate-900 dark:text-white truncate">
                    {ownershipDocName || "Vehicle Libre Document"}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setPreviewingDoc(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>
              <div className="p-4 flex-1 overflow-y-auto flex items-center justify-center bg-slate-950">
                {ownershipDoc.startsWith("data:application/pdf") ? (
                  <iframe
                    src={ownershipDoc}
                    title="Libre PDF Preview"
                    className="w-full h-[400px] rounded-xl"
                  />
                ) : (
                  <img
                    src={ownershipDoc}
                    alt="Libre document preview"
                    className="max-h-[420px] max-w-full object-contain rounded-xl"
                  />
                )}
              </div>
              <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                <button
                  type="button"
                  onClick={() => setPreviewingDoc(false)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-200 text-xs font-bold rounded-xl cursor-pointer"
                >
                  Close Preview
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
