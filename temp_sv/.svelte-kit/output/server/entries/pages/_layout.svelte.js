import { h as head, s as slot } from "../../chunks/index.js";
function _layout($$renderer, $$props) {
  head("12qhfyh", $$renderer, ($$renderer2) => {
    $$renderer2.title(($$renderer3) => {
      $$renderer3.push(`<title>AdaptiveLabs AI</title>`);
    });
  });
  $$renderer.push(`<div class="app-shell svelte-12qhfyh"><header class="layout-banner svelte-12qhfyh">Layout is active</header> <!--[-->`);
  slot($$renderer, $$props, "default", {});
  $$renderer.push(`<!--]--></div>`);
}
export {
  _layout as default
};
