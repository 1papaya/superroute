import type {
  OverpassElement,
  OverpassWay,
  OverpassNode,
  OverpassRelation,
} from "overpass-ts";

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
          const memberId = `${m.type.slice(0,1)}${m.ref}`;
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
}
