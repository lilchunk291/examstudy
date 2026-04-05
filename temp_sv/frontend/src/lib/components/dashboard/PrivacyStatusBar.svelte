<script lang="ts">
    import { Shield, Lock } from "lucide-svelte";

    // Can be extended to reflect real privacy state
    export let status: "protected" | "partial" | "exposed" = "protected";

    const config = {
        protected: {
            label: "Privacy Protected",
            color: "#4ade80",
            bg: "rgba(74,222,128,0.07)",
            border: "rgba(74,222,128,0.18)",
            pulse: "rgba(74,222,128,0.4)",
        },
        partial: {
            label: "Partial Protection",
            color: "#f59e0b",
            bg: "rgba(245,158,11,0.07)",
            border: "rgba(245,158,11,0.18)",
            pulse: "rgba(245,158,11,0.4)",
        },
        exposed: {
            label: "Not Protected",
            color: "#f87171",
            bg: "rgba(248,113,113,0.07)",
            border: "rgba(248,113,113,0.18)",
            pulse: "rgba(248,113,113,0.4)",
        },
    };

    $: c = config[status];
</script>

<div class="bar" style="background:{c.bg}; border-color:{c.border};">
    <!-- Pulse dot -->
    <span class="pulse-wrap">
        <span class="pulse-ring" style="background:{c.pulse}" />
        <span class="pulse-dot" style="background:{c.color}" />
    </span>

    <!-- Icons -->
    <span class="icons" style="color:{c.color}">
        <Shield size={12} strokeWidth={2} />
        <Lock size={10} strokeWidth={2.5} />
    </span>

    <!-- Label -->
    <span class="label" style="color:{c.color}">{c.label}</span>
</div>

<style>
    @import url("https://fonts.googleapis.com/css2?family=Geist:wght@500;600&display=swap");

    .bar {
        font-family: "Geist", system-ui, sans-serif;
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 5px 10px 5px 8px;
        border-radius: 8px;
        border: 1px solid transparent;
        transition:
            background 300ms ease,
            border-color 300ms ease;
        white-space: nowrap;
    }

    /* ── Pulse ── */
    .pulse-wrap {
        position: relative;
        width: 8px;
        height: 8px;
        flex-shrink: 0;
    }

    .pulse-dot {
        position: absolute;
        inset: 0;
        border-radius: 50%;
        transition: background 300ms ease;
    }

    .pulse-ring {
        position: absolute;
        inset: -3px;
        border-radius: 50%;
        opacity: 0;
        animation: pulse 2.4s ease-out infinite;
        transition: background 300ms ease;
    }

    /* ── Icons ── */
    .icons {
        display: flex;
        align-items: center;
        gap: 3px;
        transition: color 300ms ease;
    }

    /* ── Label ── */
    .label {
        font-size: 11px;
        font-weight: 600;
        letter-spacing: 0.02em;
        transition: color 300ms ease;
    }

    @keyframes pulse {
        0% {
            transform: scale(1);
            opacity: 0.6;
        }
        70% {
            transform: scale(2.2);
            opacity: 0;
        }
        100% {
            transform: scale(2.2);
            opacity: 0;
        }
    }
</style>
