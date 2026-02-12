/**
 * transparency.js
 * Generates user-friendly explanations for training adjustments.
 */

class TransparencyService {
    /**
     * @param {string} adjustmentType - "LOAD_INCREASE", "LOAD_DECREASE", "VOLUME_REDUCTION", "DELOAD", "INJURY_SUBSTITUTION", "MAINTENANCE"
     * @param {Object} context - Data relevant to the decision (e.g., sleep hours, pain location, last RPE)
     * @returns {string} - Explanation text
     */
    static explainAdjustment(adjustmentType, context) {
        switch (adjustmentType) {
            case "LOAD_INCREASE":
                return `🚀 **Go Mode**: You crushed the last session (RPE ${context.lastRpe}). We're adding ${context.increaseAmount}kg to keep you in the growth zone. Expect this to feel like an RPE 8.`;

            case "LOAD_DECREASE":
                return `📉 **Reset**: Last session was a grind (RPE ${context.lastRpe}). We're dropping the weight by 5% to help you master the form and build confidence. Perfect technique first!`;

            case "VOLUME_REDUCTION":
                return `🔋 **Energy Saver**: Short sleep (${context.sleepHours}h) or high stress means recovery is expensive today. We cut ${context.setsRemoved} sets to prevent overtraining. You'll stimulate muscle without digging a hole.`;

            case "DELOAD":
                return `🛑 **Deload Week**: You've been pushing hard. Your recovery markers are trending down. We're dropping intensity by 40% this week to let your nervous system rebound. You'll come back stronger next week.`;

            case "INJURY_SUBSTITUTION":
                return `🩹 **Injury Prevention**: You flagged ${context.painLocation} discomfort. We've swapped ${context.originalExercise} for ${context.newExercise} today to train the muscles without aggravating the joint. If pain persists > 24hrs, please rest.`;

            case "MAINTENANCE":
                return `✅ **Steady State**: Sticking to the plan. Consistency is key right now. Focus on perfect reps.`;

            default:
                return "Adjusting your plan based on recent performance.";
        }
    }
}

module.exports = TransparencyService;
