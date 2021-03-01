import OSMRouteRelation, { RouteTopologyError } from "./OSMRouteRelation";
import type { OSMRelationMember } from "./OSMRelation";
import type { OverpassRelation } from "overpass-ts";
import { reverseFeatureCollection } from "./utils";

export default class OSMSuperRouteRelation extends OSMRouteRelation {
  constructor(relation: OverpassRelation) {
    super(relation);
  }

  /**
   * OSMSuperRouteRelation children: member relations
   */
  get children(): OSMRelationMember[] {
    return this.members.filter(
      (member) => member.type === "relation" && "element" in member
    );
  }

  get alternatives(): GeoJSON.FeatureCollection {
    const alternativeRouteRelations = [];
    const alternativeWays = [];

    for (const child of this.children) {
      if (child.element instanceof OSMSuperRouteRelation) {
        if (child.role === "alternative")
          alternativeRouteRelations.push(
            ...child.element.children.map((child) => child.element)
          );
        else
          alternativeRouteRelations.push(
            ...child.element.alternatives.features
          );
      } else if (child.element instanceof OSMRouteRelation) {
        if (child.role === "alternative")
          alternativeRouteRelations.push(child.element);
        else alternativeWays.push(...child.element.alternatives.features);
      }
    }

    return {
      type: "FeatureCollection",
      features: alternativeRouteRelations.map((route) => route.simplestFeature),
    };
  }

  /**
   * Return ordered GeoJSON FeatureCollection of all child OSMWays
   * Will throw a TopologyError if any child is not routable
   */
  get deepOrderedFeatureCollection(): GeoJSON.FeatureCollection {
    const feats = [];

    if (!this.isRoutable) throw new RouteTopologyError(this);

    this.orderedChildIds.map((childId) => {
      const isReversed = childId.slice(0, 1) === "-";
      const absoluteId = isReversed ? childId.slice(1) : childId;
      const memberEl = this.children.find(
        (child) =>
          child.element.id === absoluteId && child.role !== "alternative"
      ).element as OSMSuperRouteRelation | OSMRouteRelation;

      const featCollection = memberEl.deepOrderedFeatureCollection;
      const features = isReversed
        ? reverseFeatureCollection(featCollection).features
        : featCollection.features;

      feats.push(...features);
    });

    return {
      type: "FeatureCollection",
      features: feats,
    };
  }

  /**
   * Return GeoJSON FeatureCollection of all child OSMWays
   */
  get deepFeatureCollection(): GeoJSON.FeatureCollection {
    const feats = [];

    this.children.forEach((child) => {
      if (child.role === "alternative") return;

      if (child.element instanceof OSMSuperRouteRelation)
        feats.push(...child.element.deepFeatureCollection.features);
      else if (child.element instanceof OSMRouteRelation)
        feats.push(...child.element.featureCollection.features);
    });

    return {
      type: "FeatureCollection",
      features: feats,
    };
  }

  /**
   * Return GeoJSON MultiLineString feature (deep & unordered)
   * Every LineString of output MultiLineString is from an OSMWay
   */

  get deepMultiLineStringFeature(): GeoJSON.Feature<GeoJSON.MultiLineString> {
    return {
      type: "Feature",
      properties: this.properties,
      geometry: {
        type: "MultiLineString",
        coordinates: (this.deepFeatureCollection
          .features as GeoJSON.Feature<GeoJSON.LineString>[]).map((feat) => {
          return feat.geometry.coordinates;
        }),
      },
    };
  }

  get multiLineStringFeature(): GeoJSON.Feature<GeoJSON.MultiLineString> {
    if (!this.isRoutable) throw new RouteTopologyError(this);
    return super.multiLineStringFeature;
  }

  get featureCollection(): GeoJSON.FeatureCollection {
    if (!this.isRoutable) throw new RouteTopologyError(this);
    return super.featureCollection;
  }
}
