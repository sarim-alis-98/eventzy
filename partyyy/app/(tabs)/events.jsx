import React, { useState, useEffect } from "react";
import { View, Text, FlatList, TouchableOpacity, Modal, TextInput, Alert, RefreshControl, Platform, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import Toast from "react-native-toast-message";
import DateTimePicker from "@react-native-community/datetimepicker";
import { logout, getUser } from "../../services/auth";
import { getEvents, createEvent, deleteEvent, joinEvent, leaveEvent, updateEvent } from "../../services/event";
import { eventStyles } from "../../styles/event";

const CATEGORIES = ["All", "Party", "Meeting", "Concert", "Festival", "Other"];

const CATEGORY_COLORS = {
  Party: "#9333EA",
  Meeting: "#3B82F6",
  Concert: "#F97316",
  Festival: "#10B981",
  Other: "#6B7280",
};

export default function EventsScreen() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [viewMode, setViewMode] = useState("all"); // 'all' or 'joined'
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [user, setUser] = useState(null);
  const [newEvent, setNewEvent] = useState({ name: "", date: "", location: "", category: "Party" });
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [editEventData, setEditEventData] = useState({ name: "", date: "", location: "", category: "Party" });
  const [editSelectedDate, setEditSelectedDate] = useState(new Date());
  const [showEditDatePicker, setShowEditDatePicker] = useState(false);
  const [editAndroidPickerMode, setEditAndroidPickerMode] = useState("date");
  const router = useRouter();

  const [androidPickerMode, setAndroidPickerMode] = useState("date");

  const onDateChange = (event, date) => {
    if (Platform.OS === "android") {
      setShowDatePicker(false);
      if (event.type === "dismissed") return;
      
      if (androidPickerMode === "date" && date) {
        setSelectedDate(date);
        setAndroidPickerMode("time");
        setTimeout(() => setShowDatePicker(true), 100);
      } else if (androidPickerMode === "time" && date) {
        setSelectedDate(date);
        setNewEvent(prev => ({ ...prev, date: date.toISOString() }));
        setAndroidPickerMode("date");
      }
    } else {
      if (date) {
        setSelectedDate(date);
        setNewEvent(prev => ({ ...prev, date: date.toISOString() }));
      }
    }
  };

  const onEditDateChange = (event, date) => {
    if (Platform.OS === "android") {
      setShowEditDatePicker(false);
      if (event.type === "dismissed") return;
      
      if (editAndroidPickerMode === "date" && date) {
        setEditSelectedDate(date);
        setEditAndroidPickerMode("time");
        setTimeout(() => setShowEditDatePicker(true), 100);
      } else if (editAndroidPickerMode === "time" && date) {
        setEditSelectedDate(date);
        setEditEventData(prev => ({ ...prev, date: date.toISOString() }));
        setEditAndroidPickerMode("date");
      }
    } else {
      if (date) {
        setEditSelectedDate(date);
        setEditEventData(prev => ({ ...prev, date: date.toISOString() }));
      }
    }
  };

  useEffect(() => {
    checkUserRole();
    loadEvents();
  }, [selectedCategory, viewMode]);

  const checkUserRole = async () => {
    const userData = await getUser();
    setUser(userData);
    setIsAdmin(userData?.isAdmin || false);
  };

  const loadEvents = async () => {
    setLoading(true);
    try {
      // Admin always sees all events, users can toggle between all and joined
      const view = isAdmin ? "all" : viewMode;
      const result = await getEvents(selectedCategory === "All" ? null : selectedCategory, view);
      setEvents(result.events || []);
      setIsAdmin(result.isAdmin || false);
    } catch (error) {
      Toast.show({ type: "error", text1: "Error", text2: error.toString() });
    } finally {
      setLoading(false);
    }
  };

  const handleAddEvent = async () => {
    if (!newEvent.name || !newEvent.date || !newEvent.location) {
      Toast.show({ type: "error", text1: "Error", text2: "Please fill in all fields" });
      return;
    }

    try {
      // Ensure date is properly formatted
      const eventData = {
        name: newEvent.name.trim(),
        date: newEvent.date,
        location: newEvent.location.trim(),
        category: newEvent.category || "Party"
      };

      await createEvent(eventData);
      Toast.show({ type: "success", text1: "Success", text2: "Event created successfully!" });
      setShowAddModal(false);
      setNewEvent({ name: "", date: "", location: "", category: "Party" });
      setSelectedDate(new Date());
      loadEvents();
    } catch (error) {
      console.error("Error creating event:", error);
      const errorMessage = error?.message || error?.toString() || "Failed to create event. Please try again.";
      Toast.show({ 
        type: "error", 
        text1: "Error", 
        text2: errorMessage 
      });
    }
  };

  const handleJoinEvent = async (eventId) => {
    try {
      await joinEvent(eventId);
      Toast.show({ type: "success", text1: "Success", text2: "Successfully joined event!" });
      loadEvents();
    } catch (error) {
      Toast.show({ type: "error", text1: "Error", text2: error.toString() });
    }
  };

  const handleLeaveEvent = async (eventId) => {
    try {
      await leaveEvent(eventId);
      Toast.show({ type: "success", text1: "Success", text2: "Successfully left event!" });
      loadEvents();
    } catch (error) {
      Toast.show({ type: "error", text1: "Error", text2: error.toString() });
    }
  };

  const handleDeleteEvent = (eventId) => {
    Alert.alert("Delete Event", "Are you sure you want to delete this event?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteEvent(eventId);
            Toast.show({ type: "success", text1: "Success", text2: "Event deleted successfully!" });
            loadEvents();
          } catch (error) {
            Toast.show({ type: "error", text1: "Error", text2: error.toString() });
          }
        },
      },
    ]);
  };

  const openEditModal = (event) => {
    setEditingEvent(event);
    setEditEventData({
      name: event.name,
      date: event.date,
      location: event.location,
      category: event.category,
    });
    setEditSelectedDate(new Date(event.date));
    setShowEditModal(true);
  };

  const handleEditEvent = async () => {
    if (!editEventData.name || !editEventData.date || !editEventData.location) {
      Toast.show({ type: "error", text1: "Error", text2: "Please fill in all fields" });
      return;
    }

    try {
      const eventData = {
        name: editEventData.name.trim(),
        date: editEventData.date,
        location: editEventData.location.trim(),
        category: editEventData.category || "Party"
      };

      await updateEvent(editingEvent.id, eventData);
      Toast.show({ type: "success", text1: "Success", text2: "Event updated successfully!" });
      setShowEditModal(false);
      setEditingEvent(null);
      setEditEventData({ name: "", date: "", location: "", category: "Party" });
      loadEvents();
    } catch (error) {
      console.error("Error updating event:", error);
      const errorMessage = error?.message || error?.toString() || "Failed to update event. Please try again.";
      Toast.show({ 
        type: "error", 
        text1: "Error", 
        text2: errorMessage 
      });
    }
  };

  const handleLogout = async () => {
    await logout();
    router.replace("/login");
    console.log("logout")
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateString;
    }
  };

  const renderEventItem = ({ item }) => (
    <TouchableOpacity 
      activeOpacity={0.7}
      onPress={() => router.push(`/event/${item.id}`)}
    >
      <View style={[eventStyles.eventCard, { borderLeftColor: CATEGORY_COLORS[item.category] || CATEGORY_COLORS.Other }]}>
        <View style={eventStyles.eventHeader}>
          <View style={eventStyles.eventInfo}>
            <Text style={eventStyles.eventName}>{item.name}</Text>
            <View style={[eventStyles.categoryBadge, { backgroundColor: CATEGORY_COLORS[item.category] || CATEGORY_COLORS.Other }]}>
              <Text style={eventStyles.categoryText}>{item.category}</Text>
            </View>
          </View>
        </View>
        <View style={eventStyles.eventDetails}>
          <View style={eventStyles.eventDetailRow}>
            <Ionicons name="calendar-outline" size={16} color="#A0A0A0" />
            <Text style={eventStyles.eventDetailText}>{formatDate(item.date)}</Text>
          </View>
          <View style={eventStyles.eventDetailRow}>
            <Ionicons name="location-outline" size={16} color="#A0A0A0" />
            <Text style={eventStyles.eventDetailText}>{item.location}</Text>
          </View>
          <View style={eventStyles.eventDetailRow}>
            <Ionicons name="people-outline" size={16} color="#A0A0A0" />
            <Text style={eventStyles.eventDetailText}>{item.participantsCount || 0} participants</Text>
          </View>
        </View>
        {!isAdmin && (
          <TouchableOpacity
            onPress={(e) => { e.stopPropagation(); item.isJoined ? handleLeaveEvent(item.id) : handleJoinEvent(item.id); }}
            style={[eventStyles.joinButton, item.isJoined && eventStyles.leaveButton]}
          >
            <Text style={eventStyles.joinButtonText}>{item.isJoined ? "Leave Event" : "Join Event"}</Text>
          </TouchableOpacity>
        )}
        {isAdmin && (
          <View style={eventStyles.adminActions}>
            <TouchableOpacity onPress={(e) => { e.stopPropagation(); openEditModal(item); }} style={eventStyles.editEventButton}>
              <Ionicons name="create-outline" size={18} color="#3B82F6" />
              <Text style={eventStyles.editEventText}>Edit</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={(e) => { e.stopPropagation(); handleDeleteEvent(item.id); }} style={eventStyles.deleteEventButton}>
              <Ionicons name="trash-outline" size={18} color="#EF4444" />
              <Text style={eventStyles.deleteEventText}>Delete</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={eventStyles.container} edges={["top", "bottom"]}>
      {/* Header */}
      <LinearGradient colors={["#1a0f2e", "#2d1b3d"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={eventStyles.headerGradient}>
        <View style={eventStyles.header}>
          {/* Profile Picture */}
          <TouchableOpacity onPress={() => router.push("/(tabs)/profile")} style={eventStyles.profileContainer}>
            {user?.imageUrl ? (
              <Image source={{ uri: user.imageUrl }} style={eventStyles.profileImage} />
            ) : (
              <LinearGradient colors={["#9333EA", "#F97316"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={eventStyles.profileImagePlaceholder}>
                <Text style={eventStyles.profileInitial}>
                  {user?.username ? user.username.charAt(0).toUpperCase() : "U"}
                </Text>
              </LinearGradient>
            )}
          </TouchableOpacity>

          {/* Eventzy Text */}
          <View style={eventStyles.brandContainer}>
            <Text style={eventStyles.brandTextSolid}>Eventzy 🎉⭐🥳</Text>
          </View>

          {/* Logout Icon */}
          <TouchableOpacity onPress={handleLogout} style={eventStyles.notificationContainer}>
            <View style={eventStyles.notificationCircle}>
              <Ionicons name="log-out-outline" size={20} color="#FFFFFF" />
            </View>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* View Mode Toggle (for regular users) */}
      {!isAdmin && (
        <View style={eventStyles.viewModeContainer}>
          <TouchableOpacity
            onPress={() => setViewMode("all")}
            style={[eventStyles.viewModeButton, viewMode === "all" && eventStyles.viewModeButtonActive]}
          >
            <Text style={[eventStyles.viewModeText, viewMode === "all" && eventStyles.viewModeTextActive]}>All Events</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setViewMode("joined")}
            style={[eventStyles.viewModeButton, viewMode === "joined" && eventStyles.viewModeButtonActive]}
          >
            <Text style={[eventStyles.viewModeText, viewMode === "joined" && eventStyles.viewModeTextActive]}>My Events</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Category Filter */}
      <View style={eventStyles.categoryContainer}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={CATEGORIES}
          keyExtractor={(item) => item}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => setSelectedCategory(item)}
              style={[eventStyles.categoryButton, selectedCategory === item && eventStyles.categoryButtonActive]}
            >
              <Text style={[eventStyles.categoryButtonText, selectedCategory === item && eventStyles.categoryButtonTextActive]}>{item}</Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* Events List */}
      <FlatList
        data={events}
        keyExtractor={(item) => item.id}
        renderItem={renderEventItem}
        contentContainerStyle={eventStyles.listContent}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={loadEvents} tintColor="#9333EA" />}
        ListEmptyComponent={
          <View style={eventStyles.emptyContainer}>
            <Ionicons name="calendar-outline" size={64} color="#666666" />
            <Text style={eventStyles.emptyText}>
              {viewMode === "joined" ? "You haven't joined any events" : "No events found"}
            </Text>
            <Text style={eventStyles.emptySubtext}>
              {isAdmin ? "Tap + to create your first event" : viewMode === "joined" ? "Browse events to join" : "No events available"}
            </Text>
          </View>
        }
      />

      {/* Add Event Button (Admin Only) */}
      {isAdmin && (
        <TouchableOpacity onPress={() => setShowAddModal(true)} style={eventStyles.addButtonContainer}>
          <LinearGradient colors={["#9333EA", "#F97316"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={eventStyles.addButton}>
            <Ionicons name="add" size={32} color="#FFFFFF" />
          </LinearGradient>
        </TouchableOpacity>
      )}

      {/* Add Event Modal */}
      <Modal visible={showAddModal} animationType="slide" transparent>
        <View style={eventStyles.modalOverlay}>
          <View style={eventStyles.modalContent}>
            <View style={eventStyles.modalHeader}>
              <Text style={eventStyles.modalTitle}>Create New Event</Text>
              <TouchableOpacity onPress={() => setShowAddModal(false)}>
                <Ionicons name="close" size={24} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            <TextInput
              style={eventStyles.input}
              placeholder="Event Name"
              placeholderTextColor="#A0A0A0"
              value={newEvent.name}
              onChangeText={(text) => setNewEvent({ ...newEvent, name: text })}
            />

            <TouchableOpacity style={eventStyles.input} onPress={() => { setAndroidPickerMode("date"); setShowDatePicker(true); }}>
              <View style={eventStyles.dateInputContainer}>
                <Ionicons name="calendar-outline" size={20} color="#A0A0A0" />
                <Text style={[eventStyles.dateInputText, !newEvent.date && eventStyles.dateInputPlaceholder]}>
                  {newEvent.date ? formatDate(newEvent.date) : "Start Date"}
                </Text>
              </View>
            </TouchableOpacity>

            {showDatePicker && (
              <DateTimePicker
                value={selectedDate}
                mode={Platform.OS === "android" ? androidPickerMode : "datetime"}
                display={Platform.OS === "ios" ? "spinner" : "default"}
                onChange={onDateChange}
                minimumDate={new Date()}
              />
            )}
            

            <TextInput
              style={eventStyles.input}
              placeholder="Location"
              placeholderTextColor="#A0A0A0"
              value={newEvent.location}
              onChangeText={(text) => setNewEvent({ ...newEvent, location: text })}
            />

            <View style={eventStyles.categorySelector}>
              <Text style={eventStyles.label}>Category</Text>
              <View style={eventStyles.categoryOptions}>
                {CATEGORIES.filter((c) => c !== "All").map((category) => (
                  <TouchableOpacity
                    key={category}
                    onPress={() => setNewEvent({ ...newEvent, category })}
                    style={[eventStyles.categoryOption, newEvent.category === category && { backgroundColor: CATEGORY_COLORS[category] }]}
                  >
                    <Text style={[eventStyles.categoryOptionText, newEvent.category === category && eventStyles.categoryOptionTextActive]}>
                      {category}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <TouchableOpacity onPress={handleAddEvent} style={eventStyles.saveButtonContainer}>
              <LinearGradient colors={["#9333EA", "#F97316"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={eventStyles.saveButton}>
                <Text style={eventStyles.saveButtonText}>Create Event</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Edit Event Modal */}
      <Modal visible={showEditModal} animationType="slide" transparent>
        <View style={eventStyles.modalOverlay}>
          <View style={eventStyles.modalContent}>
            <View style={eventStyles.modalHeader}>
              <Text style={eventStyles.modalTitle}>Edit Event</Text>
              <TouchableOpacity onPress={() => { setShowEditModal(false); setEditingEvent(null); }}>
                <Ionicons name="close" size={24} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            <TextInput
              style={eventStyles.input}
              placeholder="Event Name"
              placeholderTextColor="#A0A0A0"
              value={editEventData.name}
              onChangeText={(text) => setEditEventData({ ...editEventData, name: text })}
            />

            <TouchableOpacity style={eventStyles.input} onPress={() => { setEditAndroidPickerMode("date"); setShowEditDatePicker(true); }}>
              <View style={eventStyles.dateInputContainer}>
                <Ionicons name="calendar-outline" size={20} color="#A0A0A0" />
                <Text style={[eventStyles.dateInputText, !editEventData.date && eventStyles.dateInputPlaceholder]}>
                  {editEventData.date ? formatDate(editEventData.date) : "Start Date"}
                </Text>
              </View>
            </TouchableOpacity>

            {showEditDatePicker && (
              <DateTimePicker
                value={editSelectedDate}
                mode={Platform.OS === "android" ? editAndroidPickerMode : "datetime"}
                display={Platform.OS === "ios" ? "spinner" : "default"}
                onChange={onEditDateChange}
                minimumDate={new Date()}
              />
            )}

            <TextInput
              style={eventStyles.input}
              placeholder="Location"
              placeholderTextColor="#A0A0A0"
              value={editEventData.location}
              onChangeText={(text) => setEditEventData({ ...editEventData, location: text })}
            />

            <View style={eventStyles.categorySelector}>
              <Text style={eventStyles.label}>Category</Text>
              <View style={eventStyles.categoryOptions}>
                {CATEGORIES.filter((c) => c !== "All").map((category) => (
                  <TouchableOpacity
                    key={category}
                    onPress={() => setEditEventData({ ...editEventData, category })}
                    style={[eventStyles.categoryOption, editEventData.category === category && { backgroundColor: CATEGORY_COLORS[category] }]}
                  >
                    <Text style={[eventStyles.categoryOptionText, editEventData.category === category && eventStyles.categoryOptionTextActive]}>
                      {category}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <TouchableOpacity onPress={handleEditEvent} style={eventStyles.saveButtonContainer}>
              <LinearGradient colors={["#9333EA", "#F97316"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={eventStyles.saveButton}>
                <Text style={eventStyles.saveButtonText}>Update Event</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
