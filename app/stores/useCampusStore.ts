import { create } from "zustand";

export type CampusId = "all" | "ibogun" | "sagamu" | "ago";

export interface CampusOption {
    id: CampusId;
    name: string;
    fullName: string;
    tag: string;
    location: string;
    landmarks: string;
    faculties: string;
}

export const CAMPUSES: CampusOption[] = [
    {
        id: "ago",
        name: "Ago Campus",
        fullName: "Ago-Iwoye Main Campus",
        tag: "Main Campus",
        location: "Ago-Iwoye, Ogun State",
        landmarks: "Ayegbami, Itamerin, Abudu, Pepsi Axis",
        faculties: "Arts, Law, Social Sciences, Science & Admin",
    },
    {
        id: "ibogun",
        name: "Ibogun Campus",
        fullName: "College of Engineering & Technology",
        tag: "Engineering & Tech",
        location: "Ibogun-Coker, Ogun State",
        landmarks: "Osungboye, Fashina, Daleville, Downtown",
        faculties: "Engineering, Computing & Applied Tech",
    },
    {
        id: "sagamu",
        name: "Sagamu Campus",
        fullName: "College of Health Sciences",
        tag: "Health Sciences",
        location: "Sagamu, Ogun State",
        landmarks: "OOUTH, GRA, Sabo, Remoland",
        faculties: "Medicine, Pharmacy, Nursing & Health",
    },
];

interface CampusStore {
    selectedCampus: CampusId | null;
    isModalOpen: boolean;
    hasChosen: boolean;
    setCampus: (campus: CampusId) => void;
    openCampusModal: () => void;
    closeCampusModal: () => void;
    initFromStorage: () => void;
}

const STORAGE_KEY = "igloo_mycampus_selection";

export const useCampusStore = create<CampusStore>((set) => ({
    selectedCampus: null,
    isModalOpen: false,
    hasChosen: false,

    initFromStorage: () => {
        if (typeof window === "undefined") return;
        const stored = localStorage.getItem(STORAGE_KEY) as CampusId | null;
        if (stored && (stored === "ago" || stored === "ibogun" || stored === "sagamu" || stored === "all")) {
            set({ selectedCampus: stored, hasChosen: true, isModalOpen: false });
        } else {
            // First time or no selection: open modal automatically!
            set({ selectedCampus: null, hasChosen: false, isModalOpen: true });
        }
    },

    setCampus: (campus: CampusId) => {
        if (typeof window !== "undefined") {
            localStorage.setItem(STORAGE_KEY, campus);
        }
        set({ selectedCampus: campus, hasChosen: true, isModalOpen: false });
    },

    openCampusModal: () => set({ isModalOpen: true }),
    closeCampusModal: () => set({ isModalOpen: false }),
}));

/**
 * Robust matcher to determine if a property belongs to a given campus
 */
export function propertyMatchesCampus(property: any, campusId: CampusId | null): boolean {
    if (!campusId || campusId === "all") return true;

    const textToSearch = [
        property.campus || "",
        property.location || "",
        property.address || "",
        property.title || "",
        property.description || "",
    ]
        .join(" ")
        .toLowerCase();

    if (campusId === "ibogun") {
        const ibogunKeywords = [
            "ibogun",
            "osungboye",
            "fashina",
            "daleville",
            "downtown",
            "engineering",
        ];
        return ibogunKeywords.some((keyword) => textToSearch.includes(keyword));
    }

    if (campusId === "ago") {
        const agoKeywords = [
            "ago",
            "ago-iwoye",
            "ago iwoye",
            "ayegbami",
            "itamerin",
            "abudu",
            "egbeda",
            "pepsi",
            "main campus",
            "deleko",
        ];
        return agoKeywords.some((keyword) => textToSearch.includes(keyword));
    }

    if (campusId === "sagamu") {
        const sagamuKeywords = ["sagamu", "shagamu", "health science", "chs"];
        return sagamuKeywords.some((keyword) => textToSearch.includes(keyword));
    }

    return true;
}
