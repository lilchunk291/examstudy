<script lang="ts">
    import { onMount, onDestroy } from "svelte";
    import { user } from "$lib/stores/auth";
    import { BookOpen, Clock, Target, TrendingUp } from "lucide-svelte";

    export let userProfile = null;

    // ── Types ──────────────────────────────────────────────
    interface StatsResponse {
        total_sessions?: number;
        study_sessions?: number;
        focus_hours?: number;
        total_focus_hours?: number;
        weekly_goal_pct?: number;
        weekly_goal?: number;
        retention_rate?: number;
        retention?: number;
        sessions_trend?: string;
        focus_trend?: string;
        goal_trend?: string;
        retention_trend?: string;
    }

    interface StatCard {
        key: string;
        label: string;
        sublabel: string;
        value: string;
        raw: number;
        max: number;
        trend: string;
        trendUp: boolean;
        accent: string;
        glow: string;
        icon: any;
    }

    // ── State ──────────────────────────────────────────────
    let stats: StatCard[] = buildStats(null);
    let loading = true;
    let error = false;
    let pollInterval: ReturnType<typeof setInterval>;

    // ── Helpers ────────────────────────────────────────────
    function formatValue(key: string, val: number): string {
        if (!val && val !== 0) return "—";
        if (key === "focus") return `${val}h`;
        if (key === "goal") return `${val}%`;
        if (key === "retention") return `${val}%`;
        return String(val);
    }

    function parseTrend(t: string | undefined): boolean {
        return !t || t.startsWith("+");
    }

    function buildStats(data: StatsResponse | null): StatCard[] {
        const d = data ?? {};
        return [
            {
                key: "sessions",
                label: "Sessions",
                sublabel: "Study Sessions",
                value: formatValue(
                    "sessions",
                    d.total_sessions ?? d.study_sessions ?? 0,
                ),
                raw: d.total_sessions ?? d.study_sessions ?? 0,
                max: 100,
                trend: d.sessions_trend ?? "—",
                trendUp: parseTrend(d.sessions_trend),
                accent: "#a3e635",
                glow: "rgba(163,230,53,0.15)",
                icon: BookOpen,
            },
            {
                key: "focus",
                label: "Focus",
                sublabel: "Total Focus Time",
                value: formatValue(
                    "focus",
                    d.focus_hours ?? d.total_focus_hours ?? 0,
                ),
                raw: d.focus_hours ?? d.total_focus_hours ?? 0,
                max: 200,
                trend: d.focus_trend ?? "—",
                trendUp: parseTrend(d.focus_trend),
                accent: "#38bdf8",
                glow: "rgba(56,189,248,0.15)",
                icon: Clock,
            },
            {
                key: "goal",
                label: "Goal",
                sublabel: "Weekly Progress",
                value: formatValue(
                    "goal",
                    d.weekly_goal_pct ?? d.weekly_goal ?? 0,
                ),
                raw: d.weekly_goal_pct ?? d.weekly_goal ?? 0,
                max: 100,
                trend: d.goal_trend ?? "—",
                trendUp: parseTrend(d.goal_trend),
                accent: "#f59e0b",
                glow: "rgba(245,158,11,0.15)",
                icon: Target,
            },
            {
                key: "retention",
                label: "Retention",
                sublabel: "Memory Retention",
                value: formatValue(
                    "retention",
                    d.retention_rate ?? d.retention ?? 0,
                ),
                raw: d.retention_rate ?? d.retention ?? 0,
                max: 100,
                trend: d.retention_trend ?? "—",
                trendUp: parseTrend(d.retention_trend),
                accent: "#e879f9",
                glow: "rgba(232,121,249,0.15)",
                icon: TrendingUp,
            },
        ];
    }

    async function fetchStats() {
        const currentUser = $user;
        if (!currentUser?.session?.access_token) return;

        try {
            const res = await fetch(
                `${import.meta.env.VITE_API_URL || "http://localhost:8000"}/api/students/stats`,
                {
                    headers: {
                        Authorization: `Bearer ${currentUser.session.access_token}`,
                    },
                },
            );

            if (!res.ok) throw new Error(`HTTP ${res.status}`);

            const data: StatsResponse = await res.json();
            stats = buildStats(data);
            error = false;
        } catch (e) {
            console.error("Stats fetch failed:", e);
            error = true;
        } finally {
            loading = false;
        }
    }

    // If parent passes userProfile with stats embedded, use it
    $: if (userProfile) {
        stats = buildStats(userProfile);
        loading = false;
    }

    onMount(async () => {
        await fetchStats();
        // Poll every 60 seconds for live updates
        pollInterval = setInterval(fetchStats, 60_000);
    });

    onDestroy(() => {
        clearInterval(pollInterval);
    });

    function barWidth(raw: number, max: number): number {
        if (!raw || !max) return 0;
        return Math.min((raw / max) * 100, 100);
    }
</script>

