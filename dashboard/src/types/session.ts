export type User = {
    username: string
    link: string
  }


export type Session = {
    graph: any
    constraints: string[]
    users: User[]
  }
  
  // "This will allow you to update the state within the context whenever you need to."
  export interface SessionContextProps {
      propertyForm: Session | null
      updatePropertyForm: (property: Partial<Session>) => void
  }