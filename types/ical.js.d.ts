declare module 'ical.js' {
  namespace ICAL {
    interface Component {
      name: string
      getAllSubcomponents(name?: string): Component[]
      getFirstPropertyValue(name: string): any
      getFirstProperty(name: string): Property | null
      getAllProperties(name?: string): Property[]
    }

    interface Property {
      name: string
      getFirstValue(): any
      getValues(): any[]
      getParameter(name: string): string | null
    }

    interface Time {
      toJSDate(): Date
      toString(): string
    }

    interface Event {
      summary: string
      startDate: Time
      endDate: Time
      description: string
      location: string
      uid: string
      component: Component
    }

    function parse(input: string): any[]
    
    const Component: {
      new (data: any): Component
      fromString(str: string): Component
    }
    
    const Time: {
      new (data: any): Time
      fromString(str: string): Time
    }
    
    const Event: {
      new (component: Component): Event
    }
  }

  export = ICAL
}
