<script lang="ts">
    import { onMount } from "svelte";
    import { user } from "$lib/stores/auth";

    export let userProfile = null;

    interface Stat {
        label: string;
        sublabel: string;
        value: string;
        raw: number;
        max: number;
        trend: string;
        trendUp: boolean;
        accent: string;
        glow: string;
    }

    let stats: Stat[] = [
        {
            label: "Sessions",
            sublabel: "Study Sessions",
            value: "—",
            raw: 0,
            max: 100,
            trend: "—",
            trendUp: true,
            accent: "#a3e635",
            glow: "rgba(163,230,53,0.15)",
        },
        {
            label: "Focus",
            sublabel: "Total Focus Time",
            value: "—",
            raw: 0,
            max: 200,
            trend: "—",
            trendUp: true,
            accent: "#38bdf8",
            glow: "rgba(56,189,248,0.15)",
        },
        {
            label: "Goal",
            sublabel: "Weekly Progress",
            value: "—",
            raw: 0,
            max: 100,
            trend: "—",
            trendUp: true,
            accent: "#f59e0b",
            glow: "rgba(245,158,11,0.15)",
        },
        {
            label: "Retention",
            sublabel: "Memory Retention",
            value: "—",
            raw: 0,
            max: 100,
            trend: "—",
            trendUp: true,
            accent: "#e879f9",
            glow: "rgba(232,121,249,0.15)",
        },
        {
            label: "Resilience",
            sublabel: "How well your prep holds under pressure",
            value: "—",
            raw: 0,
            max: 100,
            trend: "—",
            trendUp: true,
            accent: "#f97316",
            glow: "rgba(249,115,22,0.15)",
        },
    ];

    let loaded = false;

    function formatValue(key: string, val: number): string {
        if (key === "Focus") return val > 0 ? `${val}h` : "—";
        if (key === "Goal" || key === "Retention")
            return val > 0 ? `${val}%` : "—";
        return val > 0 ? String(val) : "—";
    }

    function getBarWidth(raw: number, max: number): number {
        if (!raw || !max) return 0;
        return Math.min((raw / max) * 100, 100);
    }

    onMount(async () => {
        // Pull from userProfile prop first
        if (userProfile) {
            applyProfile(userProfile);
            loaded = true;
            return;
        }

        // Otherwise fetch directly
        try {
            const currentUser = $user;
            if (!currentUser) {
                loaded = true;
                return;
            }

            const res = await fetch(
                `${import.meta.env.VITE_API_URL || "http://localhost:8000"}/api/students/stats`,
                {
                    headers: {
                        Authorization: `Bearer ${currentUser.session?.access_token}`,
                    },
                },
            );

            if (res.ok) {
                const data = await res.json();
                applyProfile(data);
            }
        } catch (e) {
            console.error("Stats fetch failed:", e);
        } finally {
            loaded = true;
        }
    });

    // Watch userProfile prop reactively
    $: if (userProfile) applyProfile(userProfile);

    function applyProfile(data: any) {
        stats = [
            {
                label: "Sessions",
                sublabel: "Study Sessions",
                value: formatValue(
                    "Sessions",
                    data.total_sessions ?? data.study_sessions ?? 0,
                ),
                raw: data.total_sessions ?? data.study_sessions ?? 0,
                max: 100,
                trend: data.sessions_trend ?? "0%",
                trendUp: true,
                accent: "#a3e635",
                glow: "rgba(163,230,53,0.15)",
            },
            {
                label: "Focus",
                sublabel: "Total Focus Time",
                value: formatValue(
                    "Focus",
                    data.focus_hours ?? data.total_focus_hours ?? 0,
                ),
                raw: data.focus_hours ?? data.total_focus_hours ?? 0,
                max: 200,
                trend: data.focus_trend ?? "0%",
                trendUp: true,
                accent: "#38bdf8",
                glow: "rgba(56,189,248,0.15)",
            },
            {
                label: "Goal",
                sublabel: "Weekly Progress",
                value: formatValue(
                    "Goal",
                    data.weekly_goal_pct ?? data.weekly_goal ?? 0,
                ),
                raw: data.weekly_goal_pct ?? data.weekly_goal ?? 0,
                max: 100,
                trend: data.goal_trend ?? "0%",
                trendUp: true,
                accent: "#f59e0b",
                glow: "rgba(245,158,11,0.15)",
            },
            {
                label: "Retention",
                sublabel: "Memory Retention",
                value: formatValue(
                    "Retention",
                    data.retention_rate ?? data.retention ?? 0,
                ),
                raw: data.retention_rate ?? data.retention ?? 0,
                max: 100,
                trend: data.retention_trend ?? "0%",
                trendUp: true,
                accent: "#e879f9",
                glow: "rgba(232,121,249,0.15)",
            },
        ];
    }
