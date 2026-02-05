// src/services/antiCheatValidator.js

class AntiCheatValidator {
  constructor() {
    this.maxRunningSpeed = 25; // km/h
    this.maxCyclingSpeed = 60; // km/h
    this.maxAcceleration = 2.5; // m/s²
    this.minGpsAccuracy = 50; // meters (worse than this is suspicious)
  }

  /**
   * Calculate comprehensive anti-cheat score
   * @param {Array} gpsTrack - GPS points with speed, accuracy, altitude
   * @param {Array} heartRateData - Optional heart rate readings
   * @param {String} mode - 'running' or 'cycling'
   * @returns {Object} - Score and details
   */
  calculateScore(gpsTrack, heartRateData = null, mode = 'running') {
    const scores = [];
    const reasons = [];

    // Test 1: Speed Analysis
    const speedResult = this.testSpeed(gpsTrack, mode);
    scores.push(speedResult.score);
    if (speedResult.score < 1.0) reasons.push(speedResult.reason);

    // Test 2: Acceleration Analysis
    const accelResult = this.testAcceleration(gpsTrack);
    scores.push(accelResult.score);
    if (accelResult.score < 1.0) reasons.push(accelResult.reason);

    // Test 3: GPS Accuracy
    const accuracyResult = this.testGpsAccuracy(gpsTrack);
    scores.push(accuracyResult.score);
    if (accuracyResult.score < 1.0) reasons.push(accuracyResult.reason);

    // Test 4: Turn Sharpness
    const turnResult = this.testTurnSharpness(gpsTrack);
    scores.push(turnResult.score);
    if (turnResult.score < 1.0) reasons.push(turnResult.reason);

    // Test 5: Heart Rate (if available)
    if (heartRateData && heartRateData.length > 10) {
      const hrResult = this.testHeartRate(gpsTrack, heartRateData);
      scores.push(hrResult.score);
      if (hrResult.score < 1.0) reasons.push(hrResult.reason);
    }

    const finalScore = this.mean(scores);

    return {
      score: parseFloat(finalScore.toFixed(2)),
      verdict: this.getVerdict(finalScore),
      reasons,
      details: {
        speed: speedResult.score,
        acceleration: accelResult.score,
        gpsAccuracy: accuracyResult.score,
        turnSharpness: turnResult.score,
        heartRate: heartRateData ? (scores.length > 4 ? scores[4] : null) : null,
      },
    };
  }

  testSpeed(track, mode) {
    const speeds = track
      .map(p => p.speed)
      .filter(s => s !== null && s !== undefined && s > 0);

    if (speeds.length === 0) {
      return { score: 0.7, reason: 'No speed data available' };
    }

    const maxSpeed = Math.max(...speeds);
    const avgSpeed = this.mean(speeds);
    const maxAllowed = mode === 'running' ? this.maxRunningSpeed : this.maxCyclingSpeed;

    // Excessive speed
    if (maxSpeed > maxAllowed) {
      return { 
        score: 0.0, 
        reason: `Max speed ${maxSpeed.toFixed(1)} km/h exceeds ${mode} limit of ${maxAllowed} km/h` 
      };
    }

    // Sustained high speed (suspicious)
    const highSpeedThreshold = maxAllowed * 0.9;
    const highSpeedCount = speeds.filter(s => s > highSpeedThreshold).length;
    const highSpeedRatio = highSpeedCount / speeds.length;

    if (highSpeedRatio > 0.5) {
      return { 
        score: 0.3, 
        reason: `${(highSpeedRatio * 100).toFixed(0)}% of activity at suspiciously high speed` 
      };
    }

    return { score: 1.0, reason: null };
  }

  testAcceleration(track) {
    const accelerations = [];

    for (let i = 1; i < track.length; i++) {
      const dt = (track[i].timestamp - track[i - 1].timestamp) / 1000; // seconds
      
      if (dt === 0 || !track[i].speed || !track[i - 1].speed) continue;

      const dv = (track[i].speed - track[i - 1].speed) / 3.6; // Convert km/h to m/s
      const accel = Math.abs(dv / dt);
      accelerations.push(accel);
    }

    if (accelerations.length === 0) {
      return { score: 0.8, reason: 'Insufficient data for acceleration test' };
    }

    const maxAccel = Math.max(...accelerations);

    // Extreme acceleration (vehicle-like)
    if (maxAccel > 3.0) {
      return { 
        score: 0.2, 
        reason: `Max acceleration ${maxAccel.toFixed(1)} m/s² exceeds human capability` 
      };
    }

    // High acceleration (suspicious)
    if (maxAccel > this.maxAcceleration) {
      return { 
        score: 0.6, 
        reason: `Suspicious acceleration: ${maxAccel.toFixed(1)} m/s²` 
      };
    }

    return { score: 1.0, reason: null };
  }

