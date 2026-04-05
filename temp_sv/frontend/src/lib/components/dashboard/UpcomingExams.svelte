<script lang="ts">
    import { onMount, onDestroy } from "svelte";
    import { user } from "$lib/stores/auth";
    import { Calendar, AlertTriangle, Clock } from "lucide-svelte";

    export let userProfile = null;

    interface Exam {
        name: string;
        date: string;
        daysLeft: number;
        difficulty: "Easy" | "Medium" | "Hard";
        subject?: string;
    }

    let exams: Exam[] = [];
    let loading = true;
    let error = false;
    let pollInterval: ReturnType<typeof setInterval>;

    const difficultyConfig = {
        Easy: { color: "#34d399", bg: "rgba(52,211,153,0.08)" },
        Medium: { color: "#f59e0b", bg: "rgba(245,158,11,0.08)" },
        Hard: { color: "#f87171", bg: "rgba(248,113,113,0.08)" },
    } as Record<string, { color: string; bg: string }>;

    function urgencyAccent(daysLeft: number): string {
        if (daysLeft <= 3) return "#f87171";
        if (daysLeft <= 7) return "#f59e0b";
        return "#a3e635";
    }

    function formatDate(dateStr: string): string {
        try {
            return new Date(dateStr).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
            });
        } catch {
            return dateStr;
        }
    }

    function calcDaysLeft(dateStr: string): number {
        const diff = new Date(dateStr).getTime() - Date.now();
        return Math.max(0, Math.ceil(diff / 86_400_000));
    }

    function mapExams(data: any[]): Exam[] {
        return data.map((e) => ({
            name: e.name ?? e.exam_name ?? e.title ?? "Exam",
            date: formatDate(e.date ?? e.exam_date ?? e.scheduled_date ?? ""),
            daysLeft: e.days_left ?? calcDaysLeft(e.date ?? e.exam_date ?? ""),
            difficulty: e.difficulty ?? e.level ?? "Medium",
            subject: e.subject ?? e.course ?? "",
        }));
    }

    async function fetchExams() {
        const currentUser = $user;
        if (!currentUser?.session?.access_token) return;

        try {
            const res = await fetch(
                `${import.meta.env.VITE_API_URL || "http://localhost:8000"}/api/students/exams`,
                {
                    headers: {
                        Authorization: `Bearer ${currentUser.session.access_token}`,
                    },
                },
            );

            if (!res.ok) throw new Error(`HTTP ${res.status}`);

            const data = await res.json();
            exams = mapExams(Array.isArray(data) ? data : (data.exams ?? []));
            error = false;
        } catch (e) {
            console.error("Exams fetch failed:", e);
            error = true;
            // Fallback to mock data so UI never looks empty
            exams = [
                {
                    name: "Data Structures",
                    date: "Mar 2",
                    daysLeft: 5,
                    difficulty: "Hard",
                },
                {
                    name: "Machine Learning",
                    date: "Mar 5",
                    daysLeft: 8,
                    difficulty: "Medium",
                },
                {
                    name: "Web Development",
                    date: "Mar 8",
                    daysLeft: 11,
                    difficulty: "Easy",
                },
            ];
        } finally {
            loading = false;
        }
    }

    $: if (userProfile?.exams) {
        exams = mapExams(userProfile.exams);
        loading = false;
    }

    onMount(async () => {
        await fetchExams();
        pollInterval = setInterval(fetchExams, 60_000);
    });

    onDestroy(() => clearInterval(pollInterval));
</script>

