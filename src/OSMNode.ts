import type { OverpassNode } from "overpass-ts";
import OSMElement from "./OSMElement";

export default class OSMNode extends OSMElement {
  type: "way";
  lat: number;
  lon: number;

  constructor(node: OverpassNode) {
    super(node);

    this.lat = node.lat;
    this.lon = node.lon;
  }
}
