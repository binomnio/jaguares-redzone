// Isolated UI fixtures only. Never changes application auth or calls remote services.
const { build } = await import(
  process.env.ESBUILD_MODULE ||
    "/tmp/admin-mobile-tools/node_modules/esbuild/lib/main.js"
);
import { createServer } from "node:http";
import { mkdirSync, writeFileSync, readFileSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import assert from "node:assert/strict";
const { chromium } = await import(
  process.env.PLAYWRIGHT_MODULE ||
    "/tmp/admin-mobile-tools/node_modules/playwright/index.mjs"
);
const root = fileURLToPath(new URL("..", import.meta.url)).replace(/\/$/, "");
const dir = process.env.ADMIN_MOBILE_OUTPUT || "/tmp/admin-mobile-fixture";
mkdirSync(dir, { recursive: true });
const logo =
  "data:image/svg+xml," +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64"><rect width="64" height="64" rx="12" fill="#dc2626"/><text x="32" y="42" fill="white" font-size="32" text-anchor="middle">J</text></svg>',
  );
writeFileSync(
  dir + "/next.tsx",
  `import React from 'react'; export default function Link({href,onClick,...props}) {return <a href={href} {...props} onClick={e=>{onClick?.(e);e.preventDefault();history.pushState(null,'',href)}}/>} export function useRouter(){return {push(){},refresh(){}}} export function Image({fill,unoptimized,...props}){return <img {...props} style={fill?{position:'absolute',width:'100%',height:'100%',inset:0}:undefined}/>}`,
);
writeFileSync(dir + "/image.tsx", `export {Image as default} from './next';`);
writeFileSync(
  dir + "/supabase.ts",
  `const id='123e4567-e89b-12d3-a456-426614174000'; const tables={team_settings:[{id,team_name:'Jaguares',logo_url:${JSON.stringify(logo)},primary_color:'#dc2626',secondary_color:'#111827'}],games:[{id,opponent_name:'Equipo visitante con nombre largo',game_date:'2026-11-01T18:00:00Z',location:'Estadio de prueba',is_home:true,status:'final',our_score:24,opponent_score:17}],players:[{id,first_name:'Alejandro',last_name:'Apellido compuesto de prueba',jersey_number:'99',position:'QB',height:'1.80 m',weight:'80 kg',active:true,is_featured:true}],standings:[{id,position:1,team_name:'Equipo con nombre largo de prueba',wins:3,losses:1,ties:0,pf:90,pc:40,dif:50,stk:'W3'}]}; export async function createClient(){return {auth:{getUser:async()=>({data:{user:{app_metadata:{role:'admin'}}}})},from(table){const q={select(){return this},limit(){return this},order(){return this},eq(){return this},maybeSingle:async()=>({data:tables[table][0]}),single:async()=>({data:tables[table][0]}),then(resolve){return Promise.resolve({data:tables[table],count:tables[table].length,error:null}).then(resolve)}};return q}}}`,
);
const routes = [
  "dashboard",
  "team",
  "games",
  "players",
  "standings",
  "games/new",
  "players/new",
  "standings/new",
  "games/[id]",
  "players/[id]",
  "standings/[id]",
];
writeFileSync(
  dir + "/server.tsx",
  `import React from 'react'; import {renderToString} from 'react-dom/server'; import Layout from '${root}/app/(admin)/layout.tsx'; ${routes.map((r, i) => `import P${i} from '${root}/app/(admin)/admin/${r}/page.tsx';`).join("\n")} const pages={${routes.map((r, i) => `${JSON.stringify("/admin/" + r.replace("[id]", "123e4567-e89b-12d3-a456-426614174000"))}:P${i}`).join(",")}}; export async function render(path){const Page=pages[path];if(!Page)return null; const children=await Page({params:Promise.resolve({id:'123e4567-e89b-12d3-a456-426614174000'})});return renderToString(await Layout({children})).replace('<aside','<div id="fixture-navigation" style="display:contents"><aside').replace('</aside>','</aside></div>');}`,
);
writeFileSync(
  dir + "/browser.tsx",
  `import React from 'react';import {hydrateRoot} from 'react-dom/client';import Navigation from '${root}/components/AdminNavigation.tsx';hydrateRoot(document.getElementById('fixture-navigation'),<Navigation logoUrl={${JSON.stringify(logo)}}/>);`,
);
const plugin = {
  name: "fixture-only-mocks",
  setup(b) {
    b.onResolve(
      { filter: /^next\/(link|navigation|image|cache)$/ },
      (args) => ({
        path: dir + (args.path === "next/image" ? "/image.tsx" : "/next.tsx"),
      }),
    );
    b.onResolve({ filter: /^@\// }, (args) => ({
      path:
        args.path === "@/utils/supabase/server"
          ? dir + "/supabase.ts"
          : root +
            "/" +
            args.path.slice(2) +
            (/\.(tsx?|js)$/.test(args.path)
              ? ""
              : args.path.includes("components/")
                ? ".tsx"
                : ".ts"),
    }));
  },
};
const common = {
  bundle: true,
  jsx: "automatic",
  nodePaths: [root + "/node_modules"],
  plugins: [plugin],
  logLevel: "silent",
};
// The cache stub is unused by rendering; server actions are never invoked.
writeFileSync(
  dir + "/next.tsx",
  readFileSync(dir + "/next.tsx", "utf8") +
    "\nexport function revalidatePath(){}",
);
await build({
  ...common,
  entryPoints: [dir + "/server.tsx"],
  platform: "node",
  format: "cjs",
  outfile: dir + "/server.cjs",
});
await build({
  ...common,
  entryPoints: [dir + "/browser.tsx"],
  platform: "browser",
  outfile: dir + "/browser.js",
});
const { render } = (await import(dir + "/server.cjs")).default;
const css = readdirSync(root + "/.next/static/chunks")
  .filter((x) => x.endsWith(".css"))
  .map((x) => readFileSync(root + "/.next/static/chunks/" + x, "utf8"))
  .join("\n");
