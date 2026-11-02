export const VISIT_KINDS = ['Open Jump', 'Birthday Party', 'Other'];
export const REMINDER_OPTIONS = [
  { value: 0, label: 'No reminder' }, { value: 48, label: '2 days before' },
  { value: 24, label: '1 day before' }, { value: 2, label: '2 hours before' },
];
const TIME_ZONE = 'America/Los_Angeles';
function parts(date) {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: TIME_ZONE, year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
  });
  return Object.fromEntries(formatter.formatToParts(date).map(({ type, value }) => [type, value]));
}
export function visitInputs(iso) {
  const p = parts(new Date(iso));
  return { date: `${p.year}-${p.month}-${p.day}`, time: `${p.hour}:${p.minute}` };
}
// Modern California dates use UTC-7 or UTC-8. Verify the wall clock in
// America/Los_Angeles instead of using the phone's zone or guessing DST.
export function parseVisitTime(date, time, now = Date.now()) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !/^\d{2}:\d{2}$/.test(time)) {
    throw new Error('Use YYYY-MM-DD for the date and HH:mm for the time (24-hour format).');
  }
  const [y, m, d] = date.split('-').map(Number);
  const [h, min] = time.split(':').map(Number);
  if (y < 2020 || y > 2100 || m < 1 || m > 12 || d < 1 || d > 31 || h > 23 || min > 59) throw new Error('Enter a valid date and time.');
  const utc = Date.UTC(y, m - 1, d, h, min);
  const matches = [7, 8].map((offset) => utc + offset * 3600000).filter((ms) => {
    const p = visitInputs(new Date(ms).toISOString());
    return p.date === date && p.time === time;
  });
  if (!matches.length) throw new Error('That date or California time does not exist. Please choose another time.');
  if (matches.length > 1) throw new Error('That time occurs twice during the clock change. Please choose an unambiguous time.');
  if (matches[0] <= now) throw new Error('Choose a visit time in the future.');
  return new Date(matches[0]).toISOString();
}
export function validateVisit(input, now = Date.now()) {
  if (!VISIT_KINDS.includes(input.kind)) throw new Error('Choose a visit type.');
  const starts_at = parseVisitTime(input.date.trim(), input.time.trim(), now);
  const reminder_hours = Number(input.reminder_hours);
  if (!REMINDER_OPTIONS.some((option) => option.value === reminder_hours)) throw new Error('Choose a reminder option.');
  if (reminder_hours && new Date(starts_at).getTime() - reminder_hours * 3600000 <= now) {
    throw new Error('That reminder time has already passed. Choose a shorter reminder or no reminder.');
  }
  const reference = (input.reference || '').trim();
  if (reference.length > 80) throw new Error('Keep the booking reference under 80 characters.');
  return { kind: input.kind, starts_at, reminder_hours, reference };
}
export function formatVisit(iso) {
  return new Intl.DateTimeFormat('en-US', {
    timeZone: TIME_ZONE, weekday: 'short', month: 'short', day: 'numeric',
    year: 'numeric', hour: 'numeric', minute: '2-digit', timeZoneName: 'short',
  }).format(new Date(iso));
}
export function reminderTime(visit) {
  return new Date(visit.starts_at).getTime() - visit.reminder_hours * 3600000;
}
