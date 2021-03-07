(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.turf = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
module.exports = {
    interpolate: require('@turf/interpolate'),
    centroid: require('@turf/centroid'),
    collect: require('@turf/collect'),
    helpers: require('@turf/helpers')

};
},{"@turf/centroid":8,"@turf/collect":10,"@turf/helpers":12,"@turf/interpolate":14}],2:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var meta_1 = require("@turf/meta");
/**
 * Takes a set of features, calculates the bbox of all input features, and returns a bounding box.
 *
 * @name bbox
 * @param {GeoJSON} geojson any GeoJSON object
 * @returns {BBox} bbox extent in [minX, minY, maxX, maxY] order
 * @example
 * var line = turf.lineString([[-74, 40], [-78, 42], [-82, 35]]);
 * var bbox = turf.bbox(line);
 * var bboxPolygon = turf.bboxPolygon(bbox);
 *
 * //addToMap
 * var addToMap = [line, bboxPolygon]
 */
function bbox(geojson) {
    var result = [Infinity, Infinity, -Infinity, -Infinity];
    meta_1.coordEach(geojson, function (coord) {
        if (result[0] > coord[0]) {
            result[0] = coord[0];
        }
        if (result[1] > coord[1]) {
            result[1] = coord[1];
        }
        if (result[2] < coord[0]) {
            result[2] = coord[0];
        }
        if (result[3] < coord[1]) {
            result[3] = coord[1];
        }
    });
    return result;
}
bbox["default"] = bbox;
exports.default = bbox;

},{"@turf/meta":19}],3:[function(require,module,exports){
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var boolean_point_in_polygon_1 = __importDefault(require("@turf/boolean-point-in-polygon"));
var line_intersect_1 = __importDefault(require("@turf/line-intersect"));
var meta_1 = require("@turf/meta");
var polygon_to_line_1 = __importDefault(require("@turf/polygon-to-line"));
/**
 * Boolean-disjoint returns (TRUE) if the intersection of the two geometries is an empty set.
 *
 * @name booleanDisjoint
 * @param {Geometry|Feature<any>} feature1 GeoJSON Feature or Geometry
 * @param {Geometry|Feature<any>} feature2 GeoJSON Feature or Geometry
 * @returns {boolean} true/false
 * @example
 * var point = turf.point([2, 2]);
 * var line = turf.lineString([[1, 1], [1, 2], [1, 3], [1, 4]]);
 *
 * turf.booleanDisjoint(line, point);
 * //=true
 */
function booleanDisjoint(feature1, feature2) {
    var bool = true;
    meta_1.flattenEach(feature1, function (flatten1) {
        meta_1.flattenEach(feature2, function (flatten2) {
            if (bool === false) {
                return false;
            }
            bool = disjoint(flatten1.geometry, flatten2.geometry);
        });
    });
    return bool;
}
/**
 * Disjoint operation for simple Geometries (Point/LineString/Polygon)
 *
 * @private
 * @param {Geometry<any>} geom1 GeoJSON Geometry
 * @param {Geometry<any>} geom2 GeoJSON Geometry
 * @returns {boolean} true/false
 */
function disjoint(geom1, geom2) {
    switch (geom1.type) {
        case "Point":
            switch (geom2.type) {
                case "Point":
                    return !compareCoords(geom1.coordinates, geom2.coordinates);
                case "LineString":
                    return !isPointOnLine(geom2, geom1);
                case "Polygon":
                    return !boolean_point_in_polygon_1.default(geom1, geom2);
            }
            /* istanbul ignore next */
            break;
        case "LineString":
            switch (geom2.type) {
                case "Point":
                    return !isPointOnLine(geom1, geom2);
                case "LineString":
                    return !isLineOnLine(geom1, geom2);
                case "Polygon":
                    return !isLineInPoly(geom2, geom1);
            }
            /* istanbul ignore next */
            break;
        case "Polygon":
            switch (geom2.type) {
                case "Point":
                    return !boolean_point_in_polygon_1.default(geom2, geom1);
                case "LineString":
                    return !isLineInPoly(geom1, geom2);
                case "Polygon":
                    return !isPolyInPoly(geom2, geom1);
            }
    }
    return false;
}
// http://stackoverflow.com/a/11908158/1979085
function isPointOnLine(lineString, pt) {
    for (var i = 0; i < lineString.coordinates.length - 1; i++) {
        if (isPointOnLineSegment(lineString.coordinates[i], lineString.coordinates[i + 1], pt.coordinates)) {
            return true;
        }
    }
    return false;
}
function isLineOnLine(lineString1, lineString2) {
    var doLinesIntersect = line_intersect_1.default(lineString1, lineString2);
    if (doLinesIntersect.features.length > 0) {
        return true;
    }
    return false;
}
function isLineInPoly(polygon, lineString) {
    for (var _i = 0, _a = lineString.coordinates; _i < _a.length; _i++) {
        var coord = _a[_i];
        if (boolean_point_in_polygon_1.default(coord, polygon)) {
            return true;
        }
    }
    var doLinesIntersect = line_intersect_1.default(lineString, polygon_to_line_1.default(polygon));
    if (doLinesIntersect.features.length > 0) {
        return true;
    }
    return false;
}
/**
 * Is Polygon (geom1) in Polygon (geom2)
 * Only takes into account outer rings
 * See http://stackoverflow.com/a/4833823/1979085
 *
 * @private
 * @param {Geometry|Feature<Polygon>} feature1 Polygon1
 * @param {Geometry|Feature<Polygon>} feature2 Polygon2
 * @returns {boolean} true/false
 */
function isPolyInPoly(feature1, feature2) {
    for (var _i = 0, _a = feature1.coordinates[0]; _i < _a.length; _i++) {
        var coord1 = _a[_i];
        if (boolean_point_in_polygon_1.default(coord1, feature2)) {
            return true;
        }
    }
    for (var _b = 0, _c = feature2.coordinates[0]; _b < _c.length; _b++) {
        var coord2 = _c[_b];
        if (boolean_point_in_polygon_1.default(coord2, feature1)) {
            return true;
        }
    }
    var doLinesIntersect = line_intersect_1.default(polygon_to_line_1.default(feature1), polygon_to_line_1.default(feature2));
    if (doLinesIntersect.features.length > 0) {
        return true;
    }
    return false;
}
function isPointOnLineSegment(lineSegmentStart, lineSegmentEnd, pt) {
    var dxc = pt[0] - lineSegmentStart[0];
    var dyc = pt[1] - lineSegmentStart[1];
    var dxl = lineSegmentEnd[0] - lineSegmentStart[0];
    var dyl = lineSegmentEnd[1] - lineSegmentStart[1];
    var cross = dxc * dyl - dyc * dxl;
    if (cross !== 0) {
        return false;
    }
    if (Math.abs(dxl) >= Math.abs(dyl)) {
        if (dxl > 0) {
            return lineSegmentStart[0] <= pt[0] && pt[0] <= lineSegmentEnd[0];
        }
        else {
            return lineSegmentEnd[0] <= pt[0] && pt[0] <= lineSegmentStart[0];
        }
    }
    else if (dyl > 0) {
        return lineSegmentStart[1] <= pt[1] && pt[1] <= lineSegmentEnd[1];
    }
    else {
        return lineSegmentEnd[1] <= pt[1] && pt[1] <= lineSegmentStart[1];
    }
}
/**
 * compareCoords
 *
 * @private
 * @param {Position} pair1 point [x,y]
 * @param {Position} pair2 point [x,y]
 * @returns {boolean} true/false if coord pairs match
 */
function compareCoords(pair1, pair2) {
    return pair1[0] === pair2[0] && pair1[1] === pair2[1];
}
exports.default = booleanDisjoint;

},{"@turf/boolean-point-in-polygon":5,"@turf/line-intersect":17,"@turf/meta":19,"@turf/polygon-to-line":21}],4:[function(require,module,exports){
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var boolean_disjoint_1 = __importDefault(require("@turf/boolean-disjoint"));
var meta_1 = require("@turf/meta");
/**
 * Boolean-intersects returns (TRUE) two geometries intersect.
 *
 * @name booleanIntersects
 * @param {Geometry|Feature<any>} feature1 GeoJSON Feature or Geometry
 * @param {Geometry|Feature<any>} feature2 GeoJSON Feature or Geometry
 * @returns {boolean} true/false
 * @example
 * var point = turf.point([2, 2]);
 * var line = turf.lineString([[1, 1], [1, 2], [1, 3], [1, 4]]);
 *
 * turf.booleanIntersects(line, point);
 * //=true
 */
function booleanIntersects(feature1, feature2) {
    var bool = false;
    meta_1.flattenEach(feature1, function (flatten1) {
        meta_1.flattenEach(feature2, function (flatten2) {
            if (bool === true) {
                return true;
            }
            bool = !boolean_disjoint_1.default(flatten1.geometry, flatten2.geometry);
        });
    });
    return bool;
}
exports.default = booleanIntersects;

},{"@turf/boolean-disjoint":3,"@turf/meta":19}],5:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var invariant_1 = require("@turf/invariant");
// http://en.wikipedia.org/wiki/Even%E2%80%93odd_rule
// modified from: https://github.com/substack/point-in-polygon/blob/master/index.js
// which was modified from http://www.ecse.rpi.edu/Homepages/wrf/Research/Short_Notes/pnpoly.html
/**
 * Takes a {@link Point} and a {@link Polygon} or {@link MultiPolygon} and determines if the point
 * resides inside the polygon. The polygon can be convex or concave. The function accounts for holes.
 *
 * @name booleanPointInPolygon
 * @param {Coord} point input point
 * @param {Feature<Polygon|MultiPolygon>} polygon input polygon or multipolygon
 * @param {Object} [options={}] Optional parameters
 * @param {boolean} [options.ignoreBoundary=false] True if polygon boundary should be ignored when determining if
 * the point is inside the polygon otherwise false.
 * @returns {boolean} `true` if the Point is inside the Polygon; `false` if the Point is not inside the Polygon
 * @example
 * var pt = turf.point([-77, 44]);
 * var poly = turf.polygon([[
 *   [-81, 41],
 *   [-81, 47],
 *   [-72, 47],
 *   [-72, 41],
 *   [-81, 41]
 * ]]);
 *
 * turf.booleanPointInPolygon(pt, poly);
 * //= true
 */
function booleanPointInPolygon(point, polygon, options) {
    if (options === void 0) { options = {}; }
    // validation
    if (!point) {
        throw new Error("point is required");
    }
    if (!polygon) {
        throw new Error("polygon is required");
    }
    var pt = invariant_1.getCoord(point);
    var geom = invariant_1.getGeom(polygon);
    var type = geom.type;
    var bbox = polygon.bbox;
    var polys = geom.coordinates;
    // Quick elimination if point is not inside bbox
    if (bbox && inBBox(pt, bbox) === false) {
        return false;
    }
    // normalize to multipolygon
    if (type === "Polygon") {
        polys = [polys];
    }
    var insidePoly = false;
    for (var i = 0; i < polys.length && !insidePoly; i++) {
        // check if it is in the outer ring first
        if (inRing(pt, polys[i][0], options.ignoreBoundary)) {
            var inHole = false;
            var k = 1;
            // check for the point in any of the holes
            while (k < polys[i].length && !inHole) {
                if (inRing(pt, polys[i][k], !options.ignoreBoundary)) {
                    inHole = true;
                }
                k++;
            }
            if (!inHole) {
                insidePoly = true;
            }
        }
    }
    return insidePoly;
}
exports.default = booleanPointInPolygon;
/**
 * inRing
 *
 * @private
 * @param {Array<number>} pt [x,y]
 * @param {Array<Array<number>>} ring [[x,y], [x,y],..]
 * @param {boolean} ignoreBoundary ignoreBoundary
 * @returns {boolean} inRing
 */
function inRing(pt, ring, ignoreBoundary) {
    var isInside = false;
    if (ring[0][0] === ring[ring.length - 1][0] &&
        ring[0][1] === ring[ring.length - 1][1]) {
        ring = ring.slice(0, ring.length - 1);
    }
    for (var i = 0, j = ring.length - 1; i < ring.length; j = i++) {
        var xi = ring[i][0];
        var yi = ring[i][1];
        var xj = ring[j][0];
        var yj = ring[j][1];
        var onBoundary = pt[1] * (xi - xj) + yi * (xj - pt[0]) + yj * (pt[0] - xi) === 0 &&
            (xi - pt[0]) * (xj - pt[0]) <= 0 &&
            (yi - pt[1]) * (yj - pt[1]) <= 0;
        if (onBoundary) {
            return !ignoreBoundary;
        }
        var intersect = yi > pt[1] !== yj > pt[1] &&
            pt[0] < ((xj - xi) * (pt[1] - yi)) / (yj - yi) + xi;
        if (intersect) {
            isInside = !isInside;
        }
    }
    return isInside;
}
/**
 * inBBox
 *
 * @private
 * @param {Position} pt point [x,y]
 * @param {BBox} bbox BBox [west, south, east, north]
 * @returns {boolean} true/false if point is inside BBox
 */
function inBBox(pt, bbox) {
    return (bbox[0] <= pt[0] && bbox[1] <= pt[1] && bbox[2] >= pt[0] && bbox[3] >= pt[1]);
}

},{"@turf/invariant":16}],6:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var invariant_1 = require("@turf/invariant");
/**
 * Returns true if a point is on a line. Accepts a optional parameter to ignore the
 * start and end vertices of the linestring.
 *
 * @name booleanPointOnLine
 * @param {Coord} pt GeoJSON Point
 * @param {Feature<LineString>} line GeoJSON LineString
 * @param {Object} [options={}] Optional parameters
 * @param {boolean} [options.ignoreEndVertices=false] whether to ignore the start and end vertices.
 * @returns {boolean} true/false
 * @example
 * var pt = turf.point([0, 0]);
 * var line = turf.lineString([[-1, -1],[1, 1],[1.5, 2.2]]);
 * var isPointOnLine = turf.booleanPointOnLine(pt, line);
 * //=true
 */
function booleanPointOnLine(pt, line, options) {
    if (options === void 0) { options = {}; }
    // Normalize inputs
    var ptCoords = invariant_1.getCoord(pt);
    var lineCoords = invariant_1.getCoords(line);
    // Main
    for (var i = 0; i < lineCoords.length - 1; i++) {
        var ignoreBoundary = false;
        if (options.ignoreEndVertices) {
            if (i === 0) {
                ignoreBoundary = "start";
            }
            if (i === lineCoords.length - 2) {
                ignoreBoundary = "end";
            }
            if (i === 0 && i + 1 === lineCoords.length - 1) {
                ignoreBoundary = "both";
            }
        }
        if (isPointOnLineSegment(lineCoords[i], lineCoords[i + 1], ptCoords, ignoreBoundary)) {
            return true;
        }
    }
    return false;
}
// See http://stackoverflow.com/a/4833823/1979085
/**
 * @private
 * @param {Position} lineSegmentStart coord pair of start of line
 * @param {Position} lineSegmentEnd coord pair of end of line
 * @param {Position} pt coord pair of point to check
 * @param {boolean|string} excludeBoundary whether the point is allowed to fall on the line ends.
 * If true which end to ignore.
 * @returns {boolean} true/false
 */
function isPointOnLineSegment(lineSegmentStart, lineSegmentEnd, pt, excludeBoundary) {
    var x = pt[0];
    var y = pt[1];
    var x1 = lineSegmentStart[0];
    var y1 = lineSegmentStart[1];
    var x2 = lineSegmentEnd[0];
    var y2 = lineSegmentEnd[1];
    var dxc = pt[0] - x1;
    var dyc = pt[1] - y1;
    var dxl = x2 - x1;
    var dyl = y2 - y1;
    var cross = dxc * dyl - dyc * dxl;
    if (cross !== 0) {
        return false;
    }
    if (!excludeBoundary) {
        if (Math.abs(dxl) >= Math.abs(dyl)) {
            return dxl > 0 ? x1 <= x && x <= x2 : x2 <= x && x <= x1;
        }
        return dyl > 0 ? y1 <= y && y <= y2 : y2 <= y && y <= y1;
    }
    else if (excludeBoundary === "start") {
        if (Math.abs(dxl) >= Math.abs(dyl)) {
            return dxl > 0 ? x1 < x && x <= x2 : x2 <= x && x < x1;
        }
        return dyl > 0 ? y1 < y && y <= y2 : y2 <= y && y < y1;
    }
    else if (excludeBoundary === "end") {
        if (Math.abs(dxl) >= Math.abs(dyl)) {
            return dxl > 0 ? x1 <= x && x < x2 : x2 < x && x <= x1;
        }
        return dyl > 0 ? y1 <= y && y < y2 : y2 < y && y <= y1;
    }
    else if (excludeBoundary === "both") {
        if (Math.abs(dxl) >= Math.abs(dyl)) {
            return dxl > 0 ? x1 < x && x < x2 : x2 < x && x < x1;
        }
        return dyl > 0 ? y1 < y && y < y2 : y2 < y && y < y1;
    }
    return false;
}
exports.default = booleanPointOnLine;

},{"@turf/invariant":16}],7:[function(require,module,exports){
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var bbox_1 = __importDefault(require("@turf/bbox"));
var boolean_point_on_line_1 = __importDefault(require("@turf/boolean-point-on-line"));
var boolean_point_in_polygon_1 = __importDefault(require("@turf/boolean-point-in-polygon"));
var invariant_1 = require("@turf/invariant");
/**
 * Boolean-within returns true if the first geometry is completely within the second geometry.
 * The interiors of both geometries must intersect and, the interior and boundary of the primary (geometry a)
 * must not intersect the exterior of the secondary (geometry b).
 * Boolean-within returns the exact opposite result of the `@turf/boolean-contains`.
 *
 * @name booleanWithin
 * @param {Geometry|Feature<any>} feature1 GeoJSON Feature or Geometry
 * @param {Geometry|Feature<any>} feature2 GeoJSON Feature or Geometry
 * @returns {boolean} true/false
 * @example
 * var line = turf.lineString([[1, 1], [1, 2], [1, 3], [1, 4]]);
 * var point = turf.point([1, 2]);
 *
 * turf.booleanWithin(point, line);
 * //=true
 */
function booleanWithin(feature1, feature2) {
    var geom1 = invariant_1.getGeom(feature1);
    var geom2 = invariant_1.getGeom(feature2);
    var type1 = geom1.type;
    var type2 = geom2.type;
    switch (type1) {
        case "Point":
            switch (type2) {
                case "MultiPoint":
                    return isPointInMultiPoint(geom1, geom2);
                case "LineString":
                    return boolean_point_on_line_1.default(geom1, geom2, { ignoreEndVertices: true });
                case "Polygon":
                case "MultiPolygon":
                    return boolean_point_in_polygon_1.default(geom1, geom2, { ignoreBoundary: true });
                default:
                    throw new Error("feature2 " + type2 + " geometry not supported");
            }
        case "MultiPoint":
            switch (type2) {
                case "MultiPoint":
                    return isMultiPointInMultiPoint(geom1, geom2);
                case "LineString":
                    return isMultiPointOnLine(geom1, geom2);
                case "Polygon":
                case "MultiPolygon":
                    return isMultiPointInPoly(geom1, geom2);
                default:
                    throw new Error("feature2 " + type2 + " geometry not supported");
            }
        case "LineString":
            switch (type2) {
                case "LineString":
                    return isLineOnLine(geom1, geom2);
                case "Polygon":
                case "MultiPolygon":
                    return isLineInPoly(geom1, geom2);
                default:
                    throw new Error("feature2 " + type2 + " geometry not supported");
            }
        case "Polygon":
            switch (type2) {
                case "Polygon":
                case "MultiPolygon":
                    return isPolyInPoly(geom1, geom2);
                default:
                    throw new Error("feature2 " + type2 + " geometry not supported");
            }
        default:
            throw new Error("feature1 " + type1 + " geometry not supported");
    }
}
function isPointInMultiPoint(point, multiPoint) {
    var i;
    var output = false;
    for (i = 0; i < multiPoint.coordinates.length; i++) {
        if (compareCoords(multiPoint.coordinates[i], point.coordinates)) {
            output = true;
            break;
        }
    }
    return output;
}
function isMultiPointInMultiPoint(multiPoint1, multiPoint2) {
    for (var i = 0; i < multiPoint1.coordinates.length; i++) {
        var anyMatch = false;
        for (var i2 = 0; i2 < multiPoint2.coordinates.length; i2++) {
            if (compareCoords(multiPoint1.coordinates[i], multiPoint2.coordinates[i2])) {
                anyMatch = true;
            }
        }
        if (!anyMatch) {
            return false;
        }
    }
    return true;
}
function isMultiPointOnLine(multiPoint, lineString) {
    var foundInsidePoint = false;
    for (var i = 0; i < multiPoint.coordinates.length; i++) {
        if (!boolean_point_on_line_1.default(multiPoint.coordinates[i], lineString)) {
            return false;
        }
        if (!foundInsidePoint) {
            foundInsidePoint = boolean_point_on_line_1.default(multiPoint.coordinates[i], lineString, { ignoreEndVertices: true });
        }
    }
    return foundInsidePoint;
}
function isMultiPointInPoly(multiPoint, polygon) {
    var output = true;
    var oneInside = false;
    for (var i = 0; i < multiPoint.coordinates.length; i++) {
        var isInside = boolean_point_in_polygon_1.default(multiPoint.coordinates[1], polygon);
        if (!isInside) {
            output = false;
            break;
        }
        if (!oneInside) {
            isInside = boolean_point_in_polygon_1.default(multiPoint.coordinates[1], polygon, {
                ignoreBoundary: true,
            });
        }
    }
    return output && isInside;
}
function isLineOnLine(lineString1, lineString2) {
    for (var i = 0; i < lineString1.coordinates.length; i++) {
        if (!boolean_point_on_line_1.default(lineString1.coordinates[i], lineString2)) {
            return false;
        }
    }
    return true;
}
function isLineInPoly(linestring, polygon) {
    var polyBbox = bbox_1.default(polygon);
    var lineBbox = bbox_1.default(linestring);
    if (!doBBoxOverlap(polyBbox, lineBbox)) {
        return false;
    }
    var foundInsidePoint = false;
    for (var i = 0; i < linestring.coordinates.length - 1; i++) {
        if (!boolean_point_in_polygon_1.default(linestring.coordinates[i], polygon)) {
            return false;
        }
        if (!foundInsidePoint) {
            foundInsidePoint = boolean_point_in_polygon_1.default(linestring.coordinates[i], polygon, { ignoreBoundary: true });
        }
        if (!foundInsidePoint) {
            var midpoint = getMidpoint(linestring.coordinates[i], linestring.coordinates[i + 1]);
            foundInsidePoint = boolean_point_in_polygon_1.default(midpoint, polygon, {
                ignoreBoundary: true,
            });
        }
    }
    return foundInsidePoint;
}
/**
 * Is Polygon2 in Polygon1
 * Only takes into account outer rings
 *
 * @private
 * @param {Geometry|Feature<Polygon>} feature1 Polygon1
 * @param {Geometry|Feature<Polygon>} feature2 Polygon2
 * @returns {boolean} true/false
 */
function isPolyInPoly(feature1, feature2) {
    var poly1Bbox = bbox_1.default(feature1);
    var poly2Bbox = bbox_1.default(feature2);
    if (!doBBoxOverlap(poly2Bbox, poly1Bbox)) {
        return false;
    }
    for (var i = 0; i < feature1.coordinates[0].length; i++) {
        if (!boolean_point_in_polygon_1.default(feature1.coordinates[0][i], feature2)) {
            return false;
        }
    }
    return true;
}
function doBBoxOverlap(bbox1, bbox2) {
    if (bbox1[0] > bbox2[0])
        return false;
    if (bbox1[2] < bbox2[2])
        return false;
    if (bbox1[1] > bbox2[1])
        return false;
    if (bbox1[3] < bbox2[3])
        return false;
    return true;
}
/**
 * compareCoords
 *
 * @private
 * @param {Position} pair1 point [x,y]
 * @param {Position} pair2 point [x,y]
 * @returns {boolean} true/false if coord pairs match
 */
function compareCoords(pair1, pair2) {
    return pair1[0] === pair2[0] && pair1[1] === pair2[1];
}
/**
 * getMidpoint
 *
 * @private
 * @param {Position} pair1 point [x,y]
 * @param {Position} pair2 point [x,y]
 * @returns {Position} midpoint of pair1 and pair2
 */
function getMidpoint(pair1, pair2) {
    return [(pair1[0] + pair2[0]) / 2, (pair1[1] + pair2[1]) / 2];
}
exports.default = booleanWithin;

},{"@turf/bbox":2,"@turf/boolean-point-in-polygon":5,"@turf/boolean-point-on-line":6,"@turf/invariant":16}],8:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var meta_1 = require("@turf/meta");
var helpers_1 = require("@turf/helpers");
/**
 * Takes one or more features and calculates the centroid using the mean of all vertices.
 * This lessens the effect of small islands and artifacts when calculating the centroid of a set of polygons.
 *
 * @name centroid
 * @param {GeoJSON} geojson GeoJSON to be centered
 * @param {Object} [options={}] Optional Parameters
 * @param {Object} [options.properties={}] an Object that is used as the {@link Feature}'s properties
 * @returns {Feature<Point>} the centroid of the input features
 * @example
 * var polygon = turf.polygon([[[-81, 41], [-88, 36], [-84, 31], [-80, 33], [-77, 39], [-81, 41]]]);
 *
 * var centroid = turf.centroid(polygon);
 *
 * //addToMap
 * var addToMap = [polygon, centroid]
 */
function centroid(geojson, options) {
    if (options === void 0) { options = {}; }
    var xSum = 0;
    var ySum = 0;
    var len = 0;
    meta_1.coordEach(geojson, function (coord) {
        xSum += coord[0];
        ySum += coord[1];
        len++;
    }, true);
    return helpers_1.point([xSum / len, ySum / len], options.properties);
}
exports.default = centroid;

},{"@turf/helpers":12,"@turf/meta":19}],9:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Returns a cloned copy of the passed GeoJSON Object, including possible 'Foreign Members'.
 * ~3-5x faster than the common JSON.parse + JSON.stringify combo method.
 *
 * @name clone
 * @param {GeoJSON} geojson GeoJSON Object
 * @returns {GeoJSON} cloned GeoJSON Object
 * @example
 * var line = turf.lineString([[-74, 40], [-78, 42], [-82, 35]], {color: 'red'});
 *
 * var lineCloned = turf.clone(line);
 */
function clone(geojson) {
    if (!geojson) {
        throw new Error("geojson is required");
    }
    switch (geojson.type) {
        case "Feature":
            return cloneFeature(geojson);
        case "FeatureCollection":
            return cloneFeatureCollection(geojson);
        case "Point":
        case "LineString":
        case "Polygon":
        case "MultiPoint":
        case "MultiLineString":
        case "MultiPolygon":
        case "GeometryCollection":
            return cloneGeometry(geojson);
        default:
            throw new Error("unknown GeoJSON type");
    }
}
/**
 * Clone Feature
 *
 * @private
 * @param {Feature<any>} geojson GeoJSON Feature
 * @returns {Feature<any>} cloned Feature
 */
function cloneFeature(geojson) {
    var cloned = { type: "Feature" };
    // Preserve Foreign Members
    Object.keys(geojson).forEach(function (key) {
        switch (key) {
            case "type":
            case "properties":
            case "geometry":
                return;
            default:
                cloned[key] = geojson[key];
        }
    });
    // Add properties & geometry last
    cloned.properties = cloneProperties(geojson.properties);
    cloned.geometry = cloneGeometry(geojson.geometry);
    return cloned;
}
/**
 * Clone Properties
 *
 * @private
 * @param {Object} properties GeoJSON Properties
 * @returns {Object} cloned Properties
 */
function cloneProperties(properties) {
    var cloned = {};
    if (!properties) {
        return cloned;
    }
    Object.keys(properties).forEach(function (key) {
        var value = properties[key];
        if (typeof value === "object") {
            if (value === null) {
                // handle null
                cloned[key] = null;
            }
            else if (Array.isArray(value)) {
                // handle Array
                cloned[key] = value.map(function (item) {
                    return item;
                });
            }
            else {
                // handle generic Object
                cloned[key] = cloneProperties(value);
            }
        }
        else {
            cloned[key] = value;
        }
    });
    return cloned;
}
/**
 * Clone Feature Collection
 *
 * @private
 * @param {FeatureCollection<any>} geojson GeoJSON Feature Collection
 * @returns {FeatureCollection<any>} cloned Feature Collection
 */
function cloneFeatureCollection(geojson) {
    var cloned = { type: "FeatureCollection" };
    // Preserve Foreign Members
    Object.keys(geojson).forEach(function (key) {
        switch (key) {
            case "type":
            case "features":
                return;
            default:
                cloned[key] = geojson[key];
        }
    });
    // Add features
    cloned.features = geojson.features.map(function (feature) {
        return cloneFeature(feature);
    });
    return cloned;
}
/**
 * Clone Geometry
 *
 * @private
 * @param {Geometry<any>} geometry GeoJSON Geometry
 * @returns {Geometry<any>} cloned Geometry
 */
function cloneGeometry(geometry) {
    var geom = { type: geometry.type };
    if (geometry.bbox) {
        geom.bbox = geometry.bbox;
    }
    if (geometry.type === "GeometryCollection") {
        geom.geometries = geometry.geometries.map(function (g) {
            return cloneGeometry(g);
        });
        return geom;
    }
    geom.coordinates = deepSlice(geometry.coordinates);
    return geom;
}
/**
 * Deep Slice coordinates
 *
 * @private
 * @param {Coordinates} coords Coordinates
 * @returns {Coordinates} all coordinates sliced
 */