</script>

<div class="stats-row" class:loaded>
    {#each stats as stat, i}
        <div
            class="card"
            style="--accent:{stat.accent}; --glow:{stat.glow}; animation-delay:{i *
                70}ms"
        >
            <!-- Top row: label + trend -->
            <div class="card-top">
                <span class="card-sublabel">{stat.sublabel}</span>
                <span
                    class="card-trend"
                    class:up={stat.trendUp}
                    class:down={!stat.trendUp}
                >
                    {stat.trend}
                </span>
            </div>

            <!-- Big number -->
            <div class="card-value">{stat.value}</div>

            <!-- Bold label -->
            <div class="card-label">{stat.label}</div>

            <!-- Progress bar -->
            <div class="bar-track">
                <div
                    class="bar-fill"
                    style="width:{loaded
                        ? getBarWidth(stat.raw, stat.max)
                        : 0}%"
                />
            </div>
        </div>
    {/each}
</div>

<style>
    @import url("https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@500;700;800;900&family=Geist:wght@400;500;600&display=swap");

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
        padding: 18px 18px 14px;
        display: flex;
        flex-direction: column;
        gap: 2px;
        overflow: hidden;
        opacity: 0;
        transform: translateY(10px);
        animation: rise 320ms cubic-bezier(0.22, 1, 0.36, 1) forwards;
        cursor: default;
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
            0 8px 32px var(--glow);
    }

    .card:hover::before {
        opacity: 1;
    }

    /* ── Top row ── */
    .card-top {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 10px;
    }

    .card-sublabel {
        font-family: "Geist", system-ui, sans-serif;
        font-size: 10px;
        font-weight: 500;
        letter-spacing: 0.05em;
        text-transform: uppercase;
        color: rgba(255, 255, 255, 0.28);
    }

    .card-trend {
        font-family: "Geist", system-ui, sans-serif;
        font-size: 11px;
        font-weight: 700;
        letter-spacing: 0.02em;
    }

    .card-trend.up {
        color: #a3e635;
    }
    .card-trend.down {
        color: #f87171;
    }

    /* ── Value ── */
    .card-value {
        font-family: "Barlow Condensed", sans-serif;
        font-size: 52px;
        font-weight: 800;
        color: #fff;
        line-height: 1;
        letter-spacing: -1px;
        font-variant-numeric: tabular-nums;
        /* accent underline */
        background: linear-gradient(180deg, #fff 60%, var(--accent) 200%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
    }

    /* ── Label ── */
    .card-label {
        font-family: "Barlow Condensed", sans-serif;
        font-size: 13px;
        font-weight: 700;
        letter-spacing: 0.15em;
        text-transform: uppercase;
        color: var(--accent);
        margin-bottom: 12px;
        opacity: 0.7;
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
        transition: width 900ms cubic-bezier(0.22, 1, 0.36, 1);
        box-shadow: 0 0 8px var(--accent);
    }

    /* ── Animation ── */
    @keyframes rise {
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }

    /* ── Responsive ── */
    @media (max-width: 860px) {
        .stats-row {
            grid-template-columns: repeat(2, 1fr);
        }
    }

    @media (max-width: 480px) {
        .stats-row {
            grid-template-columns: 1fr 1fr;
            gap: 8px;
        }

        .card-value {
            font-size: 40px;
        }
    }
</style>
