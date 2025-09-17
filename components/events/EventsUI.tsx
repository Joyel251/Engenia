"use client";
import React, { useState } from 'react';
import EventCards from '@/components/event-cards';
import EventPopup from '../EventPopup';
import CircularGallery from '../CircularGallery';

interface EventsUIProps {
  events: any[];
}

export default function EventsUI({ events }: EventsUIProps) {
  const [active, setActive] = useState<any | null>(null);

  return (
    <>
      <CircularGallery
        items={events.slice(0, 8).map(e => ({ id: e.id, title: e.name }))}
        className="mb-8"
      />
      <EventCards
        events={events}
        onSelect={(e: any) => setActive(e)}
      />
      <EventPopup open={!!active} event={active} onClose={() => setActive(null)} />
    </>
  );
}
