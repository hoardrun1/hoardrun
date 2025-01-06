import { create } from 'zustand'

interface NavigationState {
  currentPage: string
  previousPage: string
  isTransitioning: boolean
  transitionDirection: 'forward' | 'backward' | 'none'
  navigationStack: string[]
  setCurrentPage: (page: string) => void
  setPreviousPage: (page: string) => void
  setIsTransitioning: (isTransitioning: boolean) => void
  setTransitionDirection: (direction: 'forward' | 'backward' | 'none') => void
  pushToStack: (page: string) => void
  popFromStack: () => void
  clearStack: () => void
}

export const useNavigationStore = create<NavigationState>((set) => ({
  currentPage: '/',
  previousPage: '',
  isTransitioning: false,
  transitionDirection: 'none',
  navigationStack: ['/'],
  setCurrentPage: (page) => set({ currentPage: page }),
  setPreviousPage: (page) => set({ previousPage: page }),
  setIsTransitioning: (isTransitioning) => set({ isTransitioning }),
  setTransitionDirection: (direction) => set({ transitionDirection: direction }),
  pushToStack: (page) =>
    set((state) => ({ navigationStack: [...state.navigationStack, page] })),
  popFromStack: () =>
    set((state) => ({ navigationStack: state.navigationStack.slice(0, -1) })),
  clearStack: () => set({ navigationStack: ['/'] }),
}))

export const navigationService = {
  navigate: async (to: string, options?: { replace?: boolean }) => {
    const store = useNavigationStore.getState()
    
    store.setIsTransitioning(true)
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
    
    store.setTransitionDirection('forward')
    
    // Simulate transition time
    await new Promise(resolve => setTimeout(resolve, 300))
    store.setIsTransitioning(false)
  },

  goBack: async () => {
    const store = useNavigationStore.getState()
    
    if (store.navigationStack.length <= 1) {
      return
    }
    
    store.setIsTransitioning(true)
    store.setPreviousPage(store.currentPage)
    store.popFromStack()
    store.setCurrentPage(store.navigationStack[store.navigationStack.length - 1])
    store.setTransitionDirection('backward')
    
    // Simulate transition time
    await new Promise(resolve => setTimeout(resolve, 300))
    store.setIsTransitioning(false)
  },

  reset: () => {
    const store = useNavigationStore.getState()
    store.clearStack()
    store.setCurrentPage('/')
    store.setPreviousPage('')
    store.setTransitionDirection('none')
    store.setIsTransitioning(false)
  },
} 