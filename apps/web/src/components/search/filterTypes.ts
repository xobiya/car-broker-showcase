import type { VehicleListing } from "@autobroker/shared";

export interface FilterState {
  brand: string[];
  model: string[];
  condition: string[];
  bodyType: string[];
  fuel: string[];
  transmission: string[];
  driveType: string[];
  location: string[];
  minPrice?: string | number;
  maxPrice?: string | number;
  minYear?: string | number;
  maxYear?: string | number;
  minMileage?: string | number;
  maxMileage?: string | number;
  features: string[];
}

export const INITIAL_FILTER_STATE: FilterState = {
  brand: [],
  model: [],
  condition: [],
  bodyType: [],
  fuel: [],
  transmission: [],
  driveType: [],
  location: [],
  minPrice: "",
  maxPrice: "",
  minYear: "",
  maxYear: "",
  minMileage: "",
  maxMileage: "",
  features: [],
};

export const initialFilterState = INITIAL_FILTER_STATE;

export const ETHIOPIAN_PRICE_BRACKETS = [
  { label: "Under 3M ETB", min: 0, max: 3000000 },
  { label: "3M – 6M ETB", min: 3000000, max: 6000000 },
  { label: "6M – 10M ETB", min: 6000000, max: 10000000 },
  { label: "10M – 20M ETB", min: 10000000, max: 20000000 },
  { label: "Over 20M ETB", min: 20000000, max: undefined },
];

export const BODY_TYPES = [
  "Sedan",
  "SUV",
  "Hatchback",
  "Pickup",
  "Van",
  "Bus",
  "Truck",
  "Machinery",
  "Motorcycle",
];

export const FUEL_TYPES = [
  "Benzine",
  "Diesel",
  "Electric",
  "Hybrid",
];

export const TRANSMISSION_TYPES = [
  "Automatic",
  "Manual",
];

export const DRIVE_TYPES = [
  "4WD",
  "AWD",
  "FWD",
  "RWD",
];

export const CONDITION_TYPES = [
  "New",
  "Like New",
  "Used",
];

export const ETHIOPIAN_LOCATIONS = [
  "Addis Ababa (Bole)",
  "Addis Ababa (Kazanchis)",
  "Addis Ababa (Sarbet)",
  "Addis Ababa (CMC)",
  "Addis Ababa (Old Airport)",
  "Addis Ababa (Gerji)",
  "Addis Ababa (Piassa)",
  "Hawassa",
  "Adama",
  "Bahir Dar",
  "Dire Dawa",
];

export const FEATURE_FLAGS = [
  { id: "inspected", label: "150-Pt Physical Audit Passed" },
  { id: "libre_clean", label: "Libre Clear & Title Verified" },
  { id: "direct_owner", label: "Direct Owner Listing" },
  { id: "warranty", label: "Dealer Warranty Included" },
];

export const YEAR_OPTIONS = [
  2025, 2024, 2023, 2022, 2021, 2020, 2019, 2018, 2017, 2016, 2015, 2012, 2010
];

export const MILEAGE_BRACKETS = [
  { label: "Under 10,000 km", max: 10000 },
  { label: "Under 30,000 km", max: 30000 },
  { label: "Under 60,000 km", max: 60000 },
  { label: "Under 100,000 km", max: 100000 },
];

