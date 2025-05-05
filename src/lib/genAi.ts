type WorkoutPlan = {
  schedule: string[];
  exercises: {
    day: string;
    routines: {
      name: string;
      sets: number;
      reps: number;
    }[];
  }[];
};

type DietPlan = {
  dailyCalories: number;
  meals: {
    name: string;
    foods: string[];
  }[];
};

// validate and fix workout plan to ensure it has proper numeric types
export function validateWorkoutPlan(plan: WorkoutPlan) {
  const validatedPlan = {
    schedule: plan.schedule,
    exercises: plan.exercises.map((exercise) => ({
      day: exercise.day,
      routines: exercise.routines.map((routine) => ({
        name: routine.name,
        sets:
          typeof routine.sets === "number"
            ? routine.sets
            : parseInt(routine.sets) || 1,
        reps:
          typeof routine.reps === "number"
            ? routine.reps
            : parseInt(routine.reps) || 10,
      })),
    })),
  };
  return validatedPlan;
}

// validate diet plan to ensure it strictly follows schema
export function validateDietPlan(plan: DietPlan) {
  // only keep the fields we want
  const validatedPlan = {
    dailyCalories: plan.dailyCalories,
    meals: plan.meals.map((meal) => ({
      name: meal.name,
      foods: meal.foods,
    })),
  };
  return validatedPlan;
}

export function getDietPropmt(
  age: number,
  height: number,
  weight: number,
  dietary_restrictions: string,
  fitness_goal: string
) {
  return `You are an experienced nutrition coach creating a personalized diet plan based on:
        Age: ${age}
        Height: ${height}
        Weight: ${weight}
        Fitness goal: ${fitness_goal}
        Dietary restrictions: ${dietary_restrictions}
        
        As a professional nutrition coach:
        - Calculate appropriate daily calorie intake based on the person's stats and goals
        - Create a balanced meal plan with proper macronutrient distribution
        - Include a variety of nutrient-dense foods while respecting dietary restrictions
        - Consider meal timing around workouts for optimal performance and recovery
        
        CRITICAL SCHEMA INSTRUCTIONS:
        - Your output MUST contain ONLY the fields specified below, NO ADDITIONAL FIELDS
        - "dailyCalories" MUST be a NUMBER, not a string
        - DO NOT add fields like "supplements", "macros", "notes", or ANYTHING else
        - ONLY include the EXACT fields shown in the example below
        - Each meal should include ONLY a "name" and "foods" array

        Return a JSON object with this EXACT structure and no other fields:
        {
          "dailyCalories": 2000,
          "meals": [
            {
              "name": "Breakfast",
              "foods": ["Oatmeal with berries", "Greek yogurt", "Black coffee"]
            },
            {
              "name": "Lunch",
              "foods": ["Grilled chicken salad", "Whole grain bread", "Water"]
            }
          ]
        }
        
        DO NOT add any fields that are not in this example. Your response must be a valid JSON object with no additional text.`;
}

export function getWorkoutPropmt(
  age: number,
  height: number,
  weight: number,
  injuries: string,
  workout_days: string,
  fitness_goal: string,
  fitness_level: string
) {
  return `You are an experienced fitness coach creating a personalized workout plan based on:
        Age: ${age}
        Height: ${height}
        Weight: ${weight}
        Injuries or limitations: ${injuries}
        Available days for workout: ${workout_days}
        Fitness goal: ${fitness_goal}
        Fitness level: ${fitness_level}
        
        As a professional coach:
        - Consider muscle group splits to avoid overtraining the same muscles on consecutive days
        - Design exercises that match the fitness level and account for any injuries
        - Structure the workouts to specifically target the user's fitness goal
        
        CRITICAL SCHEMA INSTRUCTIONS:
        - Your output MUST contain ONLY the fields specified below, NO ADDITIONAL FIELDS
        - "sets" and "reps" MUST ALWAYS be NUMBERS, never strings
        - For example: "sets": 3, "reps": 10
        - Do NOT use text like "reps": "As many as possible" or "reps": "To failure"
        - Instead use specific numbers like "reps": 12 or "reps": 15
        - For cardio, use "sets": 1, "reps": 1 or another appropriate number
        - NEVER include strings for numerical fields
        - NEVER add extra fields not shown in the example below
        
        Return a JSON object with this EXACT structure:
        {
          "schedule": ["Monday", "Wednesday", "Friday"],
          "exercises": [
            {
              "day": "Monday",
              "routines": [
                {
                  "name": "Exercise Name",
                  "sets": 3,
                  "reps": 10
                }
              ]
            }
          ]
        }
        
        DO NOT add any fields that are not in this example. Your response must be a valid JSON object with no additional text.`;
}
