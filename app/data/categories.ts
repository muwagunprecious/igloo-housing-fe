import {
    Home,
    Building,
    Building2,
    BedSingle,
    BedDouble,
    Hotel,
    Users,
    DoorOpen,
    LayoutGrid,
} from "lucide-react";

export const categories = [
    { label: "All", icon: LayoutGrid },
    { label: "Self-contained", icon: Home },
    { label: "Room and Parlour", icon: DoorOpen },
    { label: "Mini Flat", icon: Building },
    { label: "1 Bedroom", icon: BedSingle },
    { label: "2 Bedrooms", icon: BedDouble },
    { label: "3+ Bedrooms", icon: Building2 },
    { label: "Hostel", icon: Hotel },
    { label: "Shared Apartment", icon: Users },
];