const assert = require("assert");
const sr = require("../src/index");

const validSuperrouteData = {
  superroute: {
    type: "relation",
    id: 0,
    timestamp: "2000-01-01T12:00:00Z",
    version: 1,
    changeset: 1,
    user: "mDav",
    uid: 1337,
    tags: {
      name: "superroute0",
      type: "superroute",
    },
    members: [
      {
        type: "relation",
        ref: 1,
        role: "",
      },
      {
        type: "relation",
        ref: 2,
        role: "",
      },
    ],
  },
  routes: [
    {
      type: "relation",
      id: 1,
      timestamp: "2000-01-01T12:00:01Z",
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
          ref: 10,
          role: "",
        },
        {
          type: "way",
          ref: 11,
          role: "",
        },
      ],
    },
    {
      type: "relation",
      id: 2,
      timestamp: "2000-01-01T12:00:02Z",
      version: 1,
      changeset: 1,
      user: "mDav",
      uid: 1337,
      tags: {
        name: "route2",
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
  ],
  ways: [
    {
      type: "way",
      id: 10,
      timestamp: "2000-01-01T12:00:10Z",
      version: 1,
      changeset: 1,
      user: "mDav",
      uid: 1337,
      nodes: [100, 101],
      tags: {
        name: "way10",
      },
      geometry: [
        {
          lat: 100,
          lon: 100,
        },
        {
          lat: 101,
          lon: 101,
        },
      ],
    },
    {
      type: "way",
      id: 11,
      timestamp: "2000-01-01T12:00:11Z",
      version: 1,
      changeset: 1,
      user: "mDav",
      uid: 1337,
      nodes: [101, 102],
      tags: {
        name: "way11",
      },
      geometry: [
        {
          lat: 101,
          lon: 101,
        },
        {
          lat: 102,
          lon: 102,
        },
      ],
    },
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

const validRouteData = new sr.OSMRouteData([
  validSuperrouteData.superroute,
  ...validSuperrouteData.routes,
  ...validSuperrouteData.ways,
]);

const validSuperroute = validRouteData.superRoutes[0];

describe("OSMSuperRoute", function () {
  describe("simple valid superroute", function () {
    it("should be routable", function () {
      assert.equal(validSuperroute.isRoutable, true);
    });

    it("should return correct nodeDegrees", function () {
      assert.deepStrictEqual(validSuperroute.nodeDegrees, [
        [],
        ["n100", "n104"],
        ["n102"],
        [],
      ]);
    });

    it("should return correct multiLineStringFeature", function () {
      assert.deepStrictEqual(validSuperroute.multiLineStringFeature, {
        type: "Feature",
        properties: {
          "@timestamp": "2000-01-01T12:00:00Z",
          "@version": 1,
          "@changeset": 1,
          "@user": "mDav",
          "@uid": 1337,
          "@id": "r0",
          name: "superroute0",
          type: "superroute",
        },
        geometry: {
          type: "MultiLineString",
          coordinates: [
            [
              [100, 100],
              [101, 101],
              [102, 102],
            ],
            [
              [102, 102],
              [103, 103],
              [104, 104],
            ],
          ],
        },
      });
    });

    it("should return correct featureCollection", function () {
      assert.deepStrictEqual(validSuperroute.featureCollection, {
        type: "FeatureCollection",
        features: [
          {
            type: "Feature",
            properties: {
              "@timestamp": "2000-01-01T12:00:01Z",
              "@version": 1,
              "@changeset": 1,
              "@user": "mDav",
              "@uid": 1337,
              "@id": "r1",
              name: "route1",
              type: "route",
            },
            geometry: {
              type: "LineString",
              coordinates: [
                [100, 100],
                [101, 101],
                [102, 102],
              ],
            },
          },
          {
            type: "Feature",
            properties: {
              "@timestamp": "2000-01-01T12:00:02Z",
              "@version": 1,
              "@changeset": 1,
              "@user": "mDav",
              "@uid": 1337,
              "@id": "r2",
              name: "route2",
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
          },
        ],
      });
    });

    it("should return correct orderedChildIds", function () {
      assert.deepEqual(validSuperroute.orderedChildIds, ["r1", "r2"]);
    });

    it("should return correct endNodes", function () {
      assert.deepEqual(validSuperroute.endNodes, ["n100", "n104"]);
    });

    it("should return correct orderedFeatureCollection", function () {
      assert.deepEqual(validSuperroute.orderedFeatureCollection, {
        type: "FeatureCollection",
        features: [
          {
            type: "Feature",
            properties: {
              "@timestamp": "2000-01-01T12:00:01Z",
              "@version": 1,
              "@changeset": 1,
              "@user": "mDav",
              "@uid": 1337,
              "@id": "r1",
              name: "route1",
              type: "route",
            },
            geometry: {
              type: "LineString",
              coordinates: [
                [100, 100],
                [101, 101],
                [102, 102],
              ],
            },
          },
          {
            type: "Feature",
            properties: {
              "@timestamp": "2000-01-01T12:00:02Z",
              "@version": 1,
              "@changeset": 1,
              "@user": "mDav",
              "@uid": 1337,
              "@id": "r2",
              name: "route2",
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
          },
        ],
      });
    });

    it("should return correct lineStringFeature", function () {
      assert.deepStrictEqual(validSuperroute.lineStringFeature, {
        type: "Feature",
        properties: {
          "@timestamp": "2000-01-01T12:00:00Z",
          "@version": 1,
          "@changeset": 1,
          "@user": "mDav",
          "@uid": 1337,
          "@id": "r0",
          name: "superroute0",
          type: "superroute",
        },
        geometry: {
          type: "LineString",
          coordinates: [
            [100, 100],
            [101, 101],
            [102, 102],
            [103, 103],
            [104, 104],
          ],
        },
      });
    });

    it("should return correct deepOrderedFeatureCollection", function () {
      assert.deepStrictEqual(validSuperroute.deepOrderedFeatureCollection, {
        type: "FeatureCollection",
        features: [
          {
            type: "Feature",
            properties: {
              "@timestamp": "2000-01-01T12:00:10Z",
              "@version": 1,
              "@changeset": 1,
              "@user": "mDav",
              "@uid": 1337,
              "@id": "w10",
              name: "way10",
            },
            geometry: {
              type: "LineString",
              coordinates: [
                [100, 100],
                [101, 101],
              ],
            },
          },
          {
            type: "Feature",
            properties: {
              "@timestamp": "2000-01-01T12:00:11Z",
              "@version": 1,
              "@changeset": 1,
              "@user": "mDav",
              "@uid": 1337,
              "@id": "w11",
              name: "way11",
            },
            geometry: {
              type: "LineString",
              coordinates: [
                [101, 101],
                [102, 102],
              ],
            },
          },
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

    it("should return correct deepFeatureCollection", function () {
      assert.deepStrictEqual(validSuperroute.deepFeatureCollection, {
        type: "FeatureCollection",
        features: [
          {
            type: "Feature",
            properties: {
              "@timestamp": "2000-01-01T12:00:10Z",
              "@version": 1,
              "@changeset": 1,
              "@user": "mDav",
              "@uid": 1337,
              "@id": "w10",
              name: "way10",
            },
            geometry: {
              type: "LineString",
              coordinates: [
                [100, 100],
                [101, 101],
              ],
            },
          },
          {
            type: "Feature",
            properties: {
              "@timestamp": "2000-01-01T12:00:11Z",
              "@version": 1,
              "@changeset": 1,
              "@user": "mDav",
              "@uid": 1337,
              "@id": "w11",
              name: "way11",
            },
            geometry: {
              type: "LineString",
              coordinates: [
                [101, 101],
                [102, 102],
              ],
            },
          },
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
  });

  describe("simple invalid superroute", function () {
    const invalidSuperrouteData = JSON.parse(
      JSON.stringify(validSuperrouteData)
    );

    invalidSuperrouteData.ways[1] = {
      type: "way",
      id: 11,
      timestamp: "2000-01-01T12:00:11Z",
      version: 1,
      changeset: 1,
      user: "mDav",
      uid: 1337,
      nodes: [101, 109],
      tags: {
        name: "way11",
      },
      geometry: [
        {
          lat: 101,
          lon: 101,
        },
        {
          lat: 109,
          lon: 109,
        },
      ],
    };

    const invalidRouteData = new sr.OSMRouteData([
      invalidSuperrouteData.superroute,
      ...invalidSuperrouteData.routes,
      ...invalidSuperrouteData.ways,
    ]);

    const invalidSuperroute = invalidRouteData.superRoutes[0];

    it("should be not routable", function () {
      assert.equal(invalidSuperroute.isRoutable, false);
    });

    it("should return correct nodeDegrees", function () {
      assert.deepStrictEqual(invalidSuperroute.nodeDegrees, [
        [],
        ["n100", "n109", "n102", "n104"],
        [],
        [],
      ]);
    });

    it("should return correct deepMultiLineStringFeature", function () {
      assert.deepStrictEqual(invalidSuperroute.deepMultiLineStringFeature, {
        type: "Feature",
        properties: {
          "@timestamp": "2000-01-01T12:00:00Z",
          "@version": 1,
          "@changeset": 1,
          "@user": "mDav",
          "@uid": 1337,
          "@id": "r0",
          name: "superroute0",
          type: "superroute",
        },
        geometry: {
          type: "MultiLineString",
          coordinates: [
            [
              [100, 100],
              [101, 101],
            ],
            [
              [101, 101],
              [109, 109],
            ],
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

    it("should exception on featureCollection", function () {
      assert.throws(() => {
        invalidSuperroute.featureCollection;
      });
    });

    it("should exception on orderedChildIds", function () {
      assert.throws(() => {
        invalidSuperroute.orderedChildIds;
      });
    });

    it("should exception on startNode", function () {
      assert.throws(() => {
        invalidSuperroute.endNodes;
      });
    });

    it("should exception on orderedFeatureCollection", function () {
      assert.throws(() => {
        invalidSuperroute.orderedFeatureCollection;
      });
    });

    it("should exception on lineStringFeature", function () {
      assert.throws(() => {
        invalidSuperroute.lineStringFeature;
      });
    });

    it("should exception on deepOrderedFeatureCollection", function () {
      assert.throws(() => {
        invalidSuperroute.deepOrderedFeatureCollection;
      });
    });

    it("should return correct deepFeatureCollection", function () {
      assert.deepStrictEqual(invalidSuperroute.deepFeatureCollection, {
        type: "FeatureCollection",
        features: [
          {
            type: "Feature",
            properties: {
              "@timestamp": "2000-01-01T12:00:10Z",
              "@version": 1,
              "@changeset": 1,
              "@user": "mDav",
              "@uid": 1337,
              "@id": "w10",
              name: "way10",
            },
            geometry: {
              type: "LineString",
              coordinates: [
                [100, 100],
                [101, 101],
              ],
            },
          },
          {
            type: "Feature",
            properties: {
              "@timestamp": "2000-01-01T12:00:11Z",
              "@version": 1,
              "@changeset": 1,
              "@user": "mDav",
              "@uid": 1337,
              "@id": "w11",
              name: "way11",
            },
            geometry: {
              type: "LineString",
              coordinates: [
                [101, 101],
                [109, 109],
              ],
            },
          },
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
  });
});

export {};
