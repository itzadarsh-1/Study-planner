
import { useAuthStore } from './authStore';

export function bindUserStorage(
  store,
  { prefix, fields, defaults }
) {
  let activeUserId = null;
  let isSwitching = false;

  const getUserId = (user) => {
    const id = user?._id ?? user?.id;
    return id ? String(id) : null;
  };

  const storageKey = (userId) =>
    `${prefix}:user:${userId}`;

  const resetStore = () => {
    store.setState(defaults());
  };

  const loadUserData = (userId) => {
    const values = defaults();

    if (!userId) return values;

    try {
      const raw = localStorage.getItem(
        storageKey(userId)
      );

      if (!raw) return values;

      const saved = JSON.parse(raw);

      if (!saved || typeof saved !== 'object') {
        return values;
      }

      for (const field of fields) {
        if (
          Object.prototype.hasOwnProperty.call(
            saved,
            field
          )
        ) {
          values[field] = saved[field];
        }
      }
    } catch (error) {
      console.error(
        'Failed to load user storage:',
        error
      );
    }

    return values;
  };

  const switchUser = (user) => {
    const newUserId = getUserId(user);

    if (newUserId === activeUserId) return;

    isSwitching = true;

    try {
      activeUserId = newUserId;

      // Always replace previous user's data
      if (!newUserId) {
        resetStore();
      } else {
        store.setState(
          loadUserData(newUserId)
        );
      }
    } finally {
      isSwitching = false;
    }
  };

  // Initialize with empty data
  isSwitching = true;
  resetStore();
  isSwitching = false;

  // Save only current authenticated user's data
  store.subscribe((state) => {
    if (isSwitching || !activeUserId) {
      return;
    }

    const data = {};

    for (const field of fields) {
      data[field] = state[field];
    }

    try {
      localStorage.setItem(
        storageKey(activeUserId),
        JSON.stringify(data)
      );
    } catch (error) {
      console.error(
        'Failed to save user storage:',
        error
      );
    }
  });

  // Detect login, logout and account changes
  useAuthStore.subscribe((state) => {
    switchUser(state.authUser);
  });

  // Load currently authenticated user's data
  switchUser(
    useAuthStore.getState().authUser
  );
}
