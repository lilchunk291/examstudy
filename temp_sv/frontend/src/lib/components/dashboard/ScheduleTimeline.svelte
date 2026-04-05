<script lang="ts">
    import { onMount, onDestroy } from "svelte";
    import { goto } from "$app/navigation";
    import { user } from "$lib/stores/auth";
    import {
        Calendar,
        Clock,
        Plus,
        BookOpen,
        Brain,
        RotateCcw,
        Zap,
        ChevronLeft,
        ChevronRight,
    } from "lucide-svelte";

    // ── Types ──────────────────────────────────────────────
    interface ScheduleItem {
        id: string;
        time: string;
        subject: string;
        type: "study" | "deep-work" | "review" | "practice";
        duration: string;
        durationMinutes: number;
        status: "completed" | "in-progress" | "upcoming";
        difficulty?: "easy" | "medium" | "hard";
    }

    // ── Props ──────────────────────────────────────────────
    // FIX: declare the prop the dashboard passes in
    export let userProfile: any = null;

    // ── Config ─────────────────────────────────────────────
    const typeConfig: Record<
        string,
        { accent: string; glow: string; label: string; icon: any }
    > = {
        study: {
            accent: "#a3e635",
            glow: "rgba(163,230,53,0.15)",
            label: "Study",
            icon: BookOpen,
        },
        "deep-work": {
            accent: "#38bdf8",
            glow: "rgba(56,189,248,0.15)",
            label: "Deep Work",
            icon: Brain,
        },
        review: {
            accent: "#f59e0b",
            glow: "rgba(245,158,11,0.15)",
            label: "Review",
            icon: RotateCcw,
        },
        practice: {
            accent: "#e879f9",
            glow: "rgba(232,121,249,0.15)",
            label: "Practice",
            icon: Zap,
        },
    };

    const difficultyConfig: Record<string, { color: string; bg: string }> = {
        easy: { color: "#34d399", bg: "rgba(52,211,153,0.08)" },
        medium: { color: "#f59e0b", bg: "rgba(245,158,11,0.08)" },
        hard: { color: "#f87171", bg: "rgba(248,113,113,0.08)" },
    };

    // ── State ──────────────────────────────────────────────
    let schedule: ScheduleItem[] = [];
    let loading = true;
    let error = false;
    let mounted = false;
    let selectedDay = "today";
    let pollInterval: ReturnType<typeof setInterval>;
    let clockInterval: ReturnType<typeof setInterval>;

    // FIX: keep `now` live so isActive / isPast stay accurate
    let now = new Date();

    $: stats = {
        total: schedule.length,
        hours: schedule.reduce((s, i) => s + i.durationMinutes, 0) / 60,
        completed: schedule.filter((i) => i.status === "completed").length,
        upcoming: schedule.filter((i) => i.status === "upcoming").length,
    };

    $: dateLabel = (() => {
        const d = new Date();
        if (selectedDay === "yesterday") d.setDate(d.getDate() - 1);
        if (selectedDay === "tomorrow") d.setDate(d.getDate() + 1);
        return d.toLocaleDateString("en-US", {
            weekday: "long",
            month: "long",
            day: "numeric",
        });
    })();

    // ── Helpers ────────────────────────────────────────────
    function cfg(type: string) {
        return typeConfig[type] ?? typeConfig.study;
    }

    function parseTime(t: string): Date {
        try {
            const today = new Date();
            const [time, period] = t.split(" ");
            let [h, m] = time.split(":").map(Number);
            if (period === "PM" && h !== 12) h += 12;
            if (period === "AM" && h === 12) h = 0;
            return new Date(
                today.getFullYear(),
                today.getMonth(),
                today.getDate(),
                h,
                m ?? 0,
            );
        } catch {
            return new Date();
        }
    }

    function isActive(item: ScheduleItem, i: number): boolean {
        if (selectedDay !== "today") return false;
        const start = parseTime(item.time);
        const next = schedule[i + 1];
        const end = next
            ? parseTime(next.time)
            : new Date(start.getTime() + item.durationMinutes * 60000);
        return now >= start && now < end;
    }

    function isPast(item: ScheduleItem): boolean {
        if (selectedDay !== "today") return selectedDay === "yesterday";
        return now > parseTime(item.time);
    }

    // ── Data ───────────────────────────────────────────────
    function mapItems(raw: any[]): ScheduleItem[] {
        return raw.map((s) => ({
            id: s.id ?? Math.random().toString(36).slice(2),
            time: s.time ?? s.start_time ?? s.scheduled_time ?? "9:00 AM",
            subject: s.subject ?? s.topic ?? s.title ?? "Study Session",
            type: s.type ?? s.session_type ?? "study",
            duration: s.duration ?? "1h",
            durationMinutes: s.duration_minutes ?? 60,
            status: s.status ?? "upcoming",
            difficulty: s.difficulty ?? "medium",
        }));
    }

    function useFallback() {
        // No longer using hardcoded demo data
        schedule = [];
    }

    async function fetchSchedule() {
        const currentUser = $user;
        if (!currentUser?.session?.access_token) {
            useFallback();
            loading = false;
            return;
        }

        try {
            const res = await fetch(
                `${import.meta.env.VITE_API_URL || "http://localhost:8000"}/api/students/schedule`,
                {
                    headers: {
                        Authorization: `Bearer ${currentUser.session.access_token}`,
                    },
                },
            );
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const data = await res.json();
            const raw = Array.isArray(data) ? data : (data.schedule ?? []);
            if (raw.length) schedule = mapItems(raw);
            else useFallback();
            error = false;
        } catch (e) {
            console.error("Schedule fetch failed:", e);
            error = true;
            useFallback();
        } finally {
            loading = false;
        }
    }

    onMount(async () => {
        await fetchSchedule();
        mounted = true;
        pollInterval = setInterval(fetchSchedule, 60_000);
        // FIX: refresh `now` every 30s so active/past state stays correct
        clockInterval = setInterval(() => {
            now = new Date();
        }, 30_000);
    });

    onDestroy(() => {
        clearInterval(pollInterval);
        clearInterval(clockInterval);
    });
