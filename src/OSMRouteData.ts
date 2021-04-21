import type {
  OverpassElement,
  OverpassWay,
  OverpassNode,
  OverpassRelation,
  OverpassJson,
} from "overpass-ts";
import type { ZFactory } from "z-factory";

import { META_TAGS } from "./OSMElement";
import OSMSuperRouteRelation from "./OSMSuperRouteRelation";
import OSMRouteRelation from "./OSMRouteRelation";
import OSMNode from "./OSMNode";
import OSMWay from "./OSMWay";

export default class OSMRouteData extends Map<
  string,
  OSMNode | OSMWay | OSMRouteRelation | OSMSuperRouteRelation
> {
  timestamp: string | null;

  constructor(
    data: Array<OverpassElement> = [],
    timestamp: string | null = null
  ) {
    super();
    this.timestamp = timestamp;

    //
    // add nodes & ways to cache
    //

    (data.filter(
      (el) => el["type"] === "way" || el["type"] === "node"
    ) as Array<OverpassWay | OverpassNode>).forEach((overpassEl) => {
      const osmElement =
        overpassEl.type === "way"
          ? new OSMWay(overpassEl)
          : new OSMNode(overpassEl);

      this.set(osmElement.id, osmElement);
    });

    //
    // add baseroutes to cache
    //

    const relations = data.filter(
      (el) => el["type"] === "relation"
    ) as OverpassRelation[];

    // baseroutes are relations with type=route and
    // have no relation members with non-alternative role
    relations
      .filter(
        (el) =>
          "tags" in el &&
          "type" in el.tags &&
          el.tags["type"] === "route" &&
          !!el.members.find(
            (m) => m["type"] === "relation" && m["role"] !== "alternative"
          ) === false
      )
      .forEach((overpassBaseRoute) => {
        const baseRoute = new OSMRouteRelation(overpassBaseRoute);

        baseRoute.addRefs(this);
        this.set(baseRoute.id, baseRoute);
      });

    //
    // add superroutes to cache
    //

    // superroutes are relations with type~route|superroute and
    // at least one subrelation which is not an alternative
    const superRoutes = relations.filter(
      (el) =>
        "tags" in el &&
        "type" in el.tags &&
        (el.tags["type"] === "route" || el.tags["type"] === "superroute") &&
        !!el.members.find(
          (m) => m["type"] === "relation" && m["role"] !== "alternative"
        ) === true
    );

    // add superroutes to cache
    superRoutes.forEach((overpassSuperRoute) => {
      const superRoute = new OSMSuperRouteRelation(overpassSuperRoute);
      this.set(superRoute.id, superRoute);
    });

    superRoutes.forEach((overpassSuperRoute) => {
      // add superroutes as parents for each relation
      overpassSuperRoute.members
        .filter((m) => m.type === "relation")
        .forEach((m) => {
          const memberId = `${m.type.slice(0, 1)}${m.ref}`;
          // if member doesn't exist in data, nothing to do here...
          if (!this.has(memberId)) return;

          const memberRoute = this.get(memberId) as OSMRouteRelation;

          memberRoute.addParent({
            type: "relation",
            role: m.role,
            ref: overpassSuperRoute.id,
          });
        });
    });

    // add references on parents and children
    superRoutes.forEach((overpassSuperRoute) => {
      const superRoute = this.get(
        `r${overpassSuperRoute.id}`
      ) as OSMRouteRelation;

      superRoute.addRefs(this);
    });
  }

  get allRoutes(): Array<OSMRouteRelation | OSMSuperRouteRelation> {
    return Array.from(this.values()).filter(
      (element) => element instanceof OSMRouteRelation
    ) as Array<OSMRouteRelation>;
  }

  get baseRoutes(): OSMRouteRelation[] {
    return Array.from(this.values()).filter(
      (element) =>
        element instanceof OSMRouteRelation &&
        !(element instanceof OSMSuperRouteRelation)
    ) as OSMRouteRelation[];
  }

  get superRoutes(): OSMSuperRouteRelation[] {
    return Array.from(this.values()).filter(
      (element) => element instanceof OSMSuperRouteRelation
    ) as OSMSuperRouteRelation[];
  }

  async addElevation(zFactory: ZFactory, zoomLevel = 11): Promise<unknown> {
    return Promise.all(
      Array.from(this.values()).map((el: OSMWay) => {
        if (el.type !== "way") return new Promise((res) => res(null));

        return Promise.all(
          el.geometry.map((coord, coordIdx) =>
            zFactory.getZ([coord.lon, coord.lat], zoomLevel).then((ele) => {
              el.geometry[coordIdx] = Object.assign({}, el.geometry[coordIdx], {
                z: Math.round(ele * 10) / 10,
              });
            })
          )
        );
      })
    );
  }

  addStatsMetadataToWays(): void {}

  toJson(): OverpassJson {
    const sortedElIds = Array.from(this.keys()).sort();

    return {
      version: 0.6,
      generator: "superroute via overpass api",
      osm3s: {
        timestamp_osm_base: this.timestamp,
        copyright:
          "The data included in this document is from www.openstreetmap.org. The data is made available under ODbL.",
      },
      elements: sortedElIds.map((elId) => {
        let el = this.get(elId);

        const obj = {
          type: el.type,
          id: parseInt(el.id.slice(1)),
        };

        // copy over meta tags
        for (const tag of META_TAGS)
          if (tag in el.meta) obj[tag] = el.meta[tag];

        if (el.type === "way") {
          el = el as OSMWay;
          obj["nodes"] = [el.nodes[0], el.nodes[el.nodes.length - 1]];
          obj["geometry"] = el.geometry;
          obj["tags"] = el.tags;

          return obj as OverpassWay;
        } else if (el.type === "relation") {
          el = el as OSMRouteRelation;

          obj["members"] = el.members.map((member) => ({
            type: member.type,
            ref: member.ref,
            role: member.role,
          }));

          obj["tags"] = el.tags;

          return obj as OverpassRelation;
        }
      }),
    };
  }
}
