import { useEffect, useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Users, Building2, BookOpen, ClipboardList } from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────

interface StatData {
  totalUsers: number;
  newUsersThisMonth: number;
  activeDepartments: number;
  totalCourses: number;
  newCoursesThisSemester: number;
  pendingODRequests: number;
}

// ─── Animated counter hook ───────────────────────────────────────────────────

function useCountUp(target: number, duration = 900) {
  const [display, setDisplay] = useState(0);
  const rafRef = useRef<number | null>(null);
  const startRef = useRef<number | null>(null);
  const fromRef = useRef(0);

  useEffect(() => {
    if (target === display) return;
    fromRef.current = display;
    startRef.current = null;

    const step = (ts: number) => {
      if (!startRef.current) startRef.current = ts;
      const elapsed = ts - startRef.current;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(fromRef.current + (target - fromRef.current) * eased));
      if (progress < 1) rafRef.current = requestAnimationFrame(step);
    };

    rafRef.current = requestAnimationFrame(step);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [target]); // eslint-disable-line react-hooks/exhaustive-deps

  return display;
}

// ─── Semester boundary helper ────────────────────────────────────────────────

function getSemesterStart(): string {
  const now = new Date();
  const month = now.getMonth(); // 0-based
  // Semester 1: June–Nov, Semester 2: Dec–May
  const semStart = month >= 5 && month <= 10
    ? new Date(now.getFullYear(), 5, 1)   // 1 Jun
    : month >= 11
      ? new Date(now.getFullYear(), 11, 1) // 1 Dec
      : new Date(now.getFullYear() - 1, 11, 1); // 1 Dec prev year
  return semStart.toISOString();
}

function getMonthStart(): string {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
}

// ─── Data fetching ───────────────────────────────────────────────────────────

async function fetchStats(): Promise<StatData> {
  const [
    { count: totalUsers },
    { count: newUsersThisMonth },
    { count: activeDepartments },
    { count: totalCourses },
    { count: newCoursesThisSemester },
    { count: pendingODRequests },
  ] = await Promise.all([
    supabase.from("profiles").select("*", { count: "exact", head: true }),
    supabase
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .gte("created_at", getMonthStart()),
    supabase.from("departments").select("*", { count: "exact", head: true }),
    supabase.from("courses").select("*", { count: "exact", head: true }),
    supabase
      .from("courses")
      .select("*", { count: "exact", head: true })
      .gte("created_at", getSemesterStart()),
    supabase
      .from("od_requests")
      .select("*", { count: "exact", head: true })
      .eq("status", "pending"),
  ]);

  return {
    totalUsers: totalUsers ?? 0,
    newUsersThisMonth: newUsersThisMonth ?? 0,
    activeDepartments: activeDepartments ?? 0,
    totalCourses: totalCourses ?? 0,
    newCoursesThisSemester: newCoursesThisSemester ?? 0,
    pendingODRequests: pendingODRequests ?? 0,
  };
}

// ─── Individual stat card ─────────────────────────────────────────────────────

interface CardProps {
  icon: React.ReactNode;
  label: string;
  value: number;
  sub: string;
  urgent?: boolean;
  loading: boolean;
}

function StatCard({ icon, label, value, sub, urgent = false, loading }: CardProps) {
  const animated = useCountUp(loading ? 0 : value);

  return (
    <div
      className={`
        relative flex flex-col gap-3 rounded-2xl border bg-card p-5
        transition-all duration-300 hover:shadow-md hover:-translate-y-0.5
        ${urgent && value > 0
          ? "border-destructive/40 bg-destructive/5 ring-1 ring-destructive/20"
          : "border-border"
        }
      `}
    >
      {/* Pulse dot for urgent + non-zero */}
      {urgent && value > 0 && (
        <span className="absolute right-4 top-4 flex h-2.5 w-2.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-destructive opacity-60" />
          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-destructive" />
        </span>
      )}

      {/* Icon */}
      <div
        className={`
          flex h-10 w-10 items-center justify-center rounded-xl
          ${urgent && value > 0
            ? "bg-destructive/10 text-destructive"
            : "bg-muted text-muted-foreground"
          }
        `}
      >
        {icon}
      </div>

      {/* Value */}
      <div>
        {loading ? (
          <div className="h-9 w-24 animate-pulse rounded-lg bg-muted" />
        ) : (
          <p
            className={`text-4xl font-semibold tracking-tight tabular-nums
              ${urgent && value > 0 ? "text-destructive" : "text-foreground"}
            `}
          >
            {animated.toLocaleString()}
          </p>
        )}
        <p className="mt-0.5 text-sm font-medium text-foreground/80">{label}</p>
      </div>

      {/* Sub-label */}
      {loading ? (
        <div className="h-4 w-32 animate-pulse rounded bg-muted" />
      ) : (
        <p
          className={`text-xs font-medium
            ${urgent && value > 0
              ? "text-destructive"
              : "text-muted-foreground"
            }
          `}
        >
          {sub}
        </p>
      )}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function QuickStats() {
  const [stats, setStats] = useState<StatData | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const load = async () => {
    try {
      const data = await fetchStats();
      setStats(data);
      setLastUpdated(new Date());
    } catch (err) {
      console.error("QuickStats fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();

    // ── Real-time: re-fetch whenever od_requests changes ──────────────────
    const odChannel = supabase
      .channel("od-requests-stats")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "od_requests" },
        () => load()
      )
      .subscribe();

    // ── Real-time: re-fetch when profiles / courses / departments change ──
    const generalChannel = supabase
      .channel("stats-general")
      .on("postgres_changes", { event: "*", schema: "public", table: "profiles" }, () => load())
      .on("postgres_changes", { event: "*", schema: "public", table: "courses" }, () => load())
      .on("postgres_changes", { event: "*", schema: "public", table: "departments" }, () => load())
      .subscribe();

    return () => {
      supabase.removeChannel(odChannel);
      supabase.removeChannel(generalChannel);
    };
  }, []);

  const s = stats;

  const cards: CardProps[] = [
    {
      icon: <Users size={20} />,
      label: "Total Users",
      value: s?.totalUsers ?? 0,
      sub: s ? `+${s.newUsersThisMonth} this month` : "",
      loading,
    },
    {
      icon: <Building2 size={20} />,
      label: "Active Departments",
      value: s?.activeDepartments ?? 0,
      sub: "All active",
      loading,
    },
    {
      icon: <BookOpen size={20} />,
      label: "Total Courses",
      value: s?.totalCourses ?? 0,
      sub: s ? `+${s.newCoursesThisSemester} new this semester` : "",
      loading,
    },
    {
      icon: <ClipboardList size={20} />,
      label: "Pending OD Requests",
      value: s?.pendingODRequests ?? 0,
      sub: s?.pendingODRequests
        ? "Requires immediate action"
        : "No pending requests",
      urgent: true,
      loading,
    },
  ];

  return (
    <div className="space-y-3">
      {/* Header row */}
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-foreground">Quick Stats</h2>
        {lastUpdated && (
          <p className="text-xs text-muted-foreground">
            Live · updated {lastUpdated.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
          </p>
        )}
      </div>

      {/* Cards grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <StatCard key={card.label} {...card} />
        ))}
      </div>
    </div>
  );
}