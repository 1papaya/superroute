import type { OverpassRelation, OverpassRelationMember } from "overpass-ts";
import type OSMRouteData from "./OSMRouteData";

import OSMSuperRouteRelation from "./OSMSuperRouteRelation";
import OSMRouteRelation from "./OSMRouteRelation";
import OSMElement from "./OSMElement";
import OSMNode from "./OSMNode";
import OSMWay from "./OSMWay";

export interface OSMRelationMember extends OverpassRelationMember {
  element?: OSMNode | OSMWay | OSMRouteRelation | OSMSuperRouteRelation;
}

export default class OSMRelation extends OSMElement {
  type: "relation";
  members: OSMRelationMember[] = [];
  parents: OSMRelationMember[] = [];

  constructor(relation: OverpassRelation) {
    super(relation);

    this.members = relation.members;
  }

  addRefs(cache: OSMRouteData): void {
    this.members.forEach((member) => this.addRef(member, cache));
    this.parents.forEach((parent) => this.addRef(parent, cache));
  }

  addRef(member: OSMRelationMember, cache: OSMRouteData): void {
    const memberId = `${member.type.slice(0,1)}${member.ref}`;

    if (cache.has(memberId)) member.element = cache.get(memberId);
    else console.log(`${this.id}: member ${memberId} not found in cache`);
  }

  addParent(relation: OSMRelationMember): void {
    this.parents.push(relation);
  }
}
