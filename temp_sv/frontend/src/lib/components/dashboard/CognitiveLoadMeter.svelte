<script lang="ts">
    import { onMount, onDestroy } from "svelte";
    import { user } from "$lib/stores/auth";
    import { Brain, TrendingUp, TrendingDown, Minus } from "lucide-svelte";

    export let level = 0;
    export let userProfile = null;

    let loading = true;
    let error = false;
    let mounted = false;
    let pollInterval: ReturnType<typeof setInterval>;

    // ── Derived ────────────────────────────────────────────
    $: color = level > 80 ? "#f87171" : level > 60 ? "#f59e0b" : "#a3e635";

    $: glow =
        level > 80
            ? "rgba(248,113,113,0.2)"
            : level > 60
              ? "rgba(245,158,11,0.2)"
              : "rgba(163,230,53,0.2)";

    $: label = level > 80 ? "High" : level > 60 ? "Moderate" : "Low";

    $: message =
        level > 80
            ? "Take a break soon — you're overloaded"
            : level > 60
              ? "Consider a short break to reset focus"
              : "Optimal zone — great time to study";

    $: TrendIcon = level > 80 ? TrendingUp : level > 60 ? Minus : TrendingDown;

    // ── Arc math ───────────────────────────────────────────
    const R = 54;
    const CX = 70;
    const CY = 70;
    const CIRCUMFERENCE = 2 * Math.PI * R;

    // FIX: declare `loaded` before the reactive statements that depend on it
    $: loaded = !loading;
    $: fillLength = loaded ? (level / 100) * CIRCUMFERENCE : 0;
    $: dashArray = `${fillLength} ${CIRCUMFERENCE}`;

    // ── Fetch ──────────────────────────────────────────────
    async function fetchLoad() {
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

            const data = await res.json();
            const val =
                data.cognitive_load ??
                data.cognitive_load_pct ??
                data.load ??
                null;
            if (val !== null) level = Number(val);
            error = false;
        } catch (e) {
            console.error("Cognitive load fetch failed:", e);
            error = true;
            if (!level) level = 58; // fallback
        } finally {
            loading = false;
        }
    }

    // Use parent-passed profile if available
    $: if (userProfile?.cognitive_load != null) {
        level = userProfile.cognitive_load;
        loading = false;
    }

    onMount(async () => {
        await fetchLoad();
        mounted = true;
        pollInterval = setInterval(fetchLoad, 60_000);
    });

    onDestroy(() => clearInterval(pollInterval));
</script>

