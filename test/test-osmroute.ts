const assert = require("assert");
const sr = require("../src/index");

const validRouteData = {
  route: {
    type: "relation",
    id: 2,
    timestamp: "2000-01-01T12:00:02Z",
    version: 1,
    changeset: 1,
    user: "mDav",
    uid: 1337,
    tags: {
      name: "route1",
      type: "route",
    },
    members: [
      {
        type: "way",
        ref: 12,
        role: "",
      },
      {
        type: "way",
        ref: 13,
        role: "",
      },
    ],
  },
  ways: [
    {
      type: "way",
      id: 12,
      timestamp: "2000-01-01T12:00:12Z",
      version: 1,
      changeset: 1,
      user: "mDav",
      uid: 1337,
      nodes: [102, 103],
      tags: {
        name: "way12",
      },
      geometry: [
        {
          lat: 102,
          lon: 102,
        },
        {
          lat: 103,
          lon: 103,
        },
      ],
    },
    {
      type: "way",
      id: 13,
      timestamp: "2000-01-01T12:00:13Z",
      version: 1,
      changeset: 1,
      user: "mDav",
      uid: 1337,
      nodes: [104, 103],
      tags: {
        name: "way13",
      },
      geometry: [
        {
          lat: 104,
          lon: 104,
        },
        {
          lat: 103,
          lon: 103,
        },
      ],
    },
  ],
};

const validData = new sr.OSMRouteData([
  validRouteData.route,
  ...validRouteData.ways,
]);

const validRoute = validData.allRoutes[0];

