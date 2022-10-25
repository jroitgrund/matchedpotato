import create from "zustand";

import { SearchRequest } from "./client";

export type Filters = Omit<SearchRequest, "color">;

interface Store {
  imageData: string | undefined;
  setImageData: (imageData: string) => void;
  filters: Filters;
  setFilters: (filters: Filters) => void;
}

export const useStore = create<Store>((set) => ({
  imageData: undefined,
  setImageData: (imageData) => set((s) => ({ ...s, imageData })),
  filters: {},
  setFilters: (filters) => set((s) => ({ ...s, filters })),
}));