const server = createServer(async (req, res) => {
  try {
    if (req.url === "/style.css") {
      res.setHeader("Content-Type", "text/css");
      return res.end(css);
    }
    if (req.url === "/browser.js") {
      res.setHeader("Content-Type", "text/javascript");
      return res.end(readFileSync(dir + "/browser.js"));
    }
    const html = await render(req.url);
    if (!html) {
      res.statusCode = 404;
      return res.end();
    }
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.end(
      '<!doctype html><html lang="es"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/><link rel="stylesheet" href="/style.css"/></head><body style="margin:0;font-family:Arial">' +
        html +
        '<script src="/browser.js"></script></body></html>',
    );
  } catch (e) {
    res.statusCode = 500;
    res.end(String(e));
  }
});
await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
const baseUrl = `http://127.0.0.1:${server.address().port}`;
const browser = await chromium.launch({
  executablePath: "/usr/bin/chromium",
  args: ["--no-sandbox"],
});
const results = [];
try {
  for (const width of [320, 390, 768, 1440])
    for (const r of routes) {
      const path =
        "/admin/" + r.replace("[id]", "123e4567-e89b-12d3-a456-426614174000");
      const page = await browser.newPage({ viewport: { width, height: 844 } });
      const errors = [];
      page.on("pageerror", (e) => errors.push(e.message));
      const response = await page.goto(baseUrl + path, {
        waitUntil: "networkidle",
      });
      assert.equal(response.status(), 200);
      assert.equal(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
        true,
        `${width} ${r}: document overflow`,
      );
      const menu = page.locator('button[aria-controls="admin-navigation"]');
      if (width < 768) {
        await menu.click();
        await assert.equal(await menu.getAttribute("aria-expanded"), "true");
        await page.keyboard.press("Escape");
        assert.equal(await menu.getAttribute("aria-expanded"), "false");
        await menu.click();
        await page.getByRole("link", { name: "Roster", exact: true }).click();
        assert.equal(await menu.getAttribute("aria-expanded"), "false");
      } else {
        assert.equal(await menu.isVisible(), false);
        assert.equal(await page.getByRole("navigation").isVisible(), true);
      }
      assert.deepEqual(errors, []);
      if (
        ["dashboard", "games", "team", "standings/new"].includes(r) &&
        [390, 1440].includes(width)
      )
        await page.screenshot({
          path: dir + "/" + r.replace("/", "-") + "-" + width + ".png",
          fullPage: true,
        });
      results.push({ path, width, passed: true });
      await page.close();
    }
  writeFileSync(dir + "/results.json", JSON.stringify(results, null, 2));
  console.log(
    "Passed",
    results.length,
    "route/viewport checks including menu, Escape, link close and document overflow",
  );
} finally {
  await browser.close();
  server.close();
}
