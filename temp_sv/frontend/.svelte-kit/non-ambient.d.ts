
// this file is generated — do not edit it


declare module "svelte/elements" {
	export interface HTMLAttributes<T> {
		'data-sveltekit-keepfocus'?: true | '' | 'off' | undefined | null;
		'data-sveltekit-noscroll'?: true | '' | 'off' | undefined | null;
		'data-sveltekit-preload-code'?:
			| true
			| ''
			| 'eager'
			| 'viewport'
			| 'hover'
			| 'tap'
			| 'off'
			| undefined
			| null;
		'data-sveltekit-preload-data'?: true | '' | 'hover' | 'tap' | 'off' | undefined | null;
		'data-sveltekit-reload'?: true | '' | 'off' | undefined | null;
		'data-sveltekit-replacestate'?: true | '' | 'off' | undefined | null;
	}
}

export {};


declare module "$app/types" {
	export interface AppTypes {
		RouteId(): "/" | "/ai" | "/auth" | "/auth/callback" | "/chat" | "/crisis" | "/dashboard" | "/deep-work" | "/demo" | "/import" | "/login" | "/privacy-vault" | "/profile" | "/register" | "/rooms" | "/schedule" | "/sessions" | "/settings" | "/settings/connectors" | "/settings/theme" | "/study" | "/vault";
		RouteParams(): {
			
		};
		LayoutParams(): {
			"/": Record<string, never>;
			"/ai": Record<string, never>;
			"/auth": Record<string, never>;
			"/auth/callback": Record<string, never>;
			"/chat": Record<string, never>;
			"/crisis": Record<string, never>;
			"/dashboard": Record<string, never>;
			"/deep-work": Record<string, never>;
			"/demo": Record<string, never>;
			"/import": Record<string, never>;
			"/login": Record<string, never>;
			"/privacy-vault": Record<string, never>;
			"/profile": Record<string, never>;
			"/register": Record<string, never>;
			"/rooms": Record<string, never>;
			"/schedule": Record<string, never>;
			"/sessions": Record<string, never>;
			"/settings": Record<string, never>;
			"/settings/connectors": Record<string, never>;
			"/settings/theme": Record<string, never>;
			"/study": Record<string, never>;
			"/vault": Record<string, never>
		};
		Pathname(): "/" | "/ai" | "/auth/callback" | "/chat" | "/crisis" | "/dashboard" | "/deep-work" | "/demo" | "/import" | "/login" | "/privacy-vault" | "/profile" | "/register" | "/rooms" | "/schedule" | "/sessions" | "/settings" | "/settings/connectors" | "/settings/theme" | "/study" | "/vault";
		ResolvedPathname(): `${"" | `/${string}`}${ReturnType<AppTypes['Pathname']>}`;
		Asset(): string & {};
	}
}