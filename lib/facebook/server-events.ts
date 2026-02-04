/**
 * Facebook Server-Side Tracking Helpers
 * 
 * These functions send conversion events to Facebook Conversions API
 * for better tracking accuracy and iOS 14+ compatibility.
 */

interface ServerEventParams {
  email?: string;
  phone?: string;
  event_source_url?: string;
  custom_data?: Record<string, unknown>;
}

/**
 * Send a server-side event to Facebook Conversions API
 */
export async function sendFacebookServerEvent(
  event_name: string,
  params: ServerEventParams = {}
): Promise<boolean> {
  try {
    const response = await fetch('/api/facebook/conversions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        event_name,
        ...params,
      }),
    });

    if (!response.ok) {
      console.error('Failed to send Facebook server event:', await response.text());
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error sending Facebook server event:', error);
    return false;
  }
}

/**
 * Track Lead event (meeting request, contact form, etc.)
 */
export async function trackServerLead(params: ServerEventParams = {}) {
  return sendFacebookServerEvent('Lead', {
    ...params,
    custom_data: {
      content_name: 'Meeting Request',
      ...params.custom_data,
    },
  });
}

/**
 * Track Purchase event (subscription, service purchase, etc.)
 */
export async function trackServerPurchase(params: ServerEventParams & {
  value?: number;
  currency?: string;
}) {
  return sendFacebookServerEvent('Purchase', {
    ...params,
    custom_data: {
      value: params.value || 0,
      currency: params.currency || 'USD',
      ...params.custom_data,
    },
  });
}

/**
 * Track Contact event (button click, form start, etc.)
 */
export async function trackServerContact(params: ServerEventParams = {}) {
  return sendFacebookServerEvent('Contact', {
    ...params,
    custom_data: {
      content_name: 'Contact Initiated',
      ...params.custom_data,
    },
  });
}

/**
 * Track Schedule event (meeting scheduled)
 */
export async function trackServerSchedule(params: ServerEventParams = {}) {
  return sendFacebookServerEvent('Schedule', {
    ...params,
    custom_data: {
      content_name: 'Meeting Scheduled',
      ...params.custom_data,
    },
  });
}

/**
 * Track CompleteRegistration event (user signup, account creation)
 */
export async function trackServerCompleteRegistration(params: ServerEventParams = {}) {
  return sendFacebookServerEvent('CompleteRegistration', {
    ...params,
    custom_data: {
      content_name: 'Registration Complete',
      ...params.custom_data,
    },
  });
}

/**
 * Track custom event
 */
export async function trackServerCustomEvent(
  event_name: string,
  params: ServerEventParams = {}
) {
  return sendFacebookServerEvent(event_name, params);
}
