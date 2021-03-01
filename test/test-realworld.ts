const testTrails = require("./trails.ts").default;
const sr = require("../src/index");
const assert = require("assert");
const fs = require("fs");

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

describe("Real World Routes", function () {
  for (const trail of testTrails) {
    for (const routability of ["routable", "unroutable"]) {
      let data, route;

      if (!fs.existsSync(`./test/data/${trail.name}-${routability}.json`))
        continue;

      describe(`${trail.name}-${routability}`, function () {
        before(async function () {
          const dataPath = `./test/data/${trail.name}-${routability}.json`;

          if (fs.existsSync(dataPath)) {
            data = await sr.loadFile(
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
