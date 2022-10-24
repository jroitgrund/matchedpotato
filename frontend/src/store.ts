import create from "zustand";

interface Store {
  imageData: string | undefined;
  setImageData: (imageData: string) => void;
}

export const useStore = create<Store>((set) => ({
  imageData: undefined,
  setImageData: (imageData) => set(() => ({ imageData })),
}));
