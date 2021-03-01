import type { OverpassRelationMember } from "overpass-ts";

export const reverseFeatureCollection = function (
  featureCollection: GeoJSON.FeatureCollection
): GeoJSON.FeatureCollection {
  featureCollection.features = featureCollection.features.slice().reverse();
  featureCollection.features = featureCollection.features.map(
    reverseLineFeature
  );

  return featureCollection;
};

export const reverseLineFeature = function (
  feature: GeoJSON.Feature<GeoJSON.LineString | GeoJSON.MultiLineString>
): GeoJSON.Feature<GeoJSON.LineString | GeoJSON.MultiLineString> {
  const id_ = feature.properties["@id"];

  return {
    type: "Feature",
    properties: Object.assign({}, feature.properties, {
      "@id": _isReversed(id_) ? `${id_.slice(1)}` : `-${id_}`,
    }),
    geometry:
      feature.geometry.type === "LineString"
        ? {
            type: "LineString",
            coordinates: feature.geometry.coordinates.slice().reverse(),
          }
        : {
            type: "MultiLineString",
            coordinates: feature.geometry.coordinates.map((coordinates) =>
              coordinates.slice().reverse()
            ),
          },
  };
};

export function _absoluteId(id: string): string {
  return _isReversed(id) ? id.slice(1) : id;
}

export function _memberId(member: OverpassRelationMember): string {
  return `${member.type.slice(0, 1)}${member.ref}`;
}

export function _isReversed(elementId: string): boolean {
  return elementId.slice(0, 1) === "-";
}
