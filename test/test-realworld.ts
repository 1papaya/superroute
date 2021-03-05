import testTrails from "./trails";
import * as sr from "../src/index";
import * as fs from "fs";
import * as assert from "assert";

const anyRouteGetters = [
  "alternatives",
  "deepFeatureCollection",
  "deepMultiLineStringFeature",
  "simplestFeature",
];

const onlyRoutableGetters = [
  "orderedFeatureCollection",
  "deepOrderedFeatureCollection",
  "lineStringFeature",
];

const baseRouteUnroutableGetters = [
  "featureCollection",
  "multiLineStringFeature",
];

const allGetters = [
  ...anyRouteGetters,
  ...onlyRoutableGetters,
  ...baseRouteUnroutableGetters,
];

const _addSortProperty = function (featCollection) {
  const dupeFeatCollection = JSON.parse(JSON.stringify(featCollection));

  for (let i = 0; i < dupeFeatCollection.features.length; i++) {
    dupeFeatCollection.features[i].properties["sort"] = i;
  }

  return dupeFeatCollection;
};

const loadFile = (path: string): Promise<sr.OSMRouteData> => {
  // TODO check not in browser
  return import("fs").then((fs) => {
    return fs.promises.readFile(path, { encoding: "utf8" }).then((raw) => {
      const data = JSON.parse(raw);
      return new sr.OSMRouteData(data.elements, data.osm3s.timestamp_osm_base);
    });
  });
};

describe("Real World Routes", function () {
  if (!fs.existsSync("./test/data/out/")) fs.mkdirSync("./test/data/out/");
  for (const trail of testTrails) {
    for (const routability of ["routable", "unroutable"]) {
      let data, route;

      if (!fs.existsSync(`./test/data/${trail.name}-${routability}.json`))
        continue;

      describe(`${trail.name}-${routability}`, function () {
        before(async function () {
          const dataPath = `./test/data/${trail.name}-${routability}.json`;

          if (fs.existsSync(dataPath)) {
            data = await loadFile(
              `./test/data/${trail.name}-${routability}.json`
            );
            route = data.get(`r${trail.id}`);
          }
        });

        for (const getter of allGetters) {
          it(`${getter}`, function () {
            if (typeof route === "undefined") return;

            const isUnroutableWithOnlyRoutableGetter =
              routability === "unroutable" &&
              onlyRoutableGetters.includes(getter);

            const isUnroutableSuperRelationWithBaseRouteGetters =
              routability === "unroutable" &&
              route instanceof sr.OSMSuperRouteRelation &&
              baseRouteUnroutableGetters.includes(getter);

            const shouldError =
              isUnroutableWithOnlyRoutableGetter ||
              isUnroutableSuperRelationWithBaseRouteGetters;

            const assert_ = shouldError ? assert.throws : assert.doesNotThrow;

            console.log(`     ${shouldError ? "should" : "shouldn't"} error:`);

            assert_(function () {
              let json = route[getter];

              if (json.type === "FeatureCollection")
                json = _addSortProperty(json);

              fs.writeFileSync(
                `./test/data/out/${trail.name}-${routability}-${getter}.json`,
                JSON.stringify(json, null, 2)
              );
            });
          });
        }
      });
    }
  }
});

export {};
