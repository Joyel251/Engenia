Just a simple webpage for engenia

## Live Leaderboard & Table View

The `Leaderboard` component supports two interactive views:

- Table (default): Animated rows with live polling that smoothly swap positions when ranks change (Kahoot-style). Rank changes show green upward (gain) / red downward (loss) badges. Point deltas are shown beside the total.
- Cards: Original podium (top 3) and department stat cards. Toggle using the Table / Cards switch in the header.

### Component Props

```
<Leaderboard
	departments={initialDepartmentRankings}
	showPodium={settings?.leaderboardVisible}
	live={true}          // enable automatic polling (default true)
	pollIntervalMs={8000} // adjust polling frequency (ms)
/>
```

### Ranking Logic
Ordering priority (same as server):
1. Higher points
2. More first places
3. More second places
4. More total events

### Live Update Mechanism
Client polls `/api/departments` every `pollIntervalMs` milliseconds. Incoming data is normalized and re-ranked, previous ranks & points are stored to compute transitions:
- `rankChange` drives row outline + temporary background highlight
- `pointsChange` shows + / - deltas
Framer Motion `layout` + `layoutId` animate row movement automatically.

### Replacing Polling with Real-Time (Optional)
Swap the polling `useEffect` in `components/Leaderboard.tsx` with a WebSocket / Pusher / Ably subscription and call `setData(updatedDepartments)` using the same transformation & ranking logic.

### Customization Tips
- Adjust animation stiffness/damping where `motion.tr` is defined.
- Change colors for rank or point changes inside the table rendering block.
- Add sounds or confetti on significant rank jumps (e.g., crossing into top 3).

### Performance Notes
- For large department counts, increase `pollIntervalMs` or debounce updates.
- Avoid mutating arrays in place—always replace state with a new sorted array for consistent layout animations.

### Future Ideas
- WebSocket push for instant updates
- Historical trend sparkline per department
- Filter/search bar & division grouping
- Persistent expand row with recent events / more stats

Enjoy building! 🚀
