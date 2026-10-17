export const BRANDS = ["Toyota", "BYD", "Hyundai", "Suzuki", "Kia", "Honda", "Nissan", "Changan", "Mercedes-Benz", "BMW", "Volkswagen", "Ford", "Mitsubishi", "Isuzu", "MG", "Geely", "Chevrolet", "Mazda", "Land Rover", "Lexus", "Jeep", "Peugeot", "Renault", "Foton", "Great Wall", "Haval", "Jetour", "Chery"];
export const LOCATIONS = ["Addis Ababa", "Adama", "Bahir Dar", "Dire Dawa", "Hawassa", "Jimma", "Mekelle", "Gondar", "Debre Zeit", "Shashemene", "Harar", "Dessie"];
export const COLORS = ["White", "Black", "Silver", "Gray", "Blue", "Red", "Green", "Gold", "Brown", "Beige", "Orange", "Burgundy", "Navy"];
export const FUEL_TYPES = ["Gasoline", "Diesel", "Electric", "Hybrid"];
export const TRANSMISSIONS = ["Automatic", "Manual"];
export const DRIVE_TYPES = ["4WD", "AWD", "FWD", "RWD"];
export const CONDITIONS = ["New", "Used", "Imported", "Damaged"];
export const BODY_TYPES = ["SUV", "Sedan", "Hatchback", "Pickup", "Truck", "Van", "Coupe", "Convertible"];
export const ENGINE_TYPES = ["V4", "V6", "V8", "V12", "Electric", "Hybrid"];
export const DOOR_OPTIONS = [2, 3, 4, 5];
export const SEAT_OPTIONS = [2, 4, 5, 6, 7, 8];
export const INQUIRY_STATUSES = ["all", "new", "contacted", "negotiating", "sold", "cancelled"] as const;
export const LISTING_STATUSES = ["all", "approved", "pending", "sold"] as const;
export const BRAND_MODELS: Record<string, string[]> = {
  "Toyota": ["Vitz", "Yaris", "Passo", "Corolla", "Premio", "Allion", "Fielder", "Harrier", "Land Cruiser", "Land Cruiser Prado", "Rush", "Hilux", "Hiace", "Camry", "RAV4", "Fortuner", "Corolla Cross", "Starlet", "Belta", "Avanza", "Innova", "Coaster", "Dyna", "Tundra", "Highlander", "Crown", "Sienta", "Noah", "Voxy", "Alphard", "Auris", "Axio"],
  "BYD": ["Atto 3", "Seagull", "Dolphin", "Han", "Tang", "Yuan Plus", "Seal", "Song Plus"],
  "Hyundai": ["Tucson", "Elantra", "Santa Fe", "Accent", "Grand i10", "Creta", "Sonata", "Palisade", "Kona", "Venue", "Staria", "Grand Starex", "H-1", "i20", "i30", "Tucson LWB"],
  "Suzuki": ["Swift", "Dzire", "Alto", "Ertiga", "Vitara", "Jimny", "S-Presso", "Celerio", "Baleno", "Grand Vitara", "Wagon R", "Ciaz", "Ignis", "APV"],
  "Kia": ["Sportage", "Sorento", "Picanto", "Rio", "Cerato", "Seltos", "Telluride", "Stonic", "Niro", "EV6", "Carnival", "K5", "Soul"],
  "Honda": ["Fit", "Civic", "CR-V", "Vezel", "Grace", "Freed", "Accord", "HR-V", "Odyssey", "Stepwgn", "N-Box", "Shuttle", "Jazz", "City", "BR-V", "WR-V"],
  "Nissan": ["Note", "X-Trail", "Patrol", "Sunny", "Juke", "Qashqai", "Navara", "Pathfinder", "Altima", "Leaf", "Murano", "Elgrand", "Serena", "Wingroad", "March", "Tiida", "Frontier"],
  "Changan": ["CS35", "CS55", "CS75", "Eado", "Alsvin", "UNI-K", "UNI-T", "UNI-V", "Deepal"],
  "Mercedes-Benz": ["C-Class", "E-Class", "S-Class", "G-Class", "GLA", "GLB", "GLC", "GLE", "CLS", "A-Class", "B-Class", "AMG GT", "V-Class", "Sprinter"],
  "BMW": ["3 Series", "5 Series", "7 Series", "X1", "X3", "X5", "X7", "X6", "i4", "i7", "M3", "M5", "Z4", "1 Series"],
  "Volkswagen": ["Golf", "Passat", "Polo", "Tiguan", "ID.4", "ID.3", "Jetta", "T-Cross", "T-Roc", "Touran", "Sharan", "Teramont", "Amarok", "Virtus", "Lavida"],
  "Ford": ["Ranger", "Everest", "Explorer", "Escape", "Focus", "Fusion", "Mustang", "Edge", "Transit", "F-150", "Endeavour", "EcoSport"],
  "Mitsubishi": ["L200", "Pajero", "Montero", "Outlander", "Eclipse Cross", "Mirage", "Delica", "ASX", "Triton", "Xpander"],
  "Isuzu": ["D-Max", "MU-X", "FRR", "N-Series", "ELF", "KB", "Trooper"],
  "MG": ["MG5", "MG6", "MG ZS", "MG HS", "MG RX5", "MG3", "MG GT", "MG EZS"],
  "Geely": ["Tugela", "Emgrand", "Coolray", "Monjaro", "Starray", "Okavango", "Geometry C", "Panda"],
  "Chevrolet": ["Trailblazer", "Captiva", "Equinox", "Tahoe", "Suburban", "Malibu", "Camaro", "Colorado", "Spark", "Aveo", "Cruze"],
  "Mazda": ["CX-5", "CX-9", "CX-30", "CX-3", "BT-50", "Mazda3", "Mazda6", "MX-5", "Demio", "Atenza", "Axela", "Biante"],
  "Land Rover": ["Range Rover", "Range Rover Sport", "Range Rover Evoque", "Discovery", "Discovery Sport", "Defender", "Velar"],
  "Lexus": ["LX570", "RX350", "NX200", "ES350", "GX460", "LS500", "UX200", "LM300h"],
  "Jeep": ["Wrangler", "Grand Cherokee", "Cherokee", "Compass", "Renegade", "Gladiator", "Wagoneer"],
  "Peugeot": ["3008", "5008", "208", "2008", "308", "508", "Partner", "Landtrek", "Rifter"],
  "Renault": ["Kwid", "Duster", "Logan", "Sandero", "Koleos", "Captur", "Kangoo", "Triber"],
  "Foton": ["Tunland", "BJ40", "New Energy", "AUV", "View"],
  "Great Wall": ["Haval H6", "Haval H2", "Haval Jolion", "Wingle 5", "Wingle 7", "Poer", "Ora Good Cat", "Tank 300", "Tank 500"],
  "Haval": ["H6", "H2", "Jolion", "Dargo", "H9", "F7", "M6"],
  "Jetour": ["X70", "X90", "X95", "Dashing", "Traveller"],
  "Chery": ["Tiggo 2", "Tiggo 3", "Tiggo 4", "Tiggo 7", "Tiggo 8", "Arrizo 5", "Arrizo 6", "Omoda 5", "EQ1"],
};