describe("OSMRoute", function () {
  describe("simple valid route", function () {
    it("should be routable", function () {
      assert.equal(validRoute.isRoutable, true);
    });

    it("should return correct nodeDegrees", function () {
      assert.deepStrictEqual(validRoute.nodeDegrees, [
        [],
        ["n102", "n104"],
        ["n103"],
        [],
      ]);
    });

    it("should return correct multiLineStringFeature", function () {
      assert.deepStrictEqual(validRoute.multiLineStringFeature, {
        type: "Feature",
        properties: {
          "@timestamp": "2000-01-01T12:00:02Z",
          "@version": 1,
          "@changeset": 1,
          "@user": "mDav",
          "@uid": 1337,
          "@id": "r2",
          name: "route1",
          type: "route",
        },
        geometry: {
          type: "MultiLineString",
          coordinates: [
            [
              [102, 102],
              [103, 103],
            ],
            [
              [104, 104],
              [103, 103],
            ],
          ],
        },
      });
    });

    it("should return correct featureCollection", function () {
      assert.deepStrictEqual(validRoute.featureCollection, {
        type: "FeatureCollection",
        features: [
          {
            type: "Feature",
            properties: {
              "@timestamp": "2000-01-01T12:00:12Z",
              "@version": 1,
              "@changeset": 1,
              "@user": "mDav",
              "@uid": 1337,
              "@id": "w12",
              name: "way12",
            },
            geometry: {
              type: "LineString",
              coordinates: [
                [102, 102],
                [103, 103],
              ],
            },
          },
          {
            type: "Feature",
            properties: {
              "@timestamp": "2000-01-01T12:00:13Z",
              "@version": 1,
              "@changeset": 1,
              "@user": "mDav",
              "@uid": 1337,
              "@id": "w13",
              name: "way13",
            },
            geometry: {
              type: "LineString",
              coordinates: [
                [104, 104],
                [103, 103],
              ],
            },
          },
        ],
      });
    });

    it("should return correct orderedChildIds", function () {
      assert.deepEqual(validRoute.orderedChildIds, ["w12", "-w13"]);
    });

    it("should return correct endNodes", function () {
      assert.deepEqual(validRoute.endNodes, ["n102", "n104"]);
    });

    it("should return correct orderedFeatureCollection", function () {
      assert.deepEqual(validRoute.orderedFeatureCollection, {
        type: "FeatureCollection",
        features: [
          {
            type: "Feature",
            properties: {
              "@timestamp": "2000-01-01T12:00:12Z",
              "@version": 1,
              "@changeset": 1,
              "@user": "mDav",
              "@uid": 1337,
              "@id": "w12",
              name: "way12",
            },
            geometry: {
              type: "LineString",
              coordinates: [
                [102, 102],
                [103, 103],
              ],
            },
          },
          {
            type: "Feature",
            properties: {
              "@timestamp": "2000-01-01T12:00:13Z",
              "@version": 1,
              "@changeset": 1,
              "@user": "mDav",
              "@uid": 1337,
              "@id": "-w13",
              name: "way13",
            },
            geometry: {
              type: "LineString",
              coordinates: [
                [103, 103],
                [104, 104],
              ],
            },
          },
        ],
      });
    });

    it("should return correct lineStringFeature", function () {
      assert.deepStrictEqual(validRoute.lineStringFeature, {
        type: "Feature",
        properties: {
          "@timestamp": "2000-01-01T12:00:02Z",
          "@version": 1,
          "@changeset": 1,
          "@user": "mDav",
          "@uid": 1337,
          "@id": "r2",
          name: "route1",
          type: "route",
        },
        geometry: {
          type: "LineString",
          coordinates: [
            [102, 102],
            [103, 103],
            [104, 104],
          ],
        },
      });
    });
  });

  describe("simple invalid route", function () {
    const invalidRouteData = JSON.parse(JSON.stringify(validRouteData));

    invalidRouteData["ways"][0] = {
      type: "way",
      id: 12,
      timestamp: "2000-01-01T12:00:12Z",
      version: 1,
      changeset: 1,
      user: "mDav",
      uid: 1337,
      nodes: [102, 106],
      tags: { name: "way12" },
      geometry: [
        { lon: 102, lat: 102 },
        { lon: 106, lat: 106 },
      ],
    };

    const invalidData = new sr.OSMRouteData([
      invalidRouteData.route,
      ...invalidRouteData.ways,
    ]);
    
    const invalidRoute = invalidData.allRoutes[0];

    it("should be not routable", function () {
      assert.equal(invalidRoute.isRoutable, false);
    });

    it("should return correct nodeDegrees", function () {
      assert.deepStrictEqual(invalidRoute.nodeDegrees, [
        [],
        ["n102", "n106", "n104", "n103"],
        [],
        [],
      ]);
    });

    it("should return correct multiLineStringFeature", function () {
      assert.deepStrictEqual(invalidRoute.multiLineStringFeature, {
        type: "Feature",
        properties: {
          "@timestamp": "2000-01-01T12:00:02Z",
          "@version": 1,
          "@changeset": 1,
          "@user": "mDav",
          "@uid": 1337,
          "@id": "r2",
          name: "route1",
          type: "route",
        },
        geometry: {
          type: "MultiLineString",
          coordinates: [
            [
              [102, 102],
              [106, 106],
            ],
            [
              [104, 104],
              [103, 103],
            ],
          ],
        },
      });
    });

    it("should return correct featureCollection", function () {
      assert.deepStrictEqual(invalidRoute.featureCollection, {
        type: "FeatureCollection",
        features: [
          {
            type: "Feature",
            properties: {
              "@timestamp": "2000-01-01T12:00:12Z",
              "@version": 1,
              "@changeset": 1,
              "@user": "mDav",
              "@uid": 1337,
              "@id": "w12",
              name: "way12",
            },
            geometry: {
              type: "LineString",
              coordinates: [
                [102, 102],
                [106, 106],
              ],
            },
          },
          {
            type: "Feature",
            properties: {
              "@timestamp": "2000-01-01T12:00:13Z",
              "@version": 1,
              "@changeset": 1,
              "@user": "mDav",
              "@uid": 1337,
              "@id": "w13",
              name: "way13",
            },
            geometry: {
              type: "LineString",
              coordinates: [
                [104, 104],
                [103, 103],
              ],
            },
          },
        ],
      });
    });

    it("should exception on orderedChildIds", function () {
      assert.throws(() => {
        invalidRoute.orderedChildIds;
      });
    });

    it("should exception on endNodes", function () {
      assert.throws(() => {
        invalidRoute.endNodes;
      });
    });

    it("should exception on orderedFeatureCollection", function () {
      assert.throws(() => {
        invalidRoute.orderedFeatureCollection;
      });
    });

    it("should exception on lineStringFeature", function () {
      assert.throws(() => {
        invalidRoute.lineStringFeature;
      });
    });
  });
});