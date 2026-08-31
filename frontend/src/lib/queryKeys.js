/**
 * Central query key factory. Every hook imports from here instead of
 * hand-writing key arrays, so a single upload mutation can invalidate
 * "everything about this PO" in one place without hunting through every
 * hook file for the right string.
 */
export const queryKeys = {
  documents: {
    all: ["documents"],
    list: (filters) => ["documents", "list", filters],
    detail: (id) => ["documents", "detail", id],
  },
 
  match: {
    detail: (poNumber) => ["match", poNumber],
  },
 
  summary: {
    detail: (poNumber) => ["summary", poNumber],
  },
 
  skuMasters: {
    all: ["skuMasters"],
    detail: (id) => ["skuMasters", "detail", id],
  },
};
 
/**
 * Call after any successful upload/mutation tied to a poNumber - invalidates
 * every query that could be stale as a result (documents list, match,
 * summary). GET /match and /summary always recompute server-side, but the
 * client cache still needs telling to refetch.
 */
export const invalidatePoNumberQueries = (queryClient, poNumber) => {
  queryClient.invalidateQueries({ queryKey: queryKeys.documents.all });
  queryClient.invalidateQueries({ queryKey: queryKeys.match.detail(poNumber) });
  queryClient.invalidateQueries({ queryKey: queryKeys.summary.detail(poNumber) });
};