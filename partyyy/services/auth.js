// Imports.
import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "./api";

// Login.
export const login = async (email, password) => {
  try {
    const response = await api.post("/users/login", {
      email,
      password,
    });

    if (response.data.success) {
      // Store token.
      await AsyncStorage.setItem("token", response.data.data.token);
      await AsyncStorage.setItem("user", JSON.stringify(response.data.data.user));
      return response.data.data;
    }
    throw new Error(response.data.message || "Login failed");
  } catch (error) {
    throw error.response?.data?.message || error.message || "Login failed";
  }
};

// Register.
export const register = async (username, email, password, imageUri = null) => {
  try {
    const formData = new FormData();
    formData.append("username", username);
    formData.append("email", email);
    formData.append("password", password);

    if (imageUri) {
      formData.append("image", {
        uri: imageUri,
        type: "image/jpeg",
        name: "profile.jpg",
      });
    }

    const response = await api.post("/users/register", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    if (response.data.success) {
      // Store token.
      await AsyncStorage.setItem("token", response.data.data.token);
      await AsyncStorage.setItem("user", JSON.stringify(response.data.data.user));
      return response.data.data;
    }
    throw new Error(response.data.message || "Registration failed");
  } catch (error) {
    throw error.response?.data?.message || error.message || "Registration failed";
  }
};

// Logout.
export const logout = async () => {
  await AsyncStorage.removeItem("token");
  await AsyncStorage.removeItem("user");
};

// Get stored token.
export const getToken = async () => {
  return await AsyncStorage.getItem("token");
};

// Get stored user.
export const getUser = async () => {
  const userStr = await AsyncStorage.getItem("user");
  return userStr ? JSON.parse(userStr) : null;
};

// Check if user is logged in.
export const isLoggedIn = async () => {
  const token = await getToken();
  return !!token;
};

// Update profile.
export const updateProfile = async (username, email, imageUri = null) => {
  try {
    const formData = new FormData();
    if (username) formData.append("username", username);
    if (email) formData.append("email", email);

    if (imageUri) {
      formData.append("image", {
        uri: imageUri,
        type: "image/jpeg",
        name: "profile.jpg",
      });
    }

    const response = await api.put("/users/profile", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    if (response.data.success) {
      // Update stored user data
      const currentUser = await getUser();
      const updatedUser = { ...currentUser, ...response.data.data };
      await AsyncStorage.setItem("user", JSON.stringify(updatedUser));
      return response.data.data;
    }
    throw new Error(response.data.message || "Update failed");
  } catch (error) {
    throw error.response?.data?.message || error.message || "Update failed";
  }
};

// Get fresh profile from server
export const getProfile = async () => {
  try {
    const response = await api.get("/users/profile");
    if (response.data.success) {
      await AsyncStorage.setItem("user", JSON.stringify(response.data.data));
      return response.data.data;
    }
    throw new Error(response.data.message || "Failed to get profile");
  } catch (error) {
    throw error.response?.data?.message || error.message || "Failed to get profile";
  }
};