<div class="card" style="--color:{color}; --glow:{glow}">
    <!-- Header -->
    <div class="card-header">
        <div class="header-left">
            <div class="header-icon">
                <Brain size={13} strokeWidth={2} />
            </div>
            <span class="header-title">Cognitive Load</span>
        </div>
        <div class="trend-icon" style="color:{color}">
            <svelte:component this={TrendIcon} size={14} strokeWidth={2} />
        </div>
    </div>

    <!-- Gauge + value -->
    <div class="gauge-wrap">
        <svg viewBox="0 0 140 140" class="gauge-svg">
            <!-- Track -->
            <circle
                cx={CX}
                cy={CY}
                r={R}
                fill="none"
                stroke="rgba(255,255,255,0.06)"
                stroke-width="8"
            />
            <!-- Fill -->
            <circle
                cx={CX}
                cy={CY}
                r={R}
                fill="none"
                stroke={color}
                stroke-width="8"
                stroke-linecap="round"
                stroke-dasharray={dashArray}
                stroke-dashoffset="0"
                transform="rotate(-90 {CX} {CY})"
                style="filter: drop-shadow(0 0 6px {glow});
                       transition: stroke-dasharray 900ms cubic-bezier(0.22,1,0.36,1),
                                   stroke 400ms ease;"
            />
            <!-- Center value -->
            <text
                x={CX}
                y={CY - 6}
                text-anchor="middle"
                dominant-baseline="middle"
                class="gauge-value-text"
                fill={loading ? "rgba(255,255,255,0.15)" : "white"}
            >
                {loading ? "—" : `${level}%`}
            </text>
            <text
                x={CX}
                y={CY + 16}
                text-anchor="middle"
                dominant-baseline="middle"
                class="gauge-label-text"
                fill={color}
            >
                {loading ? "" : label}
            </text>
        </svg>
    </div>

    <!-- Message -->
    <div class="message-row" class:skeleton={loading}>
        {#if !loading}
            <div class="message-dot" style="background:{color}" />
            <span class="message-text">{message}</span>
        {:else}
            <div class="skel-line" />
        {/if}
    </div>

    <!-- Mini bar -->
    <div class="bar-track">
        <div
            class="bar-fill"
            style="width:{loaded ? level : 0}%;
                   background:{color};
                   box-shadow: 0 0 8px {glow};"
        />
    </div>

    {#if error}
        <p class="error-note">Could not sync — showing cached data</p>
    {/if}
</div>

<style>
    /* FIX: @import must be first in <style> */
    @import url("https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@700;800&family=Geist:wght@400;500;600&display=swap");

    .card {
        font-family: "Geist", system-ui, sans-serif;
        background: #0e0e10;
        border: 1px solid rgba(255, 255, 255, 0.07);
        border-radius: 12px;
        padding: 16px;
        display: flex;
        flex-direction: column;
        gap: 12px;
        transition:
            border-color 200ms ease,
            box-shadow 200ms ease;
    }

    .card:hover {
        border-color: var(--color);
        box-shadow:
            0 0 0 1px var(--color),
            0 8px 28px var(--glow);
    }

    /* ── Header ── */
    .card-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
    }

    .header-left {
        display: flex;
        align-items: center;
        gap: 8px;
    }

    .header-icon {
        width: 26px;
        height: 26px;
        border-radius: 7px;
        background: rgba(163, 230, 53, 0.1);
        color: #a3e635;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .header-title {
        font-size: 12px;
        font-weight: 600;
        color: rgba(255, 255, 255, 0.75);
        letter-spacing: 0.01em;
    }

    .trend-icon {
        display: flex;
        align-items: center;
        transition: color 400ms ease;
    }

    /* ── Gauge ── */
    .gauge-wrap {
        display: flex;
        justify-content: center;
        padding: 0 16px;
    }

    .gauge-svg {
        width: 140px;
        height: 140px;
    }

    .gauge-value-text {
        font-family: "Barlow Condensed", sans-serif;
        font-size: 28px;
        font-weight: 800;
        letter-spacing: -1px;
        transition: fill 400ms ease;
    }

    .gauge-label-text {
        font-family: "Geist", system-ui, sans-serif;
        font-size: 10px;
        font-weight: 600;
        letter-spacing: 0.1em;
        text-transform: uppercase;
        transition: fill 400ms ease;
    }

    /* ── Message ── */
    .message-row {
        display: flex;
        align-items: center;
        gap: 7px;
        min-height: 16px;
    }

    .message-dot {
        width: 5px;
        height: 5px;
        border-radius: 50%;
        flex-shrink: 0;
        transition: background 400ms ease;
    }

    .message-text {
        font-size: 11px;
        color: rgba(255, 255, 255, 0.45);
        line-height: 1.4;
    }

    /* ── Bar ── */
    .bar-track {
        height: 2px;
        background: rgba(255, 255, 255, 0.07);
        border-radius: 2px;
        overflow: hidden;
    }

    .bar-fill {
        height: 100%;
        border-radius: 2px;
        transition:
            width 900ms cubic-bezier(0.22, 1, 0.36, 1),
            background 400ms ease;
    }

    /* ── Skeleton ── */
    .message-row.skeleton {
        padding: 2px 0;
    }

    /* FIX: added proper shimmer gradient so the animation is actually visible */
    .skel-line {
        height: 8px;
        width: 80%;
        border-radius: 4px;
        background: linear-gradient(
            90deg,
            rgba(255, 255, 255, 0.06) 25%,
            rgba(255, 255, 255, 0.13) 50%,
            rgba(255, 255, 255, 0.06) 75%
        );
        background-size: 200% 100%;
        animation: shimmer 1.4s infinite;
    }

    /* ── Error ── */
    .error-note {
        font-size: 10px;
        color: #f87171;
        opacity: 0.6;
        margin: 0;
        text-align: right;
    }

    /* ── Keyframes ── */
    @keyframes shimmer {
        from {
            background-position: 200% 0;
        }
        to {
            background-position: -200% 0;
        }
    }
</style>
