import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Image, Modal, TextInput, Platform } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import Toast from "react-native-toast-message";
import { getEventById, joinEvent, leaveEvent, updateEvent } from "../../services/event";
import { getUser } from "../../services/auth";
import { StyleSheet } from "react-native";

const CATEGORY_COLORS = {
  Party: "#9333EA",
  Meeting: "#3B82F6",
  Concert: "#F97316",
  Festival: "#10B981",
  Other: "#6B7280",
};

export default function EventDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editEventData, setEditEventData] = useState({ name: "", date: "", location: "", category: "Party" });
  const [editSelectedDate, setEditSelectedDate] = useState(new Date());
  const [showEditDatePicker, setShowEditDatePicker] = useState(false);
  const [editAndroidPickerMode, setEditAndroidPickerMode] = useState("date");

  const CATEGORIES = ["Party", "Meeting", "Concert", "Festival", "Other"];

  useEffect(() => {
    loadEventAndUser();
  }, [id]);

  const loadEventAndUser = async () => {
    try {
      const [eventData, userData] = await Promise.all([
        getEventById(id),
        getUser()
      ]);
      setEvent(eventData);
      setUser(userData);
      setIsAdmin(userData?.isAdmin || false);
    } catch (error) {
      Toast.show({ type: "error", text1: "Error", text2: "Failed to load event" });
    } finally {
      setLoading(false);
    }
  };

  const handleJoinEvent = async () => {
    try {
      await joinEvent(id);
      Toast.show({ type: "success", text1: "Success", text2: "You've joined the event!" });
      loadEventAndUser();
    } catch (error) {
      Toast.show({ type: "error", text1: "Error", text2: error.toString() });
    }
  };

  const handleLeaveEvent = async () => {
    try {
      await leaveEvent(id);
      Toast.show({ type: "success", text1: "Success", text2: "You've left the event" });
      loadEventAndUser();
    } catch (error) {
      Toast.show({ type: "error", text1: "Error", text2: error.toString() });
    }
  };

  const openEditModal = () => {
    setEditEventData({
      name: event.name,
      date: event.date,
      location: event.location,
      category: event.category,
    });
    setEditSelectedDate(new Date(event.date));
    setShowEditModal(true);
  };

  const onEditDateChange = (evt, date) => {
    if (Platform.OS === "android") {
      setShowEditDatePicker(false);
      if (evt.type === "dismissed") return;
      
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

      await updateEvent(id, eventData);
      Toast.show({ type: "success", text1: "Success", text2: "Event updated successfully!" });
      setShowEditModal(false);
      loadEventAndUser();
    } catch (error) {
      const errorMessage = error?.message || error?.toString() || "Failed to update event";
      Toast.show({ type: "error", text1: "Error", text2: errorMessage });
    }
  };

  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateString;
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color="#9333EA" />
      </SafeAreaView>
    );
  }

  if (!event) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.errorText}>Event not found</Text>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButtonAlt}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const categoryColor = CATEGORY_COLORS[event.category] || CATEGORY_COLORS.Other;

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <LinearGradient colors={["#1a0f2e", "#2d1b3d"]} style={styles.headerGradient}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Event Details</Text>
          {isAdmin ? (
            <TouchableOpacity onPress={openEditModal} style={styles.editHeaderButton}>
              <Ionicons name="create-outline" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          ) : (
            <View style={{ width: 40 }} />
          )}
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={[styles.categoryHeader, { backgroundColor: categoryColor }]}>
          <Text style={styles.categoryText}>{event.category}</Text>
        </View>

        <View style={styles.eventCard}>
          <Text style={styles.eventName}>{event.name}</Text>
          
          <View style={styles.detailSection}>
            <View style={styles.detailRow}>
              <View style={styles.iconContainer}>
                <Ionicons name="calendar" size={20} color={categoryColor} />
              </View>
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Date & Time</Text>
                <Text style={styles.detailValue}>{formatDate(event.date)}</Text>
              </View>
            </View>

            <View style={styles.detailRow}>
              <View style={styles.iconContainer}>
                <Ionicons name="location" size={20} color={categoryColor} />
              </View>
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Location</Text>
                <Text style={styles.detailValue}>{event.location}</Text>
              </View>
            </View>

            <View style={styles.detailRow}>
              <View style={styles.iconContainer}>
                <Ionicons name="people" size={20} color={categoryColor} />
              </View>
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Participants</Text>
                <Text style={styles.detailValue}>{event.participantsCount || 0} people attending</Text>
              </View>
            </View>
          </View>

          {event.description && (
            <View style={styles.descriptionSection}>
              <Text style={styles.sectionTitle}>About this event</Text>
              <Text style={styles.description}>{event.description}</Text>
            </View>
          )}
        </View>
      </ScrollView>

      {!isAdmin && (
        <View style={styles.footer}>
          <TouchableOpacity
            onPress={event.isJoined ? handleLeaveEvent : handleJoinEvent}
            style={styles.actionButtonContainer}
          >
            <LinearGradient
              colors={event.isJoined ? ["#EF4444", "#DC2626"] : ["#9333EA", "#F97316"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.actionButton}
            >
              <Ionicons 
                name={event.isJoined ? "exit-outline" : "add-circle-outline"} 
                size={24} 
                color="#FFFFFF" 
              />
              <Text style={styles.actionButtonText}>
                {event.isJoined ? "Leave Event" : "Join Event"}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      )}

      {/* Edit Event Modal */}
      <Modal visible={showEditModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Event</Text>
              <TouchableOpacity onPress={() => setShowEditModal(false)}>
                <Ionicons name="close" size={24} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.input}
              placeholder="Event Name"
              placeholderTextColor="#A0A0A0"
              value={editEventData.name}
              onChangeText={(text) => setEditEventData({ ...editEventData, name: text })}
            />

            <TouchableOpacity style={styles.input} onPress={() => { setEditAndroidPickerMode("date"); setShowEditDatePicker(true); }}>
              <View style={styles.dateInputContainer}>
                <Ionicons name="calendar-outline" size={20} color="#A0A0A0" />
                <Text style={[styles.dateInputText, !editEventData.date && styles.dateInputPlaceholder]}>
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
              style={styles.input}
              placeholder="Location"
              placeholderTextColor="#A0A0A0"
              value={editEventData.location}
              onChangeText={(text) => setEditEventData({ ...editEventData, location: text })}
            />

            <View style={styles.categorySelector}>
              <Text style={styles.label}>Category</Text>
              <View style={styles.categoryOptions}>
                {CATEGORIES.map((category) => (
                  <TouchableOpacity
                    key={category}
                    onPress={() => setEditEventData({ ...editEventData, category })}
                    style={[styles.categoryOption, editEventData.category === category && { backgroundColor: CATEGORY_COLORS[category] }]}
                  >
                    <Text style={[styles.categoryOptionText, editEventData.category === category && styles.categoryOptionTextActive]}>
                      {category}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <TouchableOpacity onPress={handleEditEvent} style={styles.saveButtonContainer}>
              <LinearGradient colors={["#9333EA", "#F97316"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.saveButton}>
                <Text style={styles.saveButtonText}>Update Event</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0a0a0a",
  },
  headerGradient: {
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  content: {
    flex: 1,
  },
  categoryHeader: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: "center",
  },
  categoryText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  eventCard: {
    padding: 20,
  },
  eventName: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 24,
  },
  detailSection: {
    gap: 16,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 16,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  detailContent: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 12,
    color: "#A0A0A0",
    marginBottom: 4,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  detailValue: {
    fontSize: 16,
    color: "#FFFFFF",
    fontWeight: "500",
  },
  descriptionSection: {
    marginTop: 24,
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.1)",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#FFFFFF",
    marginBottom: 12,
  },
  description: {
    fontSize: 15,
    color: "#CCCCCC",
    lineHeight: 24,
  },
  footer: {
    padding: 16,
    paddingBottom: 24,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.1)",
  },
  actionButtonContainer: {
    borderRadius: 16,
    overflow: "hidden",
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    gap: 8,
  },
  actionButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "600",
  },
  errorText: {
    color: "#FFFFFF",
    fontSize: 18,
    textAlign: "center",
    marginTop: 40,
  },
  backButtonAlt: {
    marginTop: 20,
    alignSelf: "center",
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: "#9333EA",
    borderRadius: 8,
  },
  backButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  editHeaderButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#1a1a1a",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  input: {
    backgroundColor: "#000000",
    borderRadius: 12,
    padding: 16,
    color: "#FFFFFF",
    fontSize: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#333333",
  },
  dateInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  dateInputText: {
    color: "#FFFFFF",
    fontSize: 16,
  },
  dateInputPlaceholder: {
    color: "#A0A0A0",
  },
  categorySelector: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
    marginBottom: 12,
  },
  categoryOptions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  categoryOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#000000",
    borderWidth: 1,
    borderColor: "#333333",
  },
  categoryOptionText: {
    color: "#A0A0A0",
    fontSize: 14,
    fontWeight: "500",
  },
  categoryOptionTextActive: {
    color: "#FFFFFF",
  },
  saveButtonContainer: {
    borderRadius: 12,
    overflow: "hidden",
  },
  saveButton: {
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  saveButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "600",
  },
});
