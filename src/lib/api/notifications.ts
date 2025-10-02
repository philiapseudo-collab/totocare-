import { supabase } from '@/integrations/supabase/client';

export interface NotificationPayload {
  userId: string;
  type: 'appointment' | 'vaccination' | 'screening' | 'general';
  title: string;
  message: string;
  scheduledFor?: string;
}

export const notificationsApi = {
  /**
   * Send a notification to a user
   */
  async sendNotification(payload: NotificationPayload) {
    const { data, error } = await supabase.functions.invoke('send-notification', {
      body: payload,
    });

    if (error) throw error;
    return data;
  },

  /**
   * Send appointment reminder
   */
  async sendAppointmentReminder(appointmentId: string, userId: string, appointmentDate: string) {
    return this.sendNotification({
      userId,
      type: 'appointment',
      title: 'Appointment Reminder',
      message: `You have an upcoming appointment on ${new Date(appointmentDate).toLocaleDateString()}.`,
      scheduledFor: appointmentDate,
    });
  },

  /**
   * Send vaccination reminder
   */
  async sendVaccinationReminder(vaccinationId: string, userId: string, vaccineName: string, scheduledDate: string) {
    return this.sendNotification({
      userId,
      type: 'vaccination',
      title: 'Vaccination Due',
      message: `Your ${vaccineName} vaccination is scheduled for ${new Date(scheduledDate).toLocaleDateString()}.`,
      scheduledFor: scheduledDate,
    });
  },

  /**
   * Send screening reminder
   */
  async sendScreeningReminder(screeningId: string, userId: string, screeningType: string, scheduledDate: string) {
    return this.sendNotification({
      userId,
      type: 'screening',
      title: 'Screening Due',
      message: `Your ${screeningType} screening is scheduled for ${new Date(scheduledDate).toLocaleDateString()}.`,
      scheduledFor: scheduledDate,
    });
  },

  /**
   * Send general notification
   */
  async sendGeneralNotification(userId: string, title: string, message: string) {
    return this.sendNotification({
      userId,
      type: 'general',
      title,
      message,
    });
  },

  /**
   * Batch send notifications
   */
  async sendBatchNotifications(notifications: NotificationPayload[]) {
    const results = await Promise.allSettled(
      notifications.map(notification => this.sendNotification(notification))
    );

    return {
      successful: results.filter(r => r.status === 'fulfilled').length,
      failed: results.filter(r => r.status === 'rejected').length,
      results,
    };
  },
};
