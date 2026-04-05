import { writable } from 'svelte/store'

export interface Theme {
    // backgrounds
    bg:              string
    surface:         string
    surfaceHover:    string

    // accent
    accent:          string
    accentGlow:      string

    // text
    textPrimary:     string
    textMuted:       string
    textPlaceholder: string

    // borders
    border:          string
    borderFocus:     string

    // status colors
    colorHard:       string
    colorMedium:     string
    colorEasy:       string
    colorReview:     string

    // typography
    fontSans:        string
    fontMono:        string

    // radius
    radiusCard:      string
    radiusInput:     string
    radiusBtn:       string
}

export const defaultTheme: Theme = {
    bg:              '#0A0A0B',
    surface:         '#111114',
    surfaceHover:    'rgba(255,255,255,0.04)',
    accent:          '#C8FF00',
    accentGlow:      'rgba(200,255,0,0.25)',
    textPrimary:     '#F2F2F2',
    textMuted:       '#555560',
    textPlaceholder: 'rgba(255,255,255,0.2)',
    border:          'rgba(255,255,255,0.08)',
    borderFocus:     'rgba(200,255,0,0.5)',
    colorHard:       '#ef4444',
    colorMedium:     '#fb923c',
    colorEasy:       '#4ade80',
    colorReview:     '#60a5fa',
    fontSans:        'Inter, sans-serif',
    fontMono:        'JetBrains Mono, monospace',
    radiusCard:      '16px',
    radiusInput:     '10px',
    radiusBtn:       '10px'
}

// preset themes
export const presetThemes: Record<string, Theme> = {
    'Default Dark': defaultTheme,

    'Midnight Blue': {
        ...defaultTheme,
        bg:          '#070B14',
        surface:     '#0D1526',
        accent:      '#60a5fa',
        accentGlow:  'rgba(96,165,250,0.25)',
        borderFocus: 'rgba(96,165,250,0.5)'
    },

    'Forest': {
        ...defaultTheme,
        bg:          '#070D0A',
        surface:     '#0D1610',
        accent:      '#4ade80',
        accentGlow:  'rgba(74,222,128,0.25)',
        borderFocus: 'rgba(74,222,128,0.5)'
    },

    'Rose': {
        ...defaultTheme,
        bg:          '#0D070A',
        surface:     '#160D10',
        accent:      '#f472b6',
        accentGlow:  'rgba(244,114,182,0.25)',
        borderFocus: 'rgba(244,114,182,0.5)'
    },

    'Amber': {
        ...defaultTheme,
        bg:          '#0D0A07',
        surface:     '#161008',
        accent:      '#fbbf24',
        accentGlow:  'rgba(251,191,36,0.25)',
        borderFocus: 'rgba(251,191,36,0.5)'
    },

    'Pure White': {
        bg:          '#ffffff',
        surface:     '#f4f4f5',
        surfaceHover:'rgba(0,0,0,0.04)',
        accent:      '#6366f1',
        accentGlow:  'rgba(99,102,241,0.25)',
        textPrimary: '#09090b',
        textMuted:   '#71717a',
        textPlaceholder: 'rgba(0,0,0,0.3)',
        border:      'rgba(0,0,0,0.08)',
        borderFocus: 'rgba(99,102,241,0.5)',
        colorHard:   '#ef4444',
        colorMedium: '#f97316',
        colorEasy:   '#22c55e',
        colorReview: '#3b82f6',
        fontSans:    'Inter, sans-serif',
        fontMono:    'JetBrains Mono, monospace',
        radiusCard:  '16px',
        radiusInput: '10px',
        radiusBtn:   '10px'
    }
}

function createThemeStore() {
    const saved = typeof localStorage !== 'undefined'
        ? localStorage.getItem('sv_theme')
        : null

    const initial: Theme = saved
        ? { ...defaultTheme, ...JSON.parse(saved) }
        : defaultTheme

    const { subscribe, set, update } = writable<Theme>(initial)

    return {
        subscribe,

        // apply a single token change
        setToken(key: keyof Theme, value: string) {
            update(theme => {
                const next = { ...theme, [key]: value }
                applyTheme(next)
                return next
            })
        },

        // apply a full preset
        applyPreset(preset: Theme) {
            set(preset)
            applyTheme(preset)
        },

        // save current theme to localStorage
        save(theme: Theme) {
            localStorage.setItem('sv_theme', JSON.stringify(theme))
        },

        // reset to default
        reset() {
            set(defaultTheme)
            applyTheme(defaultTheme)
            localStorage.removeItem('sv_theme')
        }
    }
}

// apply theme to :root CSS variables
export function applyTheme(theme: Theme) {
    const root = document.documentElement
    root.style.setProperty('--bg',               theme.bg)
    root.style.setProperty('--surface',          theme.surface)
    root.style.setProperty('--surface-hover',    theme.surfaceHover)
    root.style.setProperty('--accent',           theme.accent)
    root.style.setProperty('--accent-glow',      theme.accentGlow)
    root.style.setProperty('--text-primary',     theme.textPrimary)
    root.style.setProperty('--text-muted',       theme.textMuted)
    root.style.setProperty('--text-placeholder', theme.textPlaceholder)
    root.style.setProperty('--border',           theme.border)
    root.style.setProperty('--border-focus',     theme.borderFocus)
    root.style.setProperty('--color-hard',       theme.colorHard)
    root.style.setProperty('--color-medium',     theme.colorMedium)
    root.style.setProperty('--color-easy',       theme.colorEasy)
    root.style.setProperty('--color-review',     theme.colorReview)
    root.style.setProperty('--font-sans',        theme.fontSans)
    root.style.setProperty('--font-mono',        theme.fontMono)
    root.style.setProperty('--radius-card',      theme.radiusCard)
    root.style.setProperty('--radius-input',     theme.radiusInput)
    root.style.setProperty('--radius-btn',       theme.radiusBtn)
}

export const themeStore = createThemeStore()
