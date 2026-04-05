import { $ as attr, a0 as bind_props, a1 as fallback, e as escape_html } from "../../chunks/index.js";
function FeedbackPanel($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let armIndex = fallback($$props["armIndex"], null);
    let submitting = false;
    $$renderer2.push(`<section class="feedback-card svelte-p7nz7"><h3 class="svelte-p7nz7">Roadmap Feedback</h3> <p class="svelte-p7nz7">Rate the generated roadmap to train the Thompson Sampling bandit.</p> <div class="feedback-actions svelte-p7nz7"><button${attr("disabled", submitting, true)} class="svelte-p7nz7">Helpful</button> <button${attr("disabled", submitting, true)} class="svelte-p7nz7">Not helpful</button></div> `);
    {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--> `);
    {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--></section>`);
    bind_props($$props, { armIndex });
  });
}
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let days = 14;
    let velocity = "Medium";
    let topicsJson = `[
  { "id": "topic-1", "name": "Linear Algebra", "weight": 3 },
  { "id": "topic-2", "name": "Calculus", "weight": 2 },
  { "id": "topic-3", "name": "Python", "weight": 2 }
]`;
    let loading = false;
    let roadmap = [];
    let selectedArmIndex = null;
    $$renderer2.push(`<main class="svelte-1uha8ag"><h1>AdaptiveLabs AI Roadmap Optimizer</h1> <p>Frontend (5173) -> FastAPI GA (8000)</p> <label class="svelte-1uha8ag">Days Remaining <input type="number" min="1"${attr("value", days)} class="svelte-1uha8ag"/></label> <label class="svelte-1uha8ag">Velocity `);
    $$renderer2.select(
      { value: velocity, class: "" },
      ($$renderer3) => {
        $$renderer3.option({ value: "Slow" }, ($$renderer4) => {
          $$renderer4.push(`Slow`);
        });
        $$renderer3.option({ value: "Medium" }, ($$renderer4) => {
          $$renderer4.push(`Medium`);
        });
        $$renderer3.option({ value: "Fast" }, ($$renderer4) => {
          $$renderer4.push(`Fast`);
        });
      },
      "svelte-1uha8ag"
    );
    $$renderer2.push(`</label> <label class="svelte-1uha8ag">Topics (JSON) <textarea rows="8" class="svelte-1uha8ag">`);
    const $$body = escape_html(topicsJson);
    if ($$body) {
      $$renderer2.push(`${$$body}`);
    }
    $$renderer2.push(`</textarea></label> <button${attr("disabled", loading, true)} class="svelte-1uha8ag">${escape_html("Generate Roadmap")}</button> `);
    {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--> `);
    if (roadmap.length > 0) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<h2>Generated Roadmap</h2> <pre class="svelte-1uha8ag">${escape_html(JSON.stringify(roadmap, null, 2))}</pre> `);
      {
        $$renderer2.push("<!--[!-->");
      }
      $$renderer2.push(`<!--]-->`);
    } else {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--> `);
    FeedbackPanel($$renderer2, { armIndex: selectedArmIndex });
    $$renderer2.push(`<!----></main>`);
  });
}
export {
  _page as default
};
