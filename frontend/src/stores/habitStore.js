
import { create } from 'zustand';
import { bindUserStorage } from './userScopedStorage';

const useHabitStore = create(
  (set, get) => ({
    habits: [],
    lastResetDate: new Date().toDateString(),

    addHabit: (text) =>
      set((state) => ({
        habits: [
          ...state.habits,
          {
            id: Date.now(),
            text,
            completed: false,
            streak: 0,
            maxStreak: 0,
            lastCompleted: null
          }
        ]
      })),

    toggleHabit: (id) => {
      const now = new Date();
      const today = now.toDateString();
      const yesterday = new Date(
        now.getTime() - 86400000
      ).toDateString();

      const { habits, lastResetDate } = get();

      if (today !== lastResetDate) {
        set({
          habits: habits.map((habit) => ({
            ...habit,
            completed: false,
            maxStreak: habit.completed
              ? Math.max(habit.streak, habit.maxStreak)
              : habit.maxStreak
          })),
          lastResetDate: today
        });
        return;
      }

      set({
        habits: habits.map((habit) => {
          if (habit.id === id) {
            const newCompleted = !habit.completed;
            let newStreak = habit.streak;

            if (newCompleted) {
              if (habit.lastCompleted === yesterday) {
                newStreak = habit.streak + 1;
              } else {
                newStreak = 1;
              }
            } else {
              if (habit.lastCompleted === today) {
                newStreak = 0;
              }
            }

            return {
              ...habit,
              completed: newCompleted,
              streak: newStreak,
              lastCompleted: newCompleted
                ? today
                : habit.lastCompleted
            };
          }

          return habit;
        })
      });
    },

    updateHabit: (id, newText) =>
      set((state) => ({
        habits: state.habits.map((habit) =>
          habit.id === id
            ? { ...habit, text: newText }
            : habit
        )
      })),

    deleteHabit: (id) =>
      set((state) => ({
        habits: state.habits.filter(
          (habit) => habit.id !== id
        )
      }))
  })
);

bindUserStorage(useHabitStore, {
  prefix: 'habit-storage',
  fields: ['habits', 'lastResetDate'],
  defaults: () => ({
    habits: [],
    lastResetDate: new Date().toDateString()
  })
});

export default useHabitStore;