  testGpsAccuracy(track) {
    const accuracies = track
      .map(p => p.accuracy)
      .filter(a => a !== null && a !== undefined && a > 0);

    if (accuracies.length === 0) {
      return { score: 0.7, reason: 'No GPS accuracy data available' };
    }

    const avgAccuracy = this.mean(accuracies);
    const perfectCount = accuracies.filter(a => a < 5).length;
    const perfectRatio = perfectCount / accuracies.length;

    // Unnaturally perfect GPS (spoofing indicator)
    if (perfectRatio > 0.9) {
      return { 
        score: 0.3, 
        reason: `${(perfectRatio * 100).toFixed(0)}% of GPS points unrealistically accurate (<5m)` 
      };
    }

    // Very poor accuracy
    if (avgAccuracy > this.minGpsAccuracy) {
      return { 
        score: 0.7, 
        reason: `Poor GPS accuracy: ${avgAccuracy.toFixed(0)}m average` 
      };
    }

    return { score: 1.0, reason: null };
  }

  testTurnSharpness(track) {
    const angles = [];

    for (let i = 1; i < track.length - 1; i++) {
      const bearing1 = this.calculateBearing(track[i - 1], track[i]);
      const bearing2 = this.calculateBearing(track[i], track[i + 1]);

      let angleChange = Math.abs(bearing2 - bearing1);
      if (angleChange > 180) angleChange = 360 - angleChange;

      angles.push(angleChange);
    }

    if (angles.length === 0) {
      return { score: 0.8, reason: 'Insufficient points for turn analysis' };
    }

    const sharpTurns = angles.filter(a => a > 90).length;
    const expectedTurns = track.length / 50; // Expect ~1 turn per 50 points

    // Too few sharp turns (car-like wide turns)
    if (sharpTurns < expectedTurns * 0.2) {
      return { 
        score: 0.5, 
        reason: `Insufficient sharp turns: ${sharpTurns} (expected ~${expectedTurns.toFixed(0)})` 
      };
    }

    return { score: 1.0, reason: null };
  }

  testHeartRate(track, hrData) {
    const avgHr = this.mean(hrData);
    const speeds = track.map(p => p.speed).filter(s => s > 0);
    const avgSpeed = this.mean(speeds);

    // Low HR at high speed (suspicious)
    if (avgSpeed > 12 && avgHr < 100) {
      return { 
        score: 0.4, 
        reason: `Heart rate ${avgHr.toFixed(0)} bpm too low for speed ${avgSpeed.toFixed(1)} km/h` 
      };
    }

    // Flat-line HR (spoofing)
    const hrVariance = this.variance(hrData);
    if (hrVariance < 10) {
      return { 
        score: 0.3, 
        reason: 'Heart rate shows no variation (potential spoof)' 
      };
    }

    return { score: 1.0, reason: null };
  }

  calculateBearing(p1, p2) {
    const lat1 = this.toRadians(p1.lat);
    const lat2 = this.toRadians(p2.lat);
    const dLng = this.toRadians(p2.lng - p1.lng);

    const x = Math.sin(dLng) * Math.cos(lat2);
    const y = Math.cos(lat1) * Math.sin(lat2) -
              Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng);

    const bearing = Math.atan2(x, y);
    return this.toDegrees(bearing);
  }

  getVerdict(score) {
    if (score >= 0.80) return 'APPROVED';
    if (score >= 0.60) return 'PRIVATE_ONLY';
    return 'FLAGGED';
  }

  // Utility functions
  mean(arr) {
    return arr.reduce((a, b) => a + b, 0) / arr.length;
  }

  variance(arr) {
    const avg = this.mean(arr);
    return this.mean(arr.map(x => Math.pow(x - avg, 2)));
  }

  toRadians(degrees) {
    return degrees * (Math.PI / 180);
  }

  toDegrees(radians) {
    return radians * (180 / Math.PI);
  }
}

module.exports = AntiCheatValidator;
