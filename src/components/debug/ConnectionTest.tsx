
"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function ConnectionTest() {
    const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
    const [error, setError] = useState<string | null>(null);
    const [rowCount, setRowCount] = useState<number | null>(null);

    useEffect(() => {
        async function checkConnection() {
            try {
                console.log("Testing Supabase connection...");
                const { count, error } = await supabase
                    .from("projects")
                    .select("*", { count: "exact", head: true });

                if (error) {
                    throw error;
                }

                setStatus("success");
                setRowCount(count);
            } catch (err: any) {
                console.error("Supabase connection error:", err);
                setStatus("error");
                setError(err.message || "Unknown error");
            }
        }

        checkConnection();
    }, []);

    if (status === "loading") return <div className="p-2 text-xs bg-yellow-100 text-yellow-800 rounded">Checking DB...</div>;
    if (status === "error") return <div className="p-2 text-xs bg-red-100 text-red-800 rounded">❌ DB Error: {error}</div>;

    return (
        <div className="p-2 text-xs bg-green-100 text-green-800 rounded border border-green-200">
            ✅ DB Connected (Projects: {rowCount})
        </div>
    );
}
