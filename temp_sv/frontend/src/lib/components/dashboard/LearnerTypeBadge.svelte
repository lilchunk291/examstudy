<script lang="ts">
    import { onMount, onDestroy } from "svelte";
    import { user } from "$lib/stores/auth";
    import {
        Eye,
        Brain,
        Zap,
        GitBranch,
        ArrowRight,
        Network,
        Layers,
    } from "lucide-svelte";

    export let type = "omni";
    export let vak = "visual";
    export let userProfile = null;

    let loading = true;
    let error = false;
    let pollInterval: ReturnType<typeof setInterval>;

    // ── Learning Style Models ──────────────────────────────

    const primaryTypes = {
        linear: {
            icon: ArrowRight,
            label: "Linear",
            tag: "Sequential Thinker",
            description:
                "You follow a structured, step-by-step path. Each concept builds directly on the last — no skipping ahead.",
            accent: "#38bdf8",
            glow: "rgba(56,189,248,0.15)",
            traits: ["Step-by-step", "Methodical", "Structured"],
        },
        relational: {
            icon: GitBranch,
            label: "Relational",
            tag: "Connector Thinker",
            description:
                "You anchor new knowledge to what you already know. Patterns, analogies and prior context drive your understanding.",
            accent: "#e879f9",
            glow: "rgba(232,121,249,0.15)",
            traits: ["Pattern-driven", "Contextual", "Associative"],
        },
        systemic: {
            icon: Network,
            label: "Systemic",
            tag: "Systems Thinker",
            description:
                "You combine linear and relational thinking strategically — switching modes based on what the task demands.",
            accent: "#f59e0b",
            glow: "rgba(245,158,11,0.15)",
            traits: ["Adaptive", "Efficient", "Dual-mode"],
        },
        omni: {
            icon: Layers,
            label: "Omni",
            tag: "Omnidirectional Learner",
            description:
                "You naturally use all learning strategies in parallel. Most people fall here — you adapt fluidly to any context.",
            accent: "#a3e635",
            glow: "rgba(163,230,53,0.15)",
            traits: ["Fluid", "Adaptive", "Multi-strategy"],
        },
    } as Record<string, any>;

    const vakTypes = {
        visual: {
            icon: Eye,
            label: "Visual",
            hint: "Diagrams, charts & colour-coding",
            accent: "#818cf8",
        },
        auditory: {
            icon: Brain,
            label: "Auditory",
            hint: "Discussion, podcasts & verbal recall",
            accent: "#fb923c",
        },
        kinesthetic: {
            icon: Zap,
            label: "Kinesthetic",
            hint: "Hands-on practice & real examples",
            accent: "#34d399",
        },
    } as Record<string, any>;

    $: primary = primaryTypes[type] ?? primaryTypes.omni;
    $: vakInfo = vakTypes[vak] ?? vakTypes.visual;

    // ── Real-time fetch ────────────────────────────────────
    async function fetchLearnerType() {
        const currentUser = $user;
        if (!currentUser?.session?.access_token) return;

        try {
            const res = await fetch(
                `${import.meta.env.VITE_API_URL || "http://localhost:8000"}/api/students/profile`,
                {
                    headers: {
                        Authorization: `Bearer ${currentUser.session.access_token}`,
                    },
                },
            );

            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const data = await res.json();

            type =
                data.learner_type ??
                data.learning_style ??
                data.primary_style ??
                "omni";
            vak = data.vak_style ?? data.vak ?? data.sensory_style ?? "visual";
            error = false;
        } catch (e) {
            console.error("Learner type fetch failed:", e);
            error = true;
        } finally {
            loading = false;
        }
    }

    $: if (userProfile) {
        type = userProfile.learner_type ?? userProfile.learning_style ?? type;
        vak = userProfile.vak_style ?? userProfile.vak ?? vak;
        loading = false;
    }

    onMount(async () => {
        await fetchLearnerType();
        pollInterval = setInterval(fetchLearnerType, 120_000);
    });

    onDestroy(() => clearInterval(pollInterval));
</script>

<div
    class="card"
    class:loading
    style="--accent:{primary.accent}; --glow:{primary.glow};"
