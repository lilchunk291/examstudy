

export const index = 0;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/_layout.svelte.js')).default;
export const imports = ["_app/immutable/nodes/0.CFUUxWw9.js","_app/immutable/chunks/C5IrZ_lV.js","_app/immutable/chunks/C5sZfvDW.js","_app/immutable/chunks/BWfTSIIS.js"];
export const stylesheets = ["_app/immutable/assets/0.B0xn5paE.css"];
export const fonts = [];
