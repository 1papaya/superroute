export {
  default as OSMRouteRelation,
  RouteTopologyError,
} from "./OSMRouteRelation";
export { default as OSMSuperRouteRelation } from "./OSMSuperRouteRelation";
export { default as OSMRouteData } from "./OSMRouteData";

import { default as OSMRouteRelation } from "./OSMRouteRelation";
import { default as OSMRouteData } from "./OSMRouteData";
import { overpass, OverpassJson } from "overpass-ts";

export async function loadIds(
  ids: number[] = [],
  overpassOpts = {}
): Promise<OSMRouteData> {
  const query = `[out:json];
              relation(id:${ids.join(",")}) -> .routes;
              .routes; >>; rel(r) -> .subrelations;
  
              (.routes; .subrelations;) -> .allrelations;
  
              .allrelations out meta;
              .allrelations; way(r); out meta geom;
              .allrelations; node(r); out meta geom;
              `.replace(/\n\s{12}/g, "\n");

  return loadOverpass(query, overpassOpts);
}

export async function loadId(
  id: number,
  overpassOpts = {}
): Promise<OSMRouteRelation> {
  return loadIds([id], overpassOpts).then(
    (data) => data.get(`r${id}`) as OSMRouteRelation
  );
}

export async function loadBbox(
  bbox: Array<number> = [],
  filter = "",
  overpassOpts = {}
): Promise<OSMRouteData> {
  const bboxStr = `${bbox[0]},${bbox[1]},${bbox[2]},${bbox[3]}`;

  const query = `[out:json];
  
              relation["type"="route"]${filter}(${bboxStr}) -> .baseroutes;
  
              (
                relation["type"="superroute"]; .baseroutes; <<;
                rel._["type"~"route|superroute"]->.superroutes;
              );

              (.superroutes; .baseroutes;) -> .allroutes;

              .allroutes out meta;
              .allroutes; way(r); out meta geom;
              .allroutes; node(r); out meta geom;
              `.replace(/\n\s{12}/g, "\n");

  return loadOverpass(query, overpassOpts);
}

export async function loadOverpass(
  query: string,
  opt = {}
): Promise<OSMRouteData> {
  return overpass(query, opt).then((data) => {
    data = data as OverpassJson;
    return new OSMRouteData(data.elements, data.osm3s.timestamp_osm_base);
  });
}
