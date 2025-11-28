import React, { useEffect, useState } from "react";
import { Modal, View, Text, TextInput, TouchableOpacity, StyleSheet, Platform } from "react-native";
import dayjs from "dayjs";

export default function EventFormModal({
  visible,
  onClose,
  onSave,
  initialDate,         // (compat) si viene solo una fecha
  initialStartDate,    // nueva: "YYYY-MM-DD"
  initialEndDate,      // nueva: "YYYY-MM-DD"
  editingEvent,        // { id, title, notes, date, time }  (edición simple)
}) {
  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [time, setTime]   = useState("10:00"); // HH:mm
    const [startDate, setStartDate] = useState(
    initialStartDate || initialDate || dayjs().format("YYYY-MM-DD")
    );
    const [endDate, setEndDate] = useState(
    initialEndDate || initialStartDate || initialDate || dayjs().format("YYYY-MM-DD")
    );
  useEffect(() => {
    if (editingEvent) {
      setTitle(editingEvent.title || "");
      setNotes(editingEvent.notes || "");
      setTime(editingEvent.time || "10:00");
      const d = editingEvent.date || initialStartDate || initialDate || dayjs().format("YYYY-MM-DD");
   setStartDate(d);
   setEndDate(initialEndDate || d);
    } else {
      setTitle("");
      setNotes("");
      setTime("10:00");
      const s = initialStartDate || initialDate || dayjs().format("YYYY-MM-DD");
   const e = initialEndDate || s;
   setStartDate(s);
  setEndDate(e);
    }
  }, [visible, editingEvent, initialDate]);

  const handleSave = () => {
    if (!title.trim()) return;
            onSave({
        // cuando es edición, mantené el id (de un solo día)
        id: editingEvent?.id || null,
        title: title.trim(),
        notes: notes.trim(),
        startDate,
        endDate,
        time,  // HH:mm
        });
};
  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <Text style={styles.title}>{editingEvent ? "Editar evento" : "Nuevo evento"}</Text>

          <Text style={styles.label}>Desde (YYYY-MM-DD)</Text>
            <TextInput
            value={startDate}
            onChangeText={setStartDate}
            placeholder="YYYY-MM-DD"
            style={styles.input}
            inputMode="numeric"
            editable={!initialStartDate}   // 👈 bloquea si el rango vino del calendario
            />

            <Text style={styles.label}>Hasta (YYYY-MM-DD)</Text>
            <TextInput
            value={endDate}
            onChangeText={setEndDate}
            placeholder="YYYY-MM-DD"
            style={styles.input}
            inputMode="numeric"
            editable={!initialEndDate}     // 👈 bloquea si el rango vino del calendario
            />

          <Text style={styles.label}>Título</Text>
          <TextInput
            value={title}
            onChangeText={setTitle}
            placeholder="Riego, control de humedad, etc."
            style={styles.input}
          />

          <Text style={styles.label}>Notas</Text>
          <TextInput
            value={notes}
            onChangeText={setNotes}
            placeholder="Opcional"
            multiline
            numberOfLines={3}
            style={[styles.input, styles.textarea]}
          />

          <View style={styles.row}>
            <TouchableOpacity style={[styles.btn, styles.cancel]} onPress={onClose}>
                <Text style={styles.btnText}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.btn, styles.save]} onPress={handleSave}>
                <Text style={styles.btnText}>Guardar</Text>
            </TouchableOpacity>
            </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "flex-end",
  },
  card: {
    backgroundColor: "#fff",
    padding: 16,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    ...Platform.select({
      android: { elevation: 6 },
      ios: { shadowColor: "#000", shadowOpacity: 0.1, shadowRadius: 10, shadowOffset: { width: 0, height: -4 } }
    })
  },
  title: { fontSize: 18, fontWeight: "bold", marginBottom: 12 },
  label: { fontSize: 14, marginTop: 8, marginBottom: 6 },
  input: {
    borderWidth: 1, borderColor: "#ccc", borderRadius: 8,
    paddingHorizontal: 12, paddingVertical: 10, fontSize: 16
  },
  textarea: { minHeight: 80, textAlignVertical: "top" },
  row: { flexDirection: "row", justifyContent: "flex-end", gap: 12, marginTop: 16 },
  btn: { paddingHorizontal: 16, paddingVertical: 12, borderRadius: 10 },
  cancel: { backgroundColor: "#999" },
  save: { backgroundColor: "#15A266" },
  btnText: { color: "#fff", fontWeight: "600" }
});