>
    <!-- Header -->
    <div class="card-header">
        <div class="header-left">
            <div class="header-icon">
                <Layers size={13} strokeWidth={2} />
            </div>
            <span class="header-title">Learning Profile</span>
        </div>
        {#if !loading}
            <span class="profile-tag">{primary.tag}</span>
        {/if}
    </div>

    {#if loading}
        <!-- Skeleton -->
        <div class="skeleton-block">
            <div class="skel skel-icon" />
            <div class="skel skel-title" />
            <div class="skel skel-body" />
            <div class="skel skel-body short" />
        </div>
    {:else}
        <!-- Primary style -->
        <div class="primary-section">
            <div
                class="primary-icon-wrap"
                style="background:rgba(255,255,255,0.04); border:1px solid {primary.accent}30"
            >
                <svelte:component
                    this={primary.icon}
                    size={22}
                    strokeWidth={1.8}
                    color={primary.accent}
                />
            </div>
            <div class="primary-info">
                <div class="primary-label-row">
                    <span class="primary-label" style="color:{primary.accent}"
                        >{primary.label}</span
                    >
                    <span class="primary-model-hint">Primary Mode</span>
                </div>
                <p class="primary-desc">{primary.description}</p>
            </div>
        </div>

        <!-- Trait chips -->
        <div class="traits-row">
            {#each primary.traits as trait}
                <span
                    class="trait-chip"
                    style="color:{primary.accent}; background:{primary.glow}; border-color:{primary.accent}30"
                >
                    {trait}
                </span>
            {/each}
        </div>

        <!-- Divider -->
        <div class="divider" />

        <!-- VAK secondary -->
        <div class="vak-row">
            <span class="vak-heading">Sensory Channel</span>
            <div class="vak-right">
                <div
                    class="vak-icon"
                    style="color:{vakInfo.accent}; background:{vakInfo.accent}15"
                >
                    <svelte:component
                        this={vakInfo.icon}
                        size={12}
                        strokeWidth={2}
                    />
                </div>
                <div class="vak-info">
                    <span class="vak-label" style="color:{vakInfo.accent}"
                        >{vakInfo.label}</span
                    >
                    <span class="vak-hint">{vakInfo.hint}</span>
                </div>
            </div>
        </div>
    {/if}

    {#if error}
        <p class="error-note">Could not sync — showing cached profile</p>
    {/if}
</div>

<style>
    @import url("https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@600;700&family=Geist:wght@400;500;600&display=swap");

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

    .card:not(.loading):hover {
        border-color: var(--accent);
        box-shadow:
            0 0 0 1px var(--accent),
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
        flex-shrink: 0;
    }

    .header-title {
        font-size: 12px;
        font-weight: 600;
        color: rgba(255, 255, 255, 0.75);
    }

    .profile-tag {
        font-size: 9px;
        font-weight: 600;
        letter-spacing: 0.07em;
        text-transform: uppercase;
        color: var(--accent);
        background: var(--glow);
        padding: 3px 7px;
        border-radius: 4px;
        border: 1px solid color-mix(in srgb, var(--accent) 20%, transparent);
        white-space: nowrap;
    }

    /* ── Primary section ── */
    .primary-section {
        display: flex;
        align-items: flex-start;
        gap: 12px;
    }

    .primary-icon-wrap {
        width: 44px;
        height: 44px;
        border-radius: 10px;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
    }

    .primary-info {
        display: flex;
        flex-direction: column;
        gap: 4px;
        flex: 1;
        min-width: 0;
    }

    .primary-label-row {
        display: flex;
        align-items: center;
        gap: 8px;
    }

    .primary-label {
        font-family: "Barlow Condensed", sans-serif;
        font-size: 20px;
        font-weight: 700;
        letter-spacing: -0.3px;
        line-height: 1;
        transition: color 300ms ease;
    }

    .primary-model-hint {
        font-size: 9px;
        font-weight: 500;
        letter-spacing: 0.06em;
        text-transform: uppercase;
        color: rgba(255, 255, 255, 0.2);
    }

    .primary-desc {
        font-size: 11px;
        line-height: 1.5;
        color: rgba(255, 255, 255, 0.38);
        margin: 0;
    }

    /* ── Traits ── */
    .traits-row {
        display: flex;
        gap: 6px;
        flex-wrap: wrap;
    }

    .trait-chip {
        font-size: 10px;
        font-weight: 600;
        letter-spacing: 0.04em;
        padding: 3px 8px;
        border-radius: 5px;
        border: 1px solid transparent;
        transition:
            background 300ms ease,
            color 300ms ease;
    }

    /* ── Divider ── */
    .divider {
        height: 1px;
        background: rgba(255, 255, 255, 0.05);
    }

    /* ── VAK row ── */
    .vak-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
    }

    .vak-heading {
        font-size: 10px;
        font-weight: 500;
        letter-spacing: 0.05em;
        text-transform: uppercase;
        color: rgba(255, 255, 255, 0.2);
        white-space: nowrap;
    }

    .vak-right {
        display: flex;
        align-items: center;
        gap: 7px;
    }

    .vak-icon {
        width: 22px;
        height: 22px;
        border-radius: 5px;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
    }

    .vak-info {
        display: flex;
        flex-direction: column;
        gap: 1px;
        align-items: flex-end;
    }

    .vak-label {
        font-size: 11px;
        font-weight: 600;
        line-height: 1;
    }

    .vak-hint {
        font-size: 9px;
        color: rgba(255, 255, 255, 0.2);
        text-align: right;
    }

    /* ── Skeleton ── */
    .skeleton-block {
        display: flex;
        flex-direction: column;
        gap: 8px;
        padding: 4px 0;
    }

    .skel {
        border-radius: 5px;
        background: rgba(255, 255, 255, 0.06);
        background-size: 200% 100%;
        animation: shimmer 1.4s infinite;
    }

    .skel-icon {
        width: 44px;
        height: 44px;
        border-radius: 10px;
    }
    .skel-title {
        width: 50%;
        height: 10px;
    }
    .skel-body {
        width: 90%;
        height: 8px;
    }
    .skel-body.short {
        width: 70%;
    }

    /* ── Error ── */
    .error-note {
        font-size: 10px;
        color: #f87171;
        opacity: 0.6;
        margin: 0;
        text-align: right;
    }

    @keyframes shimmer {
        from {
            background-position: 200% 0;
        }
        to {
            background-position: -200% 0;
        }
    }
</style>
