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

  // Mirror the image selection heuristic from EventCards so the gallery feels cohesive
  const getEventImage = (event: any) => {
    if (!event) return 'https://picsum.photos/seed/fallback/800/600?grayscale';
    const lower = (event.type || '').toLowerCase();
    const category = lower.includes('tech')
      ? 'tech'
      : lower.includes('dance')
        ? 'people'
        : lower.includes('photo')
          ? 'nature'
          : lower.includes('debate')
            ? 'business'
            : lower.includes('quiz')
              ? 'education'
              : 'abstract';
    return `https://picsum.photos/seed/${event.id}/800/600?category=${category}`;
  };

  return (
    <>
      <div className="mb-8">
        <CircularGallery
          items={events.slice(0, 8).map(e => ({ image: getEventImage(e), text: e.name }))}
        />
      </div>
      <EventCards
        events={events}
      />
      {/* Note: EventCards already handles popup logic internally; keep this fallback if needed for external trigger */}
      <EventPopup isOpen={!!active} event={active} onClose={() => setActive(null)} />
    </>
  );
}
