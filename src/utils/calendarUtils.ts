interface CalendarEvent {
  id: number;
  startTime: Date;
  endTime: Date;
  [key: string]: any;
}

interface EventPosition {
  left: string;
  width: string;
  zIndex: number;
}

const eventsOverlap = (event1: CalendarEvent, event2: CalendarEvent): boolean => {
  return event1.startTime < event2.endTime && event2.startTime < event1.endTime;
};

const groupOverlappingEvents = (events: CalendarEvent[]): CalendarEvent[][] => {
  const groups: CalendarEvent[][] = [];
  const processed = new Set<number>();

  for (const event of events) {
    if (processed.has(event.id)) continue;

    const group = [event];
    processed.add(event.id);

    for (const otherEvent of events) {
      if (processed.has(otherEvent.id)) continue;

      if (group.some(groupEvent => eventsOverlap(groupEvent, otherEvent))) {
        group.push(otherEvent);
        processed.add(otherEvent.id);
      }
    }

    groups.push(group);
  }

  return groups;
};

export const calculateEventPositions = (events: CalendarEvent[]): Map<number, EventPosition> => {
  const positions = new Map<number, EventPosition>();
  
  if (events.length === 0) return positions;

  const groups = groupOverlappingEvents(events);

  groups.forEach(group => {
    if (group.length === 1) {
      positions.set(group[0].id, {
        left: '2px',
        width: 'calc(100% - 4px)',
        zIndex: 10
      });
          } else {
        const columnWidth = 100 / group.length;
      
              group.forEach((event, index) => {
          const leftPercent = index * columnWidth;
          const widthPercent = columnWidth - 1;
        
        positions.set(event.id, {
          left: `${leftPercent}%`,
          width: `${widthPercent}%`,
          zIndex: 10 + index
        });
      });
    }
  });

  return positions;
};

export const shouldShowEventInHour = (event: CalendarEvent, hour: number): boolean => {
  const eventStartHour = event.startTime.getHours();
  const eventEndHour = event.endTime.getHours();
  const eventStartMinute = event.startTime.getMinutes();
  const eventEndMinute = event.endTime.getMinutes();
  
  return eventStartHour <= hour && (eventEndHour > hour || (eventEndHour === hour && eventEndMinute > 0));
};

export const getEventPositionInHour = (event: CalendarEvent, hour: number) => {
  const eventStartHour = event.startTime.getHours();
  const eventEndHour = event.endTime.getHours();
  const eventStartMinute = event.startTime.getMinutes();
  const eventEndMinute = event.endTime.getMinutes();
  
  const startMinute = hour === eventStartHour ? eventStartMinute : 0;
  const endMinute = hour === eventEndHour ? eventEndMinute : 60;
  
  const top = (startMinute / 60) * 60;
  const height = ((endMinute - startMinute) / 60) * 60;
  
  return { top, height: Math.max(height, 20) };
}; 