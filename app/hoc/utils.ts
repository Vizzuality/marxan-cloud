export function mergeDehydratedState(
  prevDehydratedState = { mutations: [], queries: [] },
  newDehydratedState = { mutations: [], queries: [] },
) {
  return {
    mutations: [
      ...prevDehydratedState.mutations,
      ...newDehydratedState.mutations,
    ],
    queries: [
      ...prevDehydratedState.queries,
      ...newDehydratedState.queries,
    ],
  };
}
