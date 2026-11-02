import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { formatVisit, reminderTime } from './visitTime';

const PREFIX = 'partykingdom-visit-';
const CHANNEL = 'partykingdom-visits';
let queue = Promise.resolve();
if (Platform.OS !== 'web') {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({ shouldShowAlert: true, shouldShowBanner: true, shouldShowList: true, shouldPlaySound: true, shouldSetBadge: false }),
  });
}
function allowed(permission) {
  return permission.granted || permission.ios?.status === Notifications.IosAuthorizationStatus?.PROVISIONAL;
}
export async function requestReminderPermission() {
  if (Platform.OS === 'web') return false;
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync(CHANNEL, { name: 'Visit reminders', importance: Notifications.AndroidImportance.DEFAULT });
  }
  let permission = await Notifications.getPermissionsAsync();
  if (!allowed(permission) && permission.canAskAgain) permission = await Notifications.requestPermissionsAsync();
  return allowed(permission);
}
// Serial reconciliation prevents tab refreshes and account changes from leaving
// duplicate or cross-account notifications. We only touch this feature's IDs.
export function syncReminders(visits, owner) {
  const task = async () => {
    const result = {};
    if (Platform.OS === 'web') {
      visits.forEach((v) => { result[v.id] = v.reminder_hours ? 'unavailable' : 'off'; });
      return result;
    }
    const scheduled = await Notifications.getAllScheduledNotificationsAsync();
    const permission = await Notifications.getPermissionsAsync();
    const canNotify = allowed(permission);
    const desired = new Map();
    for (const visit of visits) {
      if (!visit.reminder_hours) { result[visit.id] = 'off'; continue; }
      if (reminderTime(visit) <= Date.now()) { result[visit.id] = 'elapsed'; continue; }
      if (!canNotify) { result[visit.id] = 'permission'; continue; }
      const identifier = `${PREFIX}${owner}-${visit.id}`;
      const signature = `${visit.kind}|${visit.starts_at}|${visit.reminder_hours}`;
      desired.set(identifier, { visit, signature });
    }
    const existing = new Map();
    for (const item of scheduled.filter((item) => item.identifier.startsWith(PREFIX))) {
      const wanted = desired.get(item.identifier);
      if (!wanted || item.content.data?.signature !== wanted.signature) {
        await Notifications.cancelScheduledNotificationAsync(item.identifier);
      } else existing.set(item.identifier, item);
    }
    if (Platform.OS === 'android' && desired.size) {
      await Notifications.setNotificationChannelAsync(CHANNEL, { name: 'Visit reminders', importance: Notifications.AndroidImportance.DEFAULT });
    }
    for (const [identifier, { visit, signature }] of desired) {
      if (existing.has(identifier)) { result[visit.id] = 'scheduled'; continue; }
      try {
        const trigger = { date: new Date(reminderTime(visit)), channelId: CHANNEL };
        if (Notifications.SchedulableTriggerInputTypes) trigger.type = Notifications.SchedulableTriggerInputTypes.DATE;
        await Notifications.scheduleNotificationAsync({
          identifier,
          content: {
            title: 'Your Party Kingdom visit is coming up',
            body: `${visit.kind}: ${formatVisit(visit.starts_at)}. Remember your grip socks!`,
            sound: 'default', data: { visitId: visit.id, signature },
          },
          trigger,
        });
        result[visit.id] = 'scheduled';
      } catch { result[visit.id] = 'error'; }
    }
    return result;
  };
  const result = queue.then(task, task);
  queue = result.catch(() => {});
  return result;
}
export function clearOtherOwnerReminders(owner) {
  const task = async () => {
    if (Platform.OS === 'web') return;
    const scheduled = await Notifications.getAllScheduledNotificationsAsync();
    for (const item of scheduled) {
      if (item.identifier.startsWith(PREFIX) && !item.identifier.startsWith(`${PREFIX}${owner}-`)) {
        await Notifications.cancelScheduledNotificationAsync(item.identifier);
      }
    }
  };
  const result = queue.then(task, task);
  queue = result.catch(() => {});
  return result;
}
export const REMINDER_STATUS = {
  off: 'No reminder', scheduled: 'Reminder scheduled on this phone',
  elapsed: 'Reminder time has passed', permission: 'Notifications are off — enable them in phone settings',
  unavailable: 'Phone reminders are unavailable in the web preview', error: 'Reminder could not be scheduled — try refreshing',
};
