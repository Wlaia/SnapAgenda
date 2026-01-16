
import { useProfile } from "@/contexts/ProfileContext";
import { Navigate } from "react-router-dom";
import { Loader2 } from "lucide-react";

interface SubscriptionGuardProps {
    children: React.ReactNode;
}

export const SubscriptionGuard = ({ children }: SubscriptionGuardProps) => {
    const { profile, isLoading } = useProfile();

    if (isLoading) {
        return (
            <div className="h-screen w-full flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    // Admin bypass
    if (profile.isAdmin) {
        return <>{children}</>;
    }

    // Active subscription bypass
    if (profile.subscriptionStatus === 'active') {
        return <>{children}</>;
    }

    // Check Trial Expired
    const isTrialExpired =
        profile.subscriptionStatus === 'trial' &&
        profile.trialEndsAt &&
        new Date() > new Date(profile.trialEndsAt);

    // Check Cancelled/Past Due
    const isBlockedStatus = profile.subscriptionStatus === 'cancelled' || profile.subscriptionStatus === 'past_due';

    if (isTrialExpired || isBlockedStatus) {
        return <Navigate to="/payment-required" replace />;
    }

    return <>{children}</>;
};
