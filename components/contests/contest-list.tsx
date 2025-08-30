import { createClient } from "@/lib/supabase/server";
import { User, getContestStatus } from "@/lib/types";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "lucide-react";
import { format } from "date-fns";
import Link from "next/link";

interface ContestListProps {
  user: User;
}

const fetchContests = async () => {
  const supabase = await createClient();

  try {
    const { data, error } = await supabase
      .from("contests")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;

    return data;
  } catch (error) {
    throw error;
  }
};

export async function ContestList({ user }: ContestListProps) {
  const contests = await fetchContests().catch((error) => {
    return null;
  });

  if (contests == null) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            An error occurred while fetching contests
          </h3>
        </div>
      </div>
    );
  }

  if (contests.length === 0) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            No contests yet
          </h3>
        </div>
      </div>
    );
  }

  const statusColorMap = {
    upcoming: "bg-blue-100 text-blue-800",
    active: "bg-green-100 text-green-800",
    ended: "bg-gray-100 text-gray-800",
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {contests.map((contest) => {
          const status = getContestStatus(contest);

          return (
            <Card
              key={contest.id}
              className={`hover:shadow-md transition-shadow`}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <Link
                      href={`/contests/${contest.id}`}
                      className="block hover:opacity-80 transition-opacity"
                    >
                      <CardTitle className="text-lg">{contest.name}</CardTitle>
                      <CardDescription className="mt-1">
                        {contest.description || "No description provided"}
                      </CardDescription>
                    </Link>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <Badge className={statusColorMap[status]}>
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="h-4 w-4 mr-2" />
                    <span>
                      {format(new Date(contest.start_time), "MMM d, yyyy")} -{" "}
                      {format(new Date(contest.end_time), "MMM d, yyyy")}
                    </span>
                  </div>

                  <div className="pt-2">
                    <Button asChild className="w-full">
                      <Link href={`/contests/${contest.id}`}>View Contest</Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