function deepSlice(coords) {
    var cloned = coords;
    if (typeof cloned[0] !== "object") {
        return cloned.slice();
    }
    return cloned.map(function (coord) {
        return deepSlice(coord);
    });
}
exports.default = clone;

},{}],10:[function(require,module,exports){
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var bbox_1 = __importDefault(require("@turf/bbox"));
var boolean_point_in_polygon_1 = __importDefault(require("@turf/boolean-point-in-polygon"));
var rbush_1 = __importDefault(require("rbush"));
/**
 * Merges a specified property from a FeatureCollection of points into a
 * FeatureCollection of polygons. Given an `inProperty` on points and an `outProperty`
 * for polygons, this finds every point that lies within each polygon, collects the
 * `inProperty` values from those points, and adds them as an array to `outProperty`
 * on the polygon.
 *
 * @name collect
 * @param {FeatureCollection<Polygon>} polygons polygons with values on which to aggregate
 * @param {FeatureCollection<Point>} points points to be aggregated
 * @param {string} inProperty property to be nested from
 * @param {string} outProperty property to be nested into
 * @returns {FeatureCollection<Polygon>} polygons with properties listed based on `outField`
 * @example
 * var poly1 = turf.polygon([[[0,0],[10,0],[10,10],[0,10],[0,0]]]);
 * var poly2 = turf.polygon([[[10,0],[20,10],[20,20],[20,0],[10,0]]]);
 * var polyFC = turf.featureCollection([poly1, poly2]);
 * var pt1 = turf.point([5,5], {population: 200});
 * var pt2 = turf.point([1,3], {population: 600});
 * var pt3 = turf.point([14,2], {population: 100});
 * var pt4 = turf.point([13,1], {population: 200});
 * var pt5 = turf.point([19,7], {population: 300});
 * var pointFC = turf.featureCollection([pt1, pt2, pt3, pt4, pt5]);
 * var collected = turf.collect(polyFC, pointFC, 'population', 'values');
 * var values = collected.features[0].properties.values
 * //=values => [200, 600]
 *
 * //addToMap
 * var addToMap = [pointFC, collected]
 */
function collect(polygons, points, inProperty, outProperty) {
    var rtree = rbush_1.default(6);
    var treeItems = points.features.map(function (item) {
        return {
            minX: item.geometry.coordinates[0],
            minY: item.geometry.coordinates[1],
            maxX: item.geometry.coordinates[0],
            maxY: item.geometry.coordinates[1],
            property: item.properties[inProperty],
        };
    });
    rtree.load(treeItems);
    polygons.features.forEach(function (poly) {
        if (!poly.properties) {
            poly.properties = {};
        }
        var bbox = bbox_1.default(poly);
        var potentialPoints = rtree.search({
            minX: bbox[0],
            minY: bbox[1],
            maxX: bbox[2],
            maxY: bbox[3],
        });
        var values = [];
        potentialPoints.forEach(function (pt) {
            if (boolean_point_in_polygon_1.default([pt.minX, pt.minY], poly)) {
                values.push(pt.property);
            }
        });
        poly.properties[outProperty] = values;
    });
    return polygons;
}
exports.default = collect;

},{"@turf/bbox":2,"@turf/boolean-point-in-polygon":5,"rbush":28}],11:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var invariant_1 = require("@turf/invariant");
var helpers_1 = require("@turf/helpers");
//http://en.wikipedia.org/wiki/Haversine_formula
//http://www.movable-type.co.uk/scripts/latlong.html
/**
 * Calculates the distance between two {@link Point|points} in degrees, radians, miles, or kilometers.
 * This uses the [Haversine formula](http://en.wikipedia.org/wiki/Haversine_formula) to account for global curvature.
 *
 * @name distance
 * @param {Coord} from origin point
 * @param {Coord} to destination point
 * @param {Object} [options={}] Optional parameters
 * @param {string} [options.units='kilometers'] can be degrees, radians, miles, or kilometers
 * @returns {number} distance between the two points
 * @example
 * var from = turf.point([-75.343, 39.984]);
 * var to = turf.point([-75.534, 39.123]);
 * var options = {units: 'miles'};
 *
 * var distance = turf.distance(from, to, options);
 *
 * //addToMap
 * var addToMap = [from, to];
 * from.properties.distance = distance;
 * to.properties.distance = distance;
 */
function distance(from, to, options) {
    if (options === void 0) { options = {}; }
    var coordinates1 = invariant_1.getCoord(from);
    var coordinates2 = invariant_1.getCoord(to);
    var dLat = helpers_1.degreesToRadians(coordinates2[1] - coordinates1[1]);
    var dLon = helpers_1.degreesToRadians(coordinates2[0] - coordinates1[0]);
    var lat1 = helpers_1.degreesToRadians(coordinates1[1]);
    var lat2 = helpers_1.degreesToRadians(coordinates2[1]);
    var a = Math.pow(Math.sin(dLat / 2), 2) +
        Math.pow(Math.sin(dLon / 2), 2) * Math.cos(lat1) * Math.cos(lat2);
    return helpers_1.radiansToLength(2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)), options.units);
}
exports.default = distance;

},{"@turf/helpers":12,"@turf/invariant":16}],12:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * @module helpers
 */
/**
 * Earth Radius used with the Harvesine formula and approximates using a spherical (non-ellipsoid) Earth.
 *
 * @memberof helpers
 * @type {number}
 */
exports.earthRadius = 6371008.8;
/**
 * Unit of measurement factors using a spherical (non-ellipsoid) earth radius.
 *
 * @memberof helpers
 * @type {Object}
 */
exports.factors = {
    centimeters: exports.earthRadius * 100,
    centimetres: exports.earthRadius * 100,
    degrees: exports.earthRadius / 111325,
    feet: exports.earthRadius * 3.28084,
    inches: exports.earthRadius * 39.37,
    kilometers: exports.earthRadius / 1000,
    kilometres: exports.earthRadius / 1000,
    meters: exports.earthRadius,
    metres: exports.earthRadius,
    miles: exports.earthRadius / 1609.344,
    millimeters: exports.earthRadius * 1000,
    millimetres: exports.earthRadius * 1000,
    nauticalmiles: exports.earthRadius / 1852,
    radians: 1,
    yards: exports.earthRadius / 1.0936,
};
/**
 * Units of measurement factors based on 1 meter.
 *
 * @memberof helpers
 * @type {Object}
 */
exports.unitsFactors = {
    centimeters: 100,
    centimetres: 100,
    degrees: 1 / 111325,
    feet: 3.28084,
    inches: 39.37,
    kilometers: 1 / 1000,
    kilometres: 1 / 1000,
    meters: 1,
    metres: 1,
    miles: 1 / 1609.344,
    millimeters: 1000,
    millimetres: 1000,
    nauticalmiles: 1 / 1852,
    radians: 1 / exports.earthRadius,
    yards: 1 / 1.0936,
};
/**
 * Area of measurement factors based on 1 square meter.
 *
 * @memberof helpers
 * @type {Object}
 */
exports.areaFactors = {
    acres: 0.000247105,
    centimeters: 10000,
    centimetres: 10000,
    feet: 10.763910417,
    hectares: 0.0001,
    inches: 1550.003100006,
    kilometers: 0.000001,
    kilometres: 0.000001,
    meters: 1,
    metres: 1,
    miles: 3.86e-7,
    millimeters: 1000000,
    millimetres: 1000000,
    yards: 1.195990046,
};
/**
 * Wraps a GeoJSON {@link Geometry} in a GeoJSON {@link Feature}.
 *
 * @name feature
 * @param {Geometry} geometry input geometry
 * @param {Object} [properties={}] an Object of key-value pairs to add as properties
 * @param {Object} [options={}] Optional Parameters
 * @param {Array<number>} [options.bbox] Bounding Box Array [west, south, east, north] associated with the Feature
 * @param {string|number} [options.id] Identifier associated with the Feature
 * @returns {Feature} a GeoJSON Feature
 * @example
 * var geometry = {
 *   "type": "Point",
 *   "coordinates": [110, 50]
 * };
 *
 * var feature = turf.feature(geometry);
 *
 * //=feature
 */
function feature(geom, properties, options) {
    if (options === void 0) { options = {}; }
    var feat = { type: "Feature" };
    if (options.id === 0 || options.id) {
        feat.id = options.id;
    }
    if (options.bbox) {
        feat.bbox = options.bbox;
    }
    feat.properties = properties || {};
    feat.geometry = geom;
    return feat;
}
exports.feature = feature;
/**
 * Creates a GeoJSON {@link Geometry} from a Geometry string type & coordinates.
 * For GeometryCollection type use `helpers.geometryCollection`
 *
 * @name geometry
 * @param {string} type Geometry Type
 * @param {Array<any>} coordinates Coordinates
 * @param {Object} [options={}] Optional Parameters
 * @returns {Geometry} a GeoJSON Geometry
 * @example
 * var type = "Point";
 * var coordinates = [110, 50];
 * var geometry = turf.geometry(type, coordinates);
 * // => geometry
 */
function geometry(type, coordinates, _options) {
    if (_options === void 0) { _options = {}; }
    switch (type) {
        case "Point":
            return point(coordinates).geometry;
        case "LineString":
            return lineString(coordinates).geometry;
        case "Polygon":
            return polygon(coordinates).geometry;
        case "MultiPoint":
            return multiPoint(coordinates).geometry;
        case "MultiLineString":
            return multiLineString(coordinates).geometry;
        case "MultiPolygon":
            return multiPolygon(coordinates).geometry;
        default:
            throw new Error(type + " is invalid");
    }
}
exports.geometry = geometry;
/**
 * Creates a {@link Point} {@link Feature} from a Position.
 *
 * @name point
 * @param {Array<number>} coordinates longitude, latitude position (each in decimal degrees)
 * @param {Object} [properties={}] an Object of key-value pairs to add as properties
 * @param {Object} [options={}] Optional Parameters
 * @param {Array<number>} [options.bbox] Bounding Box Array [west, south, east, north] associated with the Feature
 * @param {string|number} [options.id] Identifier associated with the Feature
 * @returns {Feature<Point>} a Point feature
 * @example
 * var point = turf.point([-75.343, 39.984]);
 *
 * //=point
 */
function point(coordinates, properties, options) {
    if (options === void 0) { options = {}; }
    if (!coordinates) {
        throw new Error("coordinates is required");
    }
    if (!Array.isArray(coordinates)) {
        throw new Error("coordinates must be an Array");
    }
    if (coordinates.length < 2) {
        throw new Error("coordinates must be at least 2 numbers long");
    }
    if (!isNumber(coordinates[0]) || !isNumber(coordinates[1])) {
        throw new Error("coordinates must contain numbers");
    }
    var geom = {
        type: "Point",
        coordinates: coordinates,
    };
    return feature(geom, properties, options);
}
exports.point = point;
/**
 * Creates a {@link Point} {@link FeatureCollection} from an Array of Point coordinates.
 *
 * @name points
 * @param {Array<Array<number>>} coordinates an array of Points
 * @param {Object} [properties={}] Translate these properties to each Feature
 * @param {Object} [options={}] Optional Parameters
 * @param {Array<number>} [options.bbox] Bounding Box Array [west, south, east, north]
 * associated with the FeatureCollection
 * @param {string|number} [options.id] Identifier associated with the FeatureCollection
 * @returns {FeatureCollection<Point>} Point Feature
 * @example
 * var points = turf.points([
 *   [-75, 39],
 *   [-80, 45],
 *   [-78, 50]
 * ]);
 *
 * //=points
 */
function points(coordinates, properties, options) {
    if (options === void 0) { options = {}; }
    return featureCollection(coordinates.map(function (coords) {
        return point(coords, properties);
    }), options);
}
exports.points = points;
/**
 * Creates a {@link Polygon} {@link Feature} from an Array of LinearRings.
 *
 * @name polygon
 * @param {Array<Array<Array<number>>>} coordinates an array of LinearRings
 * @param {Object} [properties={}] an Object of key-value pairs to add as properties
 * @param {Object} [options={}] Optional Parameters
 * @param {Array<number>} [options.bbox] Bounding Box Array [west, south, east, north] associated with the Feature
 * @param {string|number} [options.id] Identifier associated with the Feature
 * @returns {Feature<Polygon>} Polygon Feature
 * @example
 * var polygon = turf.polygon([[[-5, 52], [-4, 56], [-2, 51], [-7, 54], [-5, 52]]], { name: 'poly1' });
 *
 * //=polygon
 */
function polygon(coordinates, properties, options) {
    if (options === void 0) { options = {}; }
    for (var _i = 0, coordinates_1 = coordinates; _i < coordinates_1.length; _i++) {
        var ring = coordinates_1[_i];
        if (ring.length < 4) {
            throw new Error("Each LinearRing of a Polygon must have 4 or more Positions.");
        }
        for (var j = 0; j < ring[ring.length - 1].length; j++) {
            // Check if first point of Polygon contains two numbers
            if (ring[ring.length - 1][j] !== ring[0][j]) {
                throw new Error("First and last Position are not equivalent.");
            }
        }
    }
    var geom = {
        type: "Polygon",
        coordinates: coordinates,
    };
    return feature(geom, properties, options);
}
exports.polygon = polygon;
/**
 * Creates a {@link Polygon} {@link FeatureCollection} from an Array of Polygon coordinates.
 *
 * @name polygons
 * @param {Array<Array<Array<Array<number>>>>} coordinates an array of Polygon coordinates
 * @param {Object} [properties={}] an Object of key-value pairs to add as properties
 * @param {Object} [options={}] Optional Parameters
 * @param {Array<number>} [options.bbox] Bounding Box Array [west, south, east, north] associated with the Feature
 * @param {string|number} [options.id] Identifier associated with the FeatureCollection
 * @returns {FeatureCollection<Polygon>} Polygon FeatureCollection
 * @example
 * var polygons = turf.polygons([
 *   [[[-5, 52], [-4, 56], [-2, 51], [-7, 54], [-5, 52]]],
 *   [[[-15, 42], [-14, 46], [-12, 41], [-17, 44], [-15, 42]]],
 * ]);
 *
 * //=polygons
 */
function polygons(coordinates, properties, options) {
    if (options === void 0) { options = {}; }
    return featureCollection(coordinates.map(function (coords) {
        return polygon(coords, properties);
    }), options);
}
exports.polygons = polygons;
/**
 * Creates a {@link LineString} {@link Feature} from an Array of Positions.
 *
 * @name lineString
 * @param {Array<Array<number>>} coordinates an array of Positions
 * @param {Object} [properties={}] an Object of key-value pairs to add as properties
 * @param {Object} [options={}] Optional Parameters
 * @param {Array<number>} [options.bbox] Bounding Box Array [west, south, east, north] associated with the Feature
 * @param {string|number} [options.id] Identifier associated with the Feature
 * @returns {Feature<LineString>} LineString Feature
 * @example
 * var linestring1 = turf.lineString([[-24, 63], [-23, 60], [-25, 65], [-20, 69]], {name: 'line 1'});
 * var linestring2 = turf.lineString([[-14, 43], [-13, 40], [-15, 45], [-10, 49]], {name: 'line 2'});
 *
 * //=linestring1
 * //=linestring2
 */
function lineString(coordinates, properties, options) {
    if (options === void 0) { options = {}; }
    if (coordinates.length < 2) {
        throw new Error("coordinates must be an array of two or more positions");
    }
    var geom = {
        type: "LineString",
        coordinates: coordinates,
    };
    return feature(geom, properties, options);
}
exports.lineString = lineString;
/**
 * Creates a {@link LineString} {@link FeatureCollection} from an Array of LineString coordinates.
 *
 * @name lineStrings
 * @param {Array<Array<Array<number>>>} coordinates an array of LinearRings
 * @param {Object} [properties={}] an Object of key-value pairs to add as properties
 * @param {Object} [options={}] Optional Parameters
 * @param {Array<number>} [options.bbox] Bounding Box Array [west, south, east, north]
 * associated with the FeatureCollection
 * @param {string|number} [options.id] Identifier associated with the FeatureCollection
 * @returns {FeatureCollection<LineString>} LineString FeatureCollection
 * @example
 * var linestrings = turf.lineStrings([
 *   [[-24, 63], [-23, 60], [-25, 65], [-20, 69]],
 *   [[-14, 43], [-13, 40], [-15, 45], [-10, 49]]
 * ]);
 *
 * //=linestrings
 */
function lineStrings(coordinates, properties, options) {
    if (options === void 0) { options = {}; }
    return featureCollection(coordinates.map(function (coords) {
        return lineString(coords, properties);
    }), options);
}
exports.lineStrings = lineStrings;
/**
 * Takes one or more {@link Feature|Features} and creates a {@link FeatureCollection}.
 *
 * @name featureCollection
 * @param {Feature[]} features input features
 * @param {Object} [options={}] Optional Parameters
 * @param {Array<number>} [options.bbox] Bounding Box Array [west, south, east, north] associated with the Feature
 * @param {string|number} [options.id] Identifier associated with the Feature
 * @returns {FeatureCollection} FeatureCollection of Features
 * @example
 * var locationA = turf.point([-75.343, 39.984], {name: 'Location A'});
 * var locationB = turf.point([-75.833, 39.284], {name: 'Location B'});
 * var locationC = turf.point([-75.534, 39.123], {name: 'Location C'});
 *
 * var collection = turf.featureCollection([
 *   locationA,
 *   locationB,
 *   locationC
 * ]);
 *
 * //=collection
 */
function featureCollection(features, options) {
    if (options === void 0) { options = {}; }
    var fc = { type: "FeatureCollection" };
    if (options.id) {
        fc.id = options.id;
    }
    if (options.bbox) {
        fc.bbox = options.bbox;
    }
    fc.features = features;
    return fc;
}
exports.featureCollection = featureCollection;
/**
 * Creates a {@link Feature<MultiLineString>} based on a
 * coordinate array. Properties can be added optionally.
 *
 * @name multiLineString
 * @param {Array<Array<Array<number>>>} coordinates an array of LineStrings
 * @param {Object} [properties={}] an Object of key-value pairs to add as properties
 * @param {Object} [options={}] Optional Parameters
 * @param {Array<number>} [options.bbox] Bounding Box Array [west, south, east, north] associated with the Feature
 * @param {string|number} [options.id] Identifier associated with the Feature
 * @returns {Feature<MultiLineString>} a MultiLineString feature
 * @throws {Error} if no coordinates are passed
 * @example
 * var multiLine = turf.multiLineString([[[0,0],[10,10]]]);
 *
 * //=multiLine
 */
function multiLineString(coordinates, properties, options) {
    if (options === void 0) { options = {}; }
    var geom = {
        type: "MultiLineString",
        coordinates: coordinates,
    };
    return feature(geom, properties, options);
}
exports.multiLineString = multiLineString;
/**
 * Creates a {@link Feature<MultiPoint>} based on a
 * coordinate array. Properties can be added optionally.
 *
 * @name multiPoint
 * @param {Array<Array<number>>} coordinates an array of Positions
 * @param {Object} [properties={}] an Object of key-value pairs to add as properties
 * @param {Object} [options={}] Optional Parameters
 * @param {Array<number>} [options.bbox] Bounding Box Array [west, south, east, north] associated with the Feature
 * @param {string|number} [options.id] Identifier associated with the Feature
 * @returns {Feature<MultiPoint>} a MultiPoint feature
 * @throws {Error} if no coordinates are passed
 * @example
 * var multiPt = turf.multiPoint([[0,0],[10,10]]);
 *
 * //=multiPt
 */
function multiPoint(coordinates, properties, options) {
    if (options === void 0) { options = {}; }
    var geom = {
        type: "MultiPoint",
        coordinates: coordinates,
    };
    return feature(geom, properties, options);
}
exports.multiPoint = multiPoint;
/**
 * Creates a {@link Feature<MultiPolygon>} based on a
 * coordinate array. Properties can be added optionally.
 *
 * @name multiPolygon
 * @param {Array<Array<Array<Array<number>>>>} coordinates an array of Polygons
 * @param {Object} [properties={}] an Object of key-value pairs to add as properties
 * @param {Object} [options={}] Optional Parameters
 * @param {Array<number>} [options.bbox] Bounding Box Array [west, south, east, north] associated with the Feature
 * @param {string|number} [options.id] Identifier associated with the Feature
 * @returns {Feature<MultiPolygon>} a multipolygon feature
 * @throws {Error} if no coordinates are passed
 * @example
 * var multiPoly = turf.multiPolygon([[[[0,0],[0,10],[10,10],[10,0],[0,0]]]]);
 *
 * //=multiPoly
 *
 */
function multiPolygon(coordinates, properties, options) {
    if (options === void 0) { options = {}; }
    var geom = {
        type: "MultiPolygon",
        coordinates: coordinates,
    };
    return feature(geom, properties, options);
}
exports.multiPolygon = multiPolygon;
/**
 * Creates a {@link Feature<GeometryCollection>} based on a
 * coordinate array. Properties can be added optionally.
 *
 * @name geometryCollection
 * @param {Array<Geometry>} geometries an array of GeoJSON Geometries
 * @param {Object} [properties={}] an Object of key-value pairs to add as properties
 * @param {Object} [options={}] Optional Parameters
 * @param {Array<number>} [options.bbox] Bounding Box Array [west, south, east, north] associated with the Feature
 * @param {string|number} [options.id] Identifier associated with the Feature
 * @returns {Feature<GeometryCollection>} a GeoJSON GeometryCollection Feature
 * @example
 * var pt = turf.geometry("Point", [100, 0]);
 * var line = turf.geometry("LineString", [[101, 0], [102, 1]]);
 * var collection = turf.geometryCollection([pt, line]);
 *
 * // => collection
 */
function geometryCollection(geometries, properties, options) {
    if (options === void 0) { options = {}; }
    var geom = {
        type: "GeometryCollection",
        geometries: geometries,
    };
    return feature(geom, properties, options);
}
exports.geometryCollection = geometryCollection;
/**
 * Round number to precision
 *
 * @param {number} num Number
 * @param {number} [precision=0] Precision
 * @returns {number} rounded number
 * @example
 * turf.round(120.4321)
 * //=120
 *
 * turf.round(120.4321, 2)
 * //=120.43
 */
function round(num, precision) {
    if (precision === void 0) { precision = 0; }
    if (precision && !(precision >= 0)) {
        throw new Error("precision must be a positive number");
    }
    var multiplier = Math.pow(10, precision || 0);
    return Math.round(num * multiplier) / multiplier;
}
exports.round = round;
/**
 * Convert a distance measurement (assuming a spherical Earth) from radians to a more friendly unit.
 * Valid units: miles, nauticalmiles, inches, yards, meters, metres, kilometers, centimeters, feet
 *
 * @name radiansToLength
 * @param {number} radians in radians across the sphere
 * @param {string} [units="kilometers"] can be degrees, radians, miles, inches, yards, metres,
 * meters, kilometres, kilometers.
 * @returns {number} distance
 */
function radiansToLength(radians, units) {
    if (units === void 0) { units = "kilometers"; }
    var factor = exports.factors[units];
    if (!factor) {
        throw new Error(units + " units is invalid");
    }
    return radians * factor;
}
exports.radiansToLength = radiansToLength;
/**
 * Convert a distance measurement (assuming a spherical Earth) from a real-world unit into radians
 * Valid units: miles, nauticalmiles, inches, yards, meters, metres, kilometers, centimeters, feet
 *
 * @name lengthToRadians
 * @param {number} distance in real units
 * @param {string} [units="kilometers"] can be degrees, radians, miles, inches, yards, metres,
 * meters, kilometres, kilometers.
 * @returns {number} radians
 */
function lengthToRadians(distance, units) {
    if (units === void 0) { units = "kilometers"; }
    var factor = exports.factors[units];
    if (!factor) {
        throw new Error(units + " units is invalid");
    }
    return distance / factor;
}
exports.lengthToRadians = lengthToRadians;
/**
 * Convert a distance measurement (assuming a spherical Earth) from a real-world unit into degrees
 * Valid units: miles, nauticalmiles, inches, yards, meters, metres, centimeters, kilometres, feet
 *
 * @name lengthToDegrees
 * @param {number} distance in real units
 * @param {string} [units="kilometers"] can be degrees, radians, miles, inches, yards, metres,
 * meters, kilometres, kilometers.
 * @returns {number} degrees
 */
function lengthToDegrees(distance, units) {
    return radiansToDegrees(lengthToRadians(distance, units));
}
exports.lengthToDegrees = lengthToDegrees;
/**
 * Converts any bearing angle from the north line direction (positive clockwise)
 * and returns an angle between 0-360 degrees (positive clockwise), 0 being the north line
 *
 * @name bearingToAzimuth
 * @param {number} bearing angle, between -180 and +180 degrees
 * @returns {number} angle between 0 and 360 degrees
 */
function bearingToAzimuth(bearing) {
    var angle = bearing % 360;
    if (angle < 0) {
        angle += 360;
    }
    return angle;
}
exports.bearingToAzimuth = bearingToAzimuth;
/**
 * Converts an angle in radians to degrees
 *
 * @name radiansToDegrees
 * @param {number} radians angle in radians
 * @returns {number} degrees between 0 and 360 degrees
 */
function radiansToDegrees(radians) {
    var degrees = radians % (2 * Math.PI);
    return (degrees * 180) / Math.PI;
}
exports.radiansToDegrees = radiansToDegrees;
/**
 * Converts an angle in degrees to radians
 *
 * @name degreesToRadians
 * @param {number} degrees angle between 0 and 360 degrees
 * @returns {number} angle in radians
 */
function degreesToRadians(degrees) {
    var radians = degrees % 360;
    return (radians * Math.PI) / 180;
}
exports.degreesToRadians = degreesToRadians;
/**
 * Converts a length to the requested unit.
 * Valid units: miles, nauticalmiles, inches, yards, meters, metres, kilometers, centimeters, feet
 *
 * @param {number} length to be converted
 * @param {Units} [originalUnit="kilometers"] of the length
 * @param {Units} [finalUnit="kilometers"] returned unit
 * @returns {number} the converted length
 */
function convertLength(length, originalUnit, finalUnit) {
    if (originalUnit === void 0) { originalUnit = "kilometers"; }
    if (finalUnit === void 0) { finalUnit = "kilometers"; }
    if (!(length >= 0)) {
        throw new Error("length must be a positive number");
    }
    return radiansToLength(lengthToRadians(length, originalUnit), finalUnit);
}
exports.convertLength = convertLength;
/**
 * Converts a area to the requested unit.
 * Valid units: kilometers, kilometres, meters, metres, centimetres, millimeters, acres, miles, yards, feet, inches, hectares
 * @param {number} area to be converted
 * @param {Units} [originalUnit="meters"] of the distance
 * @param {Units} [finalUnit="kilometers"] returned unit
 * @returns {number} the converted area
 */
function convertArea(area, originalUnit, finalUnit) {
    if (originalUnit === void 0) { originalUnit = "meters"; }
    if (finalUnit === void 0) { finalUnit = "kilometers"; }
    if (!(area >= 0)) {
        throw new Error("area must be a positive number");
    }
    var startFactor = exports.areaFactors[originalUnit];
    if (!startFactor) {
        throw new Error("invalid original units");
    }
    var finalFactor = exports.areaFactors[finalUnit];
    if (!finalFactor) {
        throw new Error("invalid final units");
    }
    return (area / startFactor) * finalFactor;
}
exports.convertArea = convertArea;
/**
 * isNumber
 *
 * @param {*} num Number to validate
 * @returns {boolean} true/false
 * @example
 * turf.isNumber(123)
 * //=true
 * turf.isNumber('foo')
 * //=false
 */
function isNumber(num) {
    return !isNaN(num) && num !== null && !Array.isArray(num);
}
exports.isNumber = isNumber;
/**
 * isObject
 *
 * @param {*} input variable to validate
 * @returns {boolean} true/false
 * @example
 * turf.isObject({elevation: 10})
 * //=true
 * turf.isObject('foo')
 * //=false
 */
function isObject(input) {
    return !!input && input.constructor === Object;
}
exports.isObject = isObject;
/**
 * Validate BBox
 *
 * @private
 * @param {Array<number>} bbox BBox to validate
 * @returns {void}
 * @throws Error if BBox is not valid
 * @example
 * validateBBox([-180, -40, 110, 50])
 * //=OK
 * validateBBox([-180, -40])
 * //=Error
 * validateBBox('Foo')
 * //=Error
 * validateBBox(5)
 * //=Error
 * validateBBox(null)
 * //=Error
 * validateBBox(undefined)
 * //=Error
 */
function validateBBox(bbox) {
    if (!bbox) {
        throw new Error("bbox is required");
    }
    if (!Array.isArray(bbox)) {
        throw new Error("bbox must be an Array");
    }
    if (bbox.length !== 4 && bbox.length !== 6) {
        throw new Error("bbox must be an Array of 4 or 6 numbers");
    }
    bbox.forEach(function (num) {
        if (!isNumber(num)) {
            throw new Error("bbox must only contain numbers");
        }
    });
}
exports.validateBBox = validateBBox;
/**
 * Validate Id
 *
 * @private
 * @param {string|number} id Id to validate
 * @returns {void}
 * @throws Error if Id is not valid
 * @example
 * validateId([-180, -40, 110, 50])
 * //=Error
 * validateId([-180, -40])
 * //=Error
 * validateId('Foo')
 * //=OK
 * validateId(5)
 * //=OK
 * validateId(null)
 * //=Error
 * validateId(undefined)
 * //=Error
 */
