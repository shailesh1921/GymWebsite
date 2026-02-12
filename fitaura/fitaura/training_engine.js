/**
 * training_engine.js
 * The central brain of the Adaptive Training System.
 */

const { User, Workout, Exercise, Feedback, ExercisePerformance } = require('./models');
const Autoregulator = require('./autoregulator');
const TransparencyService = require('./transparency');

class TrainingEngine {
    constructor() {
        this.baselineReadiness = 80;
    }

    /**
     * Calculates user's daily readiness score based on subjective feedback.
     * @param {Feedback} feedback 
     * @returns {number} Score 0-100
     */
    calculateReadiness(feedback) {
        let score = this.baselineReadiness;

        // Sleep Impact
        if (feedback.sleepQuality <= 4) score -= 20; // Poor sleep
        else if (feedback.sleepQuality <= 6) score -= 10; // Okay sleep
        else if (feedback.sleepQuality >= 8) score += 5; // Good sleep

        // Soreness Impact
        if (feedback.soreness >= 4) score -= 10; // Significant soreness
        if (feedback.soreness === 5) score -= 20; // Extreme soreness

        // Stress Impact
        if (feedback.stressLevel === 'High') score -= 15;

        return Math.max(0, Math.min(100, score));
    }

    /**
     * Main function: Generates the workout for the day.
     * @param {User} userProfile 
     * @param {Workout} plannedWorkout 
     * @param {Feedback} dailyFeedback 
     * @param {Array<ExercisePerformance>} lastPerformances - Performance data from previous session
     * @returns {Object} { adjustedWorkout, explanations }
     */
    generateDailyWorkout(userProfile, plannedWorkout, dailyFeedback, lastPerformances = []) {
        let explanations = [];
        let adjustedWorkout = JSON.parse(JSON.stringify(plannedWorkout)); // Clone

        // 1. Safety Check: Pain/Injury
        if (dailyFeedback.painFlags.length > 0) {
            dailyFeedback.painFlags.forEach(painArea => {
                adjustedWorkout.exercises.forEach((ex, index) => {
                    // Check if exercise hits painful area (very simplified mapping)
                    if (this.isExerciseRisky(ex, painArea)) {
                        const sub = this.getSafeSubstitution(ex, painArea);
                        explanations.push(TransparencyService.explainAdjustment('INJURY_SUBSTITUTION', {
                            painLocation: painArea,
                            originalExercise: ex.name,
                            newExercise: sub.name
                        }));
                        adjustedWorkout.exercises[index] = sub;
                    }
                });
            });
        }

        // 2. Readiness Check & Volume Adjustment
        const readiness = this.calculateReadiness(dailyFeedback);
        const volumeAdjustmentResult = Autoregulator.adjustVolume(adjustedWorkout, readiness);

        if (volumeAdjustmentResult.type !== 'MAINTENANCE') {
            explanations.push(TransparencyService.explainAdjustment(volumeAdjustmentResult.type, {
                sleepHours: dailyFeedback.sleepQuality, // simplistic mapping for demo string
                setsRemoved: volumeAdjustmentResult.type === 'DELOAD' ? '50%' : '20%' // simplistic
            }));
            adjustedWorkout = volumeAdjustmentResult.workout;
        }

        // 3. Load Progression based on Last Performance
        if (readiness >= 40) { // Allow load logic to run, volume was already cut if low readiness
            adjustedWorkout.exercises.forEach(currentEx => {
                const lastPerf = lastPerformances.find(p => p.exerciseId === currentEx.id);

                if (lastPerf) {
                    const adjustment = Autoregulator.adjustLoad(
                        lastPerf.weight,
                        lastPerf.rpe,
                        currentEx.rpeTarget, // Target RPE 
                        lastPerf.completedReps < currentEx.reps // Did they meet the target reps?
                    );

                    if (adjustment.adjustmentType !== 'MAINTENANCE') {
                        // Apply weight change
                        // Round to nearest 2.5kg for gym reality
                        currentEx.weight = Math.round(adjustment.newWeight / 2.5) * 2.5;

                        explanations.push(TransparencyService.explainAdjustment(adjustment.adjustmentType, {
                            lastRpe: lastPerf.rpe,
                            increaseAmount: (currentEx.weight - lastPerf.weight).toFixed(1)
                        }));
                    } else {
                        // Carry over weight if maintaining
                        currentEx.weight = lastPerf.weight;
                    }
                }
            });
        }

        return {
            readinessScore: readiness,
            workout: adjustedWorkout,
            explanations: explanations
        };
    }

    // Helper: simplistic exercise substitution logic for MVP
    isExerciseRisky(exercise, painArea) {
        // MVP: simplified matching
        const riskMap = {
            'knee': ['Squat', 'Lunge', 'Leg Press'],
            'shoulder': ['Bench Press', 'Overhead Press', 'Dip'],
            'back': ['Deadlift', 'Row', 'Good Morning']
        };

        let foundRisk = false;
        for (const [key, riskyList] of Object.entries(riskMap)) {
            if (painArea.toLowerCase().includes(key)) {
                if (riskyList.some(riskyName => exercise.name.includes(riskyName))) {
                    foundRisk = true;
                }
            }
        }
        return foundRisk;
    }

    getSafeSubstitution(exercise, painArea) {
        // MVP substitutions
        if (painArea.includes('knee')) {
            return { name: 'Glute Bridge', weight: 0, sets: 3, reps: 15, id: exercise.id + '_sub' };
        }
        if (painArea.includes('shoulder')) {
            return { name: 'Push-up (Neutral Grip)', weight: 0, sets: 3, reps: 12, id: exercise.id + '_sub' };
        }
        if (painArea.includes('back')) {
            return { name: 'Chest Supported Row', weight: exercise.weight * 0.7, sets: 3, reps: 10, id: exercise.id + '_sub' };
        }
        return { name: `Rest (${painArea} pain)`, id: 'rest', weight: 0, sets: 0, reps: 0 };
    }
}

module.exports = TrainingEngine;