export function filterVehiclesClientSide(
  vehicles: VehicleListing[],
  filters: FilterState,
  searchQuery: string = "",
  quickFilters: string[] = []
): VehicleListing[] {
  return vehicles.filter(car => {
    // 1. Text Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const brandMatch = car.brand?.toLowerCase().includes(q);
      const modelMatch = car.model?.toLowerCase().includes(q);
      const yearMatch = String(car.year).includes(q);
      const locationMatch = car.location?.toLowerCase().includes(q);
      const bodyMatch = car.bodyType?.toLowerCase().includes(q);
      const fuelMatch = car.fuelType?.toLowerCase().includes(q);
      const combined = `${car.brand} ${car.model} ${car.year}`.toLowerCase();
      const combinedMatch = combined.includes(q);

      if (!brandMatch && !modelMatch && !yearMatch && !locationMatch && !bodyMatch && !fuelMatch && !combinedMatch) {
        return false;
      }
    }

    // 2. Quick Filters
    if (quickFilters.length > 0) {
      for (const qf of quickFilters) {
        if (qf === "available" && car.status !== "available") return false;
        if (qf === "sold" && car.status !== "sold") return false;
        if (qf === "verified" && car.status === "sold") return false;
        if (qf === "electric") {
          const f = car.fuelType?.toLowerCase() || "";
          if (!f.includes("electric") && !f.includes("hybrid")) return false;
        }
        if (qf === "luxury") {
          const isLux =
            car.price >= 10000000 ||
            car.bodyType === "SUV" ||
            car.driveType === "4WD" ||
            ["mercedes-benz", "bmw", "audi", "lexus", "land rover", "porsche"].includes(
              (car.brand || "").toLowerCase()
            );
          if (!isLux) return false;
        }
        if (qf === "budget" && car.price > 3000000) return false;
        if (qf === "newArrivals" && car.year < 2022) return false;
      }
    }

    // 3. Brand Facets
    if (filters.brand && filters.brand.length > 0) {
      if (!filters.brand.some(b => b.toLowerCase() === car.brand?.toLowerCase())) {
        return false;
      }
    }

    // 4. Model Facets
    if (filters.model && filters.model.length > 0) {
      if (!filters.model.some(m => m.toLowerCase() === car.model?.toLowerCase())) {
        return false;
      }
    }

    // 5. Body Type Facets
    if (filters.bodyType && filters.bodyType.length > 0) {
      const carBt = (car.bodyType || "").toLowerCase();
      const matchesBt = filters.bodyType.some(bt => {
        const target = bt.toLowerCase();
        if (target === "pickup") return carBt.includes("pickup") || carBt.includes("truck");
        if (target === "truck") return carBt.includes("truck") || carBt.includes("dump");
        if (target === "van") return carBt.includes("van") || carBt.includes("minibus") || carBt.includes("bus");
        if (target === "bus") return carBt.includes("bus") || carBt.includes("coaster");
        if (target === "machinery") return carBt.includes("machinery") || carBt.includes("loader") || carBt.includes("heavy");
        if (target === "motorcycle") return carBt.includes("motorcycle") || carBt.includes("bike");
        return carBt.includes(target) || target.includes(carBt);
      });
      if (!matchesBt) {
        return false;
      }
    }

    // 6. Fuel Type Facets
    if (filters.fuel && filters.fuel.length > 0) {
      if (!filters.fuel.some(f => f.toLowerCase() === car.fuelType?.toLowerCase())) {
        return false;
      }
    }

    // 7. Transmission Facets
    if (filters.transmission && filters.transmission.length > 0) {
      if (!filters.transmission.some(t => t.toLowerCase() === car.transmission?.toLowerCase())) {
        return false;
      }
    }

    // 8. Drive Type Facets
    if (filters.driveType && filters.driveType.length > 0) {
      if (!filters.driveType.some(d => d.toLowerCase() === car.driveType?.toLowerCase())) {
        return false;
      }
    }

    // 9. Condition Facets
    if (filters.condition && filters.condition.length > 0) {
      if (!filters.condition.some(c => c.toLowerCase() === car.condition?.toLowerCase())) {
        return false;
      }
    }

    // 10. Location Facets
    if (filters.location && filters.location.length > 0) {
      const carLoc = car.location?.toLowerCase() || "";
      const matchesLoc = filters.location.some(l => {
        const cleanLoc = l.toLowerCase().replace(/addis ababa\s*\(([^)]+)\)/, "$1").trim();
        return carLoc.includes(cleanLoc) || cleanLoc.includes(carLoc) || carLoc.includes(l.toLowerCase());
      });
      if (!matchesLoc) return false;
    }

    // 11. Price Range
    if (filters.minPrice !== undefined && filters.minPrice !== "") {
      const min = Number(filters.minPrice);
      if (!isNaN(min) && car.price < min) return false;
    }
    if (filters.maxPrice !== undefined && filters.maxPrice !== "") {
      const max = Number(filters.maxPrice);
      if (!isNaN(max) && car.price > max) return false;
    }

    // 12. Year Range
    if (filters.minYear !== undefined && filters.minYear !== "") {
      const min = Number(filters.minYear);
      if (!isNaN(min) && car.year < min) return false;
    }
    if (filters.maxYear !== undefined && filters.maxYear !== "") {
      const max = Number(filters.maxYear);
      if (!isNaN(max) && car.year > max) return false;
    }

    // 13. Mileage Range
    if (filters.minMileage !== undefined && filters.minMileage !== "") {
      const min = Number(filters.minMileage);
      if (!isNaN(min) && (car.mileage || 0) < min) return false;
    }
    if (filters.maxMileage !== undefined && filters.maxMileage !== "") {
      const max = Number(filters.maxMileage);
      if (!isNaN(max) && (car.mileage || 0) > max) return false;
    }

    // 14. Trust & Feature Flags
    if (filters.features && filters.features.length > 0) {
      for (const feat of filters.features) {
        if (feat === "inspected" && car.inspectionStatus !== "passed" && car.inspectionStatus !== "verified") {
          // Accept verified status as inspected
          if (car.status === "sold") return false;
        }
        if (feat === "libre_clean" && car.status === "sold") return false;
        if (feat === "warranty" && car.condition !== "New" && car.condition !== "Like New") return false;
      }
    }

    return true;
  });
}