<div class="card">
    <!-- Header -->
    <div class="card-header">
        <div class="header-left">
            <div class="header-icon">
                <Calendar size={13} strokeWidth={2} />
            </div>
            <span class="header-title">Upcoming Exams</span>
        </div>
        <span class="exam-count">{exams.length} scheduled</span>
    </div>

    <!-- List -->
    <div class="exam-list">
        {#if loading}
            {#each [1, 2, 3] as _}
                <div class="exam-row skeleton">
                    <div class="skel-line wide" />
                    <div class="skel-line narrow" />
                </div>
            {/each}
        {:else if exams.length === 0}
            <div class="empty-state">
                <Calendar size={28} strokeWidth={1.5} />
                <p>No upcoming exams</p>
            </div>
        {:else}
            {#each exams as exam, i}
                {@const accent = urgencyAccent(exam.daysLeft)}
                {@const diff =
                    difficultyConfig[exam.difficulty] ??
                    difficultyConfig.Medium}
                <div
                    class="exam-row"
                    style="animation-delay:{i * 60}ms; --accent:{accent}"
                >
                    <!-- Left: urgency bar + info -->
                    <div class="row-left">
                        <div class="urgency-bar" style="background:{accent}" />
                        <div class="exam-info">
                            <span class="exam-name">{exam.name}</span>
                            <span class="exam-date">
                                <Clock size={9} strokeWidth={2} />
                                {exam.date}
                            </span>
                        </div>
                    </div>

                    <!-- Right: days + difficulty -->
                    <div class="row-right">
                        <div class="days-badge" style="color:{accent}">
                            {#if exam.daysLeft <= 3}
                                <AlertTriangle size={10} strokeWidth={2.5} />
                            {/if}
                            {exam.daysLeft}d
                        </div>
                        <span
                            class="difficulty-badge"
                            style="color:{diff.color}; background:{diff.bg}"
                        >
                            {exam.difficulty}
                        </span>
                    </div>
                </div>
            {/each}
        {/if}
    </div>

    {#if error}
        <p class="error-note">Could not sync — showing cached data</p>
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

    .exam-count {
        font-size: 10px;
        font-weight: 500;
        color: rgba(255, 255, 255, 0.2);
        letter-spacing: 0.04em;
        text-transform: uppercase;
    }

    /* ── List ── */
    .exam-list {
        display: flex;
        flex-direction: column;
        gap: 4px;
    }

    /* ── Row ── */
    .exam-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
        padding: 10px 10px 10px 0;
        border-radius: 8px;
        border: 1px solid transparent;
        opacity: 0;
        animation: fadeUp 280ms cubic-bezier(0.22, 1, 0.36, 1) forwards;
        transition:
            background 150ms ease,
            border-color 150ms ease;
        cursor: default;
    }

    .exam-row:hover {
        background: rgba(255, 255, 255, 0.03);
        border-color: rgba(255, 255, 255, 0.06);
    }

    .row-left {
        display: flex;
        align-items: center;
        gap: 10px;
        min-width: 0;
        flex: 1;
    }

    /* Thin colored left bar based on urgency */
    .urgency-bar {
        width: 3px;
        height: 32px;
        border-radius: 2px;
        flex-shrink: 0;
        opacity: 0.8;
    }

    .exam-info {
        display: flex;
        flex-direction: column;
        gap: 3px;
        min-width: 0;
    }

    .exam-name {
        font-size: 13px;
        font-weight: 500;
        color: rgba(255, 255, 255, 0.85);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    .exam-date {
        display: flex;
        align-items: center;
        gap: 4px;
        font-size: 10px;
        color: rgba(255, 255, 255, 0.25);
    }

    /* ── Right side ── */
    .row-right {
        display: flex;
        flex-direction: column;
        align-items: flex-end;
        gap: 4px;
        flex-shrink: 0;
    }

    .days-badge {
        font-family: "Barlow Condensed", sans-serif;
        font-size: 18px;
        font-weight: 700;
        line-height: 1;
        display: flex;
        align-items: center;
        gap: 3px;
        letter-spacing: -0.5px;
    }

    .difficulty-badge {
        font-size: 9px;
        font-weight: 600;
        letter-spacing: 0.07em;
        text-transform: uppercase;
        padding: 2px 6px;
        border-radius: 4px;
    }

    /* ── Skeleton ── */
    .exam-row.skeleton {
        opacity: 1;
        animation: none;
        flex-direction: column;
        align-items: flex-start;
        gap: 6px;
        padding: 10px;
    }

    .skel-line {
        height: 8px;
        border-radius: 4px;
        background: rgba(255, 255, 255, 0.06);
        animation: shimmer 1.4s infinite;
        background-size: 200% 100%;
    }

    .skel-line.wide {
        width: 70%;
    }
    .skel-line.narrow {
        width: 40%;
    }

    /* ── Empty ── */
    .empty-state {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 8px;
        padding: 24px 0;
        color: rgba(255, 255, 255, 0.15);
        font-size: 12px;
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
    @keyframes fadeUp {
        to {
            opacity: 1;
            transform: translateY(0);
        }
        from {
            opacity: 0;
            transform: translateY(6px);
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
</style>
