import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export function useBirthdays() {
    const [birthdaysToday, setBirthdaysToday] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkBirthdays = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                setLoading(false);
                return;
            }

            const { data, error } = await supabase
                .from("clients")
                .select("id, name, birth_date, phone")
                .eq("user_id", user.id)
                .not("birth_date", "is", null);

            if (data) {
                const today = new Date();
                const todayMonth = today.getMonth();
                const todayDay = today.getDate();

                const matches = data.filter(client => {
                    if (!client.birth_date) return false;
                    const [year, month, day] = client.birth_date.split('-').map(Number);
                    // Month is 1-based in string, 0-based in JS month check
                    return (month - 1) === todayMonth && day === todayDay;
                });
                setBirthdaysToday(matches);
            }
            setLoading(false);
        };

        checkBirthdays();
    }, []);

    return { birthdaysToday, loading };
}
