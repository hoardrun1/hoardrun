import { create } from 'zustand'

interface NavigationState {
  currentPage: string
  previousPage: string
  navigationStack: string[]
  setCurrentPage: (page: string) => void
  setPreviousPage: (page: string) => void
  pushToStack: (page: string) => void
  popFromStack: () => void
  clearStack: () => void
}

export const useNavigationStore = create<NavigationState>((set) => ({
  currentPage: '/',
  previousPage: '',
  navigationStack: ['/'],
  setCurrentPage: (page) => set({ currentPage: page }),
  setPreviousPage: (page) => set({ previousPage: page }),
  pushToStack: (page) =>
    set((state) => ({ navigationStack: [...state.navigationStack, page] })),
  popFromStack: () =>
    set((state) => ({ navigationStack: state.navigationStack.slice(0, -1) })),
  clearStack: () => set({ navigationStack: ['/'] }),
}))

export const navigationService = {
  navigate: async (to: string, options?: { replace?: boolean }) => {
    const store = useNavigationStore.getState()
    store.setPreviousPage(store.currentPage)
    store.setCurrentPage(to)
    if (options?.replace) {
      const newStack = [...store.navigationStack]
      newStack[newStack.length - 1] = to
      store.clearStack()
      newStack.forEach(page => store.pushToStack(page))
    } else {
      store.pushToStack(to)
    }
  },

  goBack: async () => {
    const store = useNavigationStore.getState()
    if (store.navigationStack.length <= 1) {
      return
    }
    store.setPreviousPage(store.currentPage)
    store.popFromStack()
    store.setCurrentPage(store.navigationStack[store.navigationStack.length - 1])
  },

  reset: () => {
    const store = useNavigationStore.getState()
    store.clearStack()
    store.setCurrentPage('/')
    store.setPreviousPage('')
  },
}