import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";

interface ProfileData {
    displayName: string;
    salonName: string;
    whatsapp: string;
    logoUrl?: string; // Optional because it might not be set
    address?: string; // Optional
}

interface ProfileContextType {
    profile: ProfileData;
    updateProfile: (data: Partial<ProfileData>) => void;
    refreshProfile: () => Promise<void>;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export function ProfileProvider({ children }: { children: ReactNode }) {
    const [profile, setProfile] = useState<ProfileData>({
        displayName: "",
        salonName: "",
        whatsapp: "",
        logoUrl: "",
        address: "",
    });

    const loadProfile = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            const { data, error } = await supabase
                .from("profiles")
                .select("display_name, salon_name, whatsapp, address, logo_url")
                .eq("id", user.id)
                .single();

            if (data && !error) {
                setProfile(prev => ({
                    ...prev,
                    displayName: data.display_name || "",
                    salonName: data.salon_name || "",
                    whatsapp: data.whatsapp || "",
                    address: data.address || "",
                    logoUrl: data.logo_url || "",
                }));
            }
        }
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
        <ProfileContext.Provider value={{ profile, updateProfile, refreshProfile }}>
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