<div class="stats-row" class:loaded={!loading}>
    {#each stats as stat, i}
        <div
            class="card"
            style="--accent:{stat.accent}; --glow:{stat.glow}; animation-delay:{i *
                70}ms"
        >
            <!-- Loading shimmer overlay -->
            {#if loading}
                <div class="shimmer" />
            {/if}

            <!-- Top: sublabel + trend -->
            <div class="card-top">
                <div class="icon-wrap">
                    <stat.icon size={13} strokeWidth={2} />
                </div>
                <span
                    class="trend"
                    class:up={stat.trendUp}
                    class:down={!stat.trendUp}
                    class:empty={stat.trend === "—"}
                >
                    {stat.trend}
                </span>
            </div>

            <!-- Value -->
            <div class="card-value" class:skeleton={loading}>
                {stat.value}
            </div>

            <!-- Labels -->
            <div class="card-label">{stat.label}</div>
            <div class="card-sublabel">{stat.sublabel}</div>

            <!-- Progress bar -->
            <div class="bar-track">
                <div
                    class="bar-fill"
                    style="width:{!loading ? barWidth(stat.raw, stat.max) : 0}%"
                />
            </div>
        </div>
    {/each}
</div>

<!-- Error state -->
{#if error}
    <p class="error-msg">Could not load stats — retrying in 60s</p>
{/if}

<style>
    @import url("https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@700;800;900&family=Geist:wght@400;500;600&display=swap");

    /* ── Grid ── */
    .stats-row {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 10px;
    }

    /* ── Card ── */
    .card {
        position: relative;
        background: #0e0e10;
        border: 1px solid rgba(255, 255, 255, 0.07);
        border-radius: 12px;
        padding: 16px 16px 14px;
        display: flex;
        flex-direction: column;
        gap: 2px;
        overflow: hidden;
        opacity: 0;
        transform: translateY(10px);
        animation: rise 320ms cubic-bezier(0.22, 1, 0.36, 1) forwards;
        transition:
            border-color 200ms ease,
            box-shadow 200ms ease;
    }

    .card::before {
        content: "";
        position: absolute;
        inset: 0;
        background: radial-gradient(
            ellipse at top left,
            var(--glow),
            transparent 65%
        );
        opacity: 0;
        transition: opacity 250ms ease;
        pointer-events: none;
    }

    .card:hover {
        border-color: var(--accent);
        box-shadow:
            0 0 0 1px var(--accent),
            0 8px 28px var(--glow);
    }

    .card:hover::before {
        opacity: 1;
    }

    /* ── Shimmer (loading) ── */
    .shimmer {
        position: absolute;
        inset: 0;
        background: linear-gradient(
            90deg,
            transparent 0%,
            rgba(255, 255, 255, 0.04) 50%,
            transparent 100%
        );
        background-size: 200% 100%;
        animation: shimmer 1.4s infinite;
        pointer-events: none;
        z-index: 1;
    }

    /* ── Top row ── */
    .card-top {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 10px;
    }

    .icon-wrap {
        width: 26px;
        height: 26px;
        border-radius: 7px;
        background: rgba(255, 255, 255, 0.05);
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--accent);
    }

    .trend {
        font-family: "Geist", system-ui, sans-serif;
        font-size: 11px;
        font-weight: 700;
        letter-spacing: 0.02em;
    }

    .trend.up {
        color: #a3e635;
    }
    .trend.down {
        color: #f87171;
    }
    .trend.empty {
        color: rgba(255, 255, 255, 0.2);
    }

    /* ── Value ── */
    .card-value {
        font-family: "Barlow Condensed", sans-serif;
        font-size: 50px;
        font-weight: 800;
        line-height: 1;
        letter-spacing: -1px;
        font-variant-numeric: tabular-nums;
        background: linear-gradient(175deg, #fff 50%, var(--accent) 160%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
        transition: opacity 300ms ease;
    }

    .card-value.skeleton {
        opacity: 0.2;
    }

    /* ── Labels ── */
    .card-label {
        font-family: "Barlow Condensed", sans-serif;
        font-size: 13px;
        font-weight: 700;
        letter-spacing: 0.15em;
        text-transform: uppercase;
        color: var(--accent);
        opacity: 0.65;
    }

    .card-sublabel {
        font-family: "Geist", system-ui, sans-serif;
        font-size: 10px;
        font-weight: 500;
        letter-spacing: 0.04em;
        color: rgba(255, 255, 255, 0.25);
        margin-bottom: 10px;
    }

    /* ── Progress bar ── */
    .bar-track {
        height: 2px;
        background: rgba(255, 255, 255, 0.07);
        border-radius: 2px;
        overflow: hidden;
    }

    .bar-fill {
        height: 100%;
        background: var(--accent);
        border-radius: 2px;
        box-shadow: 0 0 6px var(--accent);
        transition: width 900ms cubic-bezier(0.22, 1, 0.36, 1);
    }

    /* ── Error ── */
    .error-msg {
        font-family: "Geist", system-ui, sans-serif;
        font-size: 11px;
        color: #f87171;
        margin-top: 6px;
        opacity: 0.7;
    }

    /* ── Keyframes ── */
    @keyframes rise {
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }

    @keyframes shimmer {
        from {
            background-position: 200% 0;
        }
        to {
            background-position: -200% 0;
        }
    }

    /* ── Responsive ── */
    @media (max-width: 860px) {
        .stats-row {
            grid-template-columns: repeat(2, 1fr);
        }
    }

    @media (max-width: 480px) {
        .card-value {
            font-size: 40px;
        }
    }
</style>
