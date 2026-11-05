
import { create } from 'zustand';
import { bindUserStorage } from './userScopedStorage';

const useTodoStore = create(
  (set) => ({
    todos: [],

    addTodo: (text) =>
      set((state) => ({
        todos: [
          ...state.todos,
          {
            id: Date.now(),
            text,
            completed: false
          }
        ]
      })),

    toggleTodo: (id) =>
      set((state) => ({
        todos: state.todos.map((todo) =>
          todo.id === id
            ? { ...todo, completed: !todo.completed }
            : todo
        )
      })),

    updateTodo: (id, newText) =>
      set((state) => ({
        todos: state.todos.map((todo) =>
          todo.id === id
            ? { ...todo, text: newText }
            : todo
        )
      })),

    deleteTodo: (id) =>
      set((state) => ({
        todos: state.todos.filter(
          (todo) => todo.id !== id
        )
      }))
  })
);

bindUserStorage(useTodoStore, {
  prefix: 'todo-storage',
  fields: ['todos'],
  defaults: () => ({
    todos: []
  })
});

export default useTodoStore;
