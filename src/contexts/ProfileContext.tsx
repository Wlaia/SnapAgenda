import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";

interface ProfileData {
    id?: string;
    displayName: string;
    salonName: string;
    whatsapp: string;
    logoUrl?: string; // Optional because it might not be set
    address?: string; // Optional
    subscriptionStatus?: 'trial' | 'active' | 'past_due' | 'cancelled';
    trialEndsAt?: string;
    isAdmin?: boolean;
    lastPaymentDate?: string;
    settings?: any; // Added settings
}

interface ProfileContextType {
    profile: ProfileData;
    updateProfile: (data: Partial<ProfileData>) => void;
    refreshProfile: () => Promise<void>;
    isLoading: boolean;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export function ProfileProvider({ children }: { children: ReactNode }) {
    const [isLoading, setIsLoading] = useState(true);
    const [profile, setProfile] = useState<ProfileData>({
        id: undefined,
        displayName: "",
        salonName: "",
        whatsapp: "",
        logoUrl: "",
        address: "",
        subscriptionStatus: 'trial',
        isAdmin: false,
        settings: {}
    });

    const loadProfile = async () => {
        setIsLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            const { data, error } = await supabase
                .from("profiles")
                .select("display_name, salon_name, whatsapp, address, logo_url, subscription_status, trial_ends_at, is_admin, last_payment_date, settings")
                .eq("id", user.id)
                .single();

            if (data && !error) {
                setProfile(prev => ({
                    ...prev,
                    id: user.id,
                    displayName: data.display_name || "",
                    salonName: data.salon_name || "",
                    whatsapp: data.whatsapp || "",
                    address: data.address || "",
                    logoUrl: data.logo_url || "",
                    subscriptionStatus: data.subscription_status as any || 'trial',
                    trialEndsAt: data.trial_ends_at || "",
                    isAdmin: data.is_admin || false,
                    lastPaymentDate: data.last_payment_date || "",
                    settings: data.settings || {}
                }));
            }
        }
        setIsLoading(false);
    };

    useEffect(() => {
        loadProfile();
    }, []);

    const updateProfile = (data: Partial<ProfileData>) => {
        setProfile((prev) => ({ ...prev, ...data }));
    };

    const refreshProfile = async () => {
        await loadProfile();
    };

    return (
        <ProfileContext.Provider value={{ profile, updateProfile, refreshProfile, isLoading }}>
            {children}
        </ProfileContext.Provider>
    );
}

export function useProfile() {
    const context = useContext(ProfileContext);
    if (!context) {
        throw new Error("useProfile must be used within ProfileProvider");
    }
    return context;
}
