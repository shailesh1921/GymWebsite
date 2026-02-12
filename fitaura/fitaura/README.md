# Adaptive Training Engine

A rule-based, transparent workout adjustment system that mimics how an experienced strength & conditioning coach would modify training programs based on user performance and recovery.

## 🎯 Project Goals

- **Automatic Adjustment**: Modify workout variables (load, volume) based on performance and recovery
- **Transparent Logic**: No black-box AI - every decision is explainable
- **Coach-Like Decisions**: Prioritize injury prevention, sustainable progression, and adherence
- **Honest Limitations**: Conservative, evidence-based autoregulation

## 📊 System Inputs

The engine requires the following user data:

1. **Exercise Performance**: Weight, reps completed
2. **Perceived Effort**: RPE (1-10 scale)
3. **Sleep Quality**: Hours slept or 1-5 scale
4. **Missed Sessions**: Boolean flag
5. **Pain/Injury Flags**: Body part + severity

## 🧠 System Outputs

For every workout, the engine provides:

1. **Adjusted Load**: % increase/decrease with reasoning
2. **Adjusted Volume**: Modified sets/reps
3. **Exercise Substitutions**: When injury risk is detected
4. **Deload Recommendations**: When fatigue accumulates
5. **Written Explanations**: Clear, coach-like rationale for every change

## 🏗️ Architecture

```
├── models.js           # Data structures (User, Workout, Exercise, Feedback)
├── training_engine.js  # Core decision logic
├── autoregulator.js    # Load/volume calculation
├── transparency.js     # Explanation generation
├── server.js           # REST API (Express)
└── public/
    └── index.html      # Interactive dashboard
```

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Start the Server
```bash
node server.js
```

### 3. Open the Dashboard
Navigate to `http://localhost:3000` in your browser.

## 📡 API Usage

### Endpoint
`POST http://localhost:3000/api/workout/generate`

### Request Payload
```json
{
  "user": { "id": "u1", "name": "John Doe" },
  "plannedWorkout": {
    "id": "w1",
    "userId": "u1",
    "name": "Leg Day",
    "exercises": [
      {
        "id": "sq",
        "name": "Barbell Squat",
        "type": "compound",
        "muscleGroups": ["quads"],
        "weight": 100,
        "sets": 3,
        "reps": 5,
        "rpeTarget": 8
      }
    ]
  },
  "feedback": {
    "sleepQuality": 7,
    "soreness": 2,
    "stressLevel": "Low",
    "painFlags": []
  },
  "history": [
    {
      "exerciseId": "sq",
      "weight": 100,
      "completedReps": 5,
      "completedSets": 3,
      "rpe": 7
    }
  ]
}
```

### Response
```json
{
  "status": "success",
  "data": {
    "readinessScore": 85,
    "workout": {
      "exercises": [
        {
          "name": "Barbell Squat",
          "weight": 102.5,
          "sets": 3,
          "reps": 5
        }
      ]
    },
    "explanations": [
      "🚀 Go Mode: You crushed the last session (RPE 7). We're adding 2.5kg to keep you in the growth zone. Expect this to feel like an RPE 8."
    ]
  }
}
```

## 🧪 Testing

Run the scenario tests:
```bash
node test_scenarios.js
```

This will simulate:
- **Scenario A**: Ideal progression (good recovery, RPE 7)
- **Scenario B**: High stress/poor recovery
- **Scenario C**: Injury substitution (knee pain)

## 🔬 Decision Logic

### Readiness Calculation
```
Base Score: 80/100
- Sleep < 5h: -20
- Sleep < 7h: -10
- Sleep > 8h: +5
- Soreness > 3: -10
- Soreness = 5: -30
- High Stress: -15
```

### Load Adjustment Rules
- **RPE < Target - 1**: Increase load by 2.5%
- **RPE ≥ 9.5**: Decrease load by 5%
- **Missed Reps**: Decrease load by 5%
- **Otherwise**: Maintain

### Volume Adjustment Rules
- **Readiness < 40**: Cut volume by 50% (Deload)
- **Readiness < 60**: Cut volume by 20%
- **Readiness ≥ 60**: Maintain or progress

### Injury Protocol
If pain is reported:
1. Identify risky exercises for that body part
2. Substitute with lower-impact alternatives
3. Explain the substitution to the user

## 📈 Example Scenarios

### Good Recovery → Load Increase
**Input**: Sleep 8h, RPE 7 (easy)  
**Output**: Weight +2.5kg  
**Explanation**: "You crushed the last session (RPE 7). We're adding 2.5kg to keep you in the growth zone."

### Poor Recovery → Volume Reduction
**Input**: Sleep 5h, High Stress  
**Output**: Sets reduced from 3 to 2  
**Explanation**: "Sleep and stress are impacting recovery. We've removed 1 set to reduce systemic fatigue."

### Knee Pain → Exercise Substitution
**Input**: Pain flag: "knee"  
**Output**: Squat → Glute Bridge  
**Explanation**: "You flagged knee discomfort. We've swapped Squats for Glute Bridges to train legs without aggravating the joint."

## 🎨 Dashboard Features

The web dashboard (`http://localhost:3000`) provides:
- **Interactive Inputs**: Adjust sleep, soreness, stress, pain, and RPE
- **Real-Time Adjustments**: See how changes affect the workout
- **Visual Feedback**: Readiness score with color coding
- **Transparent Explanations**: Every adjustment is explained

## 🛠️ Technology Stack

- **Backend**: Node.js + Express
- **Logic**: Pure JavaScript (no ML frameworks)
- **Frontend**: Vanilla HTML/CSS/JS
- **Principles**: Autoregulation, RPE-based training, conservative progression

## 📝 Limitations (By Design)

- **No Wearables**: Relies on subjective user input
- **No Periodization**: MVP focuses on session-to-session adjustments
- **Limited Exercise Database**: Simplified substitution logic
- **2 Goals Only**: Hypertrophy and fat loss (no powerlifting/Olympic lifting)

## 🔮 Future Enhancements

- Database integration for workout history
- User authentication
- Progressive overload tracking over weeks/months
- Exercise library with biomechanical risk profiles
- Mobile app (React Native)

## 📄 License

MIT

## 👤 Author

Built for Fitaura - A fitness platform focused on sustainable, intelligent training.
