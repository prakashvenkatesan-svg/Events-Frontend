const API_URL =
  import.meta.env.VITE_API_URL ||
  "/api";

/*
 * Read the backend response safely.
 *
 * This prevents:
 * Unexpected end of JSON input
 */
async function readResponse(
  response,
) {
  const responseText =
    await response.text();

  /*
   * Backend returned no content.
   */
  if (!responseText) {
    return null;
  }

  try {
    return JSON.parse(responseText);
  } catch {
    /*
     * Backend returned HTML or normal text
     * instead of JSON.
     */
    throw new Error(
      `Backend returned invalid JSON. Status: ${response.status}`,
    );
  }
}

/*
 * Common API request function.
 */
async function request(
  url,
  options = {},
) {
  const token =
    localStorage.getItem(
      "mp_admin_token",
    );

  const isFormData =
    options.body instanceof FormData;

  const headers = {
    /*
     * Do not manually add Content-Type
     * when the request contains FormData.
     */
    ...(!isFormData && {
      "Content-Type":
        "application/json",
    }),

    /*
     * Add JWT token for protected routes.
     */
    ...(token && {
      Authorization:
        `Bearer ${token}`,
    }),

    /*
     * Add any custom headers.
     */
    ...options.headers,
  };

  let response;

  try {
    response = await fetch(
      `${API_URL}${url}`,
      {
        ...options,
        headers,
      },
    );
  } catch {
    throw new Error(
      "Unable to connect to the backend. Make sure the server is running on port 5000.",
    );
  }

  let data;

  try {
    data =
      await readResponse(response);
  } catch (error) {
    if (!response.ok) {
      throw new Error(
        `Backend request failed. Status: ${response.status}`,
      );
    }

    throw error;
  }

  /*
   * Remove expired admin token.
   */
  if (response.status === 401) {
    localStorage.removeItem(
      "mp_admin_token",
    );

    localStorage.removeItem(
      "mp_admin_user",
    );
  }

  if (!response.ok) {
    throw new Error(
      data?.message ||
        `Request failed. Status: ${response.status}`,
    );
  }

  return data;
}

/*
 * MoneyPechu API methods.
 */
export const api = {
  /*
   * =====================================
   * ADMIN LOGIN
   * =====================================
   */

  login(email, password) {
    return request(
      "/admin/auth/login",
      {
        method: "POST",

        body: JSON.stringify({
          email,
          password,
        }),
      },
    );
  },

  /*
   * =====================================
   * PUBLIC EVENT METHODS
   * =====================================
   */

  /*
   * Get every published event.
   */
  getEvents() {
    return request("/events");
  },

  /*
   * Get one published event.
   */
  getEvent(eventId) {
    const encodedEventId =
      encodeURIComponent(eventId);

    return request(
      `/events/${encodedEventId}`,
    );
  },

  /*
   * =====================================
   * ADMIN EVENT METHODS
   * =====================================
   */

  /*
   * Get all events, including drafts.
   */
  getAdminEvents() {
    return request(
      "/admin/events",
    );
  },

  /*
   * Get one event for admin editing.
   */
  getAdminEvent(eventId) {
    const encodedEventId =
      encodeURIComponent(eventId);

    return request(
      `/admin/events/${encodedEventId}`,
    );
  },

  /*
   * Create a new event.
   */
  createEvent(eventData) {
    return request(
      "/admin/events",
      {
        method: "POST",

        body: JSON.stringify(
          eventData,
        ),
      },
    );
  },

  /*
   * Update an existing event.
   */
  updateEvent(
    eventId,
    eventData,
  ) {
    const encodedEventId =
      encodeURIComponent(eventId);

    return request(
      `/admin/events/${encodedEventId}`,
      {
        method: "PUT",

        body: JSON.stringify(
          eventData,
        ),
      },
    );
  },

  /*
   * Delete an event.
   */
  deleteEvent(eventId) {
    const encodedEventId =
      encodeURIComponent(eventId);

    return request(
      `/admin/events/${encodedEventId}`,
      {
        method: "DELETE",
      },
    );
  },

  createPayUPayment(bookingId) {
    return request(
      "/payments/payu/create",
      {
        method: "POST",
        body: JSON.stringify({
          bookingId,
        }),
      },
    );
  },
  
  /*
   * =====================================
   * BANNER UPLOAD
   * =====================================
   */

  /*
   * Upload an event banner.
   */
  uploadBanner(file) {
    if (!file) {
      return Promise.reject(
        new Error(
          "Please select a banner image.",
        ),
      );
    }

    const formData =
      new FormData();

    /*
     * This name must match:
     * upload.single("banner")
     * in the backend.
     */
    formData.append(
      "banner",
      file,
    );

    return request(
      "/uploads/banner",
      {
        method: "POST",

        /*
         * Do not use JSON.stringify here.
         */
        body: formData,
      },
    );
  },

  /*
   * =====================================
   * BOOKINGS
   * =====================================
   */

  createBooking(bookingData) {
    return request(
      "/bookings",
      {
        method: "POST",

        body: JSON.stringify(
          bookingData,
        ),
      },
    );
  },

  getBookings() {
    return request(
      "/admin/bookings",
    );
  },

  /*
   * =====================================
   * CHECK-IN
   * =====================================
   */

  checkIn(bookingId) {
    return request(
      "/admin/check-in",
      {
        method: "POST",

        body: JSON.stringify({
          bookingId,
        }),
      },
    );
  },

  /*
   * =====================================
   * PAYMENTS
   * =====================================
   */

  getPayments() {
    return request(
      "/admin/payments",
    );
  },

  /*
   * =====================================
   * CLIENTS
   * =====================================
   */

  getClients() {
    return request(
      "/admin/clients",
    );
  },

  addClient(clientData) {
    return request(
      "/admin/clients",
      {
        method: "POST",

        body: JSON.stringify(
          clientData,
        ),
      },
    );
  },

  /*
   * =====================================
   * DASHBOARD
   * =====================================
   */

  getDashboard() {
    return request(
      "/admin/dashboard",
    );
  },

  /*
   * =====================================
   * SETTINGS
   * =====================================
   */

  getSettings() {
    return request(
      "/admin/settings",
    );
  },

  updateSettings(
    settingsData,
  ) {
    return request(
      "/admin/settings",
      {
        method: "PUT",

        body: JSON.stringify(
          settingsData,
        ),
      },
    );
  },
};