function validateId(id) {
    if (!id) {
        throw new Error("id is required");
    }
    if (["string", "number"].indexOf(typeof id) === -1) {
        throw new Error("id must be a number or a string");
    }
}
exports.validateId = validateId;

},{}],13:[function(require,module,exports){
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var distance_1 = __importDefault(require("@turf/distance"));
var intersect_1 = __importDefault(require("@turf/intersect"));
var helpers_1 = require("@turf/helpers");
/**
 * Takes a bounding box and the diameter of the cell and returns a {@link FeatureCollection} of flat-topped
 * hexagons or triangles ({@link Polygon} features) aligned in an "odd-q" vertical grid as
 * described in [Hexagonal Grids](http://www.redblobgames.com/grids/hexagons/).
 *
 * @name hexGrid
 * @param {BBox} bbox extent in [minX, minY, maxX, maxY] order
 * @param {number} cellSide length of the side of the the hexagons or triangles, in units. It will also coincide with the
 * radius of the circumcircle of the hexagons.
 * @param {Object} [options={}] Optional parameters
 * @param {string} [options.units='kilometers'] used in calculating cell size, can be degrees, radians, miles, or kilometers
 * @param {Object} [options.properties={}] passed to each hexagon or triangle of the grid
 * @param {Feature<Polygon>} [options.mask] if passed a Polygon or MultiPolygon, the grid Points will be created only inside it
 * @param {boolean} [options.triangles=false] whether to return as triangles instead of hexagons
 * @returns {FeatureCollection<Polygon>} a hexagonal grid
 * @example
 * var bbox = [-96,31,-84,40];
 * var cellSide = 50;
 * var options = {units: 'miles'};
 *
 * var hexgrid = turf.hexGrid(bbox, cellSide, options);
 *
 * //addToMap
 * var addToMap = [hexgrid];
 */
function hexGrid(bbox, cellSide, options) {
    if (options === void 0) { options = {}; }
    // Issue => https://github.com/Turfjs/turf/issues/1284
    var clonedProperties = JSON.stringify(options.properties || {});
    var west = bbox[0], south = bbox[1], east = bbox[2], north = bbox[3];
    var centerY = (south + north) / 2;
    var centerX = (west + east) / 2;
    // https://github.com/Turfjs/turf/issues/758
    var xFraction = (cellSide * 2) / distance_1.default([west, centerY], [east, centerY], options);
    var cellWidth = xFraction * (east - west);
    var yFraction = (cellSide * 2) / distance_1.default([centerX, south], [centerX, north], options);
    var cellHeight = yFraction * (north - south);
    var radius = cellWidth / 2;
    var hex_width = radius * 2;
    var hex_height = (Math.sqrt(3) / 2) * cellHeight;
    var box_width = east - west;
    var box_height = north - south;
    var x_interval = (3 / 4) * hex_width;
    var y_interval = hex_height;
    // adjust box_width so all hexagons will be inside the bbox
    var x_span = (box_width - hex_width) / (hex_width - radius / 2);
    var x_count = Math.floor(x_span);
    var x_adjust = (x_count * x_interval - radius / 2 - box_width) / 2 -
        radius / 2 +
        x_interval / 2;
    // adjust box_height so all hexagons will be inside the bbox
    var y_count = Math.floor((box_height - hex_height) / hex_height);
    var y_adjust = (box_height - y_count * hex_height) / 2;
    var hasOffsetY = y_count * hex_height - box_height > hex_height / 2;
    if (hasOffsetY) {
        y_adjust -= hex_height / 4;
    }
    // Precompute cosines and sines of angles used in hexagon creation for performance gain
    var cosines = [];
    var sines = [];
    for (var i = 0; i < 6; i++) {
        var angle = ((2 * Math.PI) / 6) * i;
        cosines.push(Math.cos(angle));
        sines.push(Math.sin(angle));
    }
    var results = [];
    for (var x = 0; x <= x_count; x++) {
        for (var y = 0; y <= y_count; y++) {
            var isOdd = x % 2 === 1;
            if (y === 0 && isOdd)
                continue;
            if (y === 0 && hasOffsetY)
                continue;
            var center_x = x * x_interval + west - x_adjust;
            var center_y = y * y_interval + south + y_adjust;
            if (isOdd) {
                center_y -= hex_height / 2;
            }
            if (options.triangles === true) {
                hexTriangles([center_x, center_y], cellWidth / 2, cellHeight / 2, JSON.parse(clonedProperties), cosines, sines).forEach(function (triangle) {
                    if (options.mask) {
                        if (intersect_1.default(options.mask, triangle))
                            results.push(triangle);
                    }
                    else {
                        results.push(triangle);
                    }
                });
            }
            else {
                var hex = hexagon([center_x, center_y], cellWidth / 2, cellHeight / 2, JSON.parse(clonedProperties), cosines, sines);
                if (options.mask) {
                    if (intersect_1.default(options.mask, hex))
                        results.push(hex);
                }
                else {
                    results.push(hex);
                }
            }
        }
    }
    return helpers_1.featureCollection(results);
}
/**
 * Creates hexagon
 *
 * @private
 * @param {Array<number>} center of the hexagon
 * @param {number} rx half hexagon width
 * @param {number} ry half hexagon height
 * @param {Object} properties passed to each hexagon
 * @param {Array<number>} cosines precomputed
 * @param {Array<number>} sines precomputed
 * @returns {Feature<Polygon>} hexagon
 */
function hexagon(center, rx, ry, properties, cosines, sines) {
    var vertices = [];
    for (var i = 0; i < 6; i++) {
        var x = center[0] + rx * cosines[i];
        var y = center[1] + ry * sines[i];
        vertices.push([x, y]);
    }
    //first and last vertex must be the same
    vertices.push(vertices[0].slice());
    return helpers_1.polygon([vertices], properties);
}
/**
 * Creates triangles composing an hexagon
 *
 * @private
 * @param {Array<number>} center of the hexagon
 * @param {number} rx half triangle width
 * @param {number} ry half triangle height
 * @param {Object} properties passed to each triangle
 * @param {Array<number>} cosines precomputed
 * @param {Array<number>} sines precomputed
 * @returns {Array<Feature<Polygon>>} triangles
 */
function hexTriangles(center, rx, ry, properties, cosines, sines) {
    var triangles = [];
    for (var i = 0; i < 6; i++) {
        var vertices = [];
        vertices.push(center);
        vertices.push([center[0] + rx * cosines[i], center[1] + ry * sines[i]]);
        vertices.push([
            center[0] + rx * cosines[(i + 1) % 6],
            center[1] + ry * sines[(i + 1) % 6],
        ]);
        vertices.push(center);
        triangles.push(helpers_1.polygon([vertices], properties));
    }
    return triangles;
}
exports.default = hexGrid;

},{"@turf/distance":11,"@turf/helpers":12,"@turf/intersect":15}],14:[function(require,module,exports){
'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var bbox = _interopDefault(require('@turf/bbox'));
var hexGrid = _interopDefault(require('@turf/hex-grid'));
var pointGrid = _interopDefault(require('@turf/point-grid'));
var distance = _interopDefault(require('@turf/distance'));
var centroid = _interopDefault(require('@turf/centroid'));
var squareGrid = _interopDefault(require('@turf/square-grid'));
var triangleGrid = _interopDefault(require('@turf/triangle-grid'));
var clone = _interopDefault(require('@turf/clone'));
var helpers = require('@turf/helpers');
var meta = require('@turf/meta');
var invariant = require('@turf/invariant');

/**
 * Takes a set of points and estimates their 'property' values on a grid using the [Inverse Distance Weighting (IDW) method](https://en.wikipedia.org/wiki/Inverse_distance_weighting).
 *
 * @name interpolate
 * @param {FeatureCollection<Point>} points with known value
 * @param {number} cellSize the distance across each grid point
 * @param {Object} [options={}] Optional parameters
 * @param {string} [options.gridType='square'] defines the output format based on a Grid Type (options: 'square' | 'point' | 'hex' | 'triangle')
 * @param {string} [options.property='elevation'] the property name in `points` from which z-values will be pulled, zValue fallbacks to 3rd coordinate if no property exists.
 * @param {string} [options.units='kilometers'] used in calculating cellSize, can be degrees, radians, miles, or kilometers
 * @param {number} [options.weight=1] exponent regulating the distance-decay weighting
 * @returns {FeatureCollection<Point|Polygon>} grid of points or polygons with interpolated 'property'
 * @example
 * var points = turf.randomPoint(30, {bbox: [50, 30, 70, 50]});
 *
 * // add a random property to each point
 * turf.featureEach(points, function(point) {
 *     point.properties.solRad = Math.random() * 50;
 * });
 * var options = {gridType: 'points', property: 'solRad', units: 'miles'};
 * var grid = turf.interpolate(points, 100, options);
 *
 * //addToMap
 * var addToMap = [grid];
 */
function interpolate(points, cellSize, options) {
  // Optional parameters
  options = options || {};
  if (typeof options !== "object") throw new Error("options is invalid");
  var gridType = options.gridType;
  var property = options.property;
  var weight = options.weight;

  // validation
  if (!points) throw new Error("points is required");
  invariant.collectionOf(points, "Point", "input must contain Points");
  if (!cellSize) throw new Error("cellSize is required");
  if (weight !== undefined && typeof weight !== "number")
    throw new Error("weight must be a number");

  // default values
  property = property || "elevation";
  gridType = gridType || "square";
  weight = weight || 1;

  var box = bbox(points);
  var grid;
  switch (gridType) {
    case "point":
    case "points":
      grid = pointGrid(box, cellSize, options);
      break;
    case "square":
    case "squares":
      grid = squareGrid(box, cellSize, options);
      break;
    case "hex":
    case "hexes":
      grid = hexGrid(box, cellSize, options);
      break;
    case "triangle":
    case "triangles":
      grid = triangleGrid(box, cellSize, options);
      break;
    default:
      throw new Error("invalid gridType");
  }
  var results = [];
  meta.featureEach(grid, function (gridFeature) {
    var zw = 0;
    var sw = 0;
    // calculate the distance from each input point to the grid points
    meta.featureEach(points, function (point) {
      var gridPoint =
        gridType === "point" ? gridFeature : centroid(gridFeature);
      var d = distance(gridPoint, point, options);
      var zValue;
      // property has priority for zValue, fallbacks to 3rd coordinate from geometry
      if (property !== undefined) zValue = point.properties[property];
      if (zValue === undefined) zValue = point.geometry.coordinates[2];
      if (zValue === undefined) throw new Error("zValue is missing");
      if (d === 0) zw = zValue;
      var w = 1.0 / Math.pow(d, weight);
      sw += w;
      zw += w * zValue;
    });
    // write interpolated value for each grid point
    var newFeature = clone(gridFeature);
    newFeature.properties[property] = zw / sw;
    results.push(newFeature);
  });
  return helpers.featureCollection(results);
}

module.exports = interpolate;

},{"@turf/bbox":2,"@turf/centroid":8,"@turf/clone":9,"@turf/distance":11,"@turf/helpers":12,"@turf/hex-grid":13,"@turf/invariant":16,"@turf/meta":19,"@turf/point-grid":20,"@turf/square-grid":23,"@turf/triangle-grid":24}],15:[function(require,module,exports){
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var helpers_1 = require("@turf/helpers");
var invariant_1 = require("@turf/invariant");
var polygon_clipping_1 = __importDefault(require("polygon-clipping"));
/**
 * Takes two {@link Polygon|polygon} or {@link MultiPolygon|multi-polygon} geometries and
 * finds their polygonal intersection. If they don't intersect, returns null.
 *
 * @name intersect
 * @param {Feature<Polygon | MultiPolygon>} poly1 the first polygon or multipolygon
 * @param {Feature<Polygon | MultiPolygon>} poly2 the second polygon or multipolygon
 * @param {Object} [options={}] Optional Parameters
 * @param {Object} [options.properties={}] Translate GeoJSON Properties to Feature
 * @returns {Feature|null} returns a feature representing the area they share (either a {@link Polygon} or
 * {@link MultiPolygon}). If they do not share any area, returns `null`.
 * @example
 * var poly1 = turf.polygon([[
 *   [-122.801742, 45.48565],
 *   [-122.801742, 45.60491],
 *   [-122.584762, 45.60491],
 *   [-122.584762, 45.48565],
 *   [-122.801742, 45.48565]
 * ]]);
 *
 * var poly2 = turf.polygon([[
 *   [-122.520217, 45.535693],
 *   [-122.64038, 45.553967],
 *   [-122.720031, 45.526554],
 *   [-122.669906, 45.507309],
 *   [-122.723464, 45.446643],
 *   [-122.532577, 45.408574],
 *   [-122.487258, 45.477466],
 *   [-122.520217, 45.535693]
 * ]]);
 *
 * var intersection = turf.intersect(poly1, poly2);
 *
 * //addToMap
 * var addToMap = [poly1, poly2, intersection];
 */
function intersect(poly1, poly2, options) {
    if (options === void 0) { options = {}; }
    var geom1 = invariant_1.getGeom(poly1);
    var geom2 = invariant_1.getGeom(poly2);
    var intersection = polygon_clipping_1.default.intersection(geom1.coordinates, geom2.coordinates);
    if (intersection.length === 0)
        return null;
    if (intersection.length === 1)
        return helpers_1.polygon(intersection[0], options.properties);
    return helpers_1.multiPolygon(intersection, options.properties);
}
exports.default = intersect;

},{"@turf/helpers":12,"@turf/invariant":16,"polygon-clipping":26}],16:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var helpers_1 = require("@turf/helpers");
/**
 * Unwrap a coordinate from a Point Feature, Geometry or a single coordinate.
 *
 * @name getCoord
 * @param {Array<number>|Geometry<Point>|Feature<Point>} coord GeoJSON Point or an Array of numbers
 * @returns {Array<number>} coordinates
 * @example
 * var pt = turf.point([10, 10]);
 *
 * var coord = turf.getCoord(pt);
 * //= [10, 10]
 */
function getCoord(coord) {
    if (!coord) {
        throw new Error("coord is required");
    }
    if (!Array.isArray(coord)) {
        if (coord.type === "Feature" &&
            coord.geometry !== null &&
            coord.geometry.type === "Point") {
            return coord.geometry.coordinates;
        }
        if (coord.type === "Point") {
            return coord.coordinates;
        }
    }
    if (Array.isArray(coord) &&
        coord.length >= 2 &&
        !Array.isArray(coord[0]) &&
        !Array.isArray(coord[1])) {
        return coord;
    }
    throw new Error("coord must be GeoJSON Point or an Array of numbers");
}
exports.getCoord = getCoord;
/**
 * Unwrap coordinates from a Feature, Geometry Object or an Array
 *
 * @name getCoords
 * @param {Array<any>|Geometry|Feature} coords Feature, Geometry Object or an Array
 * @returns {Array<any>} coordinates
 * @example
 * var poly = turf.polygon([[[119.32, -8.7], [119.55, -8.69], [119.51, -8.54], [119.32, -8.7]]]);
 *
 * var coords = turf.getCoords(poly);
 * //= [[[119.32, -8.7], [119.55, -8.69], [119.51, -8.54], [119.32, -8.7]]]
 */
function getCoords(coords) {
    if (Array.isArray(coords)) {
        return coords;
    }
    // Feature
    if (coords.type === "Feature") {
        if (coords.geometry !== null) {
            return coords.geometry.coordinates;
        }
    }
    else {
        // Geometry
        if (coords.coordinates) {
            return coords.coordinates;
        }
    }
    throw new Error("coords must be GeoJSON Feature, Geometry Object or an Array");
}
exports.getCoords = getCoords;
/**
 * Checks if coordinates contains a number
 *
 * @name containsNumber
 * @param {Array<any>} coordinates GeoJSON Coordinates
 * @returns {boolean} true if Array contains a number
 */
function containsNumber(coordinates) {
    if (coordinates.length > 1 &&
        helpers_1.isNumber(coordinates[0]) &&
        helpers_1.isNumber(coordinates[1])) {
        return true;
    }
    if (Array.isArray(coordinates[0]) && coordinates[0].length) {
        return containsNumber(coordinates[0]);
    }
    throw new Error("coordinates must only contain numbers");
}
exports.containsNumber = containsNumber;
/**
 * Enforce expectations about types of GeoJSON objects for Turf.
 *
 * @name geojsonType
 * @param {GeoJSON} value any GeoJSON object
 * @param {string} type expected GeoJSON type
 * @param {string} name name of calling function
 * @throws {Error} if value is not the expected type.
 */
function geojsonType(value, type, name) {
    if (!type || !name) {
        throw new Error("type and name required");
    }
    if (!value || value.type !== type) {
        throw new Error("Invalid input to " +
            name +
            ": must be a " +
            type +
            ", given " +
            value.type);
    }
}
exports.geojsonType = geojsonType;
/**
 * Enforce expectations about types of {@link Feature} inputs for Turf.
 * Internally this uses {@link geojsonType} to judge geometry types.
 *
 * @name featureOf
 * @param {Feature} feature a feature with an expected geometry type
 * @param {string} type expected GeoJSON type
 * @param {string} name name of calling function
 * @throws {Error} error if value is not the expected type.
 */
function featureOf(feature, type, name) {
    if (!feature) {
        throw new Error("No feature passed");
    }
    if (!name) {
        throw new Error(".featureOf() requires a name");
    }
    if (!feature || feature.type !== "Feature" || !feature.geometry) {
        throw new Error("Invalid input to " + name + ", Feature with geometry required");
    }
    if (!feature.geometry || feature.geometry.type !== type) {
        throw new Error("Invalid input to " +
            name +
            ": must be a " +
            type +
            ", given " +
            feature.geometry.type);
    }
}
exports.featureOf = featureOf;
/**
 * Enforce expectations about types of {@link FeatureCollection} inputs for Turf.
 * Internally this uses {@link geojsonType} to judge geometry types.
 *
 * @name collectionOf
 * @param {FeatureCollection} featureCollection a FeatureCollection for which features will be judged
 * @param {string} type expected GeoJSON type
 * @param {string} name name of calling function
 * @throws {Error} if value is not the expected type.
 */
function collectionOf(featureCollection, type, name) {
    if (!featureCollection) {
        throw new Error("No featureCollection passed");
    }
    if (!name) {
        throw new Error(".collectionOf() requires a name");
    }
    if (!featureCollection || featureCollection.type !== "FeatureCollection") {
        throw new Error("Invalid input to " + name + ", FeatureCollection required");
    }
    for (var _i = 0, _a = featureCollection.features; _i < _a.length; _i++) {
        var feature = _a[_i];
        if (!feature || feature.type !== "Feature" || !feature.geometry) {
            throw new Error("Invalid input to " + name + ", Feature with geometry required");
        }
        if (!feature.geometry || feature.geometry.type !== type) {
            throw new Error("Invalid input to " +
                name +
                ": must be a " +
                type +
                ", given " +
                feature.geometry.type);
        }
    }
}
exports.collectionOf = collectionOf;
/**
 * Get Geometry from Feature or Geometry Object
 *
 * @param {Feature|Geometry} geojson GeoJSON Feature or Geometry Object
 * @returns {Geometry|null} GeoJSON Geometry Object
 * @throws {Error} if geojson is not a Feature or Geometry Object
 * @example
 * var point = {
 *   "type": "Feature",
 *   "properties": {},
 *   "geometry": {
 *     "type": "Point",
 *     "coordinates": [110, 40]
 *   }
 * }
 * var geom = turf.getGeom(point)
 * //={"type": "Point", "coordinates": [110, 40]}
 */
function getGeom(geojson) {
    if (geojson.type === "Feature") {
        return geojson.geometry;
    }
    return geojson;
}
exports.getGeom = getGeom;
/**
 * Get GeoJSON object's type, Geometry type is prioritize.
 *
 * @param {GeoJSON} geojson GeoJSON object
 * @param {string} [name="geojson"] name of the variable to display in error message (unused)
 * @returns {string} GeoJSON type
 * @example
 * var point = {
 *   "type": "Feature",
 *   "properties": {},
 *   "geometry": {
 *     "type": "Point",
 *     "coordinates": [110, 40]
 *   }
 * }
 * var geom = turf.getType(point)
 * //="Point"
 */
function getType(geojson, _name) {
    if (geojson.type === "FeatureCollection") {
        return "FeatureCollection";
    }
    if (geojson.type === "GeometryCollection") {
        return "GeometryCollection";
    }
    if (geojson.type === "Feature" && geojson.geometry !== null) {
        return geojson.geometry.type;
    }
    return geojson.type;
}
exports.getType = getType;

},{"@turf/helpers":12}],17:[function(require,module,exports){
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var helpers_1 = require("@turf/helpers");
var invariant_1 = require("@turf/invariant");
var line_segment_1 = __importDefault(require("@turf/line-segment"));
var meta_1 = require("@turf/meta");
var geojson_rbush_1 = __importDefault(require("geojson-rbush"));
/**
 * Takes any LineString or Polygon GeoJSON and returns the intersecting point(s).
 *
 * @name lineIntersect
 * @param {GeoJSON} line1 any LineString or Polygon
 * @param {GeoJSON} line2 any LineString or Polygon
 * @returns {FeatureCollection<Point>} point(s) that intersect both
 * @example
 * var line1 = turf.lineString([[126, -11], [129, -21]]);
 * var line2 = turf.lineString([[123, -18], [131, -14]]);
 * var intersects = turf.lineIntersect(line1, line2);
 *
 * //addToMap
 * var addToMap = [line1, line2, intersects]
 */
function lineIntersect(line1, line2) {
    var unique = {};
    var results = [];
    // First, normalize geometries to features
    // Then, handle simple 2-vertex segments
    if (line1.type === "LineString") {
        line1 = helpers_1.feature(line1);
    }
    if (line2.type === "LineString") {
        line2 = helpers_1.feature(line2);
    }
    if (line1.type === "Feature" &&
        line2.type === "Feature" &&
        line1.geometry !== null &&
        line2.geometry !== null &&
        line1.geometry.type === "LineString" &&
        line2.geometry.type === "LineString" &&
        line1.geometry.coordinates.length === 2 &&
        line2.geometry.coordinates.length === 2) {
        var intersect = intersects(line1, line2);
        if (intersect) {
            results.push(intersect);
        }
        return helpers_1.featureCollection(results);
    }
    // Handles complex GeoJSON Geometries
    var tree = geojson_rbush_1.default();
    tree.load(line_segment_1.default(line2));
    meta_1.featureEach(line_segment_1.default(line1), function (segment) {
        meta_1.featureEach(tree.search(segment), function (match) {
            var intersect = intersects(segment, match);
            if (intersect) {
                // prevent duplicate points https://github.com/Turfjs/turf/issues/688
                var key = invariant_1.getCoords(intersect).join(",");
                if (!unique[key]) {
                    unique[key] = true;
                    results.push(intersect);
                }
            }
        });
    });
    return helpers_1.featureCollection(results);
}
/**
 * Find a point that intersects LineStrings with two coordinates each
 *
 * @private
 * @param {Feature<LineString>} line1 GeoJSON LineString (Must only contain 2 coordinates)
 * @param {Feature<LineString>} line2 GeoJSON LineString (Must only contain 2 coordinates)
 * @returns {Feature<Point>} intersecting GeoJSON Point
 */
function intersects(line1, line2) {
    var coords1 = invariant_1.getCoords(line1);
    var coords2 = invariant_1.getCoords(line2);
    if (coords1.length !== 2) {
        throw new Error("<intersects> line1 must only contain 2 coordinates");
    }
    if (coords2.length !== 2) {
        throw new Error("<intersects> line2 must only contain 2 coordinates");
    }
    var x1 = coords1[0][0];
    var y1 = coords1[0][1];
    var x2 = coords1[1][0];
    var y2 = coords1[1][1];
    var x3 = coords2[0][0];
    var y3 = coords2[0][1];
    var x4 = coords2[1][0];
    var y4 = coords2[1][1];
    var denom = (y4 - y3) * (x2 - x1) - (x4 - x3) * (y2 - y1);
    var numeA = (x4 - x3) * (y1 - y3) - (y4 - y3) * (x1 - x3);
    var numeB = (x2 - x1) * (y1 - y3) - (y2 - y1) * (x1 - x3);
    if (denom === 0) {
        if (numeA === 0 && numeB === 0) {
            return null;
        }
        return null;
    }
    var uA = numeA / denom;
    var uB = numeB / denom;
    if (uA >= 0 && uA <= 1 && uB >= 0 && uB <= 1) {
        var x = x1 + uA * (x2 - x1);
        var y = y1 + uA * (y2 - y1);
        return helpers_1.point([x, y]);
    }
    return null;
}
exports.default = lineIntersect;

},{"@turf/helpers":12,"@turf/invariant":16,"@turf/line-segment":18,"@turf/meta":19,"geojson-rbush":25}],18:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var helpers_1 = require("@turf/helpers");
var invariant_1 = require("@turf/invariant");
var meta_1 = require("@turf/meta");
/**
 * Creates a {@link FeatureCollection} of 2-vertex {@link LineString} segments from a
 * {@link LineString|(Multi)LineString} or {@link Polygon|(Multi)Polygon}.
 *
 * @name lineSegment
 * @param {GeoJSON} geojson GeoJSON Polygon or LineString
 * @returns {FeatureCollection<LineString>} 2-vertex line segments
 * @example
 * var polygon = turf.polygon([[[-50, 5], [-40, -10], [-50, -10], [-40, 5], [-50, 5]]]);
 * var segments = turf.lineSegment(polygon);
 *
 * //addToMap
 * var addToMap = [polygon, segments]
 */
function lineSegment(geojson) {
    if (!geojson) {
        throw new Error("geojson is required");
    }
    var results = [];
    meta_1.flattenEach(geojson, function (feature) {
        lineSegmentFeature(feature, results);
    });
    return helpers_1.featureCollection(results);
}
/**
 * Line Segment
 *
 * @private
 * @param {Feature<LineString|Polygon>} geojson Line or polygon feature
 * @param {Array} results push to results
 * @returns {void}
 */
function lineSegmentFeature(geojson, results) {
    var coords = [];
    var geometry = geojson.geometry;
    if (geometry !== null) {
        switch (geometry.type) {
            case "Polygon":
                coords = invariant_1.getCoords(geometry);
                break;
            case "LineString":
                coords = [invariant_1.getCoords(geometry)];
        }
        coords.forEach(function (coord) {
            var segments = createSegments(coord, geojson.properties);
            segments.forEach(function (segment) {
                segment.id = results.length;
                results.push(segment);
            });
        });
    }
}
/**
 * Create Segments from LineString coordinates
 *
 * @private
 * @param {Array<Array<number>>} coords LineString coordinates
 * @param {*} properties GeoJSON properties
 * @returns {Array<Feature<LineString>>} line segments
 */
function createSegments(coords, properties) {
    var segments = [];
    coords.reduce(function (previousCoords, currentCoords) {
        var segment = helpers_1.lineString([previousCoords, currentCoords], properties);
        segment.bbox = bbox(previousCoords, currentCoords);
        segments.push(segment);
        return currentCoords;
    });
    return segments;
}
/**
 * Create BBox between two coordinates (faster than @turf/bbox)
 *
 * @private
 * @param {Array<number>} coords1 Point coordinate
 * @param {Array<number>} coords2 Point coordinate
 * @returns {BBox} [west, south, east, north]
 */
function bbox(coords1, coords2) {
    var x1 = coords1[0];
    var y1 = coords1[1];
    var x2 = coords2[0];
    var y2 = coords2[1];
    var west = x1 < x2 ? x1 : x2;
    var south = y1 < y2 ? y1 : y2;
    var east = x1 > x2 ? x1 : x2;
    var north = y1 > y2 ? y1 : y2;
    return [west, south, east, north];
}
exports.default = lineSegment;

},{"@turf/helpers":12,"@turf/invariant":16,"@turf/meta":19}],19:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var helpers = require('@turf/helpers');

/**
 * Callback for coordEach
 *
 * @callback coordEachCallback
 * @param {Array<number>} currentCoord The current coordinate being processed.
 * @param {number} coordIndex The current index of the coordinate being processed.
 * @param {number} featureIndex The current index of the Feature being processed.
 * @param {number} multiFeatureIndex The current index of the Multi-Feature being processed.
 * @param {number} geometryIndex The current index of the Geometry being processed.
 */

/**
 * Iterate over coordinates in any GeoJSON object, similar to Array.forEach()
 *
 * @name coordEach
 * @param {FeatureCollection|Feature|Geometry} geojson any GeoJSON object
 * @param {Function} callback a method that takes (currentCoord, coordIndex, featureIndex, multiFeatureIndex)
 * @param {boolean} [excludeWrapCoord=false] whether or not to include the final coordinate of LinearRings that wraps the ring in its iteration.
 * @returns {void}
 * @example
 * var features = turf.featureCollection([
 *   turf.point([26, 37], {"foo": "bar"}),
 *   turf.point([36, 53], {"hello": "world"})
 * ]);
 *
 * turf.coordEach(features, function (currentCoord, coordIndex, featureIndex, multiFeatureIndex, geometryIndex) {
 *   //=currentCoord
 *   //=coordIndex
 *   //=featureIndex
 *   //=multiFeatureIndex
 *   //=geometryIndex
 * });
 */
function coordEach(geojson, callback, excludeWrapCoord) {
  // Handles null Geometry -- Skips this GeoJSON
  if (geojson === null) return;
  var j,
    k,
    l,
    geometry,
    stopG,
    coords,
    geometryMaybeCollection,
    wrapShrink = 0,
    coordIndex = 0,
    isGeometryCollection,
    type = geojson.type,
    isFeatureCollection = type === "FeatureCollection",
    isFeature = type === "Feature",
    stop = isFeatureCollection ? geojson.features.length : 1;

  // This logic may look a little weird. The reason why it is that way
  // is because it's trying to be fast. GeoJSON supports multiple kinds
  // of objects at its root: FeatureCollection, Features, Geometries.
  // This function has the responsibility of handling all of them, and that
  // means that some of the `for` loops you see below actually just don't apply
  // to certain inputs. For instance, if you give this just a
  // Point geometry, then both loops are short-circuited and all we do
  // is gradually rename the input until it's called 'geometry'.
  //
  // This also aims to allocate as few resources as possible: just a
  // few numbers and booleans, rather than any temporary arrays as would
  // be required with the normalization approach.
  for (var featureIndex = 0; featureIndex < stop; featureIndex++) {
    geometryMaybeCollection = isFeatureCollection
      ? geojson.features[featureIndex].geometry
      : isFeature
      ? geojson.geometry
      : geojson;
    isGeometryCollection = geometryMaybeCollection
      ? geometryMaybeCollection.type === "GeometryCollection"
      : false;
    stopG = isGeometryCollection
      ? geometryMaybeCollection.geometries.length
      : 1;

    for (var geomIndex = 0; geomIndex < stopG; geomIndex++) {
      var multiFeatureIndex = 0;
      var geometryIndex = 0;
      geometry = isGeometryCollection
        ? geometryMaybeCollection.geometries[geomIndex]
        : geometryMaybeCollection;

      // Handles null Geometry -- Skips this geometry
      if (geometry === null) continue;
      coords = geometry.coordinates;
      var geomType = geometry.type;

      wrapShrink =
        excludeWrapCoord &&
        (geomType === "Polygon" || geomType === "MultiPolygon")
          ? 1
          : 0;

      switch (geomType) {
        case null:
          break;
        case "Point":
          if (
            callback(
              coords,
              coordIndex,
              featureIndex,
              multiFeatureIndex,
              geometryIndex
            ) === false
          )
            return false;
          coordIndex++;
          multiFeatureIndex++;
          break;
        case "LineString":
        case "MultiPoint":
          for (j = 0; j < coords.length; j++) {
            if (
              callback(
                coords[j],
                coordIndex,
                featureIndex,
                multiFeatureIndex,
                geometryIndex
              ) === false
            )
              return false;
            coordIndex++;
            if (geomType === "MultiPoint") multiFeatureIndex++;
          }
          if (geomType === "LineString") multiFeatureIndex++;
          break;
        case "Polygon":
        case "MultiLineString":
          for (j = 0; j < coords.length; j++) {
            for (k = 0; k < coords[j].length - wrapShrink; k++) {
              if (
                callback(
                  coords[j][k],
                  coordIndex,
                  featureIndex,
                  multiFeatureIndex,
                  geometryIndex
                ) === false
              )
                return false;
              coordIndex++;
            }
            if (geomType === "MultiLineString") multiFeatureIndex++;
            if (geomType === "Polygon") geometryIndex++;
          }
          if (geomType === "Polygon") multiFeatureIndex++;
          break;
        case "MultiPolygon":
          for (j = 0; j < coords.length; j++) {
            geometryIndex = 0;
            for (k = 0; k < coords[j].length; k++) {
              for (l = 0; l < coords[j][k].length - wrapShrink; l++) {
                if (
                  callback(
                    coords[j][k][l],
                    coordIndex,
                    featureIndex,
                    multiFeatureIndex,
                    geometryIndex
                  ) === false
                )
                  return false;
                coordIndex++;
              }
              geometryIndex++;
            }
            multiFeatureIndex++;
          }
          break;
        case "GeometryCollection":
          for (j = 0; j < geometry.geometries.length; j++)
            if (
              coordEach(geometry.geometries[j], callback, excludeWrapCoord) ===
              false
            )
              return false;
          break;
        default:
          throw new Error("Unknown Geometry Type");
      }
    }
  }
}

