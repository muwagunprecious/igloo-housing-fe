import {
    Home,
    Star,
    MapPin,
    Users,
    Wallet,
    LayoutGrid,
} from "lucide-react";

export const categories = [
    { label: "All", icon: LayoutGrid },
    { label: "Self-contained", icon: Home },
    { label: "Luxury", icon: Star },
    { label: "Near Campus", icon: MapPin },
    // { label: "Shared", icon: Users },       // future-proof — add to DB when ready
    // { label: "Budget", icon: Wallet },      // future-proof — add to DB when ready
];