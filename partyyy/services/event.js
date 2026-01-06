import api from "./api";

// Get event by ID
export const getEventById = async (eventId) => {
  try {
    const response = await api.get(`/events/${eventId}`);
    if (response.data.success) {
      return response.data.data;
    }
    throw new Error(response.data.message || "Failed to fetch event");
  } catch (error) {
    throw error.response?.data?.message || error.message || "Failed to fetch event";
  }
};

// Get all events
export const getEvents = async (category = null, view = "all") => {
  try {
    const params = { view };
    if (category && category !== "All") {
      params.category = category;
    }
    const response = await api.get("/events", { params });

    if (response.data.success) {
      return {
        events: response.data.data,
        isAdmin: response.data.isAdmin || false,
      };
    }
    throw new Error(response.data.message || "Failed to fetch events");
  } catch (error) {
    throw error.response?.data?.message || error.message || "Failed to fetch events";
  }
};

// Create event
export const createEvent = async (eventData) => {
  try {
    const response = await api.post("/events", eventData);

    if (response.data.success) {
      return response.data.data;
    }
    throw new Error(response.data.message || "Failed to create event");
  } catch (error) {
    // Better error handling for network and validation errors
    if (error.response) {
      // Server responded with error status
      const errorMessage = error.response.data?.message || error.response.data?.error || "Failed to create event";
      throw new Error(errorMessage);
    } else if (error.request) {
      // Request was made but no response received
      throw new Error("Network error. Please check your connection and try again.");
    } else {
      // Something else happened
      throw new Error(error.message || "Failed to create event. Please try again.");
    }
  }
};

// Join event
export const joinEvent = async (eventId) => {
  try {
    const response = await api.post(`/events/${eventId}/join`);

    if (response.data.success) {
      return response.data.data;
    }
    throw new Error(response.data.message || "Failed to join event");
  } catch (error) {
    throw error.response?.data?.message || error.message || "Failed to join event";
  }
};

// Leave event
export const leaveEvent = async (eventId) => {
  try {
    const response = await api.post(`/events/${eventId}/leave`);

    if (response.data.success) {
      return response.data.data;
    }
    throw new Error(response.data.message || "Failed to leave event");
  } catch (error) {
    throw error.response?.data?.message || error.message || "Failed to leave event";
  }
};

// Update event
export const updateEvent = async (eventId, eventData) => {
  try {
    const response = await api.put(`/events/${eventId}`, eventData);

    if (response.data.success) {
      return response.data.data;
    }
    throw new Error(response.data.message || "Failed to update event");
  } catch (error) {
    if (error.response) {
      const errorMessage = error.response.data?.message || error.response.data?.error || "Failed to update event";
      throw new Error(errorMessage);
    } else if (error.request) {
      throw new Error("Network error. Please check your connection and try again.");
    } else {
      throw new Error(error.message || "Failed to update event. Please try again.");
    }
  }
};

// Delete event
export const deleteEvent = async (eventId) => {
  try {
    const response = await api.delete(`/events/${eventId}`);

    if (response.data.success) {
      return true;
    }
    throw new Error(response.data.message || "Failed to delete event");
  } catch (error) {
    throw error.response?.data?.message || error.message || "Failed to delete event";
  }
};