/**
 * Callback for coordReduce
 *
 * The first time the callback function is called, the values provided as arguments depend
 * on whether the reduce method has an initialValue argument.
 *
 * If an initialValue is provided to the reduce method:
 *  - The previousValue argument is initialValue.
 *  - The currentValue argument is the value of the first element present in the array.
 *
 * If an initialValue is not provided:
 *  - The previousValue argument is the value of the first element present in the array.
 *  - The currentValue argument is the value of the second element present in the array.
 *
 * @callback coordReduceCallback
 * @param {*} previousValue The accumulated value previously returned in the last invocation
 * of the callback, or initialValue, if supplied.
 * @param {Array<number>} currentCoord The current coordinate being processed.
 * @param {number} coordIndex The current index of the coordinate being processed.
 * Starts at index 0, if an initialValue is provided, and at index 1 otherwise.
 * @param {number} featureIndex The current index of the Feature being processed.
 * @param {number} multiFeatureIndex The current index of the Multi-Feature being processed.
 * @param {number} geometryIndex The current index of the Geometry being processed.
 */

/**
 * Reduce coordinates in any GeoJSON object, similar to Array.reduce()
 *
 * @name coordReduce
 * @param {FeatureCollection|Geometry|Feature} geojson any GeoJSON object
 * @param {Function} callback a method that takes (previousValue, currentCoord, coordIndex)
 * @param {*} [initialValue] Value to use as the first argument to the first call of the callback.
 * @param {boolean} [excludeWrapCoord=false] whether or not to include the final coordinate of LinearRings that wraps the ring in its iteration.
 * @returns {*} The value that results from the reduction.
 * @example
 * var features = turf.featureCollection([
 *   turf.point([26, 37], {"foo": "bar"}),
 *   turf.point([36, 53], {"hello": "world"})
 * ]);
 *
 * turf.coordReduce(features, function (previousValue, currentCoord, coordIndex, featureIndex, multiFeatureIndex, geometryIndex) {
 *   //=previousValue
 *   //=currentCoord
 *   //=coordIndex
 *   //=featureIndex
 *   //=multiFeatureIndex
 *   //=geometryIndex
 *   return currentCoord;
 * });
 */
function coordReduce(geojson, callback, initialValue, excludeWrapCoord) {
  var previousValue = initialValue;
  coordEach(
    geojson,
    function (
      currentCoord,
      coordIndex,
      featureIndex,
      multiFeatureIndex,
      geometryIndex
    ) {
      if (coordIndex === 0 && initialValue === undefined)
        previousValue = currentCoord;
      else
        previousValue = callback(
          previousValue,
          currentCoord,
          coordIndex,
          featureIndex,
          multiFeatureIndex,
          geometryIndex
        );
    },
    excludeWrapCoord
  );
  return previousValue;
}

/**
 * Callback for propEach
 *
 * @callback propEachCallback
 * @param {Object} currentProperties The current Properties being processed.
 * @param {number} featureIndex The current index of the Feature being processed.
 */

/**
 * Iterate over properties in any GeoJSON object, similar to Array.forEach()
 *
 * @name propEach
 * @param {FeatureCollection|Feature} geojson any GeoJSON object
 * @param {Function} callback a method that takes (currentProperties, featureIndex)
 * @returns {void}
 * @example
 * var features = turf.featureCollection([
 *     turf.point([26, 37], {foo: 'bar'}),
 *     turf.point([36, 53], {hello: 'world'})
 * ]);
 *
 * turf.propEach(features, function (currentProperties, featureIndex) {
 *   //=currentProperties
 *   //=featureIndex
 * });
 */
function propEach(geojson, callback) {
  var i;
  switch (geojson.type) {
    case "FeatureCollection":
      for (i = 0; i < geojson.features.length; i++) {
        if (callback(geojson.features[i].properties, i) === false) break;
      }
      break;
    case "Feature":
      callback(geojson.properties, 0);
      break;
  }
}

/**
 * Callback for propReduce
 *
 * The first time the callback function is called, the values provided as arguments depend
 * on whether the reduce method has an initialValue argument.
 *
 * If an initialValue is provided to the reduce method:
 *  - The previousValue argument is initialValue.
 *  - The currentValue argument is the value of the first element present in the array.
 *
 * If an initialValue is not provided:
 *  - The previousValue argument is the value of the first element present in the array.
 *  - The currentValue argument is the value of the second element present in the array.
 *
 * @callback propReduceCallback
 * @param {*} previousValue The accumulated value previously returned in the last invocation
 * of the callback, or initialValue, if supplied.
 * @param {*} currentProperties The current Properties being processed.
 * @param {number} featureIndex The current index of the Feature being processed.
 */

/**
 * Reduce properties in any GeoJSON object into a single value,
 * similar to how Array.reduce works. However, in this case we lazily run
 * the reduction, so an array of all properties is unnecessary.
 *
 * @name propReduce
 * @param {FeatureCollection|Feature} geojson any GeoJSON object
 * @param {Function} callback a method that takes (previousValue, currentProperties, featureIndex)
 * @param {*} [initialValue] Value to use as the first argument to the first call of the callback.
 * @returns {*} The value that results from the reduction.
 * @example
 * var features = turf.featureCollection([
 *     turf.point([26, 37], {foo: 'bar'}),
 *     turf.point([36, 53], {hello: 'world'})
 * ]);
 *
 * turf.propReduce(features, function (previousValue, currentProperties, featureIndex) {
 *   //=previousValue
 *   //=currentProperties
 *   //=featureIndex
 *   return currentProperties
 * });
 */
function propReduce(geojson, callback, initialValue) {
  var previousValue = initialValue;
  propEach(geojson, function (currentProperties, featureIndex) {
    if (featureIndex === 0 && initialValue === undefined)
      previousValue = currentProperties;
    else
      previousValue = callback(previousValue, currentProperties, featureIndex);
  });
  return previousValue;
}

/**
 * Callback for featureEach
 *
 * @callback featureEachCallback
 * @param {Feature<any>} currentFeature The current Feature being processed.
 * @param {number} featureIndex The current index of the Feature being processed.
 */

/**
 * Iterate over features in any GeoJSON object, similar to
 * Array.forEach.
 *
 * @name featureEach
 * @param {FeatureCollection|Feature|Geometry} geojson any GeoJSON object
 * @param {Function} callback a method that takes (currentFeature, featureIndex)
 * @returns {void}
 * @example
 * var features = turf.featureCollection([
 *   turf.point([26, 37], {foo: 'bar'}),
 *   turf.point([36, 53], {hello: 'world'})
 * ]);
 *
 * turf.featureEach(features, function (currentFeature, featureIndex) {
 *   //=currentFeature
 *   //=featureIndex
 * });
 */
function featureEach(geojson, callback) {
  if (geojson.type === "Feature") {
    callback(geojson, 0);
  } else if (geojson.type === "FeatureCollection") {
    for (var i = 0; i < geojson.features.length; i++) {
      if (callback(geojson.features[i], i) === false) break;
    }
  }
}

/**
 * Callback for featureReduce
 *
 * The first time the callback function is called, the values provided as arguments depend
 * on whether the reduce method has an initialValue argument.
 *
 * If an initialValue is provided to the reduce method:
 *  - The previousValue argument is initialValue.
 *  - The currentValue argument is the value of the first element present in the array.
 *
 * If an initialValue is not provided:
 *  - The previousValue argument is the value of the first element present in the array.
 *  - The currentValue argument is the value of the second element present in the array.
 *
 * @callback featureReduceCallback
 * @param {*} previousValue The accumulated value previously returned in the last invocation
 * of the callback, or initialValue, if supplied.
 * @param {Feature} currentFeature The current Feature being processed.
 * @param {number} featureIndex The current index of the Feature being processed.
 */

/**
 * Reduce features in any GeoJSON object, similar to Array.reduce().
 *
 * @name featureReduce
 * @param {FeatureCollection|Feature|Geometry} geojson any GeoJSON object
 * @param {Function} callback a method that takes (previousValue, currentFeature, featureIndex)
 * @param {*} [initialValue] Value to use as the first argument to the first call of the callback.
 * @returns {*} The value that results from the reduction.
 * @example
 * var features = turf.featureCollection([
 *   turf.point([26, 37], {"foo": "bar"}),
 *   turf.point([36, 53], {"hello": "world"})
 * ]);
 *
 * turf.featureReduce(features, function (previousValue, currentFeature, featureIndex) {
 *   //=previousValue
 *   //=currentFeature
 *   //=featureIndex
 *   return currentFeature
 * });
 */
function featureReduce(geojson, callback, initialValue) {
  var previousValue = initialValue;
  featureEach(geojson, function (currentFeature, featureIndex) {
    if (featureIndex === 0 && initialValue === undefined)
      previousValue = currentFeature;
    else previousValue = callback(previousValue, currentFeature, featureIndex);
  });
  return previousValue;
}

/**
 * Get all coordinates from any GeoJSON object.
 *
 * @name coordAll
 * @param {FeatureCollection|Feature|Geometry} geojson any GeoJSON object
 * @returns {Array<Array<number>>} coordinate position array
 * @example
 * var features = turf.featureCollection([
 *   turf.point([26, 37], {foo: 'bar'}),
 *   turf.point([36, 53], {hello: 'world'})
 * ]);
 *
 * var coords = turf.coordAll(features);
 * //= [[26, 37], [36, 53]]
 */
function coordAll(geojson) {
  var coords = [];
  coordEach(geojson, function (coord) {
    coords.push(coord);
  });
  return coords;
}

/**
 * Callback for geomEach
 *
 * @callback geomEachCallback
 * @param {Geometry} currentGeometry The current Geometry being processed.
 * @param {number} featureIndex The current index of the Feature being processed.
 * @param {Object} featureProperties The current Feature Properties being processed.
 * @param {Array<number>} featureBBox The current Feature BBox being processed.
 * @param {number|string} featureId The current Feature Id being processed.
 */

/**
 * Iterate over each geometry in any GeoJSON object, similar to Array.forEach()
 *
 * @name geomEach
 * @param {FeatureCollection|Feature|Geometry} geojson any GeoJSON object
 * @param {Function} callback a method that takes (currentGeometry, featureIndex, featureProperties, featureBBox, featureId)
 * @returns {void}
 * @example
 * var features = turf.featureCollection([
 *     turf.point([26, 37], {foo: 'bar'}),
 *     turf.point([36, 53], {hello: 'world'})
 * ]);
 *
 * turf.geomEach(features, function (currentGeometry, featureIndex, featureProperties, featureBBox, featureId) {
 *   //=currentGeometry
 *   //=featureIndex
 *   //=featureProperties
 *   //=featureBBox
 *   //=featureId
 * });
 */
function geomEach(geojson, callback) {
  var i,
    j,
    g,
    geometry,
    stopG,
    geometryMaybeCollection,
    isGeometryCollection,
    featureProperties,
    featureBBox,
    featureId,
    featureIndex = 0,
    isFeatureCollection = geojson.type === "FeatureCollection",
    isFeature = geojson.type === "Feature",
    stop = isFeatureCollection ? geojson.features.length : 1;

  // This logic may look a little weird. The reason why it is that way
  // is because it's trying to be fast. GeoJSON supports multiple kinds
  // of objects at its root: FeatureCollection, Features, Geometries.
  // This function has the responsibility of handling all of them, and that
  // means that some of the `for` loops you see below actually just don't apply
  // to certain inputs. For instance, if you give this just a
  // Point geometry, then both loops are short-circuited and all we do
  // is gradually rename the input until it's called 'geometry'.
  //
  // This also aims to allocate as few resources as possible: just a
  // few numbers and booleans, rather than any temporary arrays as would
  // be required with the normalization approach.
  for (i = 0; i < stop; i++) {
    geometryMaybeCollection = isFeatureCollection
      ? geojson.features[i].geometry
      : isFeature
      ? geojson.geometry
      : geojson;
    featureProperties = isFeatureCollection
      ? geojson.features[i].properties
      : isFeature
      ? geojson.properties
      : {};
    featureBBox = isFeatureCollection
      ? geojson.features[i].bbox
      : isFeature
      ? geojson.bbox
      : undefined;
    featureId = isFeatureCollection
      ? geojson.features[i].id
      : isFeature
      ? geojson.id
      : undefined;
    isGeometryCollection = geometryMaybeCollection
      ? geometryMaybeCollection.type === "GeometryCollection"
      : false;
    stopG = isGeometryCollection
      ? geometryMaybeCollection.geometries.length
      : 1;

    for (g = 0; g < stopG; g++) {
      geometry = isGeometryCollection
        ? geometryMaybeCollection.geometries[g]
        : geometryMaybeCollection;

      // Handle null Geometry
      if (geometry === null) {
        if (
          callback(
            null,
            featureIndex,
            featureProperties,
            featureBBox,
            featureId
          ) === false
        )
          return false;
        continue;
      }
      switch (geometry.type) {
        case "Point":
        case "LineString":
        case "MultiPoint":
        case "Polygon":
        case "MultiLineString":
        case "MultiPolygon": {
          if (
            callback(
              geometry,
              featureIndex,
              featureProperties,
              featureBBox,
              featureId
            ) === false
          )
            return false;
          break;
        }
        case "GeometryCollection": {
          for (j = 0; j < geometry.geometries.length; j++) {
            if (
              callback(
                geometry.geometries[j],
                featureIndex,
                featureProperties,
                featureBBox,
                featureId
              ) === false
            )
              return false;
          }
          break;
        }
        default:
          throw new Error("Unknown Geometry Type");
      }
    }
    // Only increase `featureIndex` per each feature
    featureIndex++;
  }
}

/**
 * Callback for geomReduce
 *
 * The first time the callback function is called, the values provided as arguments depend
 * on whether the reduce method has an initialValue argument.
 *
 * If an initialValue is provided to the reduce method:
 *  - The previousValue argument is initialValue.
 *  - The currentValue argument is the value of the first element present in the array.
 *
 * If an initialValue is not provided:
 *  - The previousValue argument is the value of the first element present in the array.
 *  - The currentValue argument is the value of the second element present in the array.
 *
 * @callback geomReduceCallback
 * @param {*} previousValue The accumulated value previously returned in the last invocation
 * of the callback, or initialValue, if supplied.
 * @param {Geometry} currentGeometry The current Geometry being processed.
 * @param {number} featureIndex The current index of the Feature being processed.
 * @param {Object} featureProperties The current Feature Properties being processed.
 * @param {Array<number>} featureBBox The current Feature BBox being processed.
 * @param {number|string} featureId The current Feature Id being processed.
 */

/**
 * Reduce geometry in any GeoJSON object, similar to Array.reduce().
 *
 * @name geomReduce
 * @param {FeatureCollection|Feature|Geometry} geojson any GeoJSON object
 * @param {Function} callback a method that takes (previousValue, currentGeometry, featureIndex, featureProperties, featureBBox, featureId)
 * @param {*} [initialValue] Value to use as the first argument to the first call of the callback.
 * @returns {*} The value that results from the reduction.
 * @example
 * var features = turf.featureCollection([
 *     turf.point([26, 37], {foo: 'bar'}),
 *     turf.point([36, 53], {hello: 'world'})
 * ]);
 *
 * turf.geomReduce(features, function (previousValue, currentGeometry, featureIndex, featureProperties, featureBBox, featureId) {
 *   //=previousValue
 *   //=currentGeometry
 *   //=featureIndex
 *   //=featureProperties
 *   //=featureBBox
 *   //=featureId
 *   return currentGeometry
 * });
 */
function geomReduce(geojson, callback, initialValue) {
  var previousValue = initialValue;
  geomEach(
    geojson,
    function (
      currentGeometry,
      featureIndex,
      featureProperties,
      featureBBox,
      featureId
    ) {
      if (featureIndex === 0 && initialValue === undefined)
        previousValue = currentGeometry;
      else
        previousValue = callback(
          previousValue,
          currentGeometry,
          featureIndex,
          featureProperties,
          featureBBox,
          featureId
        );
    }
  );
  return previousValue;
}

/**
 * Callback for flattenEach
 *
 * @callback flattenEachCallback
 * @param {Feature} currentFeature The current flattened feature being processed.
 * @param {number} featureIndex The current index of the Feature being processed.
 * @param {number} multiFeatureIndex The current index of the Multi-Feature being processed.
 */

/**
 * Iterate over flattened features in any GeoJSON object, similar to
 * Array.forEach.
 *
 * @name flattenEach
 * @param {FeatureCollection|Feature|Geometry} geojson any GeoJSON object
 * @param {Function} callback a method that takes (currentFeature, featureIndex, multiFeatureIndex)
 * @example
 * var features = turf.featureCollection([
 *     turf.point([26, 37], {foo: 'bar'}),
 *     turf.multiPoint([[40, 30], [36, 53]], {hello: 'world'})
 * ]);
 *
 * turf.flattenEach(features, function (currentFeature, featureIndex, multiFeatureIndex) {
 *   //=currentFeature
 *   //=featureIndex
 *   //=multiFeatureIndex
 * });
 */
function flattenEach(geojson, callback) {
  geomEach(geojson, function (geometry, featureIndex, properties, bbox, id) {
    // Callback for single geometry
    var type = geometry === null ? null : geometry.type;
    switch (type) {
      case null:
      case "Point":
      case "LineString":
      case "Polygon":
        if (
          callback(
            helpers.feature(geometry, properties, { bbox: bbox, id: id }),
            featureIndex,
            0
          ) === false
        )
          return false;
        return;
    }

    var geomType;

    // Callback for multi-geometry
    switch (type) {
      case "MultiPoint":
        geomType = "Point";
        break;
      case "MultiLineString":
        geomType = "LineString";
        break;
      case "MultiPolygon":
        geomType = "Polygon";
        break;
    }

    for (
      var multiFeatureIndex = 0;
      multiFeatureIndex < geometry.coordinates.length;
      multiFeatureIndex++
    ) {
      var coordinate = geometry.coordinates[multiFeatureIndex];
      var geom = {
        type: geomType,
        coordinates: coordinate,
      };
      if (
        callback(helpers.feature(geom, properties), featureIndex, multiFeatureIndex) ===
        false
      )
        return false;
    }
  });
}

/**
 * Callback for flattenReduce
 *
 * The first time the callback function is called, the values provided as arguments depend
 * on whether the reduce method has an initialValue argument.
 *
 * If an initialValue is provided to the reduce method:
 *  - The previousValue argument is initialValue.
 *  - The currentValue argument is the value of the first element present in the array.
 *
 * If an initialValue is not provided:
 *  - The previousValue argument is the value of the first element present in the array.
 *  - The currentValue argument is the value of the second element present in the array.
 *
 * @callback flattenReduceCallback
 * @param {*} previousValue The accumulated value previously returned in the last invocation
 * of the callback, or initialValue, if supplied.
 * @param {Feature} currentFeature The current Feature being processed.
 * @param {number} featureIndex The current index of the Feature being processed.
 * @param {number} multiFeatureIndex The current index of the Multi-Feature being processed.
 */

/**
 * Reduce flattened features in any GeoJSON object, similar to Array.reduce().
 *
 * @name flattenReduce
 * @param {FeatureCollection|Feature|Geometry} geojson any GeoJSON object
 * @param {Function} callback a method that takes (previousValue, currentFeature, featureIndex, multiFeatureIndex)
 * @param {*} [initialValue] Value to use as the first argument to the first call of the callback.
 * @returns {*} The value that results from the reduction.
 * @example
 * var features = turf.featureCollection([
 *     turf.point([26, 37], {foo: 'bar'}),
 *     turf.multiPoint([[40, 30], [36, 53]], {hello: 'world'})
 * ]);
 *
 * turf.flattenReduce(features, function (previousValue, currentFeature, featureIndex, multiFeatureIndex) {
 *   //=previousValue
 *   //=currentFeature
 *   //=featureIndex
 *   //=multiFeatureIndex
 *   return currentFeature
 * });
 */
function flattenReduce(geojson, callback, initialValue) {
  var previousValue = initialValue;
  flattenEach(
    geojson,
    function (currentFeature, featureIndex, multiFeatureIndex) {
      if (
        featureIndex === 0 &&
        multiFeatureIndex === 0 &&
        initialValue === undefined
      )
        previousValue = currentFeature;
      else
        previousValue = callback(
          previousValue,
          currentFeature,
          featureIndex,
          multiFeatureIndex
        );
    }
  );
  return previousValue;
}

/**
 * Callback for segmentEach
 *
 * @callback segmentEachCallback
 * @param {Feature<LineString>} currentSegment The current Segment being processed.
 * @param {number} featureIndex The current index of the Feature being processed.
 * @param {number} multiFeatureIndex The current index of the Multi-Feature being processed.
 * @param {number} geometryIndex The current index of the Geometry being processed.
 * @param {number} segmentIndex The current index of the Segment being processed.
 * @returns {void}
 */

/**
 * Iterate over 2-vertex line segment in any GeoJSON object, similar to Array.forEach()
 * (Multi)Point geometries do not contain segments therefore they are ignored during this operation.
 *
 * @param {FeatureCollection|Feature|Geometry} geojson any GeoJSON
 * @param {Function} callback a method that takes (currentSegment, featureIndex, multiFeatureIndex, geometryIndex, segmentIndex)
 * @returns {void}
 * @example
 * var polygon = turf.polygon([[[-50, 5], [-40, -10], [-50, -10], [-40, 5], [-50, 5]]]);
 *
 * // Iterate over GeoJSON by 2-vertex segments
 * turf.segmentEach(polygon, function (currentSegment, featureIndex, multiFeatureIndex, geometryIndex, segmentIndex) {
 *   //=currentSegment
 *   //=featureIndex
 *   //=multiFeatureIndex
 *   //=geometryIndex
 *   //=segmentIndex
 * });
 *
 * // Calculate the total number of segments
 * var total = 0;
 * turf.segmentEach(polygon, function () {
 *     total++;
 * });
 */
function segmentEach(geojson, callback) {
  flattenEach(geojson, function (feature, featureIndex, multiFeatureIndex) {
    var segmentIndex = 0;

    // Exclude null Geometries
    if (!feature.geometry) return;
    // (Multi)Point geometries do not contain segments therefore they are ignored during this operation.
    var type = feature.geometry.type;
    if (type === "Point" || type === "MultiPoint") return;

    // Generate 2-vertex line segments
    var previousCoords;
    var previousFeatureIndex = 0;
    var previousMultiIndex = 0;
    var prevGeomIndex = 0;
    if (
      coordEach(
        feature,
        function (
          currentCoord,
          coordIndex,
          featureIndexCoord,
          multiPartIndexCoord,
          geometryIndex
        ) {
          // Simulating a meta.coordReduce() since `reduce` operations cannot be stopped by returning `false`
          if (
            previousCoords === undefined ||
            featureIndex > previousFeatureIndex ||
            multiPartIndexCoord > previousMultiIndex ||
            geometryIndex > prevGeomIndex
          ) {
            previousCoords = currentCoord;
            previousFeatureIndex = featureIndex;
            previousMultiIndex = multiPartIndexCoord;
            prevGeomIndex = geometryIndex;
            segmentIndex = 0;
            return;
          }
          var currentSegment = helpers.lineString(
            [previousCoords, currentCoord],
            feature.properties
          );
          if (
            callback(
              currentSegment,
              featureIndex,
              multiFeatureIndex,
              geometryIndex,
              segmentIndex
            ) === false
          )
            return false;
          segmentIndex++;
          previousCoords = currentCoord;
        }
      ) === false
    )
      return false;
  });
}

/**
 * Callback for segmentReduce
 *
 * The first time the callback function is called, the values provided as arguments depend
 * on whether the reduce method has an initialValue argument.
 *
 * If an initialValue is provided to the reduce method:
 *  - The previousValue argument is initialValue.
 *  - The currentValue argument is the value of the first element present in the array.
 *
 * If an initialValue is not provided:
 *  - The previousValue argument is the value of the first element present in the array.
 *  - The currentValue argument is the value of the second element present in the array.
 *
 * @callback segmentReduceCallback
 * @param {*} previousValue The accumulated value previously returned in the last invocation
 * of the callback, or initialValue, if supplied.
 * @param {Feature<LineString>} currentSegment The current Segment being processed.
 * @param {number} featureIndex The current index of the Feature being processed.
 * @param {number} multiFeatureIndex The current index of the Multi-Feature being processed.
 * @param {number} geometryIndex The current index of the Geometry being processed.
 * @param {number} segmentIndex The current index of the Segment being processed.
 */

/**
 * Reduce 2-vertex line segment in any GeoJSON object, similar to Array.reduce()
 * (Multi)Point geometries do not contain segments therefore they are ignored during this operation.
 *
 * @param {FeatureCollection|Feature|Geometry} geojson any GeoJSON
 * @param {Function} callback a method that takes (previousValue, currentSegment, currentIndex)
 * @param {*} [initialValue] Value to use as the first argument to the first call of the callback.
 * @returns {void}
 * @example
 * var polygon = turf.polygon([[[-50, 5], [-40, -10], [-50, -10], [-40, 5], [-50, 5]]]);
 *
 * // Iterate over GeoJSON by 2-vertex segments
 * turf.segmentReduce(polygon, function (previousSegment, currentSegment, featureIndex, multiFeatureIndex, geometryIndex, segmentIndex) {
 *   //= previousSegment
 *   //= currentSegment
 *   //= featureIndex
 *   //= multiFeatureIndex
 *   //= geometryIndex
 *   //= segmentIndex
 *   return currentSegment
 * });
 *
 * // Calculate the total number of segments
 * var initialValue = 0
 * var total = turf.segmentReduce(polygon, function (previousValue) {
 *     previousValue++;
 *     return previousValue;
 * }, initialValue);
 */
function segmentReduce(geojson, callback, initialValue) {
  var previousValue = initialValue;
  var started = false;
  segmentEach(
    geojson,
    function (
      currentSegment,
      featureIndex,
      multiFeatureIndex,
      geometryIndex,
      segmentIndex
    ) {
      if (started === false && initialValue === undefined)
        previousValue = currentSegment;
      else
        previousValue = callback(
          previousValue,
          currentSegment,
          featureIndex,
          multiFeatureIndex,
          geometryIndex,
          segmentIndex
        );
      started = true;
    }
  );
  return previousValue;
}

/**
 * Callback for lineEach
 *
 * @callback lineEachCallback
 * @param {Feature<LineString>} currentLine The current LineString|LinearRing being processed
 * @param {number} featureIndex The current index of the Feature being processed
 * @param {number} multiFeatureIndex The current index of the Multi-Feature being processed
 * @param {number} geometryIndex The current index of the Geometry being processed
 */

/**
 * Iterate over line or ring coordinates in LineString, Polygon, MultiLineString, MultiPolygon Features or Geometries,
 * similar to Array.forEach.
 *
 * @name lineEach
 * @param {Geometry|Feature<LineString|Polygon|MultiLineString|MultiPolygon>} geojson object
 * @param {Function} callback a method that takes (currentLine, featureIndex, multiFeatureIndex, geometryIndex)
 * @example
 * var multiLine = turf.multiLineString([
 *   [[26, 37], [35, 45]],
 *   [[36, 53], [38, 50], [41, 55]]
 * ]);
 *
 * turf.lineEach(multiLine, function (currentLine, featureIndex, multiFeatureIndex, geometryIndex) {
 *   //=currentLine
 *   //=featureIndex
 *   //=multiFeatureIndex
 *   //=geometryIndex
 * });
 */
function lineEach(geojson, callback) {
  // validation
  if (!geojson) throw new Error("geojson is required");

  flattenEach(geojson, function (feature, featureIndex, multiFeatureIndex) {
    if (feature.geometry === null) return;
    var type = feature.geometry.type;
    var coords = feature.geometry.coordinates;
    switch (type) {
      case "LineString":
        if (callback(feature, featureIndex, multiFeatureIndex, 0, 0) === false)
          return false;
        break;
      case "Polygon":
        for (
          var geometryIndex = 0;
          geometryIndex < coords.length;
          geometryIndex++
        ) {
          if (
            callback(
              helpers.lineString(coords[geometryIndex], feature.properties),
              featureIndex,
              multiFeatureIndex,
              geometryIndex
            ) === false
          )
            return false;
        }
        break;
    }
  });
}

/**
 * Callback for lineReduce
 *
 * The first time the callback function is called, the values provided as arguments depend
 * on whether the reduce method has an initialValue argument.
 *
 * If an initialValue is provided to the reduce method:
 *  - The previousValue argument is initialValue.
 *  - The currentValue argument is the value of the first element present in the array.
 *
 * If an initialValue is not provided:
 *  - The previousValue argument is the value of the first element present in the array.
 *  - The currentValue argument is the value of the second element present in the array.
 *
 * @callback lineReduceCallback
 * @param {*} previousValue The accumulated value previously returned in the last invocation
 * of the callback, or initialValue, if supplied.
 * @param {Feature<LineString>} currentLine The current LineString|LinearRing being processed.
 * @param {number} featureIndex The current index of the Feature being processed
 * @param {number} multiFeatureIndex The current index of the Multi-Feature being processed
 * @param {number} geometryIndex The current index of the Geometry being processed
 */

/**
 * Reduce features in any GeoJSON object, similar to Array.reduce().
 *
 * @name lineReduce
 * @param {Geometry|Feature<LineString|Polygon|MultiLineString|MultiPolygon>} geojson object
 * @param {Function} callback a method that takes (previousValue, currentLine, featureIndex, multiFeatureIndex, geometryIndex)
 * @param {*} [initialValue] Value to use as the first argument to the first call of the callback.
 * @returns {*} The value that results from the reduction.
 * @example
 * var multiPoly = turf.multiPolygon([
 *   turf.polygon([[[12,48],[2,41],[24,38],[12,48]], [[9,44],[13,41],[13,45],[9,44]]]),
 *   turf.polygon([[[5, 5], [0, 0], [2, 2], [4, 4], [5, 5]]])
 * ]);
 *
 * turf.lineReduce(multiPoly, function (previousValue, currentLine, featureIndex, multiFeatureIndex, geometryIndex) {
 *   //=previousValue
 *   //=currentLine
 *   //=featureIndex
 *   //=multiFeatureIndex
 *   //=geometryIndex
 *   return currentLine
 * });
 */
function lineReduce(geojson, callback, initialValue) {
  var previousValue = initialValue;
  lineEach(
    geojson,
    function (currentLine, featureIndex, multiFeatureIndex, geometryIndex) {
      if (featureIndex === 0 && initialValue === undefined)
        previousValue = currentLine;
      else
        previousValue = callback(
          previousValue,
          currentLine,
          featureIndex,
          multiFeatureIndex,
          geometryIndex
        );
    }
  );
  return previousValue;
}

