<script lang="ts">
    import { page } from "$app/state";
    import { goto } from "$app/navigation";
    import { createEventDispatcher } from "svelte";
    import {
        LayoutDashboard,
        CalendarDays,
        BookOpen,
        Brain,
        Shield,
        Palette,
        Settings,
        MessageSquare,
        ChevronLeft,
        ChevronRight,
        Zap,
        Users,
        AlertTriangle
    } from "lucide-svelte";

    export let collapsed = false;
    const dispatch = createEventDispatcher();

    const navGroups = [
        {
            label: "Workspace",
            items: [
                {
                    icon: LayoutDashboard,
                    label: "Dashboard",
                    path: "/dashboard",
                },
                { icon: CalendarDays, label: "Schedule", path: "/schedule" },
                { icon: BookOpen, label: "Study Sessions", path: "/sessions" },
                { icon: Brain, label: "Deep Work", path: "/deep-work" },
                { icon: Users, label: "Silent Rooms", path: "/rooms" },
                { icon: MessageSquare, label: "Chat", path: "/chat" },
                { icon: AlertTriangle, label: "Crisis Mode", path: "/crisis" },
            ],
        },
        {
            label: "Account",
            items: [
                { icon: Shield, label: "Privacy Vault", path: "/privacy-vault" },
                {
                    icon: Palette,
                    label: "Theme Editor",
                    path: "/settings/theme",
                },
                { icon: Settings, label: "Settings", path: "/settings" },
            ],
        },
    ];

    function toggleCollapse() {
        collapsed = !collapsed;
        dispatch("toggleCollapse", { collapsed });
    }

    function navigate(path: string) {
        goto(path);
    }
</script>

<aside class="sidebar" class:collapsed>
    <!-- Logo -->
    <div class="logo-row">
        <div class="logo-icon">
            <Zap size={14} strokeWidth={2.5} />
        </div>
        {#if !collapsed}
            <span class="logo-text">StudyVault</span>
        {/if}
    </div>

    <!-- Navigation -->
    <nav class="nav">
        {#each navGroups as group}
            <div class="nav-group">
                {#if !collapsed}
                    <span class="group-label">{group.label}</span>
                {/if}
                {#each group.items as item}
                    {@const isActive = page.url.pathname === item.path}
                    <button
                        on:click={() => navigate(item.path)}
                        class="nav-item"
                        class:active={isActive}
                        title={collapsed ? item.label : undefined}
                    >
                        <span class="nav-icon">
                            <item.icon
                                size={16}
                                strokeWidth={isActive ? 2.2 : 1.8}
                            />
                        </span>
                        {#if !collapsed}
                            <span class="nav-label">{item.label}</span>
                        {/if}
                    </button>
                {/each}
            </div>
        {/each}
    </nav>

    <!-- Footer -->
    <div class="sidebar-footer">
        {#if !collapsed}
            <div class="user-row">
                <div class="avatar">S</div>
                <div class="user-info">
                    <span class="user-name">Student</span>
                    <span class="user-plan">Free Plan</span>
                </div>
            </div>
        {:else}
            <div class="avatar solo">S</div>
        {/if}

        <button
            class="collapse-btn"
            on:click={toggleCollapse}
            title={collapsed ? "Expand" : "Collapse"}
        >
            {#if collapsed}
                <ChevronRight size={13} />
            {:else}
                <ChevronLeft size={13} />
            {/if}
        </button>
    </div>
</aside>

<style>
    @import url("https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600&display=swap");

    .sidebar {
        font-family: "Geist", "Inter", system-ui, sans-serif;
        width: 220px;
        height: 100vh;
        position: sticky;
        top: 0;
        display: flex;
        flex-direction: column;
        background: #0c0c0e;
        border-right: 1px solid rgba(255, 255, 255, 0.06);
        transition: width 200ms cubic-bezier(0.4, 0, 0.2, 1);
        overflow: hidden;
    }

    .sidebar.collapsed {
        width: 60px;
    }

    /* ── Logo ── */
    .logo-row {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 0 14px;
        height: 52px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        flex-shrink: 0;
    }

    .logo-icon {
        width: 26px;
        height: 26px;
        border-radius: 7px;
        background: #84cc16;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #000;
        flex-shrink: 0;
    }

    .logo-text {
        font-size: 14px;
        font-weight: 600;
        color: #f5f5f5;
        letter-spacing: -0.3px;
        white-space: nowrap;
    }

    /* ── Nav ── */
    .nav {
        flex: 1;
        padding: 12px 8px;
        display: flex;
        flex-direction: column;
        gap: 20px;
        overflow-y: auto;
        overflow-x: hidden;
    }

    .nav-group {
        display: flex;
        flex-direction: column;
        gap: 1px;
    }

    .group-label {
        font-size: 10px;
        font-weight: 600;
        letter-spacing: 0.07em;
        text-transform: uppercase;
        color: rgba(255, 255, 255, 0.25);
        padding: 0 8px 6px;
        white-space: nowrap;
    }

    .nav-item {
        display: flex;
        align-items: center;
        gap: 9px;
        padding: 7px 8px;
        border-radius: 7px;
        border: none;
        background: transparent;
        cursor: pointer;
        width: 100%;
        text-align: left;
        transition:
            background 120ms ease,
            color 120ms ease;
        color: rgba(255, 255, 255, 0.4);
        white-space: nowrap;
    }

    .nav-item:hover {
        background: rgba(255, 255, 255, 0.05);
        color: rgba(255, 255, 255, 0.85);
    }

    .nav-item.active {
        background: rgba(132, 204, 22, 0.1);
        color: #a3e635;
    }

    .nav-icon {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 18px;
        flex-shrink: 0;
    }

    .nav-label {
        font-size: 13px;
        font-weight: 500;
        letter-spacing: -0.1px;
    }

    /* ── Footer ── */
    .sidebar-footer {
        padding: 10px 8px;
        border-top: 1px solid rgba(255, 255, 255, 0.05);
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
        flex-shrink: 0;
    }

    .user-row {
        display: flex;
        align-items: center;
        gap: 9px;
        min-width: 0;
        flex: 1;
    }

    .avatar {
        width: 26px;
        height: 26px;
        border-radius: 50%;
        background: linear-gradient(135deg, #4ade80, #16a34a);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 11px;
        font-weight: 700;
        color: #000;
        flex-shrink: 0;
    }

    .avatar.solo {
        margin: 0 auto 4px;
    }

    .user-info {
        display: flex;
        flex-direction: column;
        min-width: 0;
        gap: 1px;
    }

    .user-name {
        font-size: 12px;
        font-weight: 500;
        color: rgba(255, 255, 255, 0.75);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    .user-plan {
        font-size: 10px;
        color: rgba(255, 255, 255, 0.25);
    }

    .collapse-btn {
        width: 24px;
        height: 24px;
        border-radius: 6px;
        border: 1px solid rgba(255, 255, 255, 0.08);
        background: transparent;
        cursor: pointer;
        color: rgba(255, 255, 255, 0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        transition:
            background 120ms ease,
            color 120ms ease;
    }

    .collapse-btn:hover {
        background: rgba(255, 255, 255, 0.06);
        color: rgba(255, 255, 255, 0.6);
    }
</style>
