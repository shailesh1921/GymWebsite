/**
 * autoregulator.js
 * Logic for adjusting training load (intensity) and volume (sets/reps).
 */

class Autoregulator {
    /**
     * Calculates the new load for an exercise based on previous performance.
     * @param {number} currentWeight - The weight used in the last session.
     * @param {number} rpe - Rated Perceived Exertion (1-10) of the last session.
     * @param {number} targetRpe - The target RPE for the exercise (default 8).
     * @param {boolean} missedReps - Whether the user failed to complete the target reps.
     * @returns {Object} { newWeight: number, adjustmentType: string }
     */
    static adjustLoad(currentWeight, rpe, targetRpe = 8, missedReps = false) {
        // failed reps -> immediate deload
        if (missedReps) {
            return {
                newWeight: currentWeight * 0.95, // 5% decrease
                adjustmentType: 'LOAD_DECREASE'
            };
        }

        // RPE was too low (too easy) -> increase load
        if (rpe <= targetRpe - 1) { // e.g. RPE 6 vs Target 8
            return {
                newWeight: currentWeight * 1.025, // 2.5% increase
                adjustmentType: 'LOAD_INCREASE'
            };
        }

        // RPE was too high (too hard) -> decrease load to reset form
        if (rpe >= 9.5) {
            return {
                newWeight: currentWeight * 0.95, // 5% decrease
                adjustmentType: 'LOAD_DECREASE'
            };
        }

        // RPE was just right -> maintain
        return {
            newWeight: currentWeight,
            adjustmentType: 'MAINTENANCE'
        };
    }

    /**
     * Adjusts volume based on daily readiness.
     * @param {Workout} plannedWorkout - The original workout plan.
     * @param {number} readinessScore - 0-100 score.
     * @returns {Workout} - Adjusted workout object.
     */
    static adjustVolume(plannedWorkout, readinessScore) {
        // Deep clone to avoid mutating original
        const adjustedWorkout = JSON.parse(JSON.stringify(plannedWorkout));

        if (readinessScore < 40) {
            // Severe fatigue: Cut volume by ~50% (Remove sets)
            adjustedWorkout.exercises.forEach(ex => {
                ex.sets = Math.max(1, Math.floor(ex.sets * 0.5));
            });
            return { workout: adjustedWorkout, type: 'DELOAD' };
        }

        if (readinessScore < 60) {
            // Moderate fatigue: Cut volume by ~20% (Remove 1 set from main lifts)
            adjustedWorkout.exercises.forEach(ex => {
                if (ex.sets > 1) {
                    ex.sets -= 1;
                }
            });
            return { workout: adjustedWorkout, type: 'VOLUME_REDUCTION' };
        }

        return { workout: adjustedWorkout, type: 'MAINTENANCE' };
    }
}

module.exports = Autoregulator;
