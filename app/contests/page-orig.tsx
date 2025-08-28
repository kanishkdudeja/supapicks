"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function TestContestsPage() {
  const [contests, setContests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchContests() {
    const supabase = createClient();
      const { data, error } = await supabase.from("contests").select("*");
      if (error) {
        console.error("Error fetching contests:", error);
      } else {
        setContests(data || []);
      }
      setLoading(false);
    }
    fetchContests();
  }, []);

  if (loading) return <p>Loading contests...</p>;

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold">Contests</h1>
      <ul className="list-disc pl-6">
        {contests.map((contest) => (
          <li key={contest.id}>
            {contest.name} — Starts: {new Date(contest.start_time).toLocaleString()}
          </li>
        ))}
      </ul>
    </div>
  );
}
