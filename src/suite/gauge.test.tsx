import assert from "node:assert/strict";
import { test } from "node:test";
import { renderToStaticMarkup } from "react-dom/server";
import { ArcGauge, gaugeTone } from "./index.js";

test("the arc gauge shows the value, its unit, and the usual band", () => {
  const html = renderToStaticMarkup(
    <ArcGauge
      value={1667}
      band={{ min: 1218, max: 1957 }}
      scale={{ from: 0, to: 2500 }}
      unit="words"
      label="Words"
    />,
  );
  assert.match(html, /aria-label="Words: 1,667 words, usual 1,218 to 1,957"/);
  assert.match(html, />1,667</);
  assert.match(html, />words</);
  assert.match(html, />2,500</);
  assert.match(html, /tk-gauge-dot is-within/);
});

test("a value outside the band is marked below or above, and the scale grows to hold it", () => {
  assert.equal(gaugeTone(908, { min: 1218, max: 1957 }), "below");
  assert.equal(gaugeTone(2400, { min: 1218, max: 1957 }), "above");
  const html = renderToStaticMarkup(
    <ArcGauge
      value={3000}
      band={{ min: 1218, max: 1957 }}
      scale={{ from: 0, to: 2500 }}
      unit="words"
      label="Words"
    />,
  );
  assert.match(html, />3,000</);
  assert.match(html, /tk-gauge-dot is-above/);
});