/**
 * Finds a particular 2-vertex LineString Segment from a GeoJSON using `@turf/meta` indexes.
 *
 * Negative indexes are permitted.
 * Point & MultiPoint will always return null.
 *
 * @param {FeatureCollection|Feature|Geometry} geojson Any GeoJSON Feature or Geometry
 * @param {Object} [options={}] Optional parameters
 * @param {number} [options.featureIndex=0] Feature Index
 * @param {number} [options.multiFeatureIndex=0] Multi-Feature Index
 * @param {number} [options.geometryIndex=0] Geometry Index
 * @param {number} [options.segmentIndex=0] Segment Index
 * @param {Object} [options.properties={}] Translate Properties to output LineString
 * @param {BBox} [options.bbox={}] Translate BBox to output LineString
 * @param {number|string} [options.id={}] Translate Id to output LineString
 * @returns {Feature<LineString>} 2-vertex GeoJSON Feature LineString
 * @example
 * var multiLine = turf.multiLineString([
 *     [[10, 10], [50, 30], [30, 40]],
 *     [[-10, -10], [-50, -30], [-30, -40]]
 * ]);
 *
 * // First Segment (defaults are 0)
 * turf.findSegment(multiLine);
 * // => Feature<LineString<[[10, 10], [50, 30]]>>
 *
 * // First Segment of 2nd Multi Feature
 * turf.findSegment(multiLine, {multiFeatureIndex: 1});
 * // => Feature<LineString<[[-10, -10], [-50, -30]]>>
 *
 * // Last Segment of Last Multi Feature
 * turf.findSegment(multiLine, {multiFeatureIndex: -1, segmentIndex: -1});
 * // => Feature<LineString<[[-50, -30], [-30, -40]]>>
 */
function findSegment(geojson, options) {
  // Optional Parameters
  options = options || {};
  if (!helpers.isObject(options)) throw new Error("options is invalid");
  var featureIndex = options.featureIndex || 0;
  var multiFeatureIndex = options.multiFeatureIndex || 0;
  var geometryIndex = options.geometryIndex || 0;
  var segmentIndex = options.segmentIndex || 0;

  // Find FeatureIndex
  var properties = options.properties;
  var geometry;

  switch (geojson.type) {
    case "FeatureCollection":
      if (featureIndex < 0)
        featureIndex = geojson.features.length + featureIndex;
      properties = properties || geojson.features[featureIndex].properties;
      geometry = geojson.features[featureIndex].geometry;
      break;
    case "Feature":
      properties = properties || geojson.properties;
      geometry = geojson.geometry;
      break;
    case "Point":
    case "MultiPoint":
      return null;
    case "LineString":
    case "Polygon":
    case "MultiLineString":
    case "MultiPolygon":
      geometry = geojson;
      break;
    default:
      throw new Error("geojson is invalid");
  }

  // Find SegmentIndex
  if (geometry === null) return null;
  var coords = geometry.coordinates;
  switch (geometry.type) {
    case "Point":
    case "MultiPoint":
      return null;
    case "LineString":
      if (segmentIndex < 0) segmentIndex = coords.length + segmentIndex - 1;
      return helpers.lineString(
        [coords[segmentIndex], coords[segmentIndex + 1]],
        properties,
        options
      );
    case "Polygon":
      if (geometryIndex < 0) geometryIndex = coords.length + geometryIndex;
      if (segmentIndex < 0)
        segmentIndex = coords[geometryIndex].length + segmentIndex - 1;
      return helpers.lineString(
        [
          coords[geometryIndex][segmentIndex],
          coords[geometryIndex][segmentIndex + 1],
        ],
        properties,
        options
      );
    case "MultiLineString":
      if (multiFeatureIndex < 0)
        multiFeatureIndex = coords.length + multiFeatureIndex;
      if (segmentIndex < 0)
        segmentIndex = coords[multiFeatureIndex].length + segmentIndex - 1;
      return helpers.lineString(
        [
          coords[multiFeatureIndex][segmentIndex],
          coords[multiFeatureIndex][segmentIndex + 1],
        ],
        properties,
        options
      );
    case "MultiPolygon":
      if (multiFeatureIndex < 0)
        multiFeatureIndex = coords.length + multiFeatureIndex;
      if (geometryIndex < 0)
        geometryIndex = coords[multiFeatureIndex].length + geometryIndex;
      if (segmentIndex < 0)
        segmentIndex =
          coords[multiFeatureIndex][geometryIndex].length - segmentIndex - 1;
      return helpers.lineString(
        [
          coords[multiFeatureIndex][geometryIndex][segmentIndex],
          coords[multiFeatureIndex][geometryIndex][segmentIndex + 1],
        ],
        properties,
        options
      );
  }
  throw new Error("geojson is invalid");
}

/**
 * Finds a particular Point from a GeoJSON using `@turf/meta` indexes.
 *
 * Negative indexes are permitted.
 *
 * @param {FeatureCollection|Feature|Geometry} geojson Any GeoJSON Feature or Geometry
 * @param {Object} [options={}] Optional parameters
 * @param {number} [options.featureIndex=0] Feature Index
 * @param {number} [options.multiFeatureIndex=0] Multi-Feature Index
 * @param {number} [options.geometryIndex=0] Geometry Index
 * @param {number} [options.coordIndex=0] Coord Index
 * @param {Object} [options.properties={}] Translate Properties to output Point
 * @param {BBox} [options.bbox={}] Translate BBox to output Point
 * @param {number|string} [options.id={}] Translate Id to output Point
 * @returns {Feature<Point>} 2-vertex GeoJSON Feature Point
 * @example
 * var multiLine = turf.multiLineString([
 *     [[10, 10], [50, 30], [30, 40]],
 *     [[-10, -10], [-50, -30], [-30, -40]]
 * ]);
 *
 * // First Segment (defaults are 0)
 * turf.findPoint(multiLine);
 * // => Feature<Point<[10, 10]>>
 *
 * // First Segment of the 2nd Multi-Feature
 * turf.findPoint(multiLine, {multiFeatureIndex: 1});
 * // => Feature<Point<[-10, -10]>>
 *
 * // Last Segment of last Multi-Feature
 * turf.findPoint(multiLine, {multiFeatureIndex: -1, coordIndex: -1});
 * // => Feature<Point<[-30, -40]>>
 */
function findPoint(geojson, options) {
  // Optional Parameters
  options = options || {};
  if (!helpers.isObject(options)) throw new Error("options is invalid");
  var featureIndex = options.featureIndex || 0;
  var multiFeatureIndex = options.multiFeatureIndex || 0;
  var geometryIndex = options.geometryIndex || 0;
  var coordIndex = options.coordIndex || 0;

  // Find FeatureIndex
  var properties = options.properties;
  var geometry;

  switch (geojson.type) {
    case "FeatureCollection":
      if (featureIndex < 0)
        featureIndex = geojson.features.length + featureIndex;
      properties = properties || geojson.features[featureIndex].properties;
      geometry = geojson.features[featureIndex].geometry;
      break;
    case "Feature":
      properties = properties || geojson.properties;
      geometry = geojson.geometry;
      break;
    case "Point":
    case "MultiPoint":
      return null;
    case "LineString":
    case "Polygon":
    case "MultiLineString":
    case "MultiPolygon":
      geometry = geojson;
      break;
    default:
      throw new Error("geojson is invalid");
  }

  // Find Coord Index
  if (geometry === null) return null;
  var coords = geometry.coordinates;
  switch (geometry.type) {
    case "Point":
      return helpers.point(coords, properties, options);
    case "MultiPoint":
      if (multiFeatureIndex < 0)
        multiFeatureIndex = coords.length + multiFeatureIndex;
      return helpers.point(coords[multiFeatureIndex], properties, options);
    case "LineString":
      if (coordIndex < 0) coordIndex = coords.length + coordIndex;
      return helpers.point(coords[coordIndex], properties, options);
    case "Polygon":
      if (geometryIndex < 0) geometryIndex = coords.length + geometryIndex;
      if (coordIndex < 0)
        coordIndex = coords[geometryIndex].length + coordIndex;
      return helpers.point(coords[geometryIndex][coordIndex], properties, options);
    case "MultiLineString":
      if (multiFeatureIndex < 0)
        multiFeatureIndex = coords.length + multiFeatureIndex;
      if (coordIndex < 0)
        coordIndex = coords[multiFeatureIndex].length + coordIndex;
      return helpers.point(coords[multiFeatureIndex][coordIndex], properties, options);
    case "MultiPolygon":
      if (multiFeatureIndex < 0)
        multiFeatureIndex = coords.length + multiFeatureIndex;
      if (geometryIndex < 0)
        geometryIndex = coords[multiFeatureIndex].length + geometryIndex;
      if (coordIndex < 0)
        coordIndex =
          coords[multiFeatureIndex][geometryIndex].length - coordIndex;
      return helpers.point(
        coords[multiFeatureIndex][geometryIndex][coordIndex],
        properties,
        options
      );
  }
  throw new Error("geojson is invalid");
}

exports.coordEach = coordEach;
exports.coordReduce = coordReduce;
exports.propEach = propEach;
exports.propReduce = propReduce;
exports.featureEach = featureEach;
exports.featureReduce = featureReduce;
exports.coordAll = coordAll;
exports.geomEach = geomEach;
exports.geomReduce = geomReduce;
exports.flattenEach = flattenEach;
exports.flattenReduce = flattenReduce;
exports.segmentEach = segmentEach;
exports.segmentReduce = segmentReduce;
exports.lineEach = lineEach;
exports.lineReduce = lineReduce;
exports.findSegment = findSegment;
exports.findPoint = findPoint;

},{"@turf/helpers":12}],20:[function(require,module,exports){
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var boolean_within_1 = __importDefault(require("@turf/boolean-within"));
var distance_1 = __importDefault(require("@turf/distance"));
var helpers_1 = require("@turf/helpers");
/**
 * Creates a {@link Point} grid from a bounding box, {@link FeatureCollection} or {@link Feature}.
 *
 * @name pointGrid
 * @param {Array<number>} bbox extent in [minX, minY, maxX, maxY] order
 * @param {number} cellSide the distance between points, in units
 * @param {Object} [options={}] Optional parameters
 * @param {string} [options.units='kilometers'] used in calculating cellSide, can be degrees, radians, miles, or kilometers
 * @param {Feature<Polygon|MultiPolygon>} [options.mask] if passed a Polygon or MultiPolygon, the grid Points will be created only inside it
 * @param {Object} [options.properties={}] passed to each point of the grid
 * @returns {FeatureCollection<Point>} grid of points
 * @example
 * var extent = [-70.823364, -33.553984, -70.473175, -33.302986];
 * var cellSide = 3;
 * var options = {units: 'miles'};
 *
 * var grid = turf.pointGrid(extent, cellSide, options);
 *
 * //addToMap
 * var addToMap = [grid];
 */
function pointGrid(bbox, cellSide, options) {
    if (options === void 0) { options = {}; }
    // Default parameters
    if (options.mask && !options.units)
        options.units = "kilometers";
    // Containers
    var results = [];
    // Typescript handles the Type Validation
    // if (cellSide === null || cellSide === undefined) throw new Error('cellSide is required');
    // if (!isNumber(cellSide)) throw new Error('cellSide is invalid');
    // if (!bbox) throw new Error('bbox is required');
    // if (!Array.isArray(bbox)) throw new Error('bbox must be array');
    // if (bbox.length !== 4) throw new Error('bbox must contain 4 numbers');
    // if (mask && ['Polygon', 'MultiPolygon'].indexOf(getType(mask)) === -1) throw new Error('options.mask must be a (Multi)Polygon');
    var west = bbox[0];
    var south = bbox[1];
    var east = bbox[2];
    var north = bbox[3];
    var xFraction = cellSide / distance_1.default([west, south], [east, south], options);
    var cellWidth = xFraction * (east - west);
    var yFraction = cellSide / distance_1.default([west, south], [west, north], options);
    var cellHeight = yFraction * (north - south);
    var bboxWidth = east - west;
    var bboxHeight = north - south;
    var columns = Math.floor(bboxWidth / cellWidth);
    var rows = Math.floor(bboxHeight / cellHeight);
    // adjust origin of the grid
    var deltaX = (bboxWidth - columns * cellWidth) / 2;
    var deltaY = (bboxHeight - rows * cellHeight) / 2;
    var currentX = west + deltaX;
    while (currentX <= east) {
        var currentY = south + deltaY;
        while (currentY <= north) {
            var cellPt = helpers_1.point([currentX, currentY], options.properties);
            if (options.mask) {
                if (boolean_within_1.default(cellPt, options.mask))
                    results.push(cellPt);
            }
            else {
                results.push(cellPt);
            }
            currentY += cellHeight;
        }
        currentX += cellWidth;
    }
    return helpers_1.featureCollection(results);
}
exports.default = pointGrid;

},{"@turf/boolean-within":7,"@turf/distance":11,"@turf/helpers":12}],21:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var helpers_1 = require("@turf/helpers");
var invariant_1 = require("@turf/invariant");
/**
 * Converts a {@link Polygon} to {@link LineString|(Multi)LineString} or {@link MultiPolygon} to a
 * {@link FeatureCollection} of {@link LineString|(Multi)LineString}.
 *
 * @name polygonToLine
 * @param {Feature<Polygon|MultiPolygon>} poly Feature to convert
 * @param {Object} [options={}] Optional parameters
 * @param {Object} [options.properties={}] translates GeoJSON properties to Feature
 * @returns {FeatureCollection|Feature<LineString|MultiLinestring>} converted (Multi)Polygon to (Multi)LineString
 * @example
 * var poly = turf.polygon([[[125, -30], [145, -30], [145, -20], [125, -20], [125, -30]]]);
 *
 * var line = turf.polygonToLine(poly);
 *
 * //addToMap
 * var addToMap = [line];
 */
function default_1(poly, options) {
    if (options === void 0) { options = {}; }
    var geom = invariant_1.getGeom(poly);
    if (!options.properties && poly.type === "Feature") {
        options.properties = poly.properties;
    }
    switch (geom.type) {
        case "Polygon":
            return polygonToLine(geom, options);
        case "MultiPolygon":
            return multiPolygonToLine(geom, options);
        default:
            throw new Error("invalid poly");
    }
}
exports.default = default_1;
/**
 * @private
 */
function polygonToLine(poly, options) {
    if (options === void 0) { options = {}; }
    var geom = invariant_1.getGeom(poly);
    var coords = geom.coordinates;
    var properties = options.properties
        ? options.properties
        : poly.type === "Feature"
            ? poly.properties
            : {};
    return coordsToLine(coords, properties);
}
exports.polygonToLine = polygonToLine;
/**
 * @private
 */
function multiPolygonToLine(multiPoly, options) {
    if (options === void 0) { options = {}; }
    var geom = invariant_1.getGeom(multiPoly);
    var coords = geom.coordinates;
    var properties = options.properties
        ? options.properties
        : multiPoly.type === "Feature"
            ? multiPoly.properties
            : {};
    var lines = [];
    coords.forEach(function (coord) {
        lines.push(coordsToLine(coord, properties));
    });
    return helpers_1.featureCollection(lines);
}
exports.multiPolygonToLine = multiPolygonToLine;
/**
 * @private
 */