</script>

<svelte:head>
    <title>Schedule — StudyVault</title>
</svelte:head>

<div class="page" class:mounted>
    <!-- ── Header ── -->
    <header class="page-header">
        <div class="header-left">
            <div class="header-icon-wrap">
                <Calendar size={14} strokeWidth={2} />
            </div>
            <div>
                <h1 class="page-title">Schedule</h1>
                <p class="page-sub">{dateLabel}</p>
            </div>
        </div>
        <button class="add-btn" on:click={() => goto("/study")}>
            <Plus size={14} strokeWidth={2.5} />
            Add Session
        </button>
    </header>

    <div class="divider" />

    <!-- ── Stats ── -->
    <div class="stats-row">
        {#each [{ label: "Sessions", sub: "Today's total", value: loading ? "—" : String(stats.total), accent: "#a3e635", glow: "rgba(163,230,53,0.15)", bar: stats.total / 6 }, { label: "Hours", sub: "Study time", value: loading ? "—" : stats.hours.toFixed(1) + "h", accent: "#38bdf8", glow: "rgba(56,189,248,0.15)", bar: stats.hours / 8 }, { label: "Done", sub: "Completed", value: loading ? "—" : String(stats.completed), accent: "#f59e0b", glow: "rgba(245,158,11,0.15)", bar: stats.total ? stats.completed / stats.total : 0 }, { label: "Left", sub: "Remaining", value: loading ? "—" : String(stats.upcoming), accent: "#e879f9", glow: "rgba(232,121,249,0.15)", bar: stats.total ? stats.upcoming / stats.total : 0 }] as s, i}
            <div
                class="stat-card"
                style="--accent:{s.accent}; --glow:{s.glow}; animation-delay:{i *
                    70}ms"
            >
                <div class="stat-top">
                    <span class="stat-sub">{s.sub}</span>
                </div>
                <div class="stat-value">{s.value}</div>
                <div class="stat-label">{s.label}</div>
                <div class="stat-bar">
                    <div
                        class="stat-bar-fill"
                        style="width:{mounted
                            ? Math.min(s.bar * 100, 100)
                            : 0}%"
                    />
                </div>
            </div>
        {/each}
    </div>

    <!-- ── Day tabs ── -->
    <div class="section-header">
        <div class="day-tabs">
            <button
                class="nav-arrow"
                on:click={() =>
                    (selectedDay =
                        selectedDay === "today"
                            ? "yesterday"
                            : selectedDay === "tomorrow"
                              ? "today"
                              : "yesterday")}
            >
                <ChevronLeft size={14} />
            </button>
            {#each [{ key: "yesterday", label: "Yesterday" }, { key: "today", label: "Today" }, { key: "tomorrow", label: "Tomorrow" }] as d}
                <button
                    class="day-tab"
                    class:active={selectedDay === d.key}
                    on:click={() => (selectedDay = d.key)}>{d.label}</button
                >
            {/each}
            <button
                class="nav-arrow"
                on:click={() =>
                    (selectedDay =
                        selectedDay === "today"
                            ? "tomorrow"
                            : selectedDay === "yesterday"
                              ? "today"
                              : "tomorrow")}
            >
                <ChevronRight size={14} />
            </button>
        </div>
        <span class="session-count">{schedule.length} sessions</span>
    </div>

    <!-- ── Timeline ── -->
    <div class="timeline">
        {#if loading}
            {#each [1, 2, 3, 4] as _, i}
                <div
                    class="timeline-item skeleton"
                    style="animation-delay:{i * 60}ms"
                >
                    <div class="skel skel-time" />
                    <div class="skel skel-dot" />
                    <div class="skel-body">
                        <div class="skel skel-title" />
                        <div class="skel skel-meta" />
                    </div>
                    <div class="skel skel-btn" />
                </div>
            {/each}
        {:else if schedule.length === 0}
            <div class="empty-state">
                <div class="empty-icon"><Calendar size={24} /></div>
                <p class="empty-title">No sessions scheduled</p>
                <p class="empty-sub">Your schedule is clear. Time to plan!</p>
                <button class="empty-cta" on:click={() => goto("/study")}
                    >Plan a Session</button
                >
            </div>
        {:else}
            {#each schedule as item, i}
                {@const c = cfg(item.type)}
                {@const active = isActive(item, i)}
                {@const past = isPast(item) && !active}
                {@const diff =
                    difficultyConfig[item.difficulty ?? "medium"] ??
                    difficultyConfig.medium}

                <div
                    class="timeline-item"
                    class:active
                    class:past
                    style="--accent:{c.accent}; --glow:{c.glow}; animation-delay:{i *
                        70}ms"
                >
                    <!-- Time -->
                    <div class="item-time">
                        <span class="time-str">{item.time}</span>
                        {#if active}<span class="live-dot" />{/if}
                    </div>

                    <!-- Dot + connector -->
                    <div class="dot-col">
                        <div
                            class="item-dot"
                            style="border-color:{active
                                ? c.accent
                                : past
                                  ? 'rgba(255,255,255,0.1)'
                                  : c.accent + '50'};
                                   background:{active
                                ? c.accent
                                : 'transparent'}"
                        >
                            {#if active}
                                <div
                                    class="dot-ripple"
                                    style="background:{c.accent}"
                                />
                            {/if}
                        </div>
                        {#if i < schedule.length - 1}
                            <div class="connector" class:past />
                        {/if}
                    </div>

                    <!-- Content -->
                    <div class="item-content">
                        <div class="item-header">
                            <div
                                class="type-pill"
                                style="color:{c.accent}; background:{c.accent}12; border:1px solid {c.accent}25"
                            >
                                <svelte:component
                                    this={c.icon}
                                    size={9}
                                    strokeWidth={2.5}
                                />
                                {c.label}
                            </div>
                            <span class="item-duration">
                                <Clock size={9} strokeWidth={2} />
                                {item.duration}
                            </span>
                        </div>
                        <p class="item-subject" class:past>{item.subject}</p>
                        {#if item.difficulty}
                            <span
                                class="diff-chip"
                                style="color:{diff.color}; background:{diff.bg}"
                                >{item.difficulty}</span
                            >
                        {/if}
                    </div>

                    <!-- Action -->
                    <button
                        class="action-btn"
                        style="background:{active
                            ? c.accent
                            : 'rgba(255,255,255,0.05)'};
                               color:{active
                            ? '#000'
                            : 'rgba(255,255,255,0.5)'};
                               border-color:{active
                            ? c.accent
                            : 'rgba(255,255,255,0.08)'}"
                        on:click={() => goto("/study")}
                    >
                        {#if item.status === "completed"}Done
                        {:else if item.status === "in-progress"}Resume
                        {:else}Start{/if}
                    </button>
                </div>
            {/each}
        {/if}
    </div>

    <!-- ── Quick actions ── -->
    <div class="quick-row">
        <button class="quick-btn" on:click={() => goto("/study")}>
            <BookOpen size={14} strokeWidth={1.8} />
            Study Planning
        </button>
        <button class="quick-btn" on:click={() => goto("/dashboard")}>
            <Brain size={14} strokeWidth={1.8} />
            Dashboard
        </button>
    </div>

    {#if error}
        <p class="error-note">Could not sync — showing demo data</p>
    {/if}
</div>

<style>
    @import url("https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@700;800&family=Geist:wght@400;500;600&display=swap");

    /* ── Page ── */
    .page {
        font-family: "Geist", system-ui, sans-serif;
        display: flex;
        flex-direction: column;
        gap: 24px;
        padding: 28px 32px 48px;
        max-width: 900px;
        width: 100%;
        min-height: 100vh;
        opacity: 0;
        transform: translateY(6px);
        transition:
            opacity 300ms ease,
            transform 300ms ease;
    }

    .page.mounted {
        opacity: 1;
        transform: translateY(0);
    }

    /* ── Header ── */
    .page-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 16px;
    }

    .header-left {
        display: flex;
        align-items: center;
        gap: 12px;
    }

    .header-icon-wrap {
        width: 34px;
        height: 34px;
        border-radius: 9px;
        background: rgba(163, 230, 53, 0.12);
        color: #a3e635;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
    }

    .page-title {
        font-size: 20px;
        font-weight: 700;
        color: rgba(255, 255, 255, 0.92);
        letter-spacing: -0.4px;
        margin: 0;
        line-height: 1.1;
    }

    .page-sub {
        font-size: 11px;
        color: rgba(255, 255, 255, 0.28);
        margin: 2px 0 0;
        letter-spacing: 0.02em;
    }

    .add-btn {
        display: flex;
        align-items: center;
        gap: 6px;
        padding: 8px 14px;
        background: #a3e635;
        color: #000;
        border: none;
        border-radius: 8px;
        font-family: "Geist", system-ui, sans-serif;
        font-size: 12px;
        font-weight: 700;
        cursor: pointer;
        letter-spacing: 0.02em;
        transition:
            filter 150ms ease,
            transform 150ms ease;
        flex-shrink: 0;
    }

    .add-btn:hover {
        filter: brightness(1.1);
    }
    .add-btn:active {
        transform: scale(0.97);
    }

    /* ── Divider ── */
    .divider {
        height: 1px;
        background: rgba(255, 255, 255, 0.05);
        margin: -8px 0;
    }

    /* ── Stats ── */
    .stats-row {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 10px;
    }

    .stat-card {
        position: relative;
        background: #0e0e10;
        border: 1px solid rgba(255, 255, 255, 0.07);
        border-radius: 10px;
        padding: 14px 14px 12px;
        display: flex;
        flex-direction: column;
        gap: 2px;
        overflow: hidden;
        opacity: 0;
        transform: translateY(8px);
        animation: rise 300ms cubic-bezier(0.22, 1, 0.36, 1) forwards;
        transition:
            border-color 180ms ease,
            box-shadow 180ms ease;
    }

    .stat-card::before {
        content: "";
        position: absolute;
        inset: 0;
        background: radial-gradient(
            ellipse at top left,
            var(--glow),
            transparent 65%
        );
        opacity: 0;
        transition: opacity 220ms ease;
        pointer-events: none;
    }

    .stat-card:hover {
        border-color: var(--accent);
        box-shadow:
            0 0 0 1px var(--accent),
            0 6px 24px var(--glow);
    }
    .stat-card:hover::before {
        opacity: 1;
    }

    .stat-top {
        margin-bottom: 8px;
    }

    .stat-sub {
        font-size: 9px;
        font-weight: 500;
        letter-spacing: 0.06em;
        text-transform: uppercase;
        color: rgba(255, 255, 255, 0.25);
    }

    .stat-value {
        font-family: "Barlow Condensed", sans-serif;
        font-size: 44px;
        font-weight: 800;
        line-height: 1;
        letter-spacing: -1px;
        font-variant-numeric: tabular-nums;
        background: linear-gradient(175deg, #fff 50%, var(--accent) 160%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
    }

    .stat-label {
        font-family: "Barlow Condensed", sans-serif;
        font-size: 12px;
        font-weight: 700;
        letter-spacing: 0.15em;
        text-transform: uppercase;
        color: var(--accent);
        opacity: 0.65;
        margin-bottom: 10px;
    }

    .stat-bar {
        height: 2px;
        background: rgba(255, 255, 255, 0.06);
        border-radius: 2px;
        overflow: hidden;
    }

    .stat-bar-fill {
        height: 100%;
        background: var(--accent);
        border-radius: 2px;
        box-shadow: 0 0 6px var(--accent);
        transition: width 900ms cubic-bezier(0.22, 1, 0.36, 1);
    }

    /* ── Section header ── */
    .section-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
    }

    .day-tabs {
        display: flex;
        align-items: center;
        gap: 4px;
        background: rgba(255, 255, 255, 0.03);
        border: 1px solid rgba(255, 255, 255, 0.06);
        border-radius: 9px;
        padding: 3px;
    }

    .day-tab {
        padding: 6px 12px;
        border: none;
        border-radius: 6px;
        background: transparent;
        font-family: "Geist", system-ui, sans-serif;
        font-size: 12px;
        font-weight: 500;
        color: rgba(255, 255, 255, 0.35);
        cursor: pointer;
        transition:
            background 150ms ease,
            color 150ms ease;
    }

    .day-tab:hover {
        color: rgba(255, 255, 255, 0.7);
    }
    .day-tab.active {
        background: #a3e635;
        color: #000;
        font-weight: 700;
    }

    .nav-arrow {
        width: 26px;
        height: 26px;
        border: none;
        border-radius: 5px;
        background: transparent;
        color: rgba(255, 255, 255, 0.25);
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: color 150ms ease;
    }

    .nav-arrow:hover {
        color: rgba(255, 255, 255, 0.6);
    }

    .session-count {
        font-size: 10px;
        font-weight: 500;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        color: rgba(255, 255, 255, 0.2);
    }

    /* ── Timeline ── */
    .timeline {
        display: flex;
        flex-direction: column;
        gap: 0;
    }

    .timeline-item {
        display: grid;
        grid-template-columns: 76px 20px 1fr auto;
        gap: 0 12px;
        align-items: flex-start;
        opacity: 0;
        animation: rise 280ms cubic-bezier(0.22, 1, 0.36, 1) forwards;
    }

    .timeline-item.skeleton {
        opacity: 1;
        animation: none;
    }

    /* Time col */
    .item-time {
        display: flex;
        flex-direction: column;
        align-items: flex-end;
        padding-top: 4px;
        gap: 4px;
    }

    .time-str {
        font-family: "Barlow Condensed", sans-serif;
        font-size: 13px;
        font-weight: 600;
        color: rgba(255, 255, 255, 0.3);
        letter-spacing: 0.03em;
        white-space: nowrap;
        transition: color 200ms ease;
    }

    .timeline-item.active .time-str {
        color: rgba(255, 255, 255, 0.85);
    }

    .live-dot {
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background: #a3e635;
        box-shadow: 0 0 6px #a3e635;
        animation: blink 1.4s ease infinite;
        align-self: flex-end;
    }

    /* Dot col */
    .dot-col {
        display: flex;
        flex-direction: column;
        align-items: center;
    }

    .item-dot {
        position: relative;
        width: 12px;
        height: 12px;
        border-radius: 50%;
        border: 1.5px solid;
        flex-shrink: 0;
        margin-top: 4px;
        transition:
            background 300ms ease,
            border-color 300ms ease;
        z-index: 1;
    }

    .dot-ripple {
        position: absolute;
        inset: -4px;
        border-radius: 50%;
        opacity: 0;
        animation: ripple 1.8s ease-out infinite;
        z-index: -1;
    }

    .connector {
        width: 1px;
        min-height: 60px;
        flex: 1;
        background: rgba(255, 255, 255, 0.08);
        transition: background 200ms ease;
    }

    .connector.past {
        background: rgba(255, 255, 255, 0.04);
    }

    /* Content */
    .item-content {
        padding: 0 0 20px;
        display: flex;
        flex-direction: column;
        gap: 4px;
    }

    .item-header {
        display: flex;
        align-items: center;
        gap: 6px;
        margin-bottom: 2px;
    }

    .type-pill {
        display: flex;
        align-items: center;
        gap: 4px;
        font-size: 9px;
        font-weight: 700;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        padding: 2px 6px;
        border-radius: 4px;
    }

    .item-duration {
        display: flex;
        align-items: center;
        gap: 3px;
        font-size: 10px;
        color: rgba(255, 255, 255, 0.2);
        margin-left: auto;
    }

    .item-subject {
        font-size: 14px;
        font-weight: 500;
        color: rgba(255, 255, 255, 0.88);
        margin: 0;
        transition: color 200ms ease;
    }

    .item-subject.past {
        color: rgba(255, 255, 255, 0.25);
        text-decoration: line-through;
        text-decoration-color: rgba(255, 255, 255, 0.1);
    }

    .diff-chip {
        font-size: 9px;
        font-weight: 600;
        letter-spacing: 0.06em;
        text-transform: uppercase;
        padding: 2px 6px;
        border-radius: 4px;
        align-self: flex-start;
    }

    /* Action */
    .action-btn {
        margin-top: 2px;
        padding: 6px 12px;
        border: 1px solid;
        border-radius: 7px;
        font-family: "Geist", system-ui, sans-serif;
        font-size: 11px;
        font-weight: 600;
        cursor: pointer;
        transition:
            filter 150ms ease,
            transform 150ms ease;
        white-space: nowrap;
        align-self: flex-start;
    }

    .action-btn:hover {
        filter: brightness(1.15);
    }
    .action-btn:active {
        transform: scale(0.96);
    }

    /* ── Skeleton ── */
    /* FIX: add proper shimmer gradient so the animation is visible */
    .skel {
        border-radius: 4px;
        background: linear-gradient(
            90deg,
            rgba(255, 255, 255, 0.05) 25%,
            rgba(255, 255, 255, 0.11) 50%,
            rgba(255, 255, 255, 0.05) 75%
        );
        background-size: 200% 100%;
        animation: shimmer 1.4s infinite;
    }

    .skel-dot {
        width: 12px;
        height: 12px;
        border-radius: 50%;
        margin-top: 4px;
    }
    .skel-time {
        width: 56px;
        height: 10px;
        margin-top: 6px;
        margin-left: auto;
    }
    .skel-body {
        display: flex;
        flex-direction: column;
        gap: 7px;
        padding-top: 4px;
    }
    .skel-title {
        width: 55%;
        height: 10px;
    }
    .skel-meta {
        width: 30%;
        height: 8px;
    }
    .skel-btn {
        width: 56px;
        height: 28px;
        border-radius: 7px;
        margin-top: 4px;
    }

    /* Empty */
    .empty-state {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 8px;
        padding: 48px 0;
        text-align: center;
    }

    .empty-icon {
        width: 48px;
        height: 48px;
        border-radius: 12px;
        background: rgba(255, 255, 255, 0.04);
        color: rgba(255, 255, 255, 0.2);
        display: flex;
        align-items: center;
        justify-content: center;
        margin-bottom: 4px;
    }

    .empty-title {
        font-size: 14px;
        font-weight: 600;
        color: rgba(255, 255, 255, 0.5);
        margin: 0;
    }
    .empty-sub {
        font-size: 12px;
        color: rgba(255, 255, 255, 0.2);
        margin: 0 0 12px;
    }

    .empty-cta {
        padding: 8px 16px;
        background: #a3e635;
        color: #000;
        border: none;
        border-radius: 8px;
        font-size: 12px;
        font-weight: 700;
        cursor: pointer;
        transition: filter 150ms ease;
    }

    .empty-cta:hover {
        filter: brightness(1.1);
    }

    /* Quick row */
    .quick-row {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 10px;
    }

    .quick-btn {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 7px;
        padding: 11px;
        background: rgba(255, 255, 255, 0.02);
        border: 1px solid rgba(255, 255, 255, 0.06);
        border-radius: 9px;
        font-family: "Geist", system-ui, sans-serif;
        font-size: 12px;
        font-weight: 500;
        color: rgba(255, 255, 255, 0.45);
        cursor: pointer;
        transition:
            background 150ms ease,
            border-color 150ms ease,
            color 150ms ease;
    }

    .quick-btn:hover {
        background: rgba(255, 255, 255, 0.04);
        border-color: rgba(255, 255, 255, 0.12);
        color: rgba(255, 255, 255, 0.75);
    }

    /* Error */
    .error-note {
        font-size: 10px;
        color: #f87171;
        opacity: 0.6;
        margin: -12px 0 0;
        text-align: right;
    }

    /* ── Keyframes ── */
    @keyframes rise {
        from {
            opacity: 0;
            transform: translateY(8px);
        }
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

    @keyframes ripple {
        0% {
            transform: scale(1);
            opacity: 0.5;
        }
        70% {
            transform: scale(2.8);
            opacity: 0;
        }
        100% {
            transform: scale(2.8);
            opacity: 0;
        }
    }

    @keyframes blink {
        0%,
        100% {
            opacity: 1;
        }
        50% {
            opacity: 0.3;
        }
    }

    /* ── Responsive ── */
    @media (max-width: 860px) {
        .stats-row {
            grid-template-columns: repeat(2, 1fr);
        }
        .page {
            padding: 20px 16px 40px;
        }
    }

    @media (max-width: 560px) {
        .timeline-item {
            grid-template-columns: 60px 16px 1fr auto;
            gap: 0 8px;
        }
        .quick-row {
            grid-template-columns: 1fr;
        }
        .stat-value {
            font-size: 36px;
        }
    }
</style>
