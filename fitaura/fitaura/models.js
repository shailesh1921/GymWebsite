/**
 * models.js
 * Data models for the Adaptive Training Engine.
 * These classes represent the core entities used in the adjustment logic.
 */

class User {
    /**
     * @param {string} id - Unique user ID
     * @param {string} name - User's name
     * @param {Object} trainingMaxes - Map of exercise IDs to 1RM (e.g., { 'sq01': 100 })
     * @param {Array<string>} injuryHistory - List of past injuries
     */
    constructor(id, name, trainingMaxes = {}, injuryHistory = []) {
        this.id = id;
        this.name = name;
        this.trainingMaxes = trainingMaxes;
        this.injuryHistory = injuryHistory;
    }
}

class Exercise {
    /**
     * @param {string} id - Unique exercise ID
     * @param {string} name - Exercise name (e.g., "Barbell Squat")
     * @param {string} type - "compound" or "isolation"
     * @param {Array<string>} muscleGroups - Target muscles (e.g., ["quads", "glutes"])
     * @param {number} weight - Weight in kg
     * @param {number} sets - Number of sets
     * @param {number} reps - Target reps per set
     * @param {number} rpeTarget - Target RPE (optional)
     */
    constructor(id, name, type, muscleGroups, weight, sets, reps, rpeTarget = 8) {
        this.id = id;
        this.name = name;
        this.type = type;
        this.muscleGroups = muscleGroups;
        this.weight = weight;
        this.sets = sets;
        this.reps = reps;
        this.rpeTarget = rpeTarget;
    }
}

class Workout {
    /**
     * @param {string} id - Unique workout ID
     * @param {string} userId - ID of the user
     * @param {string} name - Workout name (e.g., "Leg Day A")
     * @param {Array<Exercise>} exercises - List of Exercise objects
     * @param {Date} date - Date of the workout
     */
    constructor(id, userId, name, exercises = [], date = new Date()) {
        this.id = id;
        this.userId = userId;
        this.name = name;
        this.exercises = exercises;
        this.date = date;
    }
}

class Feedback {
    /**
     * @param {number} sleepQuality - 1-5 scale (1: Poor, 5: Excellent)
     * @param {number} soreness - 1-5 scale (1: None, 5: Extreme)
     * @param {string} stressLevel - "Low", "Medium", "High"
     * @param {Array<string>} painFlags - List of body parts with pain (e.g., ["left_knee"])
     */
    constructor(sleepQuality, soreness, stressLevel, painFlags = []) {
        this.sleepQuality = sleepQuality;
        this.soreness = soreness;
        this.stressLevel = stressLevel;
        this.painFlags = painFlags;
    }
}

class ExercisePerformance {
    /**
     * @param {string} exerciseId - ID of the exercise
     * @param {number} weight used
     * @param {number} completedReps - Average reps completed per set
     * @param {number} completedSets - Actual sets completed
     * @param {number} rpe - Rated Perceived Exertion (1-10)
     */
    constructor(exerciseId, weight, completedReps, completedSets, rpe) {
        this.exerciseId = exerciseId;
        this.weight = weight;
        this.completedReps = completedReps;
        this.completedSets = completedSets;
        this.rpe = rpe;
    }
}

module.exports = { User, Exercise, Workout, Feedback, ExercisePerformance };