function coordsToLine(coords, properties) {
    if (coords.length > 1) {
        return helpers_1.multiLineString(coords, properties);
    }
    return helpers_1.lineString(coords[0], properties);
}
exports.coordsToLine = coordsToLine;

},{"@turf/helpers":12,"@turf/invariant":16}],22:[function(require,module,exports){
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var boolean_intersects_1 = __importDefault(require("@turf/boolean-intersects"));
var distance_1 = __importDefault(require("@turf/distance"));
var helpers_1 = require("@turf/helpers");
/**
 * Creates a grid of rectangles from a bounding box, {@link Feature} or {@link FeatureCollection}.
 *
 * @name rectangleGrid
 * @param {Array<number>} bbox extent in [minX, minY, maxX, maxY] order
 * @param {number} cellWidth of each cell, in units
 * @param {number} cellHeight of each cell, in units
 * @param {Object} [options={}] Optional parameters
 * @param {string} [options.units='kilometers'] units ("degrees", "radians", "miles", "kilometers") that the given cellWidth
 * and cellHeight are expressed in. Converted at the southern border.
 * @param {Feature<Polygon|MultiPolygon>} [options.mask] if passed a Polygon or MultiPolygon,
 * the grid Points will be created only inside it
 * @param {Object} [options.properties={}] passed to each point of the grid
 * @returns {FeatureCollection<Polygon>} a grid of polygons
 * @example
 * var bbox = [-95, 30 ,-85, 40];
 * var cellWidth = 50;
 * var cellHeight = 20;
 * var options = {units: 'miles'};
 *
 * var rectangleGrid = turf.rectangleGrid(bbox, cellWidth, cellHeight, options);
 *
 * //addToMap
 * var addToMap = [rectangleGrid]
 */
function rectangleGrid(bbox, cellWidth, cellHeight, options) {
    if (options === void 0) { options = {}; }
    // Containers
    var results = [];
    var west = bbox[0];
    var south = bbox[1];
    var east = bbox[2];
    var north = bbox[3];
    var xFraction = cellWidth / distance_1.default([west, south], [east, south], options);
    var cellWidthDeg = xFraction * (east - west);
    var yFraction = cellHeight / distance_1.default([west, south], [west, north], options);
    var cellHeightDeg = yFraction * (north - south);
    // rows & columns
    var bboxWidth = east - west;
    var bboxHeight = north - south;
    var columns = Math.floor(bboxWidth / cellWidthDeg);
    var rows = Math.floor(bboxHeight / cellHeightDeg);
    // if the grid does not fill the bbox perfectly, center it.
    var deltaX = (bboxWidth - columns * cellWidthDeg) / 2;
    var deltaY = (bboxHeight - rows * cellHeightDeg) / 2;
    // iterate over columns & rows
    var currentX = west + deltaX;
    for (var column = 0; column < columns; column++) {
        var currentY = south + deltaY;
        for (var row = 0; row < rows; row++) {
            var cellPoly = helpers_1.polygon([
                [
                    [currentX, currentY],
                    [currentX, currentY + cellHeightDeg],
                    [currentX + cellWidthDeg, currentY + cellHeightDeg],
                    [currentX + cellWidthDeg, currentY],
                    [currentX, currentY],
                ],
            ], options.properties);
            if (options.mask) {
                if (boolean_intersects_1.default(options.mask, cellPoly)) {
                    results.push(cellPoly);
                }
            }
            else {
                results.push(cellPoly);
            }
            currentY += cellHeightDeg;
        }
        currentX += cellWidthDeg;
    }
    return helpers_1.featureCollection(results);
}
exports.default = rectangleGrid;

},{"@turf/boolean-intersects":4,"@turf/distance":11,"@turf/helpers":12}],23:[function(require,module,exports){
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var rectangle_grid_1 = __importDefault(require("@turf/rectangle-grid"));
/**
 * Creates a square grid from a bounding box.
 *
 * @name squareGrid
 * @param {Array<number>} bbox extent in [minX, minY, maxX, maxY] order
 * @param {number} cellSide of each cell, in units
 * @param {Object} [options={}] Optional parameters
 * @param {string} [options.units='kilometers'] used in calculating cellSide, can be degrees,
 * radians, miles, or kilometers
 * @param {Feature<Polygon|MultiPolygon>} [options.mask] if passed a Polygon or MultiPolygon,
 * the grid Points will be created only inside it
 * @param {Object} [options.properties={}] passed to each point of the grid
 * @returns {FeatureCollection<Polygon>} grid a grid of polygons
 * @example
 * var bbox = [-95, 30 ,-85, 40];
 * var cellSide = 50;
 * var options = {units: 'miles'};
 *
 * var squareGrid = turf.squareGrid(bbox, cellSide, options);
 *
 * //addToMap
 * var addToMap = [squareGrid]
 */
function squareGrid(bbox, cellSide, options) {
    if (options === void 0) { options = {}; }
    return rectangle_grid_1.default(bbox, cellSide, cellSide, options);
}
exports.default = squareGrid;

},{"@turf/rectangle-grid":22}],24:[function(require,module,exports){
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var distance_1 = __importDefault(require("@turf/distance"));
var intersect_1 = __importDefault(require("@turf/intersect"));
var helpers_1 = require("@turf/helpers");
/**
 * Takes a bounding box and a cell depth and returns a set of triangular {@link Polygon|polygons} in a grid.
 *
 * @name triangleGrid
 * @param {Array<number>} bbox extent in [minX, minY, maxX, maxY] order
 * @param {number} cellSide dimension of each cell
 * @param {Object} [options={}] Optional parameters
 * @param {string} [options.units='kilometers'] used in calculating cellSide, can be degrees, radians, miles, or kilometers
 * @param {Feature<Polygon>} [options.mask] if passed a Polygon or MultiPolygon, the grid Points will be created only inside it
 * @param {Object} [options.properties={}] passed to each point of the grid
 * @returns {FeatureCollection<Polygon>} grid of polygons
 * @example
 * var bbox = [-95, 30 ,-85, 40];
 * var cellSide = 50;
 * var options = {units: 'miles'};
 *
 * var triangleGrid = turf.triangleGrid(bbox, cellSide, options);
 *
 * //addToMap
 * var addToMap = [triangleGrid];
 */
function triangleGrid(bbox, cellSide, options) {
    if (options === void 0) { options = {}; }
    // Containers
    var results = [];
    // Input Validation is being handled by Typescript
    // if (cellSide === null || cellSide === undefined) throw new Error('cellSide is required');
    // if (!isNumber(cellSide)) throw new Error('cellSide is invalid');
    // if (!bbox) throw new Error('bbox is required');
    // if (!Array.isArray(bbox)) throw new Error('bbox must be array');
    // if (bbox.length !== 4) throw new Error('bbox must contain 4 numbers');
    // if (mask && ['Polygon', 'MultiPolygon'].indexOf(getType(mask)) === -1) throw new Error('options.mask must be a (Multi)Polygon');
    // Main
    var xFraction = cellSide / distance_1.default([bbox[0], bbox[1]], [bbox[2], bbox[1]], options);
    var cellWidth = xFraction * (bbox[2] - bbox[0]);
    var yFraction = cellSide / distance_1.default([bbox[0], bbox[1]], [bbox[0], bbox[3]], options);
    var cellHeight = yFraction * (bbox[3] - bbox[1]);
    var xi = 0;
    var currentX = bbox[0];
    while (currentX <= bbox[2]) {
        var yi = 0;
        var currentY = bbox[1];
        while (currentY <= bbox[3]) {
            var cellTriangle1 = null;
            var cellTriangle2 = null;
            if (xi % 2 === 0 && yi % 2 === 0) {
                cellTriangle1 = helpers_1.polygon([
                    [
                        [currentX, currentY],
                        [currentX, currentY + cellHeight],
                        [currentX + cellWidth, currentY],
                        [currentX, currentY],
                    ],
                ], options.properties);
                cellTriangle2 = helpers_1.polygon([
                    [
                        [currentX, currentY + cellHeight],
                        [currentX + cellWidth, currentY + cellHeight],
                        [currentX + cellWidth, currentY],
                        [currentX, currentY + cellHeight],
                    ],
                ], options.properties);
            }
            else if (xi % 2 === 0 && yi % 2 === 1) {
                cellTriangle1 = helpers_1.polygon([
                    [
                        [currentX, currentY],
                        [currentX + cellWidth, currentY + cellHeight],
                        [currentX + cellWidth, currentY],
                        [currentX, currentY],
                    ],
                ], options.properties);
                cellTriangle2 = helpers_1.polygon([
                    [
                        [currentX, currentY],
                        [currentX, currentY + cellHeight],
                        [currentX + cellWidth, currentY + cellHeight],
                        [currentX, currentY],
                    ],
                ], options.properties);
            }
            else if (yi % 2 === 0 && xi % 2 === 1) {
                cellTriangle1 = helpers_1.polygon([
                    [
                        [currentX, currentY],
                        [currentX, currentY + cellHeight],
                        [currentX + cellWidth, currentY + cellHeight],
                        [currentX, currentY],
                    ],
                ], options.properties);
                cellTriangle2 = helpers_1.polygon([
                    [
                        [currentX, currentY],
                        [currentX + cellWidth, currentY + cellHeight],
                        [currentX + cellWidth, currentY],
                        [currentX, currentY],
                    ],
                ], options.properties);
            }
            else if (yi % 2 === 1 && xi % 2 === 1) {
                cellTriangle1 = helpers_1.polygon([
                    [
                        [currentX, currentY],
                        [currentX, currentY + cellHeight],
                        [currentX + cellWidth, currentY],
                        [currentX, currentY],
                    ],
                ], options.properties);
                cellTriangle2 = helpers_1.polygon([
                    [
                        [currentX, currentY + cellHeight],
                        [currentX + cellWidth, currentY + cellHeight],
                        [currentX + cellWidth, currentY],
                        [currentX, currentY + cellHeight],
                    ],
                ], options.properties);
            }
            if (options.mask) {
                if (intersect_1.default(options.mask, cellTriangle1))
                    results.push(cellTriangle1);
                if (intersect_1.default(options.mask, cellTriangle2))
                    results.push(cellTriangle2);
            }
            else {
                results.push(cellTriangle1);
                results.push(cellTriangle2);
            }
            currentY += cellHeight;
            yi++;
        }
        xi++;
        currentX += cellWidth;
    }
    return helpers_1.featureCollection(results);
}
exports.default = triangleGrid;

},{"@turf/distance":11,"@turf/helpers":12,"@turf/intersect":15}],25:[function(require,module,exports){
var rbush = require('rbush');
var helpers = require('@turf/helpers');
var meta = require('@turf/meta');
var turfBBox = require('@turf/bbox').default;
var featureEach = meta.featureEach;
var coordEach = meta.coordEach;
var polygon = helpers.polygon;
var featureCollection = helpers.featureCollection;

/**
 * GeoJSON implementation of [RBush](https://github.com/mourner/rbush#rbush) spatial index.
 *
 * @name rbush
 * @param {number} [maxEntries=9] defines the maximum number of entries in a tree node. 9 (used by default) is a
 * reasonable choice for most applications. Higher value means faster insertion and slower search, and vice versa.
 * @returns {RBush} GeoJSON RBush
 * @example
 * var geojsonRbush = require('geojson-rbush').default;
 * var tree = geojsonRbush();
 */
function geojsonRbush(maxEntries) {
    var tree = rbush(maxEntries);
    /**
     * [insert](https://github.com/mourner/rbush#data-format)
     *
     * @param {Feature} feature insert single GeoJSON Feature
     * @returns {RBush} GeoJSON RBush
     * @example
     * var poly = turf.polygon([[[-78, 41], [-67, 41], [-67, 48], [-78, 48], [-78, 41]]]);
     * tree.insert(poly)
     */
    tree.insert = function (feature) {
        if (feature.type !== 'Feature') throw new Error('invalid feature');
        feature.bbox = feature.bbox ? feature.bbox : turfBBox(feature);
        return rbush.prototype.insert.call(this, feature);
    };

    /**
     * [load](https://github.com/mourner/rbush#bulk-inserting-data)
     *
     * @param {FeatureCollection|Array<Feature>} features load entire GeoJSON FeatureCollection
     * @returns {RBush} GeoJSON RBush
     * @example
     * var polys = turf.polygons([
     *     [[[-78, 41], [-67, 41], [-67, 48], [-78, 48], [-78, 41]]],
     *     [[[-93, 32], [-83, 32], [-83, 39], [-93, 39], [-93, 32]]]
     * ]);
     * tree.load(polys);
     */
    tree.load = function (features) {
        var load = [];
        // Load an Array of Features
        if (Array.isArray(features)) {
            features.forEach(function (feature) {
                if (feature.type !== 'Feature') throw new Error('invalid features');
                feature.bbox = feature.bbox ? feature.bbox : turfBBox(feature);
                load.push(feature);
            });
        } else {
            // Load a FeatureCollection
            featureEach(features, function (feature) {
                if (feature.type !== 'Feature') throw new Error('invalid features');
                feature.bbox = feature.bbox ? feature.bbox : turfBBox(feature);
                load.push(feature);
            });
        }
        return rbush.prototype.load.call(this, load);
    };

    /**
     * [remove](https://github.com/mourner/rbush#removing-data)
     *
     * @param {Feature} feature remove single GeoJSON Feature
     * @param {Function} equals Pass a custom equals function to compare by value for removal.
     * @returns {RBush} GeoJSON RBush
     * @example
     * var poly = turf.polygon([[[-78, 41], [-67, 41], [-67, 48], [-78, 48], [-78, 41]]]);
     *
     * tree.remove(poly);
     */
    tree.remove = function (feature, equals) {
        if (feature.type !== 'Feature') throw new Error('invalid feature');
        feature.bbox = feature.bbox ? feature.bbox : turfBBox(feature);
        return rbush.prototype.remove.call(this, feature, equals);
    };

    /**
     * [clear](https://github.com/mourner/rbush#removing-data)
     *
     * @returns {RBush} GeoJSON Rbush
     * @example
     * tree.clear()
     */
    tree.clear = function () {
        return rbush.prototype.clear.call(this);
    };

    /**
     * [search](https://github.com/mourner/rbush#search)
     *
     * @param {BBox|FeatureCollection|Feature} geojson search with GeoJSON
     * @returns {FeatureCollection} all features that intersects with the given GeoJSON.
     * @example
     * var poly = turf.polygon([[[-78, 41], [-67, 41], [-67, 48], [-78, 48], [-78, 41]]]);
     *
     * tree.search(poly);
     */
    tree.search = function (geojson) {
        var features = rbush.prototype.search.call(this, this.toBBox(geojson));
        return featureCollection(features);
    };

    /**
     * [collides](https://github.com/mourner/rbush#collisions)
     *
     * @param {BBox|FeatureCollection|Feature} geojson collides with GeoJSON
     * @returns {boolean} true if there are any items intersecting the given GeoJSON, otherwise false.
     * @example
     * var poly = turf.polygon([[[-78, 41], [-67, 41], [-67, 48], [-78, 48], [-78, 41]]]);
     *
     * tree.collides(poly);
     */
    tree.collides = function (geojson) {
        return rbush.prototype.collides.call(this, this.toBBox(geojson));
    };

    /**
     * [all](https://github.com/mourner/rbush#search)
     *
     * @returns {FeatureCollection} all the features in RBush
     * @example
     * tree.all()
     */
    tree.all = function () {
        var features = rbush.prototype.all.call(this);
        return featureCollection(features);
    };

    /**
     * [toJSON](https://github.com/mourner/rbush#export-and-import)
     *
     * @returns {any} export data as JSON object
     * @example
     * var exported = tree.toJSON()
     */
    tree.toJSON = function () {
        return rbush.prototype.toJSON.call(this);
    };

    /**
     * [fromJSON](https://github.com/mourner/rbush#export-and-import)
     *
     * @param {any} json import previously exported data
     * @returns {RBush} GeoJSON RBush
     * @example
     * var exported = {
     *   "children": [
     *     {
     *       "type": "Feature",
     *       "geometry": {
     *         "type": "Point",
     *         "coordinates": [110, 50]
     *       },
     *       "properties": {},
     *       "bbox": [110, 50, 110, 50]
     *     }
     *   ],
     *   "height": 1,
     *   "leaf": true,
     *   "minX": 110,
     *   "minY": 50,
     *   "maxX": 110,
     *   "maxY": 50
     * }
     * tree.fromJSON(exported)
     */
    tree.fromJSON = function (json) {
        return rbush.prototype.fromJSON.call(this, json);
    };

    /**
     * Converts GeoJSON to {minX, minY, maxX, maxY} schema
     *
     * @private
     * @param {BBox|FeatureCollection|Feature} geojson feature(s) to retrieve BBox from
     * @returns {Object} converted to {minX, minY, maxX, maxY}
     */
    tree.toBBox = function (geojson) {
        var bbox;
        if (geojson.bbox) bbox = geojson.bbox;
        else if (Array.isArray(geojson) && geojson.length === 4) bbox = geojson;
        else if (Array.isArray(geojson) && geojson.length === 6) bbox = [geojson[0], geojson[1], geojson[3], geojson[4]];
        else if (geojson.type === 'Feature') bbox = turfBBox(geojson);
        else if (geojson.type === 'FeatureCollection') bbox = turfBBox(geojson);
        else throw new Error('invalid geojson')

        return {
            minX: bbox[0],
            minY: bbox[1],
            maxX: bbox[2],
            maxY: bbox[3]
        };
    };
    return tree;
}

module.exports = geojsonRbush;
module.exports.default = geojsonRbush;

},{"@turf/bbox":2,"@turf/helpers":12,"@turf/meta":19,"rbush":28}],26:[function(require,module,exports){
(function (process){(function (){
(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.polygonClipping = factory());
}(this, (function () { 'use strict';

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  function _defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  function _createClass(Constructor, protoProps, staticProps) {
    if (protoProps) _defineProperties(Constructor.prototype, protoProps);
    if (staticProps) _defineProperties(Constructor, staticProps);
    return Constructor;
  }

  /**
   * splaytree v3.1.0
   * Fast Splay tree for Node and browser
   *
   * @author Alexander Milevski <info@w8r.name>
   * @license MIT
   * @preserve
   */
  var Node =
  /** @class */
  function () {
    function Node(key, data) {
      this.next = null;
      this.key = key;
      this.data = data;
      this.left = null;
      this.right = null;
    }

    return Node;
  }();
  /* follows "An implementation of top-down splaying"
   * by D. Sleator <sleator@cs.cmu.edu> March 1992
   */


  function DEFAULT_COMPARE(a, b) {
    return a > b ? 1 : a < b ? -1 : 0;
  }
  /**
   * Simple top down splay, not requiring i to be in the tree t.
   */


  function splay(i, t, comparator) {
    var N = new Node(null, null);
    var l = N;
    var r = N;

    while (true) {
      var cmp = comparator(i, t.key); //if (i < t.key) {

      if (cmp < 0) {
        if (t.left === null) break; //if (i < t.left.key) {

        if (comparator(i, t.left.key) < 0) {
          var y = t.left;
          /* rotate right */

          t.left = y.right;
          y.right = t;
          t = y;
          if (t.left === null) break;
        }

        r.left = t;
        /* link right */

        r = t;
        t = t.left; //} else if (i > t.key) {
      } else if (cmp > 0) {
        if (t.right === null) break; //if (i > t.right.key) {

        if (comparator(i, t.right.key) > 0) {
          var y = t.right;
          /* rotate left */

          t.right = y.left;
          y.left = t;
          t = y;
          if (t.right === null) break;
        }

        l.right = t;
        /* link left */

        l = t;
        t = t.right;
      } else break;
    }
    /* assemble */


    l.right = t.left;
    r.left = t.right;
    t.left = N.right;
    t.right = N.left;
    return t;
  }

  function insert(i, data, t, comparator) {
    var node = new Node(i, data);

    if (t === null) {
      node.left = node.right = null;
      return node;
    }

    t = splay(i, t, comparator);
    var cmp = comparator(i, t.key);

    if (cmp < 0) {
      node.left = t.left;
      node.right = t;
      t.left = null;
    } else if (cmp >= 0) {
      node.right = t.right;
      node.left = t;
      t.right = null;
    }

    return node;
  }

  function split(key, v, comparator) {
    var left = null;
    var right = null;

    if (v) {
      v = splay(key, v, comparator);
      var cmp = comparator(v.key, key);

      if (cmp === 0) {
        left = v.left;
        right = v.right;
      } else if (cmp < 0) {
        right = v.right;
        v.right = null;
        left = v;
      } else {
        left = v.left;
        v.left = null;
        right = v;
      }
    }

    return {
      left: left,
      right: right
    };
  }

  function merge(left, right, comparator) {
    if (right === null) return left;
    if (left === null) return right;
    right = splay(left.key, right, comparator);
    right.left = left;
    return right;
  }
  /**
   * Prints level of the tree
   */


  function printRow(root, prefix, isTail, out, printNode) {
    if (root) {
      out("" + prefix + (isTail ? '└── ' : '├── ') + printNode(root) + "\n");
      var indent = prefix + (isTail ? '    ' : '│   ');
      if (root.left) printRow(root.left, indent, false, out, printNode);
      if (root.right) printRow(root.right, indent, true, out, printNode);
    }
  }

  var Tree =
  /** @class */
  function () {
    function Tree(comparator) {
      if (comparator === void 0) {
        comparator = DEFAULT_COMPARE;
      }

      this._root = null;
      this._size = 0;
      this._comparator = comparator;
    }
    /**
     * Inserts a key, allows duplicates
     */


    Tree.prototype.insert = function (key, data) {
      this._size++;
      return this._root = insert(key, data, this._root, this._comparator);
    };
    /**
     * Adds a key, if it is not present in the tree
     */


    Tree.prototype.add = function (key, data) {
      var node = new Node(key, data);

      if (this._root === null) {
        node.left = node.right = null;
        this._size++;
        this._root = node;
      }

      var comparator = this._comparator;
      var t = splay(key, this._root, comparator);
      var cmp = comparator(key, t.key);
      if (cmp === 0) this._root = t;else {
        if (cmp < 0) {
          node.left = t.left;
          node.right = t;
          t.left = null;
        } else if (cmp > 0) {
          node.right = t.right;
          node.left = t;
          t.right = null;
        }

        this._size++;
        this._root = node;
      }
      return this._root;
    };
    /**
     * @param  {Key} key
     * @return {Node|null}
     */


    Tree.prototype.remove = function (key) {
      this._root = this._remove(key, this._root, this._comparator);
    };
    /**
     * Deletes i from the tree if it's there
     */


    Tree.prototype._remove = function (i, t, comparator) {
      var x;
      if (t === null) return null;
      t = splay(i, t, comparator);
      var cmp = comparator(i, t.key);

      if (cmp === 0) {
        /* found it */
        if (t.left === null) {
          x = t.right;
        } else {
          x = splay(i, t.left, comparator);
          x.right = t.right;
        }

        this._size--;
        return x;
      }

      return t;
      /* It wasn't there */
    };
    /**
     * Removes and returns the node with smallest key
     */


    Tree.prototype.pop = function () {
      var node = this._root;

      if (node) {
        while (node.left) {
          node = node.left;
        }

        this._root = splay(node.key, this._root, this._comparator);
        this._root = this._remove(node.key, this._root, this._comparator);
        return {
          key: node.key,
          data: node.data
        };
      }

      return null;
    };
    /**
     * Find without splaying
     */


    Tree.prototype.findStatic = function (key) {
      var current = this._root;
      var compare = this._comparator;

      while (current) {
        var cmp = compare(key, current.key);
        if (cmp === 0) return current;else if (cmp < 0) current = current.left;else current = current.right;
      }

      return null;
    };

    Tree.prototype.find = function (key) {
      if (this._root) {
        this._root = splay(key, this._root, this._comparator);
        if (this._comparator(key, this._root.key) !== 0) return null;
      }

      return this._root;
    };

    Tree.prototype.contains = function (key) {
      var current = this._root;
      var compare = this._comparator;

      while (current) {
        var cmp = compare(key, current.key);
        if (cmp === 0) return true;else if (cmp < 0) current = current.left;else current = current.right;
      }

      return false;
    };

    Tree.prototype.forEach = function (visitor, ctx) {
      var current = this._root;
      var Q = [];
      /* Initialize stack s */

      var done = false;

      while (!done) {
        if (current !== null) {
          Q.push(current);
          current = current.left;
        } else {
          if (Q.length !== 0) {
            current = Q.pop();
            visitor.call(ctx, current);
            current = current.right;
          } else done = true;
        }
      }

      return this;
    };
    /**
     * Walk key range from `low` to `high`. Stops if `fn` returns a value.
     */


    Tree.prototype.range = function (low, high, fn, ctx) {
      var Q = [];
      var compare = this._comparator;
      var node = this._root;
      var cmp;

      while (Q.length !== 0 || node) {
        if (node) {
          Q.push(node);
          node = node.left;
        } else {
          node = Q.pop();
          cmp = compare(node.key, high);

          if (cmp > 0) {
            break;
          } else if (compare(node.key, low) >= 0) {
            if (fn.call(ctx, node)) return this; // stop if smth is returned
          }

          node = node.right;
        }
      }

      return this;
    };
    /**
     * Returns array of keys
     */


    Tree.prototype.keys = function () {
      var keys = [];
      this.forEach(function (_a) {
        var key = _a.key;
        return keys.push(key);
      });
      return keys;
    };
    /**
     * Returns array of all the data in the nodes
     */


    Tree.prototype.values = function () {
      var values = [];
      this.forEach(function (_a) {
        var data = _a.data;
        return values.push(data);
      });
      return values;
    };

    Tree.prototype.min = function () {
      if (this._root) return this.minNode(this._root).key;
      return null;
    };

    Tree.prototype.max = function () {
      if (this._root) return this.maxNode(this._root).key;
      return null;
    };

    Tree.prototype.minNode = function (t) {
      if (t === void 0) {
        t = this._root;
      }

      if (t) while (t.left) {
        t = t.left;
      }
      return t;
    };

    Tree.prototype.maxNode = function (t) {
      if (t === void 0) {
        t = this._root;
      }

      if (t) while (t.right) {
        t = t.right;
      }
      return t;
    };
    /**
     * Returns node at given index
     */


    Tree.prototype.at = function (index) {
      var current = this._root;
      var done = false;
      var i = 0;
      var Q = [];

      while (!done) {
        if (current) {
          Q.push(current);
          current = current.left;
        } else {
          if (Q.length > 0) {
            current = Q.pop();
            if (i === index) return current;
            i++;
            current = current.right;
          } else done = true;
        }
      }

      return null;
    };

    Tree.prototype.next = function (d) {
      var root = this._root;
      var successor = null;

      if (d.right) {
        successor = d.right;

        while (successor.left) {
          successor = successor.left;
        }

        return successor;
      }

      var comparator = this._comparator;

      while (root) {
        var cmp = comparator(d.key, root.key);
        if (cmp === 0) break;else if (cmp < 0) {
          successor = root;
          root = root.left;
        } else root = root.right;
      }

      return successor;
    };

    Tree.prototype.prev = function (d) {
      var root = this._root;
      var predecessor = null;

      if (d.left !== null) {
        predecessor = d.left;

        while (predecessor.right) {
          predecessor = predecessor.right;
        }

        return predecessor;
      }

      var comparator = this._comparator;

      while (root) {
        var cmp = comparator(d.key, root.key);
        if (cmp === 0) break;else if (cmp < 0) root = root.left;else {
          predecessor = root;
          root = root.right;
        }
      }

      return predecessor;
    };

    Tree.prototype.clear = function () {
      this._root = null;
      this._size = 0;
      return this;
    };

    Tree.prototype.toList = function () {
      return toList(this._root);
    };
    /**
     * Bulk-load items. Both array have to be same size
     */


    Tree.prototype.load = function (keys, values, presort) {
      if (values === void 0) {
        values = [];
      }

      if (presort === void 0) {
        presort = false;
      }

      var size = keys.length;
      var comparator = this._comparator; // sort if needed

      if (presort) sort(keys, values, 0, size - 1, comparator);

      if (this._root === null) {
        // empty tree
        this._root = loadRecursive(keys, values, 0, size);
        this._size = size;
      } else {
        // that re-builds the whole tree from two in-order traversals
        var mergedList = mergeLists(this.toList(), createList(keys, values), comparator);
        size = this._size + size;
        this._root = sortedListToBST({
          head: mergedList
        }, 0, size);
      }

      return this;
    };

    Tree.prototype.isEmpty = function () {
      return this._root === null;
    };

    Object.defineProperty(Tree.prototype, "size", {
      get: function get() {
        return this._size;
      },
      enumerable: true,
      configurable: true
    });
    Object.defineProperty(Tree.prototype, "root", {
      get: function get() {
        return this._root;
      },
      enumerable: true,
      configurable: true
    });

    Tree.prototype.toString = function (printNode) {
      if (printNode === void 0) {
        printNode = function printNode(n) {
          return String(n.key);
        };
      }

      var out = [];
      printRow(this._root, '', true, function (v) {
        return out.push(v);
      }, printNode);
      return out.join('');
    };

    Tree.prototype.update = function (key, newKey, newData) {
      var comparator = this._comparator;

      var _a = split(key, this._root, comparator),
          left = _a.left,
          right = _a.right;

      if (comparator(key, newKey) < 0) {
        right = insert(newKey, newData, right, comparator);
      } else {
        left = insert(newKey, newData, left, comparator);
      }

      this._root = merge(left, right, comparator);
    };

    Tree.prototype.split = function (key) {
      return split(key, this._root, this._comparator);
    };

    return Tree;
  }();

  function loadRecursive(keys, values, start, end) {
    var size = end - start;

    if (size > 0) {
      var middle = start + Math.floor(size / 2);
      var key = keys[middle];
      var data = values[middle];
      var node = new Node(key, data);
      node.left = loadRecursive(keys, values, start, middle);
      node.right = loadRecursive(keys, values, middle + 1, end);
      return node;
    }

    return null;
  }

  function createList(keys, values) {
    var head = new Node(null, null);
    var p = head;

    for (var i = 0; i < keys.length; i++) {
      p = p.next = new Node(keys[i], values[i]);
    }

    p.next = null;
    return head.next;
  }

  function toList(root) {
    var current = root;
    var Q = [];
    var done = false;
    var head = new Node(null, null);
    var p = head;

    while (!done) {
      if (current) {
        Q.push(current);
        current = current.left;
      } else {
        if (Q.length > 0) {
          current = p = p.next = Q.pop();
          current = current.right;
        } else done = true;
      }
    }

    p.next = null; // that'll work even if the tree was empty

    return head.next;
  }

  function sortedListToBST(list, start, end) {
    var size = end - start;

    if (size > 0) {
      var middle = start + Math.floor(size / 2);
      var left = sortedListToBST(list, start, middle);
      var root = list.head;
      root.left = left;
      list.head = list.head.next;
      root.right = sortedListToBST(list, middle + 1, end);
      return root;
    }

    return null;
  }

  function mergeLists(l1, l2, compare) {
    var head = new Node(null, null); // dummy

    var p = head;
    var p1 = l1;
    var p2 = l2;

    while (p1 !== null && p2 !== null) {
      if (compare(p1.key, p2.key) < 0) {
        p.next = p1;
        p1 = p1.next;
      } else {
        p.next = p2;
        p2 = p2.next;
      }

      p = p.next;
    }

    if (p1 !== null) {
      p.next = p1;
    } else if (p2 !== null) {
      p.next = p2;
    }

    return head.next;
  }

  function sort(keys, values, left, right, compare) {
    if (left >= right) return;
    var pivot = keys[left + right >> 1];
    var i = left - 1;
    var j = right + 1;

    while (true) {
      do {
        i++;
      } while (compare(keys[i], pivot) < 0);

      do {
        j--;
      } while (compare(keys[j], pivot) > 0);

      if (i >= j) break;
      var tmp = keys[i];
      keys[i] = keys[j];
      keys[j] = tmp;
      tmp = values[i];
      values[i] = values[j];
      values[j] = tmp;
    }

    sort(keys, values, left, j, compare);
    sort(keys, values, j + 1, right, compare);
  }

  /**
   * A bounding box has the format:
   *
   *  { ll: { x: xmin, y: ymin }, ur: { x: xmax, y: ymax } }
   *
   */
  var isInBbox = function isInBbox(bbox, point) {
    return bbox.ll.x <= point.x && point.x <= bbox.ur.x && bbox.ll.y <= point.y && point.y <= bbox.ur.y;
  };
  /* Returns either null, or a bbox (aka an ordered pair of points)
   * If there is only one point of overlap, a bbox with identical points
   * will be returned */

  var getBboxOverlap = function getBboxOverlap(b1, b2) {
    // check if the bboxes overlap at all
    if (b2.ur.x < b1.ll.x || b1.ur.x < b2.ll.x || b2.ur.y < b1.ll.y || b1.ur.y < b2.ll.y) return null; // find the middle two X values

    var lowerX = b1.ll.x < b2.ll.x ? b2.ll.x : b1.ll.x;
    var upperX = b1.ur.x < b2.ur.x ? b1.ur.x : b2.ur.x; // find the middle two Y values

    var lowerY = b1.ll.y < b2.ll.y ? b2.ll.y : b1.ll.y;
    var upperY = b1.ur.y < b2.ur.y ? b1.ur.y : b2.ur.y; // put those middle values together to get the overlap

    return {
      ll: {
        x: lowerX,
        y: lowerY
      },
      ur: {
        x: upperX,
        y: upperY
      }
    };
  };

  /* Javascript doesn't do integer math. Everything is
   * floating point with percision Number.EPSILON.
   *
   * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/EPSILON
   */
  var epsilon = Number.EPSILON; // IE Polyfill

  if (epsilon === undefined) epsilon = Math.pow(2, -52);
  var EPSILON_SQ = epsilon * epsilon;
  /* FLP comparator */

  var cmp = function cmp(a, b) {
    // check if they're both 0
    if (-epsilon < a && a < epsilon) {
      if (-epsilon < b && b < epsilon) {
        return 0;
      }
    } // check if they're flp equal


    var ab = a - b;

    if (ab * ab < EPSILON_SQ * a * b) {
      return 0;
    } // normal comparison


    return a < b ? -1 : 1;
  };

  /**
   * This class rounds incoming values sufficiently so that
   * floating points problems are, for the most part, avoided.
   *
   * Incoming points are have their x & y values tested against
   * all previously seen x & y values. If either is 'too close'
   * to a previously seen value, it's value is 'snapped' to the
   * previously seen value.
   *
   * All points should be rounded by this class before being
   * stored in any data structures in the rest of this algorithm.
   */

  var PtRounder = /*#__PURE__*/function () {
    function PtRounder() {
      _classCallCheck(this, PtRounder);

      this.reset();
    }

    _createClass(PtRounder, [{
      key: "reset",
      value: function reset() {
        this.xRounder = new CoordRounder();
        this.yRounder = new CoordRounder();
      }
    }, {
      key: "round",
      value: function round(x, y) {
        return {
          x: this.xRounder.round(x),
          y: this.yRounder.round(y)
        };
      }
    }]);

    return PtRounder;
  }();

  var CoordRounder = /*#__PURE__*/function () {
    function CoordRounder() {
      _classCallCheck(this, CoordRounder);

      this.tree = new Tree(); // preseed with 0 so we don't end up with values < Number.EPSILON

      this.round(0);
    } // Note: this can rounds input values backwards or forwards.
    //       You might ask, why not restrict this to just rounding
    //       forwards? Wouldn't that allow left endpoints to always
    //       remain left endpoints during splitting (never change to
    //       right). No - it wouldn't, because we snap intersections
    //       to endpoints (to establish independence from the segment
    //       angle for t-intersections).


    _createClass(CoordRounder, [{
      key: "round",
      value: function round(coord) {
        var node = this.tree.add(coord);
        var prevNode = this.tree.prev(node);

        if (prevNode !== null && cmp(node.key, prevNode.key) === 0) {
          this.tree.remove(coord);
          return prevNode.key;
        }

        var nextNode = this.tree.next(node);

        if (nextNode !== null && cmp(node.key, nextNode.key) === 0) {
          this.tree.remove(coord);
          return nextNode.key;
        }

        return coord;
      }
    }]);

    return CoordRounder;
  }(); // singleton available by import


  var rounder = new PtRounder();

  /* Cross Product of two vectors with first point at origin */

  var crossProduct = function crossProduct(a, b) {
    return a.x * b.y - a.y * b.x;
  };
  /* Dot Product of two vectors with first point at origin */

  var dotProduct = function dotProduct(a, b) {
    return a.x * b.x + a.y * b.y;
  };
  /* Comparator for two vectors with same starting point */

  var compareVectorAngles = function compareVectorAngles(basePt, endPt1, endPt2) {
    var v1 = {
      x: endPt1.x - basePt.x,
      y: endPt1.y - basePt.y
    };
    var v2 = {
      x: endPt2.x - basePt.x,
      y: endPt2.y - basePt.y
    };
    var kross = crossProduct(v1, v2);
    return cmp(kross, 0);
  };
  var length = function length(v) {
    return Math.sqrt(dotProduct(v, v));
  };
  /* Get the sine of the angle from pShared -> pAngle to pShaed -> pBase */

  var sineOfAngle = function sineOfAngle(pShared, pBase, pAngle) {
    var vBase = {
      x: pBase.x - pShared.x,
      y: pBase.y - pShared.y
    };
    var vAngle = {
      x: pAngle.x - pShared.x,
      y: pAngle.y - pShared.y
    };
    return crossProduct(vAngle, vBase) / length(vAngle) / length(vBase);
  };
  /* Get the cosine of the angle from pShared -> pAngle to pShaed -> pBase */

  var cosineOfAngle = function cosineOfAngle(pShared, pBase, pAngle) {
    var vBase = {
      x: pBase.x - pShared.x,
      y: pBase.y - pShared.y
    };
    var vAngle = {
      x: pAngle.x - pShared.x,
      y: pAngle.y - pShared.y
    };
    return dotProduct(vAngle, vBase) / length(vAngle) / length(vBase);
  };
  /* Get the x coordinate where the given line (defined by a point and vector)
   * crosses the horizontal line with the given y coordiante.
   * In the case of parrallel lines (including overlapping ones) returns null. */

  var horizontalIntersection = function horizontalIntersection(pt, v, y) {
    if (v.y === 0) return null;
    return {
      x: pt.x + v.x / v.y * (y - pt.y),
      y: y
    };
  };
  /* Get the y coordinate where the given line (defined by a point and vector)
   * crosses the vertical line with the given x coordiante.
   * In the case of parrallel lines (including overlapping ones) returns null. */

  var verticalIntersection = function verticalIntersection(pt, v, x) {
    if (v.x === 0) return null;
    return {
      x: x,
      y: pt.y + v.y / v.x * (x - pt.x)
    };
  };
  /* Get the intersection of two lines, each defined by a base point and a vector.
   * In the case of parrallel lines (including overlapping ones) returns null. */

  var intersection = function intersection(pt1, v1, pt2, v2) {
    // take some shortcuts for vertical and horizontal lines
    // this also ensures we don't calculate an intersection and then discover
    // it's actually outside the bounding box of the line
    if (v1.x === 0) return verticalIntersection(pt2, v2, pt1.x);
    if (v2.x === 0) return verticalIntersection(pt1, v1, pt2.x);
    if (v1.y === 0) return horizontalIntersection(pt2, v2, pt1.y);
    if (v2.y === 0) return horizontalIntersection(pt1, v1, pt2.y); // General case for non-overlapping segments.
    // This algorithm is based on Schneider and Eberly.
    // http://www.cimec.org.ar/~ncalvo/Schneider_Eberly.pdf - pg 244

    var kross = crossProduct(v1, v2);
    if (kross == 0) return null;
    var ve = {
      x: pt2.x - pt1.x,
      y: pt2.y - pt1.y
    };
    var d1 = crossProduct(ve, v1) / kross;
    var d2 = crossProduct(ve, v2) / kross; // take the average of the two calculations to minimize rounding error

    var x1 = pt1.x + d2 * v1.x,
        x2 = pt2.x + d1 * v2.x;
    var y1 = pt1.y + d2 * v1.y,
        y2 = pt2.y + d1 * v2.y;
    var x = (x1 + x2) / 2;
    var y = (y1 + y2) / 2;
    return {
      x: x,
      y: y
    };
  };

  var SweepEvent = /*#__PURE__*/function () {
    _createClass(SweepEvent, null, [{
      key: "compare",
      // for ordering sweep events in the sweep event queue
      value: function compare(a, b) {
        // favor event with a point that the sweep line hits first
        var ptCmp = SweepEvent.comparePoints(a.point, b.point);
        if (ptCmp !== 0) return ptCmp; // the points are the same, so link them if needed

        if (a.point !== b.point) a.link(b); // favor right events over left

        if (a.isLeft !== b.isLeft) return a.isLeft ? 1 : -1; // we have two matching left or right endpoints
        // ordering of this case is the same as for their segments

        return Segment.compare(a.segment, b.segment);
      } // for ordering points in sweep line order

    }, {
      key: "comparePoints",
      value: function comparePoints(aPt, bPt) {
        if (aPt.x < bPt.x) return -1;
        if (aPt.x > bPt.x) return 1;
        if (aPt.y < bPt.y) return -1;
        if (aPt.y > bPt.y) return 1;
        return 0;
      } // Warning: 'point' input will be modified and re-used (for performance)

    }]);

    function SweepEvent(point, isLeft) {
      _classCallCheck(this, SweepEvent);

      if (point.events === undefined) point.events = [this];else point.events.push(this);
      this.point = point;
      this.isLeft = isLeft; // this.segment, this.otherSE set by factory
    }

    _createClass(SweepEvent, [{
      key: "link",
      value: function link(other) {
        if (other.point === this.point) {
          throw new Error('Tried to link already linked events');
        }

        var otherEvents = other.point.events;

        for (var i = 0, iMax = otherEvents.length; i < iMax; i++) {
          var evt = otherEvents[i];
          this.point.events.push(evt);
          evt.point = this.point;
        }

        this.checkForConsuming();
      }
      /* Do a pass over our linked events and check to see if any pair
       * of segments match, and should be consumed. */

    }, {
      key: "checkForConsuming",
      value: function checkForConsuming() {
        // FIXME: The loops in this method run O(n^2) => no good.
        //        Maintain little ordered sweep event trees?
        //        Can we maintaining an ordering that avoids the need
        //        for the re-sorting with getLeftmostComparator in geom-out?
        // Compare each pair of events to see if other events also match
        var numEvents = this.point.events.length;

        for (var i = 0; i < numEvents; i++) {
          var evt1 = this.point.events[i];
          if (evt1.segment.consumedBy !== undefined) continue;

          for (var j = i + 1; j < numEvents; j++) {
            var evt2 = this.point.events[j];
            if (evt2.consumedBy !== undefined) continue;
            if (evt1.otherSE.point.events !== evt2.otherSE.point.events) continue;
            evt1.segment.consume(evt2.segment);
          }
        }
      }
    }, {
      key: "getAvailableLinkedEvents",
      value: function getAvailableLinkedEvents() {
        // point.events is always of length 2 or greater
        var events = [];

        for (var i = 0, iMax = this.point.events.length; i < iMax; i++) {
          var evt = this.point.events[i];

          if (evt !== this && !evt.segment.ringOut && evt.segment.isInResult()) {
            events.push(evt);
          }
        }

        return events;
      }
      /**
       * Returns a comparator function for sorting linked events that will
       * favor the event that will give us the smallest left-side angle.
       * All ring construction starts as low as possible heading to the right,
       * so by always turning left as sharp as possible we'll get polygons
       * without uncessary loops & holes.
       *
       * The comparator function has a compute cache such that it avoids
       * re-computing already-computed values.
       */

    }, {
      key: "getLeftmostComparator",
      value: function getLeftmostComparator(baseEvent) {
        var _this = this;

        var cache = new Map();

        var fillCache = function fillCache(linkedEvent) {
          var nextEvent = linkedEvent.otherSE;
          cache.set(linkedEvent, {
            sine: sineOfAngle(_this.point, baseEvent.point, nextEvent.point),
            cosine: cosineOfAngle(_this.point, baseEvent.point, nextEvent.point)
          });
        };

        return function (a, b) {
          if (!cache.has(a)) fillCache(a);
          if (!cache.has(b)) fillCache(b);

          var _cache$get = cache.get(a),
              asine = _cache$get.sine,
              acosine = _cache$get.cosine;

          var _cache$get2 = cache.get(b),
              bsine = _cache$get2.sine,
              bcosine = _cache$get2.cosine; // both on or above x-axis


          if (asine >= 0 && bsine >= 0) {
            if (acosine < bcosine) return 1;
            if (acosine > bcosine) return -1;
            return 0;
          } // both below x-axis


          if (asine < 0 && bsine < 0) {
            if (acosine < bcosine) return -1;
            if (acosine > bcosine) return 1;
            return 0;
          } // one above x-axis, one below


          if (bsine < asine) return -1;
          if (bsine > asine) return 1;
          return 0;
        };
      }
    }]);

    return SweepEvent;
  }();

  // segments and sweep events when all else is identical

  var segmentId = 0;

  var Segment = /*#__PURE__*/function () {
    _createClass(Segment, null, [{
      key: "compare",

      /* This compare() function is for ordering segments in the sweep
       * line tree, and does so according to the following criteria:
       *
       * Consider the vertical line that lies an infinestimal step to the
       * right of the right-more of the two left endpoints of the input
       * segments. Imagine slowly moving a point up from negative infinity
       * in the increasing y direction. Which of the two segments will that
       * point intersect first? That segment comes 'before' the other one.
       *
       * If neither segment would be intersected by such a line, (if one
       * or more of the segments are vertical) then the line to be considered
       * is directly on the right-more of the two left inputs.
       */
      value: function compare(a, b) {
        var alx = a.leftSE.point.x;
        var blx = b.leftSE.point.x;
        var arx = a.rightSE.point.x;
        var brx = b.rightSE.point.x; // check if they're even in the same vertical plane

        if (brx < alx) return 1;
        if (arx < blx) return -1;
        var aly = a.leftSE.point.y;
        var bly = b.leftSE.point.y;
        var ary = a.rightSE.point.y;
        var bry = b.rightSE.point.y; // is left endpoint of segment B the right-more?

        if (alx < blx) {
          // are the two segments in the same horizontal plane?
          if (bly < aly && bly < ary) return 1;
          if (bly > aly && bly > ary) return -1; // is the B left endpoint colinear to segment A?

          var aCmpBLeft = a.comparePoint(b.leftSE.point);
          if (aCmpBLeft < 0) return 1;
          if (aCmpBLeft > 0) return -1; // is the A right endpoint colinear to segment B ?

          var bCmpARight = b.comparePoint(a.rightSE.point);
          if (bCmpARight !== 0) return bCmpARight; // colinear segments, consider the one with left-more
          // left endpoint to be first (arbitrary?)

          return -1;
        } // is left endpoint of segment A the right-more?


        if (alx > blx) {
          if (aly < bly && aly < bry) return -1;
          if (aly > bly && aly > bry) return 1; // is the A left endpoint colinear to segment B?

          var bCmpALeft = b.comparePoint(a.leftSE.point);
          if (bCmpALeft !== 0) return bCmpALeft; // is the B right endpoint colinear to segment A?

          var aCmpBRight = a.comparePoint(b.rightSE.point);
          if (aCmpBRight < 0) return 1;
          if (aCmpBRight > 0) return -1; // colinear segments, consider the one with left-more
          // left endpoint to be first (arbitrary?)

          return 1;
        } // if we get here, the two left endpoints are in the same
        // vertical plane, ie alx === blx
        // consider the lower left-endpoint to come first


        if (aly < bly) return -1;
        if (aly > bly) return 1; // left endpoints are identical
        // check for colinearity by using the left-more right endpoint
        // is the A right endpoint more left-more?

        if (arx < brx) {
          var _bCmpARight = b.comparePoint(a.rightSE.point);

          if (_bCmpARight !== 0) return _bCmpARight;
        } // is the B right endpoint more left-more?


        if (arx > brx) {
          var _aCmpBRight = a.comparePoint(b.rightSE.point);

          if (_aCmpBRight < 0) return 1;
          if (_aCmpBRight > 0) return -1;
        }

        if (arx !== brx) {
          // are these two [almost] vertical segments with opposite orientation?
          // if so, the one with the lower right endpoint comes first
          var ay = ary - aly;
          var ax = arx - alx;
          var by = bry - bly;
          var bx = brx - blx;
          if (ay > ax && by < bx) return 1;
          if (ay < ax && by > bx) return -1;
        } // we have colinear segments with matching orientation
        // consider the one with more left-more right endpoint to be first


        if (arx > brx) return 1;
        if (arx < brx) return -1; // if we get here, two two right endpoints are in the same
        // vertical plane, ie arx === brx
        // consider the lower right-endpoint to come first

        if (ary < bry) return -1;
        if (ary > bry) return 1; // right endpoints identical as well, so the segments are idential
        // fall back on creation order as consistent tie-breaker

        if (a.id < b.id) return -1;
        if (a.id > b.id) return 1; // identical segment, ie a === b

        return 0;
      }
      /* Warning: a reference to ringWindings input will be stored,
       *  and possibly will be later modified */

    }]);

    function Segment(leftSE, rightSE, rings, windings) {
      _classCallCheck(this, Segment);

      this.id = ++segmentId;
      this.leftSE = leftSE;
      leftSE.segment = this;
      leftSE.otherSE = rightSE;
      this.rightSE = rightSE;
      rightSE.segment = this;
      rightSE.otherSE = leftSE;
      this.rings = rings;
      this.windings = windings; // left unset for performance, set later in algorithm
      // this.ringOut, this.consumedBy, this.prev
    }

    _createClass(Segment, [{
      key: "replaceRightSE",

      /* When a segment is split, the rightSE is replaced with a new sweep event */
      value: function replaceRightSE(newRightSE) {
        this.rightSE = newRightSE;
        this.rightSE.segment = this;
        this.rightSE.otherSE = this.leftSE;
        this.leftSE.otherSE = this.rightSE;
      }
    }, {
      key: "bbox",
      value: function bbox() {
        var y1 = this.leftSE.point.y;
        var y2 = this.rightSE.point.y;
        return {
          ll: {
            x: this.leftSE.point.x,
            y: y1 < y2 ? y1 : y2
          },
          ur: {
            x: this.rightSE.point.x,
            y: y1 > y2 ? y1 : y2
          }
        };
      }
      /* A vector from the left point to the right */

    }, {
      key: "vector",
      value: function vector() {
        return {
          x: this.rightSE.point.x - this.leftSE.point.x,
          y: this.rightSE.point.y - this.leftSE.point.y
        };
      }
    }, {
      key: "isAnEndpoint",
      value: function isAnEndpoint(pt) {
        return pt.x === this.leftSE.point.x && pt.y === this.leftSE.point.y || pt.x === this.rightSE.point.x && pt.y === this.rightSE.point.y;
      }
      /* Compare this segment with a point.
       *
       * A point P is considered to be colinear to a segment if there
       * exists a distance D such that if we travel along the segment
       * from one * endpoint towards the other a distance D, we find
       * ourselves at point P.
       *
       * Return value indicates:
       *
       *   1: point lies above the segment (to the left of vertical)
       *   0: point is colinear to segment
       *  -1: point lies below the segment (to the right of vertical)
       */

    }, {
      key: "comparePoint",
      value: function comparePoint(point) {
        if (this.isAnEndpoint(point)) return 0;
        var lPt = this.leftSE.point;
        var rPt = this.rightSE.point;
        var v = this.vector(); // Exactly vertical segments.

        if (lPt.x === rPt.x) {
          if (point.x === lPt.x) return 0;
          return point.x < lPt.x ? 1 : -1;
        } // Nearly vertical segments with an intersection.
        // Check to see where a point on the line with matching Y coordinate is.


        var yDist = (point.y - lPt.y) / v.y;
        var xFromYDist = lPt.x + yDist * v.x;
        if (point.x === xFromYDist) return 0; // General case.
        // Check to see where a point on the line with matching X coordinate is.

        var xDist = (point.x - lPt.x) / v.x;
        var yFromXDist = lPt.y + xDist * v.y;
        if (point.y === yFromXDist) return 0;
        return point.y < yFromXDist ? -1 : 1;
      }
      /**
       * Given another segment, returns the first non-trivial intersection
       * between the two segments (in terms of sweep line ordering), if it exists.
       *
       * A 'non-trivial' intersection is one that will cause one or both of the
       * segments to be split(). As such, 'trivial' vs. 'non-trivial' intersection:
       *
       *   * endpoint of segA with endpoint of segB --> trivial
       *   * endpoint of segA with point along segB --> non-trivial
       *   * endpoint of segB with point along segA --> non-trivial
       *   * point along segA with point along segB --> non-trivial
       *
       * If no non-trivial intersection exists, return null
       * Else, return null.
       */

    }, {
      key: "getIntersection",
      value: function getIntersection(other) {
        // If bboxes don't overlap, there can't be any intersections
        var tBbox = this.bbox();
        var oBbox = other.bbox();
        var bboxOverlap = getBboxOverlap(tBbox, oBbox);
        if (bboxOverlap === null) return null; // We first check to see if the endpoints can be considered intersections.
        // This will 'snap' intersections to endpoints if possible, and will
        // handle cases of colinearity.

        var tlp = this.leftSE.point;
        var trp = this.rightSE.point;
        var olp = other.leftSE.point;
        var orp = other.rightSE.point; // does each endpoint touch the other segment?
        // note that we restrict the 'touching' definition to only allow segments
        // to touch endpoints that lie forward from where we are in the sweep line pass

        var touchesOtherLSE = isInBbox(tBbox, olp) && this.comparePoint(olp) === 0;
        var touchesThisLSE = isInBbox(oBbox, tlp) && other.comparePoint(tlp) === 0;
        var touchesOtherRSE = isInBbox(tBbox, orp) && this.comparePoint(orp) === 0;
        var touchesThisRSE = isInBbox(oBbox, trp) && other.comparePoint(trp) === 0; // do left endpoints match?

        if (touchesThisLSE && touchesOtherLSE) {
          // these two cases are for colinear segments with matching left
          // endpoints, and one segment being longer than the other
          if (touchesThisRSE && !touchesOtherRSE) return trp;
          if (!touchesThisRSE && touchesOtherRSE) return orp; // either the two segments match exactly (two trival intersections)
          // or just on their left endpoint (one trivial intersection

          return null;
        } // does this left endpoint matches (other doesn't)


        if (touchesThisLSE) {
          // check for segments that just intersect on opposing endpoints
          if (touchesOtherRSE) {
            if (tlp.x === orp.x && tlp.y === orp.y) return null;
          } // t-intersection on left endpoint


          return tlp;
        } // does other left endpoint matches (this doesn't)


        if (touchesOtherLSE) {
          // check for segments that just intersect on opposing endpoints
          if (touchesThisRSE) {
            if (trp.x === olp.x && trp.y === olp.y) return null;
          } // t-intersection on left endpoint


          return olp;
        } // trivial intersection on right endpoints


        if (touchesThisRSE && touchesOtherRSE) return null; // t-intersections on just one right endpoint

        if (touchesThisRSE) return trp;
        if (touchesOtherRSE) return orp; // None of our endpoints intersect. Look for a general intersection between
        // infinite lines laid over the segments

        var pt = intersection(tlp, this.vector(), olp, other.vector()); // are the segments parrallel? Note that if they were colinear with overlap,
        // they would have an endpoint intersection and that case was already handled above

        if (pt === null) return null; // is the intersection found between the lines not on the segments?

        if (!isInBbox(bboxOverlap, pt)) return null; // round the the computed point if needed

        return rounder.round(pt.x, pt.y);
      }
      /**
       * Split the given segment into multiple segments on the given points.
       *  * Each existing segment will retain its leftSE and a new rightSE will be
       *    generated for it.
       *  * A new segment will be generated which will adopt the original segment's
       *    rightSE, and a new leftSE will be generated for it.
       *  * If there are more than two points given to split on, new segments
       *    in the middle will be generated with new leftSE and rightSE's.
       *  * An array of the newly generated SweepEvents will be returned.
       *
       * Warning: input array of points is modified
       */

    }, {
      key: "split",
      value: function split(point) {
        var newEvents = [];
        var alreadyLinked = point.events !== undefined;
        var newLeftSE = new SweepEvent(point, true);
        var newRightSE = new SweepEvent(point, false);
        var oldRightSE = this.rightSE;
        this.replaceRightSE(newRightSE);
        newEvents.push(newRightSE);
        newEvents.push(newLeftSE);
        var newSeg = new Segment(newLeftSE, oldRightSE, this.rings.slice(), this.windings.slice()); // when splitting a nearly vertical downward-facing segment,
        // sometimes one of the resulting new segments is vertical, in which
        // case its left and right events may need to be swapped

        if (SweepEvent.comparePoints(newSeg.leftSE.point, newSeg.rightSE.point) > 0) {
          newSeg.swapEvents();
        }

        if (SweepEvent.comparePoints(this.leftSE.point, this.rightSE.point) > 0) {
          this.swapEvents();
        } // in the point we just used to create new sweep events with was already
        // linked to other events, we need to check if either of the affected
        // segments should be consumed


        if (alreadyLinked) {
          newLeftSE.checkForConsuming();
          newRightSE.checkForConsuming();
        }

        return newEvents;
      }
      /* Swap which event is left and right */

    }, {
      key: "swapEvents",
      value: function swapEvents() {
        var tmpEvt = this.rightSE;
        this.rightSE = this.leftSE;
        this.leftSE = tmpEvt;
        this.leftSE.isLeft = true;
        this.rightSE.isLeft = false;

        for (var i = 0, iMax = this.windings.length; i < iMax; i++) {
          this.windings[i] *= -1;
        }
      }
      /* Consume another segment. We take their rings under our wing
       * and mark them as consumed. Use for perfectly overlapping segments */

    }, {
      key: "consume",
      value: function consume(other) {
        var consumer = this;
        var consumee = other;

        while (consumer.consumedBy) {
          consumer = consumer.consumedBy;
        }

        while (consumee.consumedBy) {
          consumee = consumee.consumedBy;
        }

        var cmp = Segment.compare(consumer, consumee);
        if (cmp === 0) return; // already consumed
        // the winner of the consumption is the earlier segment
        // according to sweep line ordering

        if (cmp > 0) {
          var tmp = consumer;
          consumer = consumee;
          consumee = tmp;
        } // make sure a segment doesn't consume it's prev


        if (consumer.prev === consumee) {
          var _tmp = consumer;
          consumer = consumee;
          consumee = _tmp;
        }

        for (var i = 0, iMax = consumee.rings.length; i < iMax; i++) {
          var ring = consumee.rings[i];
          var winding = consumee.windings[i];
          var index = consumer.rings.indexOf(ring);

          if (index === -1) {
            consumer.rings.push(ring);
            consumer.windings.push(winding);
          } else consumer.windings[index] += winding;
        }

        consumee.rings = null;
        consumee.windings = null;
        consumee.consumedBy = consumer; // mark sweep events consumed as to maintain ordering in sweep event queue

        consumee.leftSE.consumedBy = consumer.leftSE;
        consumee.rightSE.consumedBy = consumer.rightSE;
      }
      /* The first segment previous segment chain that is in the result */

    }, {
      key: "prevInResult",
      value: function prevInResult() {
        if (this._prevInResult !== undefined) return this._prevInResult;
        if (!this.prev) this._prevInResult = null;else if (this.prev.isInResult()) this._prevInResult = this.prev;else this._prevInResult = this.prev.prevInResult();
        return this._prevInResult;
      }
    }, {
      key: "beforeState",
      value: function beforeState() {
        if (this._beforeState !== undefined) return this._beforeState;
        if (!this.prev) this._beforeState = {
          rings: [],
          windings: [],
          multiPolys: []
        };else {
          var seg = this.prev.consumedBy || this.prev;
          this._beforeState = seg.afterState();
        }
        return this._beforeState;
      }
    }, {
      key: "afterState",
      value: function afterState() {
        if (this._afterState !== undefined) return this._afterState;
        var beforeState = this.beforeState();
        this._afterState = {
          rings: beforeState.rings.slice(0),
          windings: beforeState.windings.slice(0),
          multiPolys: []
        };
        var ringsAfter = this._afterState.rings;
        var windingsAfter = this._afterState.windings;
        var mpsAfter = this._afterState.multiPolys; // calculate ringsAfter, windingsAfter

        for (var i = 0, iMax = this.rings.length; i < iMax; i++) {
          var ring = this.rings[i];
          var winding = this.windings[i];
          var index = ringsAfter.indexOf(ring);

          if (index === -1) {
            ringsAfter.push(ring);
            windingsAfter.push(winding);
          } else windingsAfter[index] += winding;
        } // calcualte polysAfter


        var polysAfter = [];
        var polysExclude = [];

        for (var _i = 0, _iMax = ringsAfter.length; _i < _iMax; _i++) {
          if (windingsAfter[_i] === 0) continue; // non-zero rule

          var _ring = ringsAfter[_i];
          var poly = _ring.poly;
          if (polysExclude.indexOf(poly) !== -1) continue;
          if (_ring.isExterior) polysAfter.push(poly);else {
            if (polysExclude.indexOf(poly) === -1) polysExclude.push(poly);

            var _index = polysAfter.indexOf(_ring.poly);

            if (_index !== -1) polysAfter.splice(_index, 1);
          }
        } // calculate multiPolysAfter


        for (var _i2 = 0, _iMax2 = polysAfter.length; _i2 < _iMax2; _i2++) {
          var mp = polysAfter[_i2].multiPoly;
          if (mpsAfter.indexOf(mp) === -1) mpsAfter.push(mp);
        }

        return this._afterState;
      }
      /* Is this segment part of the final result? */

    }, {
      key: "isInResult",
      value: function isInResult() {
        // if we've been consumed, we're not in the result
        if (this.consumedBy) return false;
        if (this._isInResult !== undefined) return this._isInResult;
        var mpsBefore = this.beforeState().multiPolys;
        var mpsAfter = this.afterState().multiPolys;

        switch (operation.type) {
          case 'union':
            {
              // UNION - included iff:
              //  * On one side of us there is 0 poly interiors AND
              //  * On the other side there is 1 or more.
              var noBefores = mpsBefore.length === 0;
              var noAfters = mpsAfter.length === 0;
              this._isInResult = noBefores !== noAfters;
              break;
            }

          case 'intersection':
            {
              // INTERSECTION - included iff:
              //  * on one side of us all multipolys are rep. with poly interiors AND
              //  * on the other side of us, not all multipolys are repsented
              //    with poly interiors
              var least;
              var most;

              if (mpsBefore.length < mpsAfter.length) {
                least = mpsBefore.length;
                most = mpsAfter.length;
              } else {
                least = mpsAfter.length;
                most = mpsBefore.length;
              }

              this._isInResult = most === operation.numMultiPolys && least < most;
              break;
            }

          case 'xor':
            {
              // XOR - included iff:
              //  * the difference between the number of multipolys represented
              //    with poly interiors on our two sides is an odd number
              var diff = Math.abs(mpsBefore.length - mpsAfter.length);
              this._isInResult = diff % 2 === 1;
              break;
            }

          case 'difference':
            {
              // DIFFERENCE included iff:
              //  * on exactly one side, we have just the subject
              var isJustSubject = function isJustSubject(mps) {
                return mps.length === 1 && mps[0].isSubject;
              };

              this._isInResult = isJustSubject(mpsBefore) !== isJustSubject(mpsAfter);
              break;
            }

          default:
            throw new Error("Unrecognized operation type found ".concat(operation.type));
        }

        return this._isInResult;
      }
    }], [{
      key: "fromRing",
      value: function fromRing(pt1, pt2, ring) {
        var leftPt, rightPt, winding; // ordering the two points according to sweep line ordering

        var cmpPts = SweepEvent.comparePoints(pt1, pt2);

        if (cmpPts < 0) {
          leftPt = pt1;
          rightPt = pt2;
          winding = 1;
        } else if (cmpPts > 0) {
          leftPt = pt2;
          rightPt = pt1;
          winding = -1;
        } else throw new Error("Tried to create degenerate segment at [".concat(pt1.x, ", ").concat(pt1.y, "]"));

        var leftSE = new SweepEvent(leftPt, true);
        var rightSE = new SweepEvent(rightPt, false);
        return new Segment(leftSE, rightSE, [ring], [winding]);
      }
    }]);

    return Segment;
  }();

  var RingIn = /*#__PURE__*/function () {
    function RingIn(geomRing, poly, isExterior) {
      _classCallCheck(this, RingIn);

      if (!Array.isArray(geomRing) || geomRing.length === 0) {
        throw new Error('Input geometry is not a valid Polygon or MultiPolygon');
      }

      this.poly = poly;
      this.isExterior = isExterior;
      this.segments = [];

      if (typeof geomRing[0][0] !== 'number' || typeof geomRing[0][1] !== 'number') {
        throw new Error('Input geometry is not a valid Polygon or MultiPolygon');
      }

      var firstPoint = rounder.round(geomRing[0][0], geomRing[0][1]);
      this.bbox = {
        ll: {
          x: firstPoint.x,
          y: firstPoint.y
        },
        ur: {
          x: firstPoint.x,
          y: firstPoint.y
        }
      };
      var prevPoint = firstPoint;

      for (var i = 1, iMax = geomRing.length; i < iMax; i++) {
        if (typeof geomRing[i][0] !== 'number' || typeof geomRing[i][1] !== 'number') {
          throw new Error('Input geometry is not a valid Polygon or MultiPolygon');
        }

        var point = rounder.round(geomRing[i][0], geomRing[i][1]); // skip repeated points

        if (point.x === prevPoint.x && point.y === prevPoint.y) continue;
        this.segments.push(Segment.fromRing(prevPoint, point, this));
        if (point.x < this.bbox.ll.x) this.bbox.ll.x = point.x;
        if (point.y < this.bbox.ll.y) this.bbox.ll.y = point.y;
        if (point.x > this.bbox.ur.x) this.bbox.ur.x = point.x;
        if (point.y > this.bbox.ur.y) this.bbox.ur.y = point.y;
        prevPoint = point;
      } // add segment from last to first if last is not the same as first


      if (firstPoint.x !== prevPoint.x || firstPoint.y !== prevPoint.y) {
        this.segments.push(Segment.fromRing(prevPoint, firstPoint, this));
      }
    }

    _createClass(RingIn, [{
      key: "getSweepEvents",
      value: function getSweepEvents() {
        var sweepEvents = [];

        for (var i = 0, iMax = this.segments.length; i < iMax; i++) {
          var segment = this.segments[i];
          sweepEvents.push(segment.leftSE);
          sweepEvents.push(segment.rightSE);
        }

        return sweepEvents;
      }
    }]);

    return RingIn;
  }();
  var PolyIn = /*#__PURE__*/function () {
    function PolyIn(geomPoly, multiPoly) {
      _classCallCheck(this, PolyIn);

      if (!Array.isArray(geomPoly)) {
        throw new Error('Input geometry is not a valid Polygon or MultiPolygon');
      }

      this.exteriorRing = new RingIn(geomPoly[0], this, true); // copy by value

      this.bbox = {
        ll: {
          x: this.exteriorRing.bbox.ll.x,
          y: this.exteriorRing.bbox.ll.y
        },
        ur: {
          x: this.exteriorRing.bbox.ur.x,
          y: this.exteriorRing.bbox.ur.y
        }
      };
      this.interiorRings = [];

      for (var i = 1, iMax = geomPoly.length; i < iMax; i++) {
        var ring = new RingIn(geomPoly[i], this, false);
        if (ring.bbox.ll.x < this.bbox.ll.x) this.bbox.ll.x = ring.bbox.ll.x;
        if (ring.bbox.ll.y < this.bbox.ll.y) this.bbox.ll.y = ring.bbox.ll.y;
        if (ring.bbox.ur.x > this.bbox.ur.x) this.bbox.ur.x = ring.bbox.ur.x;
        if (ring.bbox.ur.y > this.bbox.ur.y) this.bbox.ur.y = ring.bbox.ur.y;
        this.interiorRings.push(ring);
      }

      this.multiPoly = multiPoly;
    }

    _createClass(PolyIn, [{
      key: "getSweepEvents",
      value: function getSweepEvents() {
        var sweepEvents = this.exteriorRing.getSweepEvents();

        for (var i = 0, iMax = this.interiorRings.length; i < iMax; i++) {
          var ringSweepEvents = this.interiorRings[i].getSweepEvents();

          for (var j = 0, jMax = ringSweepEvents.length; j < jMax; j++) {
            sweepEvents.push(ringSweepEvents[j]);
          }
        }

        return sweepEvents;
      }
    }]);

    return PolyIn;
  }();
  var MultiPolyIn = /*#__PURE__*/function () {
    function MultiPolyIn(geom, isSubject) {
      _classCallCheck(this, MultiPolyIn);

      if (!Array.isArray(geom)) {
        throw new Error('Input geometry is not a valid Polygon or MultiPolygon');
      }

      try {
        // if the input looks like a polygon, convert it to a multipolygon
        if (typeof geom[0][0][0] === 'number') geom = [geom];
      } catch (ex) {// The input is either malformed or has empty arrays.
        // In either case, it will be handled later on.
      }

      this.polys = [];
      this.bbox = {
        ll: {
          x: Number.POSITIVE_INFINITY,
          y: Number.POSITIVE_INFINITY
        },
        ur: {
          x: Number.NEGATIVE_INFINITY,
          y: Number.NEGATIVE_INFINITY
        }
      };

      for (var i = 0, iMax = geom.length; i < iMax; i++) {
        var poly = new PolyIn(geom[i], this);
        if (poly.bbox.ll.x < this.bbox.ll.x) this.bbox.ll.x = poly.bbox.ll.x;
        if (poly.bbox.ll.y < this.bbox.ll.y) this.bbox.ll.y = poly.bbox.ll.y;
        if (poly.bbox.ur.x > this.bbox.ur.x) this.bbox.ur.x = poly.bbox.ur.x;
        if (poly.bbox.ur.y > this.bbox.ur.y) this.bbox.ur.y = poly.bbox.ur.y;
        this.polys.push(poly);
      }

      this.isSubject = isSubject;
    }

    _createClass(MultiPolyIn, [{
      key: "getSweepEvents",
      value: function getSweepEvents() {
        var sweepEvents = [];

        for (var i = 0, iMax = this.polys.length; i < iMax; i++) {
          var polySweepEvents = this.polys[i].getSweepEvents();

          for (var j = 0, jMax = polySweepEvents.length; j < jMax; j++) {
            sweepEvents.push(polySweepEvents[j]);
          }
        }

        return sweepEvents;
      }
    }]);

    return MultiPolyIn;
  }();

  var RingOut = /*#__PURE__*/function () {
    _createClass(RingOut, null, [{
      key: "factory",

      /* Given the segments from the sweep line pass, compute & return a series
       * of closed rings from all the segments marked to be part of the result */
      value: function factory(allSegments) {
        var ringsOut = [];

        for (var i = 0, iMax = allSegments.length; i < iMax; i++) {
          var segment = allSegments[i];
          if (!segment.isInResult() || segment.ringOut) continue;
          var prevEvent = null;
          var event = segment.leftSE;
          var nextEvent = segment.rightSE;
          var events = [event];
          var startingPoint = event.point;
          var intersectionLEs = [];
          /* Walk the chain of linked events to form a closed ring */

          while (true) {
            prevEvent = event;
            event = nextEvent;
            events.push(event);
            /* Is the ring complete? */

            if (event.point === startingPoint) break;

            while (true) {
              var availableLEs = event.getAvailableLinkedEvents();
              /* Did we hit a dead end? This shouldn't happen. Indicates some earlier
               * part of the algorithm malfunctioned... please file a bug report. */

              if (availableLEs.length === 0) {
                var firstPt = events[0].point;
                var lastPt = events[events.length - 1].point;
                throw new Error("Unable to complete output ring starting at [".concat(firstPt.x, ",") + " ".concat(firstPt.y, "]. Last matching segment found ends at") + " [".concat(lastPt.x, ", ").concat(lastPt.y, "]."));
              }
              /* Only one way to go, so cotinue on the path */


              if (availableLEs.length === 1) {
                nextEvent = availableLEs[0].otherSE;
                break;
              }
              /* We must have an intersection. Check for a completed loop */


              var indexLE = null;

              for (var j = 0, jMax = intersectionLEs.length; j < jMax; j++) {
                if (intersectionLEs[j].point === event.point) {
                  indexLE = j;
                  break;
                }
              }
              /* Found a completed loop. Cut that off and make a ring */


              if (indexLE !== null) {
                var intersectionLE = intersectionLEs.splice(indexLE)[0];
                var ringEvents = events.splice(intersectionLE.index);
                ringEvents.unshift(ringEvents[0].otherSE);
                ringsOut.push(new RingOut(ringEvents.reverse()));
                continue;
              }
              /* register the intersection */


              intersectionLEs.push({
                index: events.length,
                point: event.point
              });
              /* Choose the left-most option to continue the walk */

              var comparator = event.getLeftmostComparator(prevEvent);
              nextEvent = availableLEs.sort(comparator)[0].otherSE;
              break;
            }
          }

          ringsOut.push(new RingOut(events));
        }

        return ringsOut;
      }
    }]);

    function RingOut(events) {
      _classCallCheck(this, RingOut);

      this.events = events;

      for (var i = 0, iMax = events.length; i < iMax; i++) {
        events[i].segment.ringOut = this;
      }

      this.poly = null;
    }

    _createClass(RingOut, [{
      key: "getGeom",
      value: function getGeom() {
        // Remove superfluous points (ie extra points along a straight line),
        var prevPt = this.events[0].point;
        var points = [prevPt];

        for (var i = 1, iMax = this.events.length - 1; i < iMax; i++) {
          var _pt = this.events[i].point;
          var _nextPt = this.events[i + 1].point;
          if (compareVectorAngles(_pt, prevPt, _nextPt) === 0) continue;
          points.push(_pt);
          prevPt = _pt;
        } // ring was all (within rounding error of angle calc) colinear points


        if (points.length === 1) return null; // check if the starting point is necessary

        var pt = points[0];
        var nextPt = points[1];
        if (compareVectorAngles(pt, prevPt, nextPt) === 0) points.shift();
        points.push(points[0]);
        var step = this.isExteriorRing() ? 1 : -1;
        var iStart = this.isExteriorRing() ? 0 : points.length - 1;
        var iEnd = this.isExteriorRing() ? points.length : -1;
        var orderedPoints = [];

        for (var _i = iStart; _i != iEnd; _i += step) {
          orderedPoints.push([points[_i].x, points[_i].y]);
        }

        return orderedPoints;
      }
    }, {
      key: "isExteriorRing",
      value: function isExteriorRing() {
        if (this._isExteriorRing === undefined) {
          var enclosing = this.enclosingRing();
          this._isExteriorRing = enclosing ? !enclosing.isExteriorRing() : true;
        }

        return this._isExteriorRing;
      }
    }, {
      key: "enclosingRing",
      value: function enclosingRing() {
        if (this._enclosingRing === undefined) {
          this._enclosingRing = this._calcEnclosingRing();
        }

        return this._enclosingRing;
      }
      /* Returns the ring that encloses this one, if any */

    }, {
      key: "_calcEnclosingRing",
      value: function _calcEnclosingRing() {
        // start with the ealier sweep line event so that the prevSeg
        // chain doesn't lead us inside of a loop of ours
        var leftMostEvt = this.events[0];

        for (var i = 1, iMax = this.events.length; i < iMax; i++) {
          var evt = this.events[i];
          if (SweepEvent.compare(leftMostEvt, evt) > 0) leftMostEvt = evt;
        }

        var prevSeg = leftMostEvt.segment.prevInResult();
        var prevPrevSeg = prevSeg ? prevSeg.prevInResult() : null;

        while (true) {
          // no segment found, thus no ring can enclose us
          if (!prevSeg) return null; // no segments below prev segment found, thus the ring of the prev
          // segment must loop back around and enclose us

          if (!prevPrevSeg) return prevSeg.ringOut; // if the two segments are of different rings, the ring of the prev
          // segment must either loop around us or the ring of the prev prev
          // seg, which would make us and the ring of the prev peers

          if (prevPrevSeg.ringOut !== prevSeg.ringOut) {
            if (prevPrevSeg.ringOut.enclosingRing() !== prevSeg.ringOut) {
              return prevSeg.ringOut;
            } else return prevSeg.ringOut.enclosingRing();
          } // two segments are from the same ring, so this was a penisula
          // of that ring. iterate downward, keep searching


          prevSeg = prevPrevSeg.prevInResult();
          prevPrevSeg = prevSeg ? prevSeg.prevInResult() : null;
        }
      }
    }]);

    return RingOut;
  }();
  var PolyOut = /*#__PURE__*/function () {
    function PolyOut(exteriorRing) {
      _classCallCheck(this, PolyOut);

      this.exteriorRing = exteriorRing;
      exteriorRing.poly = this;
      this.interiorRings = [];
    }

    _createClass(PolyOut, [{
      key: "addInterior",
      value: function addInterior(ring) {
        this.interiorRings.push(ring);
        ring.poly = this;
      }
    }, {
      key: "getGeom",
      value: function getGeom() {
        var geom = [this.exteriorRing.getGeom()]; // exterior ring was all (within rounding error of angle calc) colinear points

        if (geom[0] === null) return null;

        for (var i = 0, iMax = this.interiorRings.length; i < iMax; i++) {
          var ringGeom = this.interiorRings[i].getGeom(); // interior ring was all (within rounding error of angle calc) colinear points

          if (ringGeom === null) continue;
          geom.push(ringGeom);
        }

        return geom;
      }
    }]);

    return PolyOut;
  }();
  var MultiPolyOut = /*#__PURE__*/function () {
    function MultiPolyOut(rings) {
      _classCallCheck(this, MultiPolyOut);

      this.rings = rings;
      this.polys = this._composePolys(rings);
    }

    _createClass(MultiPolyOut, [{
      key: "getGeom",
      value: function getGeom() {
        var geom = [];

        for (var i = 0, iMax = this.polys.length; i < iMax; i++) {
          var polyGeom = this.polys[i].getGeom(); // exterior ring was all (within rounding error of angle calc) colinear points

          if (polyGeom === null) continue;
          geom.push(polyGeom);
        }

        return geom;
      }
    }, {
      key: "_composePolys",
      value: function _composePolys(rings) {
        var polys = [];

        for (var i = 0, iMax = rings.length; i < iMax; i++) {
          var ring = rings[i];
          if (ring.poly) continue;
          if (ring.isExteriorRing()) polys.push(new PolyOut(ring));else {
            var enclosingRing = ring.enclosingRing();
            if (!enclosingRing.poly) polys.push(new PolyOut(enclosingRing));
            enclosingRing.poly.addInterior(ring);
          }
        }

        return polys;
      }
    }]);

    return MultiPolyOut;
  }();

  /**
   * NOTE:  We must be careful not to change any segments while
   *        they are in the SplayTree. AFAIK, there's no way to tell
   *        the tree to rebalance itself - thus before splitting
   *        a segment that's in the tree, we remove it from the tree,
   *        do the split, then re-insert it. (Even though splitting a
   *        segment *shouldn't* change its correct position in the
   *        sweep line tree, the reality is because of rounding errors,
   *        it sometimes does.)
   */

  var SweepLine = /*#__PURE__*/function () {
    function SweepLine(queue) {
      var comparator = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : Segment.compare;

      _classCallCheck(this, SweepLine);

      this.queue = queue;
      this.tree = new Tree(comparator);
      this.segments = [];
    }

    _createClass(SweepLine, [{
      key: "process",
      value: function process(event) {
        var segment = event.segment;
        var newEvents = []; // if we've already been consumed by another segment,
        // clean up our body parts and get out

        if (event.consumedBy) {
          if (event.isLeft) this.queue.remove(event.otherSE);else this.tree.remove(segment);
          return newEvents;
        }

        var node = event.isLeft ? this.tree.insert(segment) : this.tree.find(segment);
        if (!node) throw new Error("Unable to find segment #".concat(segment.id, " ") + "[".concat(segment.leftSE.point.x, ", ").concat(segment.leftSE.point.y, "] -> ") + "[".concat(segment.rightSE.point.x, ", ").concat(segment.rightSE.point.y, "] ") + 'in SweepLine tree. Please submit a bug report.');
        var prevNode = node;
        var nextNode = node;
        var prevSeg = undefined;
        var nextSeg = undefined; // skip consumed segments still in tree

        while (prevSeg === undefined) {
          prevNode = this.tree.prev(prevNode);
          if (prevNode === null) prevSeg = null;else if (prevNode.key.consumedBy === undefined) prevSeg = prevNode.key;
        } // skip consumed segments still in tree


        while (nextSeg === undefined) {
          nextNode = this.tree.next(nextNode);
          if (nextNode === null) nextSeg = null;else if (nextNode.key.consumedBy === undefined) nextSeg = nextNode.key;
        }

        if (event.isLeft) {
          // Check for intersections against the previous segment in the sweep line
          var prevMySplitter = null;

          if (prevSeg) {
            var prevInter = prevSeg.getIntersection(segment);

            if (prevInter !== null) {
              if (!segment.isAnEndpoint(prevInter)) prevMySplitter = prevInter;

              if (!prevSeg.isAnEndpoint(prevInter)) {
                var newEventsFromSplit = this._splitSafely(prevSeg, prevInter);

                for (var i = 0, iMax = newEventsFromSplit.length; i < iMax; i++) {
                  newEvents.push(newEventsFromSplit[i]);
                }
              }
            }
          } // Check for intersections against the next segment in the sweep line


          var nextMySplitter = null;

          if (nextSeg) {
            var nextInter = nextSeg.getIntersection(segment);

            if (nextInter !== null) {
              if (!segment.isAnEndpoint(nextInter)) nextMySplitter = nextInter;

              if (!nextSeg.isAnEndpoint(nextInter)) {
                var _newEventsFromSplit = this._splitSafely(nextSeg, nextInter);

                for (var _i = 0, _iMax = _newEventsFromSplit.length; _i < _iMax; _i++) {
                  newEvents.push(_newEventsFromSplit[_i]);
                }
              }
            }
          } // For simplicity, even if we find more than one intersection we only
          // spilt on the 'earliest' (sweep-line style) of the intersections.
          // The other intersection will be handled in a future process().


          if (prevMySplitter !== null || nextMySplitter !== null) {
            var mySplitter = null;
            if (prevMySplitter === null) mySplitter = nextMySplitter;else if (nextMySplitter === null) mySplitter = prevMySplitter;else {
              var cmpSplitters = SweepEvent.comparePoints(prevMySplitter, nextMySplitter);
              mySplitter = cmpSplitters <= 0 ? prevMySplitter : nextMySplitter;
            } // Rounding errors can cause changes in ordering,
            // so remove afected segments and right sweep events before splitting

            this.queue.remove(segment.rightSE);
            newEvents.push(segment.rightSE);

            var _newEventsFromSplit2 = segment.split(mySplitter);

            for (var _i2 = 0, _iMax2 = _newEventsFromSplit2.length; _i2 < _iMax2; _i2++) {
              newEvents.push(_newEventsFromSplit2[_i2]);
            }
          }

          if (newEvents.length > 0) {
            // We found some intersections, so re-do the current event to
            // make sure sweep line ordering is totally consistent for later
            // use with the segment 'prev' pointers
            this.tree.remove(segment);
            newEvents.push(event);
          } else {
            // done with left event
            this.segments.push(segment);
            segment.prev = prevSeg;
          }
        } else {
          // event.isRight
          // since we're about to be removed from the sweep line, check for
          // intersections between our previous and next segments
          if (prevSeg && nextSeg) {
            var inter = prevSeg.getIntersection(nextSeg);

            if (inter !== null) {
              if (!prevSeg.isAnEndpoint(inter)) {
                var _newEventsFromSplit3 = this._splitSafely(prevSeg, inter);

                for (var _i3 = 0, _iMax3 = _newEventsFromSplit3.length; _i3 < _iMax3; _i3++) {
                  newEvents.push(_newEventsFromSplit3[_i3]);
                }
              }

              if (!nextSeg.isAnEndpoint(inter)) {
                var _newEventsFromSplit4 = this._splitSafely(nextSeg, inter);

                for (var _i4 = 0, _iMax4 = _newEventsFromSplit4.length; _i4 < _iMax4; _i4++) {
                  newEvents.push(_newEventsFromSplit4[_i4]);
                }
              }
            }
          }

          this.tree.remove(segment);
        }

        return newEvents;
      }
      /* Safely split a segment that is currently in the datastructures
       * IE - a segment other than the one that is currently being processed. */

    }, {
      key: "_splitSafely",
      value: function _splitSafely(seg, pt) {
        // Rounding errors can cause changes in ordering,
        // so remove afected segments and right sweep events before splitting
        // removeNode() doesn't work, so have re-find the seg
        // https://github.com/w8r/splay-tree/pull/5
        this.tree.remove(seg);
        var rightSE = seg.rightSE;
        this.queue.remove(rightSE);
        var newEvents = seg.split(pt);
        newEvents.push(rightSE); // splitting can trigger consumption

        if (seg.consumedBy === undefined) this.tree.insert(seg);
        return newEvents;
      }
    }]);

    return SweepLine;
  }();

  var POLYGON_CLIPPING_MAX_QUEUE_SIZE = typeof process !== 'undefined' && process.env.POLYGON_CLIPPING_MAX_QUEUE_SIZE || 1000000;
  var POLYGON_CLIPPING_MAX_SWEEPLINE_SEGMENTS = typeof process !== 'undefined' && process.env.POLYGON_CLIPPING_MAX_SWEEPLINE_SEGMENTS || 1000000;
  var Operation = /*#__PURE__*/function () {
    function Operation() {
      _classCallCheck(this, Operation);
    }

    _createClass(Operation, [{
      key: "run",
      value: function run(type, geom, moreGeoms) {
        operation.type = type;
        rounder.reset();
        /* Convert inputs to MultiPoly objects */

        var multipolys = [new MultiPolyIn(geom, true)];

        for (var i = 0, iMax = moreGeoms.length; i < iMax; i++) {
          multipolys.push(new MultiPolyIn(moreGeoms[i], false));
        }

        operation.numMultiPolys = multipolys.length;
        /* BBox optimization for difference operation
         * If the bbox of a multipolygon that's part of the clipping doesn't
         * intersect the bbox of the subject at all, we can just drop that
         * multiploygon. */

        if (operation.type === 'difference') {
          // in place removal
          var subject = multipolys[0];
          var _i = 1;

          while (_i < multipolys.length) {
            if (getBboxOverlap(multipolys[_i].bbox, subject.bbox) !== null) _i++;else multipolys.splice(_i, 1);
          }
        }
        /* BBox optimization for intersection operation
         * If we can find any pair of multipolygons whose bbox does not overlap,
         * then the result will be empty. */


        if (operation.type === 'intersection') {
          // TODO: this is O(n^2) in number of polygons. By sorting the bboxes,
          //       it could be optimized to O(n * ln(n))
          for (var _i2 = 0, _iMax = multipolys.length; _i2 < _iMax; _i2++) {
            var mpA = multipolys[_i2];

            for (var j = _i2 + 1, jMax = multipolys.length; j < jMax; j++) {
              if (getBboxOverlap(mpA.bbox, multipolys[j].bbox) === null) return [];
            }
          }
        }
        /* Put segment endpoints in a priority queue */


        var queue = new Tree(SweepEvent.compare);

        for (var _i3 = 0, _iMax2 = multipolys.length; _i3 < _iMax2; _i3++) {
          var sweepEvents = multipolys[_i3].getSweepEvents();

          for (var _j = 0, _jMax = sweepEvents.length; _j < _jMax; _j++) {
            queue.insert(sweepEvents[_j]);

            if (queue.size > POLYGON_CLIPPING_MAX_QUEUE_SIZE) {
              // prevents an infinite loop, an otherwise common manifestation of bugs
              throw new Error('Infinite loop when putting segment endpoints in a priority queue ' + '(queue size too big). Please file a bug report.');
            }
          }
        }
        /* Pass the sweep line over those endpoints */


        var sweepLine = new SweepLine(queue);
        var prevQueueSize = queue.size;
        var node = queue.pop();

        while (node) {
          var evt = node.key;

          if (queue.size === prevQueueSize) {
            // prevents an infinite loop, an otherwise common manifestation of bugs
            var seg = evt.segment;
            throw new Error("Unable to pop() ".concat(evt.isLeft ? 'left' : 'right', " SweepEvent ") + "[".concat(evt.point.x, ", ").concat(evt.point.y, "] from segment #").concat(seg.id, " ") + "[".concat(seg.leftSE.point.x, ", ").concat(seg.leftSE.point.y, "] -> ") + "[".concat(seg.rightSE.point.x, ", ").concat(seg.rightSE.point.y, "] from queue. ") + 'Please file a bug report.');
          }

          if (queue.size > POLYGON_CLIPPING_MAX_QUEUE_SIZE) {
            // prevents an infinite loop, an otherwise common manifestation of bugs
            throw new Error('Infinite loop when passing sweep line over endpoints ' + '(queue size too big). Please file a bug report.');
          }

          if (sweepLine.segments.length > POLYGON_CLIPPING_MAX_SWEEPLINE_SEGMENTS) {
            // prevents an infinite loop, an otherwise common manifestation of bugs
            throw new Error('Infinite loop when passing sweep line over endpoints ' + '(too many sweep line segments). Please file a bug report.');
          }

          var newEvents = sweepLine.process(evt);

          for (var _i4 = 0, _iMax3 = newEvents.length; _i4 < _iMax3; _i4++) {
            var _evt = newEvents[_i4];
            if (_evt.consumedBy === undefined) queue.insert(_evt);
          }

          prevQueueSize = queue.size;
          node = queue.pop();
        } // free some memory we don't need anymore


        rounder.reset();
        /* Collect and compile segments we're keeping into a multipolygon */

        var ringsOut = RingOut.factory(sweepLine.segments);
        var result = new MultiPolyOut(ringsOut);
        return result.getGeom();
      }
    }]);

    return Operation;
  }(); // singleton available by import

  var operation = new Operation();

  var union = function union(geom) {
    for (var _len = arguments.length, moreGeoms = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
      moreGeoms[_key - 1] = arguments[_key];
    }

    return operation.run('union', geom, moreGeoms);
  };

  var intersection$1 = function intersection(geom) {
    for (var _len2 = arguments.length, moreGeoms = new Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
      moreGeoms[_key2 - 1] = arguments[_key2];
    }

    return operation.run('intersection', geom, moreGeoms);
  };

  var xor = function xor(geom) {
    for (var _len3 = arguments.length, moreGeoms = new Array(_len3 > 1 ? _len3 - 1 : 0), _key3 = 1; _key3 < _len3; _key3++) {
      moreGeoms[_key3 - 1] = arguments[_key3];
    }

    return operation.run('xor', geom, moreGeoms);
  };

  var difference = function difference(subjectGeom) {
    for (var _len4 = arguments.length, clippingGeoms = new Array(_len4 > 1 ? _len4 - 1 : 0), _key4 = 1; _key4 < _len4; _key4++) {
      clippingGeoms[_key4 - 1] = arguments[_key4];
    }

    return operation.run('difference', subjectGeom, clippingGeoms);
  };

  var index = {
    union: union,
    intersection: intersection$1,
    xor: xor,
    difference: difference
  };

  return index;

})));

}).call(this)}).call(this,require('_process'))
},{"_process":29}],27:[function(require,module,exports){
(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global.quickselect = factory());
}(this, (function () { 'use strict';

function quickselect(arr, k, left, right, compare) {
    quickselectStep(arr, k, left || 0, right || (arr.length - 1), compare || defaultCompare);
}

function quickselectStep(arr, k, left, right, compare) {

    while (right > left) {
        if (right - left > 600) {
            var n = right - left + 1;
            var m = k - left + 1;
            var z = Math.log(n);
            var s = 0.5 * Math.exp(2 * z / 3);
            var sd = 0.5 * Math.sqrt(z * s * (n - s) / n) * (m - n / 2 < 0 ? -1 : 1);
            var newLeft = Math.max(left, Math.floor(k - m * s / n + sd));
            var newRight = Math.min(right, Math.floor(k + (n - m) * s / n + sd));
            quickselectStep(arr, k, newLeft, newRight, compare);
        }

        var t = arr[k];
        var i = left;
        var j = right;

        swap(arr, left, k);
        if (compare(arr[right], t) > 0) swap(arr, left, right);

        while (i < j) {
            swap(arr, i, j);
            i++;
            j--;
            while (compare(arr[i], t) < 0) i++;
            while (compare(arr[j], t) > 0) j--;
        }

        if (compare(arr[left], t) === 0) swap(arr, left, j);
        else {
            j++;
            swap(arr, j, right);
        }

        if (j <= k) left = j + 1;
        if (k <= j) right = j - 1;
    }
}

function swap(arr, i, j) {
    var tmp = arr[i];
    arr[i] = arr[j];
    arr[j] = tmp;
}

function defaultCompare(a, b) {
    return a < b ? -1 : a > b ? 1 : 0;
}

return quickselect;

})));

},{}],28:[function(require,module,exports){
'use strict';

module.exports = rbush;
module.exports.default = rbush;

var quickselect = require('quickselect');

function rbush(maxEntries, format) {
    if (!(this instanceof rbush)) return new rbush(maxEntries, format);

    // max entries in a node is 9 by default; min node fill is 40% for best performance
    this._maxEntries = Math.max(4, maxEntries || 9);
    this._minEntries = Math.max(2, Math.ceil(this._maxEntries * 0.4));

    if (format) {
        this._initFormat(format);
    }

    this.clear();
}

rbush.prototype = {

    all: function () {
        return this._all(this.data, []);
    },

    search: function (bbox) {

        var node = this.data,
            result = [],
            toBBox = this.toBBox;

        if (!intersects(bbox, node)) return result;

        var nodesToSearch = [],
            i, len, child, childBBox;

        while (node) {
            for (i = 0, len = node.children.length; i < len; i++) {

                child = node.children[i];
                childBBox = node.leaf ? toBBox(child) : child;

                if (intersects(bbox, childBBox)) {
                    if (node.leaf) result.push(child);
                    else if (contains(bbox, childBBox)) this._all(child, result);
                    else nodesToSearch.push(child);
                }
            }
            node = nodesToSearch.pop();
        }

        return result;
    },

    collides: function (bbox) {

        var node = this.data,
            toBBox = this.toBBox;

        if (!intersects(bbox, node)) return false;

        var nodesToSearch = [],
            i, len, child, childBBox;

        while (node) {
            for (i = 0, len = node.children.length; i < len; i++) {

                child = node.children[i];
                childBBox = node.leaf ? toBBox(child) : child;

                if (intersects(bbox, childBBox)) {
                    if (node.leaf || contains(bbox, childBBox)) return true;
                    nodesToSearch.push(child);
                }
            }
            node = nodesToSearch.pop();
        }

        return false;
    },

    load: function (data) {
        if (!(data && data.length)) return this;

        if (data.length < this._minEntries) {
            for (var i = 0, len = data.length; i < len; i++) {
                this.insert(data[i]);
            }
            return this;
        }

        // recursively build the tree with the given data from scratch using OMT algorithm
        var node = this._build(data.slice(), 0, data.length - 1, 0);

        if (!this.data.children.length) {
            // save as is if tree is empty
            this.data = node;

        } else if (this.data.height === node.height) {
            // split root if trees have the same height
            this._splitRoot(this.data, node);

        } else {
            if (this.data.height < node.height) {
                // swap trees if inserted one is bigger
                var tmpNode = this.data;
                this.data = node;
                node = tmpNode;
            }

            // insert the small tree into the large tree at appropriate level
            this._insert(node, this.data.height - node.height - 1, true);
        }

        return this;
    },

    insert: function (item) {
        if (item) this._insert(item, this.data.height - 1);
        return this;
    },

    clear: function () {
        this.data = createNode([]);
        return this;
    },

    remove: function (item, equalsFn) {
        if (!item) return this;

        var node = this.data,
            bbox = this.toBBox(item),
            path = [],
            indexes = [],
            i, parent, index, goingUp;

        // depth-first iterative tree traversal
        while (node || path.length) {

            if (!node) { // go up
                node = path.pop();
                parent = path[path.length - 1];
                i = indexes.pop();
                goingUp = true;
            }

            if (node.leaf) { // check current node
                index = findItem(item, node.children, equalsFn);

                if (index !== -1) {
                    // item found, remove the item and condense tree upwards
                    node.children.splice(index, 1);
                    path.push(node);
                    this._condense(path);
                    return this;
                }
            }

            if (!goingUp && !node.leaf && contains(node, bbox)) { // go down
                path.push(node);
                indexes.push(i);
                i = 0;
                parent = node;
                node = node.children[0];

            } else if (parent) { // go right
                i++;
                node = parent.children[i];
                goingUp = false;

            } else node = null; // nothing found
        }

        return this;
    },

    toBBox: function (item) { return item; },

    compareMinX: compareNodeMinX,
    compareMinY: compareNodeMinY,

    toJSON: function () { return this.data; },

    fromJSON: function (data) {
        this.data = data;
        return this;
    },

    _all: function (node, result) {
        var nodesToSearch = [];
        while (node) {
            if (node.leaf) result.push.apply(result, node.children);
            else nodesToSearch.push.apply(nodesToSearch, node.children);

            node = nodesToSearch.pop();
        }
        return result;
    },

    _build: function (items, left, right, height) {

        var N = right - left + 1,
            M = this._maxEntries,
            node;

        if (N <= M) {
            // reached leaf level; return leaf
            node = createNode(items.slice(left, right + 1));
            calcBBox(node, this.toBBox);
            return node;
        }

        if (!height) {
            // target height of the bulk-loaded tree
            height = Math.ceil(Math.log(N) / Math.log(M));

            // target number of root entries to maximize storage utilization
            M = Math.ceil(N / Math.pow(M, height - 1));
        }

        node = createNode([]);
        node.leaf = false;
        node.height = height;

        // split the items into M mostly square tiles

        var N2 = Math.ceil(N / M),
            N1 = N2 * Math.ceil(Math.sqrt(M)),
            i, j, right2, right3;

        multiSelect(items, left, right, N1, this.compareMinX);

        for (i = left; i <= right; i += N1) {

            right2 = Math.min(i + N1 - 1, right);

            multiSelect(items, i, right2, N2, this.compareMinY);

            for (j = i; j <= right2; j += N2) {

                right3 = Math.min(j + N2 - 1, right2);

                // pack each entry recursively
                node.children.push(this._build(items, j, right3, height - 1));
            }
        }

        calcBBox(node, this.toBBox);

        return node;
    },

    _chooseSubtree: function (bbox, node, level, path) {

        var i, len, child, targetNode, area, enlargement, minArea, minEnlargement;

        while (true) {
            path.push(node);

            if (node.leaf || path.length - 1 === level) break;

            minArea = minEnlargement = Infinity;

            for (i = 0, len = node.children.length; i < len; i++) {
                child = node.children[i];
                area = bboxArea(child);
                enlargement = enlargedArea(bbox, child) - area;

                // choose entry with the least area enlargement
                if (enlargement < minEnlargement) {
                    minEnlargement = enlargement;
                    minArea = area < minArea ? area : minArea;
                    targetNode = child;

                } else if (enlargement === minEnlargement) {
                    // otherwise choose one with the smallest area
                    if (area < minArea) {
                        minArea = area;
                        targetNode = child;
                    }
                }
            }

            node = targetNode || node.children[0];
        }

        return node;
    },

    _insert: function (item, level, isNode) {

        var toBBox = this.toBBox,
            bbox = isNode ? item : toBBox(item),
            insertPath = [];

        // find the best node for accommodating the item, saving all nodes along the path too
        var node = this._chooseSubtree(bbox, this.data, level, insertPath);

        // put the item into the node
        node.children.push(item);
        extend(node, bbox);

        // split on node overflow; propagate upwards if necessary
        while (level >= 0) {
            if (insertPath[level].children.length > this._maxEntries) {
                this._split(insertPath, level);
                level--;
            } else break;
        }

        // adjust bboxes along the insertion path
        this._adjustParentBBoxes(bbox, insertPath, level);
    },

    // split overflowed node into two
    _split: function (insertPath, level) {

        var node = insertPath[level],
            M = node.children.length,
            m = this._minEntries;

        this._chooseSplitAxis(node, m, M);

        var splitIndex = this._chooseSplitIndex(node, m, M);

        var newNode = createNode(node.children.splice(splitIndex, node.children.length - splitIndex));
        newNode.height = node.height;
        newNode.leaf = node.leaf;

        calcBBox(node, this.toBBox);
        calcBBox(newNode, this.toBBox);

        if (level) insertPath[level - 1].children.push(newNode);
        else this._splitRoot(node, newNode);
    },

    _splitRoot: function (node, newNode) {
        // split root node
        this.data = createNode([node, newNode]);
        this.data.height = node.height + 1;
        this.data.leaf = false;
        calcBBox(this.data, this.toBBox);
    },

    _chooseSplitIndex: function (node, m, M) {

        var i, bbox1, bbox2, overlap, area, minOverlap, minArea, index;

        minOverlap = minArea = Infinity;

        for (i = m; i <= M - m; i++) {
            bbox1 = distBBox(node, 0, i, this.toBBox);
            bbox2 = distBBox(node, i, M, this.toBBox);

            overlap = intersectionArea(bbox1, bbox2);
            area = bboxArea(bbox1) + bboxArea(bbox2);

            // choose distribution with minimum overlap
            if (overlap < minOverlap) {
                minOverlap = overlap;
                index = i;

                minArea = area < minArea ? area : minArea;

            } else if (overlap === minOverlap) {
                // otherwise choose distribution with minimum area
                if (area < minArea) {
                    minArea = area;
                    index = i;
                }
            }
        }

        return index;
    },

    // sorts node children by the best axis for split
    _chooseSplitAxis: function (node, m, M) {

        var compareMinX = node.leaf ? this.compareMinX : compareNodeMinX,
            compareMinY = node.leaf ? this.compareMinY : compareNodeMinY,
            xMargin = this._allDistMargin(node, m, M, compareMinX),
            yMargin = this._allDistMargin(node, m, M, compareMinY);

        // if total distributions margin value is minimal for x, sort by minX,
        // otherwise it's already sorted by minY
        if (xMargin < yMargin) node.children.sort(compareMinX);
    },

    // total margin of all possible split distributions where each node is at least m full
    _allDistMargin: function (node, m, M, compare) {

        node.children.sort(compare);

        var toBBox = this.toBBox,
            leftBBox = distBBox(node, 0, m, toBBox),
            rightBBox = distBBox(node, M - m, M, toBBox),
            margin = bboxMargin(leftBBox) + bboxMargin(rightBBox),
            i, child;

        for (i = m; i < M - m; i++) {
            child = node.children[i];
            extend(leftBBox, node.leaf ? toBBox(child) : child);
            margin += bboxMargin(leftBBox);
        }

        for (i = M - m - 1; i >= m; i--) {
            child = node.children[i];
            extend(rightBBox, node.leaf ? toBBox(child) : child);
            margin += bboxMargin(rightBBox);
        }

        return margin;
    },

    _adjustParentBBoxes: function (bbox, path, level) {
        // adjust bboxes along the given tree path
        for (var i = level; i >= 0; i--) {
            extend(path[i], bbox);
        }
    },

    _condense: function (path) {
        // go through the path, removing empty nodes and updating bboxes
        for (var i = path.length - 1, siblings; i >= 0; i--) {
            if (path[i].children.length === 0) {
                if (i > 0) {
                    siblings = path[i - 1].children;
                    siblings.splice(siblings.indexOf(path[i]), 1);

                } else this.clear();

            } else calcBBox(path[i], this.toBBox);
        }
    },

    _initFormat: function (format) {
        // data format (minX, minY, maxX, maxY accessors)

        // uses eval-type function compilation instead of just accepting a toBBox function
        // because the algorithms are very sensitive to sorting functions performance,
        // so they should be dead simple and without inner calls

        var compareArr = ['return a', ' - b', ';'];

        this.compareMinX = new Function('a', 'b', compareArr.join(format[0]));
        this.compareMinY = new Function('a', 'b', compareArr.join(format[1]));

        this.toBBox = new Function('a',
            'return {minX: a' + format[0] +
            ', minY: a' + format[1] +
            ', maxX: a' + format[2] +
            ', maxY: a' + format[3] + '};');
    }
};

function findItem(item, items, equalsFn) {
    if (!equalsFn) return items.indexOf(item);

    for (var i = 0; i < items.length; i++) {
        if (equalsFn(item, items[i])) return i;
    }
    return -1;
}

// calculate node's bbox from bboxes of its children
function calcBBox(node, toBBox) {
    distBBox(node, 0, node.children.length, toBBox, node);
}

// min bounding rectangle of node children from k to p-1
function distBBox(node, k, p, toBBox, destNode) {
    if (!destNode) destNode = createNode(null);
    destNode.minX = Infinity;
    destNode.minY = Infinity;
    destNode.maxX = -Infinity;
    destNode.maxY = -Infinity;

    for (var i = k, child; i < p; i++) {
        child = node.children[i];
        extend(destNode, node.leaf ? toBBox(child) : child);
    }

    return destNode;
}

function extend(a, b) {
    a.minX = Math.min(a.minX, b.minX);
    a.minY = Math.min(a.minY, b.minY);
    a.maxX = Math.max(a.maxX, b.maxX);
    a.maxY = Math.max(a.maxY, b.maxY);
    return a;
}

function compareNodeMinX(a, b) { return a.minX - b.minX; }
function compareNodeMinY(a, b) { return a.minY - b.minY; }

function bboxArea(a)   { return (a.maxX - a.minX) * (a.maxY - a.minY); }
function bboxMargin(a) { return (a.maxX - a.minX) + (a.maxY - a.minY); }

function enlargedArea(a, b) {
    return (Math.max(b.maxX, a.maxX) - Math.min(b.minX, a.minX)) *
           (Math.max(b.maxY, a.maxY) - Math.min(b.minY, a.minY));
}

function intersectionArea(a, b) {
    var minX = Math.max(a.minX, b.minX),
        minY = Math.max(a.minY, b.minY),
        maxX = Math.min(a.maxX, b.maxX),
        maxY = Math.min(a.maxY, b.maxY);

    return Math.max(0, maxX - minX) *
           Math.max(0, maxY - minY);
}

function contains(a, b) {
    return a.minX <= b.minX &&
           a.minY <= b.minY &&
           b.maxX <= a.maxX &&
           b.maxY <= a.maxY;
}

function intersects(a, b) {
    return b.minX <= a.maxX &&
           b.minY <= a.maxY &&
           b.maxX >= a.minX &&
           b.maxY >= a.minY;
}

function createNode(children) {
    return {
        children: children,
        height: 1,
        leaf: true,
        minX: Infinity,
        minY: Infinity,
        maxX: -Infinity,
        maxY: -Infinity
    };
}

// sort an array so that items come in groups of n unsorted items, with groups sorted between each other;
// combines selection algorithm with binary divide & conquer approach

function multiSelect(arr, left, right, n, compare) {
    var stack = [left, right],
        mid;

    while (stack.length) {
        right = stack.pop();
        left = stack.pop();

        if (right - left <= n) continue;

        mid = left + Math.ceil((right - left) / n / 2) * n;
        quickselect(arr, mid, left, right, compare);

        stack.push(left, mid, mid, right);
    }
}

},{"quickselect":27}],29:[function(require,module,exports){
// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;
process.prependListener = noop;
process.prependOnceListener = noop;

process.listeners = function (name) { return [] }

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}]},{},[1])(1)
});
