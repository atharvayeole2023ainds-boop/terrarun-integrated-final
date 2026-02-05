// src/services/loopDetector.js
const turf = require('@turf/turf');

class LoopDetector {
  constructor(config = {}) {
    this.minDistance = config.minDistance || 1000; // meters
    this.maxDistance = config.maxDistance || 50000; // 50km for running
    this.closureThreshold = config.closureThreshold || 50; // meters
    this.minPoints = config.minPoints || 8;
  }

  /**
   * Detects if GPS track forms a valid loop
   * @param {Array} gpsTrack - Array of {lat, lng, timestamp, accuracy, speed}
   * @returns {Object} - Detection result
   */
  detectLoop(gpsTrack) {
    // Validation
    if (!gpsTrack || gpsTrack.length < this.minPoints) {
      return { 
        isLoop: false, 
        reason: `Insufficient GPS points (need ${this.minPoints}, got ${gpsTrack?.length || 0})` 
      };
    }

    const startPoint = turf.point([gpsTrack[0].lng, gpsTrack[0].lat]);
    const endPoint = turf.point([
      gpsTrack[gpsTrack.length - 1].lng,
      gpsTrack[gpsTrack.length - 1].lat
    ]);

    // Check closure distance
    const closureDistance = turf.distance(startPoint, endPoint, { units: 'meters' });
    
    if (closureDistance > this.closureThreshold) {
      return { 
        isLoop: false, 
        reason: `Start/end points ${closureDistance.toFixed(0)}m apart (max ${this.closureThreshold}m)`,
        closureDistance 
      };
    }

    // Calculate total distance
    const totalDistance = this.calculateTrackDistance(gpsTrack);
    
    if (totalDistance < this.minDistance) {
      return { 
        isLoop: false, 
        reason: `Distance too short: ${(totalDistance / 1000).toFixed(2)}km (min ${this.minDistance / 1000}km)`,
        totalDistance 
      };
    }

    if (totalDistance > this.maxDistance) {
      return { 
        isLoop: false, 
        reason: `Distance too long: ${(totalDistance / 1000).toFixed(2)}km (max ${this.maxDistance / 1000}km)`,
        totalDistance 
      };
    }

    // Create polygon from track
    const coordinates = gpsTrack.map(p => [p.lng, p.lat]);
    coordinates.push(coordinates[0]); // Close the polygon

    try {
      const polygon = turf.polygon([coordinates]);
      
      // Validate polygon (check for self-intersections)
      const validation = this.validatePolygon(polygon);
      if (!validation.valid) {
        return { 
          isLoop: false, 
          reason: validation.reason,
          polygon 
        };
      }

      const area = turf.area(polygon); // square meters
      const areaKm2 = area / 1000000;

      // Check if area is reasonable
      if (areaKm2 < 0.01) {
        return {
          isLoop: false,
          reason: 'Territory area too small (< 0.01 km²)',
        };
      }

      return {
        isLoop: true,
        polygon: polygon.geometry,
        area: areaKm2,
        perimeter: totalDistance,
        startPoint: gpsTrack[0],
        endPoint: gpsTrack[gpsTrack.length - 1],
        closureDistance,
        pointCount: gpsTrack.length,
      };

    } catch (error) {
      return { 
        isLoop: false, 
        reason: `Polygon creation failed: ${error.message}` 
      };
    }
  }

  /**
   * Calculate total distance of GPS track
   */
  calculateTrackDistance(gpsTrack) {
    let totalDistance = 0;
    
    for (let i = 1; i < gpsTrack.length; i++) {
      const from = turf.point([gpsTrack[i - 1].lng, gpsTrack[i - 1].lat]);
      const to = turf.point([gpsTrack[i].lng, gpsTrack[i].lat]);
      totalDistance += turf.distance(from, to, { units: 'meters' });
    }
    
    return totalDistance;
  }

  /**
   * Validate polygon for self-intersections
   */
  validatePolygon(polygon) {
    try {
      const coords = polygon.geometry.coordinates[0];
      
      // Check for self-intersections
      for (let i = 0; i < coords.length - 2; i++) {
        const segment1 = turf.lineString([coords[i], coords[i + 1]]);
        
        for (let j = i + 2; j < coords.length - 1; j++) {
          // Don't check adjacent segments
          if (j === i + 1 || (i === 0 && j === coords.length - 2)) continue;
          
          const segment2 = turf.lineString([coords[j], coords[j + 1]]);
          const intersection = turf.lineIntersect(segment1, segment2);
          
          if (intersection.features.length > 0) {
            return {
              valid: false,
              reason: 'Self-intersecting polygon detected (path crosses itself)',
              intersectionPoint: intersection.features[0].geometry.coordinates
            };
          }
        }
      }
      
      return { valid: true };
    } catch (error) {
      return {
        valid: false,
        reason: `Validation error: ${error.message}`,
      };
    }
  }

  /**
   * Simplify GPS track using Douglas-Peucker algorithm
   * Reduces storage by 60-90% while maintaining visual accuracy
   */
  simplifyTrack(gpsTrack, tolerance = 0.0001) {
    if (gpsTrack.length <= 2) return gpsTrack;

    const line = turf.lineString(gpsTrack.map(p => [p.lng, p.lat]));
    const simplified = turf.simplify(line, { 
      tolerance: tolerance, 
      highQuality: true 
    });

    // Map simplified coordinates back to GPS points with timestamps
    const simplifiedCoords = simplified.geometry.coordinates;
    const result = [];
    
    for (let i = 0; i < simplifiedCoords.length; i++) {
      const [lng, lat] = simplifiedCoords[i];
      
      // Find closest original point
      let closestIdx = 0;
      let minDist = Infinity;
      
      for (let j = 0; j < gpsTrack.length; j++) {
        const dist = Math.abs(gpsTrack[j].lat - lat) + Math.abs(gpsTrack[j].lng - lng);
        if (dist < minDist) {
          minDist = dist;
          closestIdx = j;
        }
      }
      
      result.push(gpsTrack[closestIdx]);
    }
    
    return result;
  }

  /**
   * Convert GPS track to PostGIS LineString WKT
   */
  toLineString(gpsTrack) {
    const coords = gpsTrack.map(p => `${p.lng} ${p.lat}`).join(', ');
    return `LINESTRING(${coords})`;
  }

  /**
   * Convert polygon to PostGIS Polygon WKT
   */
  toPolygonWKT(polygon) {
    const coords = polygon.coordinates[0]
      .map(([lng, lat]) => `${lng} ${lat}`)
      .join(', ');
    return `POLYGON((${coords}))`;
  }
}

module.exports = LoopDetector;