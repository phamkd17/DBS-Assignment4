import type { PlannedExercise } from "./types";

// Copied into each new user's templates the first time they open the app; after that they're the user's to edit.
// Snapshots are stored here (not fetched from wger) so a new account works even when wger is down.
// Exercise IDs were chosen for correct wger labels: e.g. #687 "Overhead Press" is filed under Chest, so we use #566.
export const STARTER_TEMPLATES: {
  name: string;
  exercises: PlannedExercise[];
}[] = [
  {
    name: "Push Day",
    exercises: [
      {
        exercise_id: 73,
        name: "Bench Press",
        category: "Chest",
        muscles: ["Chest"],
        image: "https://wger.de/media/exercise-images/192/Bench-press-1.png",
      },
      {
        exercise_id: 566,
        name: "Shoulder Press, Barbell",
        category: "Shoulders",
        muscles: ["Shoulders"],
        image:
          "https://wger.de/media/exercise-images/119/seated-barbell-shoulder-press-large-1.png",
      },
      {
        exercise_id: 348,
        name: "Lateral Raises",
        category: "Shoulders",
        muscles: ["Shoulders"],
        image:
          "https://wger.de/media/exercise-images/148/lateral-dumbbell-raises-large-2.png",
      },
      {
        exercise_id: 1185,
        name: "Triceps Pushdown",
        category: "Arms",
        muscles: ["Triceps"],
        image:
          "https://wger.de/media/exercise-images/1185/c5ca283d-8958-4fd8-9d59-a3f52a3ac66b.jpg",
      },
    ],
  },
  {
    name: "Pull Day",
    exercises: [
      {
        exercise_id: 475,
        name: "Pull-ups",
        category: "Back",
        muscles: ["Lats"],
        image:
          "https://wger.de/media/exercise-images/475/b0554016-16fd-4dbe-be47-a2a17d16ae0e.jpg",
      },
      {
        exercise_id: 1698,
        name: "Barbell Row (Overhand)",
        category: "Back",
        muscles: ["Lats"],
        image: null,
      },
      {
        exercise_id: 272,
        name: "Hammer Curls",
        category: "Arms",
        muscles: ["Biceps"],
        image:
          "https://wger.de/media/exercise-images/86/Bicep-hammer-curl-1.png",
      },
    ],
  },
  {
    name: "Leg Day",
    exercises: [
      {
        exercise_id: 1801,
        name: "Barbell Full Squat",
        category: "Legs",
        muscles: ["Hamstrings", "Glutes", "Quads"],
        image:
          "https://wger.de/media/exercise-images/1801/60043328-1cfb-4289-9865-aaf64d5aaa28.jpg",
      },
      {
        exercise_id: 507,
        name: "Romanian Deadlift",
        category: "Legs",
        muscles: ["Hamstrings", "Glutes"],
        image:
          "https://wger.de/media/exercise-images/507/13d526ab-12fc-461e-828a-051dd7c13fb1.png",
      },
      {
        exercise_id: 365,
        name: "Leg Curls (laying)",
        category: "Legs",
        muscles: ["Hamstrings"],
        image:
          "https://wger.de/media/exercise-images/154/lying-leg-curl-machine-large-1.png",
      },
      {
        exercise_id: 622,
        name: "Standing Calf Raises",
        category: "Calves",
        muscles: ["Calves"],
        image:
          "https://wger.de/media/exercise-images/622/9a429bd0-afd3-4ad0-8043-e9beec901c81.jpeg",
      },
    ],
  },
  {
    name: "Upper Body",
    exercises: [
      {
        exercise_id: 73,
        name: "Bench Press",
        category: "Chest",
        muscles: ["Chest"],
        image: "https://wger.de/media/exercise-images/192/Bench-press-1.png",
      },
      {
        exercise_id: 1698,
        name: "Barbell Row (Overhand)",
        category: "Back",
        muscles: ["Lats"],
        image: null,
      },
      {
        exercise_id: 566,
        name: "Shoulder Press, Barbell",
        category: "Shoulders",
        muscles: ["Shoulders"],
        image:
          "https://wger.de/media/exercise-images/119/seated-barbell-shoulder-press-large-1.png",
      },
      {
        exercise_id: 475,
        name: "Pull-ups",
        category: "Back",
        muscles: ["Lats"],
        image:
          "https://wger.de/media/exercise-images/475/b0554016-16fd-4dbe-be47-a2a17d16ae0e.jpg",
      },
    ],
  },
  {
    name: "Lower Body",
    exercises: [
      {
        exercise_id: 1801,
        name: "Barbell Full Squat",
        category: "Legs",
        muscles: ["Hamstrings", "Glutes", "Quads"],
        image:
          "https://wger.de/media/exercise-images/1801/60043328-1cfb-4289-9865-aaf64d5aaa28.jpg",
      },
      {
        exercise_id: 507,
        name: "Romanian Deadlift",
        category: "Legs",
        muscles: ["Hamstrings", "Glutes"],
        image:
          "https://wger.de/media/exercise-images/507/13d526ab-12fc-461e-828a-051dd7c13fb1.png",
      },
      {
        exercise_id: 206,
        name: "Dumbbell Lunges Walking",
        category: "Legs",
        muscles: ["Quads"],
        image: "https://wger.de/media/exercise-images/113/Walking-lunges-1.png",
      },
      {
        exercise_id: 622,
        name: "Standing Calf Raises",
        category: "Calves",
        muscles: ["Calves"],
        image:
          "https://wger.de/media/exercise-images/622/9a429bd0-afd3-4ad0-8043-e9beec901c81.jpeg",
      },
    ],
  },
];
