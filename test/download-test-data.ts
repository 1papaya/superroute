const fs = require("fs");
const testTrails = require("./trails").default;
const overpass = require("overpass-ts");
console.log(overpass);


const outDir = "./test/data";

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

(async () => {
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir);

  for (const trail of testTrails) {
    for (const routability of ["routable", "unroutable"]) {
      const outFile = `${outDir}/${trail.name}-${routability}.json`;

      if (fs.existsSync(outFile)) {
        console.log(`skipping ${trail.name}-${routability}`);
        continue;
      }

      if (!(`${routability}Date` in trail)) continue;

      console.log(`downloading ${trail.name}-${routability}`);

      const query = `
      [out:json][date:"${trail[`${routability}Date`]}"];

        relation(id:${trail.id}) -> .routes;
       .routes; >>; rel(r) -> .subroutes;

       (.routes; .subroutes;) -> .allroutes;

       .allroutes out meta;
       .allroutes; way(r); out meta geom;
       .allroutes; node(r); out meta geom;
     `;

      const data = await overpass(query);

      fs.writeFileSync(outFile, JSON.stringify(data, null, 2));

      await sleep(20000);
    }
  }
})();
