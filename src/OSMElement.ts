import type { OverpassOsmElement } from "overpass-ts";

const META_TAGS = ["changeset", "timestamp", "uid", "user", "version"];

export default class OSMElement {
  id: string;
  type: "node" | "way" | "relation";
  tags: { [key: string]: string };
  meta: { [key: string]: string | number };

  constructor(element: OverpassOsmElement) {
    this.id = `${element.type.slice(0,1)}${element.id}`;
    this.tags = element.tags;
    this.type = element.type;

    // only set meta tags that exist on object (no explicit undefined's)
    this.meta = Object.assign(
      {},
      ...Object.entries(element).map((entry) => {
        return META_TAGS.includes(entry[0]) ? { [entry[0]]: entry[1] } : {};
      })
    );
  }

  get properties(): { [key: string]: string | number } {
    return Object.assign(
      { "@id": this.id },

      // add "@" before metadata fields
      Object.assign(
        {},
        ...Object.entries(this.meta).map((entry) => {
          return { [`@${entry[0]}`]: entry[1] };
        })
      ),
      this.tags
    );
  }
}