import type { OverpassWay } from "overpass-ts";
import OSMElement from "./OSMElement";

export default class OSMWay extends OSMElement {
  type: "way";
  nodes: number[];
  geometry: { lon: number; lat: number }[];

  constructor(way: OverpassWay) {
    super(way);

    this.nodes = way.nodes;
    this.geometry = way.geometry;
  }

  get lineStringFeature(): GeoJSON.Feature<GeoJSON.LineString> {
    return {
      type: "Feature",
      properties: this.properties,
      geometry: {
        type: "LineString",
        coordinates: this.coords,
      },
    };
  }

  get reversedLineStringFeature(): GeoJSON.Feature<GeoJSON.LineString> {
    return {
      type: "Feature",
      properties: Object.assign({}, this.properties, { "@id": `-${this.id}` }),
      geometry: {
        type: "LineString",
        coordinates: this.coords.reverse(),
      },
    };
  }

  get endNodes(): string[] {
    return [`n${this.nodes[0]}`, `n${this.nodes[this.nodes.length - 1]}`];
  }

  get coords(): number[][] {
    return this.geometry.map((geom) => [geom.lon, geom.lat]);
  }
}
