/**
 * server.js
 * REST API for the Adaptive Training Engine.
 * Exposes endpoints for the frontend to request workout adjustments.
 */

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { User, Workout, Exercise, Feedback, ExercisePerformance } = require('./models');
const TrainingEngine = require('./training_engine');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public')); // Serve frontend files

const engine = new TrainingEngine();

/**
 * POST /api/workout/generate
 * Generates an adjusted workout based on user feedback and history.
 * 
 * Expected Payload:
 * {
 *   "user": { ... },
 *   "plannedWorkout": { ... },
 *   "feedback": { sleepQuality: 1-5, soreness: 1-5, stressLevel: "Low/High", painFlags: [] },
 *   "history": [ { exerciseId, weight, rpe, ... } ]
 * }
 */
app.post('/api/workout/generate', (req, res) => {
    try {
        const { user, plannedWorkout, feedback, history } = req.body;

        // Reconstruct objects from JSON payload (to ensure methods work if we add them later)
        // For MVP, plain objects might work if logic doesn't rely on 'instanceof'
        // But let's be safe and map them.

        // 1. Map Feedback
        const feedbackObj = new Feedback(
            feedback.sleepQuality,
            feedback.soreness,
            feedback.stressLevel,
            feedback.painFlags
        );

        // 2. Map Workout
        // Assuming user sends the full planned workout structure
        // In a real app, we might fetch this from DB by ID, but here we accept it in payload
        const workoutObj = new Workout(
            plannedWorkout.id,
            plannedWorkout.userId,
            plannedWorkout.name,
            plannedWorkout.exercises.map(e => new Exercise(
                e.id, e.name, e.type, e.muscleGroups, e.weight, e.sets, e.reps, e.rpeTarget
            ))
        );

        // 3. Map History
        const historyObjs = history ? history.map(h => new ExercisePerformance(
            h.exerciseId, h.weight, h.completedReps, h.completedSets, h.rpe
        )) : [];

        const userObj = new User(user.id, user.name);

        // Run the Engine
        const result = engine.generateDailyWorkout(userObj, workoutObj, feedbackObj, historyObjs);

        // Return result
        res.json({
            status: 'success',
            data: result
        });

    } catch (error) {
        console.error("Error generating workout:", error);
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
});

app.listen(PORT, () => {
    console.log(`Adaptive Training API running on http://localhost:${PORT}`);
    console.log(`Endpoint: POST /api/workout/generate`);
});
