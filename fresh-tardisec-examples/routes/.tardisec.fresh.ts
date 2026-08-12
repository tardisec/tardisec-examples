// routes/_middleware.ts
import { define } from "../utils.ts";
import tardisec from "../.tardisec.json" with { type: "json" };

export default define.middleware(async (ctx) => {
  const res = await ctx.next();
  for (const [k, v] of Object.entries(tardisec.http.headers)) {
    res.headers.set(k, v);
  }
  return res;
});