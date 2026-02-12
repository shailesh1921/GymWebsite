/**
 * test_scenarios.js
 * Verification script to run the 3 core scenarios:
 * A: Ideal Progression
 * B: High Stress/Poor Recovery
 * C: Injury Substitution
 */

const { User, Workout, Exercise, Feedback, ExercisePerformance } = require('./models');
const TrainingEngine = require('./training_engine');

const engine = new TrainingEngine();

// --- Setup Common Data ---
const user = new User('u1', 'Test User');

// Plan: Squat 3x5, Bench 3x5, Row 3x10
const plannedWorkout = new Workout('w1', user.id, 'Full Body A', [
    new Exercise('sq', 'Barbell Squat', 'compound', ['quads'], 100, 3, 5),
    new Exercise('bp', 'Bench Press', 'compound', ['chest'], 80, 3, 5),
    new Exercise('row', 'Barbell Row', 'compound', ['back'], 60, 3, 10)
]);

console.log("=== ADAPTIVE TRAINING ENGINE VERIFICATION ===\n");

// --- Scenario A: Ideal Progression ---
console.log("--- Scenario A: Ideal Progression (Good Sleep, RPE 7) ---");
const feedbackA = new Feedback(8, 2, 'Low', []); // Sleep 8, Soreness 2
const historyA = [
    new ExercisePerformance('sq', 100, 5, 3, 7), // RPE 7 (Easy)
    new ExercisePerformance('bp', 80, 5, 3, 8),  // RPE 8 (Target)
    new ExercisePerformance('row', 60, 10, 3, 9) // RPE 9 (Hard)
];

const resultA = engine.generateDailyWorkout(user, plannedWorkout, feedbackA, historyA);
console.log(`Readiness: ${resultA.readinessScore}/100`);
console.log("Adjustments:");
resultA.explanations.forEach(exp => console.log(`- ${exp}`));
console.log("New Weights:");
resultA.workout.exercises.forEach(ex => console.log(`  ${ex.name}: ${ex.weight}kg (${ex.sets}x${ex.reps})`));

// Validation A
if (resultA.readinessScore > 80 && resultA.workout.exercises[0].weight > 100) {
    console.log("✅ PASS: Load increased for Squat.");
} else {
    console.log("❌ FAIL: Load logic failed.");
}
console.log("\n");


// --- Scenario B: High Stress/Poor Recovery ---
console.log("--- Scenario B: High Stress (Sleep 5h, High Stress) ---");
const feedbackB = new Feedback(5, 3, 'High', []); // Sleep 5, Stress High
// Same history as A
const resultB = engine.generateDailyWorkout(user, plannedWorkout, feedbackB, historyA);

console.log(`Readiness: ${resultB.readinessScore}/100`);
console.log("Adjustments:");
resultB.explanations.forEach(exp => console.log(`- ${exp}`));
console.log("New Volume:");
resultB.workout.exercises.forEach(ex => console.log(`  ${ex.name}: ${ex.sets} sets`));

// Validation B
if (resultB.readinessScore < 60 && resultB.workout.exercises[0].sets < 3) {
    console.log("✅ PASS: Volume reduced due to low readiness.");
} else {
    console.log("❌ FAIL: Volume logic failed.");
}
console.log("\n");


// --- Scenario C: Injury Protocol ---
console.log("--- Scenario C: Knee Pain ---");
const feedbackC = new Feedback(7, 2, 'Low', ['left_knee']);
const resultC = engine.generateDailyWorkout(user, plannedWorkout, feedbackC, historyA);

console.log(`Readiness: ${resultC.readinessScore}/100`);
console.log("Adjustments:");
resultC.explanations.forEach(exp => console.log(`- ${exp}`));
console.log("Exercises:");
resultC.workout.exercises.forEach(ex => console.log(`  ${ex.name}`));

// Validation C
if (resultC.workout.exercises.some(ex => ex.name === 'Glute Bridge')) {
    console.log("✅ PASS: Squat substituted for Glute Bridge.");
} else {
    console.log("❌ FAIL: Injury substitution failed.");
}
