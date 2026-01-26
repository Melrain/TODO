import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type FilterState = {
  status?: string
  category?: string
  priority?: string
}

type TaskStore = {
  // Filter state
  filters: FilterState
  setFilters: (filters: FilterState) => void
  resetFilters: () => void
  
  // UI state
  isTaskFormOpen: boolean
  setTaskFormOpen: (open: boolean) => void
  
  // Loading state
  isLoading: boolean
  setIsLoading: (loading: boolean) => void
  
  // Refresh trigger
  refreshTrigger: number
  triggerRefresh: () => void
}

export const useTaskStore = create<TaskStore>()(
  persist(
    (set) => ({
      // Filter state
      filters: {},
      setFilters: (filters) => set({ filters }),
      resetFilters: () => set({ filters: {} }),
      
      // UI state
      isTaskFormOpen: false,
      setTaskFormOpen: (open) => set({ isTaskFormOpen: open }),
      
      // Loading state
      isLoading: false,
      setIsLoading: (loading) => set({ isLoading: loading }),
      
      // Refresh trigger
      refreshTrigger: 0,
      triggerRefresh: () => set((state) => ({ refreshTrigger: state.refreshTrigger + 1 })),
    }),
    {
      name: 'task-store',
      partialize: (state) => ({
        filters: state.filters, // Only persist filters
      }),
    }
  )
)
