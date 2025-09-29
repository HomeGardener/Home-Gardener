import React, { useState, useEffect, useMemo } from "react";
import { View, Text, TouchableOpacity, FlatList, Alert, StyleSheet, Modal } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Calendar } from "react-native-calendars";
import EventFormModal from "./EventFormModal";
import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
dayjs.extend(isBetween);
dayjs.extend(isSameOrBefore);
dayjs.extend(isSameOrAfter);

const STORAGE_KEY = (userId) => `calendar_events_${userId || "anon"}`;
const BLUE_DOT = { key: "evt", color: "#1677ff" };
export default function CalendarAgenda({ userId }) {
        const [allVisible, setAllVisible] = useState(false);
        const [selected, setSelected] = useState(dayjs().format("YYYY-MM-DD"));
        const [events, setEvents] = useState([]); // [{id,title,notes,date, time}]
        const [rangeStart, setRangeStart] = useState(null);
        const [rangeEnd, setRangeEnd] = useState(null);
        const [modalVisible, setModalVisible] = useState(false);
        const [editingEvent, setEditingEvent] = useState(null);
        const eachDateInclusive = (start, end) => {
        const s = dayjs(start), e = dayjs(end || start);
        const out = [];
  let cur = s;
  while (cur.isBefore(e, "day") || cur.isSame(e, "day")) {
    out.push(cur.format("YYYY-MM-DD"));
    cur = cur.add(1, "day");
  }
  return out;
};
  const handleDayPress = (d) => {
  const dStr = d.dateString;
  // si no hay inicio, o ya había rango cerrado, reiniciar con nuevo inicio
  if (!rangeStart || (rangeStart && rangeEnd)) {
    setRangeStart(dStr);
    setRangeEnd(null);
    setSelected(dStr);
    return;
  }
  // hay inicio y no hay fin -> ahora elegimos fin
  if (dayjs(dStr).isBefore(dayjs(rangeStart))) {
    // si tocaron antes del inicio, invertimos
    setRangeEnd(rangeStart);
    setRangeStart(dStr);
  } else {
    setRangeEnd(dStr);
  }
  setSelected(dStr);
};
const onSaveEvent = (payload) => {
  // payload: { id?, title, notes, startDate, endDate, time }

  // Conflicto: no permitir otro evento que se superponga en alguno de esos días a la misma hora
  const days = eachDateInclusive(payload.startDate, payload.endDate);
  const conflict = days.some(d =>
    events.some(e => {
      // eventos nuevos tienen rango; mantén compat con antiguos con e.date
      const eDays = e.startDate
        ? eachDateInclusive(e.startDate, e.endDate)
        : [e.date]; // compat
      return eDays.includes(d) && e.time === payload.time && e.id !== payload.id;
    })
  );
  if (conflict) {
    Alert.alert(
      "Conflicto de horario",
      `Ya existe un evento a las ${payload.time} en el rango elegido. Cambiá la hora o el rango.`
    );
    return;
  }

  setEvents(prev => {
    if (payload.id) {
      // editar evento existente por id
      return prev.map(p => (p.id === payload.id ? {
        ...p,
        title: payload.title,
        notes: payload.notes,
        startDate: payload.startDate,
        endDate: payload.endDate,
        time: payload.time,
        // compat: eliminamos 'date' si existiera
        date: undefined,
      } : p));
    }

    // ALTA: guardar UN SOLO objeto con rango
    const newEvent = {
      id: `${payload.startDate}_${payload.endDate}_${payload.time}_${Math.random().toString(36).slice(2,8)}`,
      title: payload.title,
      notes: payload.notes,
      startDate: payload.startDate,
      endDate: payload.endDate,
      time: payload.time,
    };
    return [...prev, newEvent];
  });

  setModalVisible(false);
};
  // Load events from storage
  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY(userId));
        if (raw) setEvents(JSON.parse(raw));
      } catch (e) {
        console.warn("No se pudieron cargar los eventos:", e?.message);
      }
    })();
  }, [userId]);

  // Persist on change
  useEffect(() => {
    AsyncStorage.setItem(STORAGE_KEY(userId), JSON.stringify(events)).catch(() => {});
  }, [events, userId]);

const rangeEvents = useMemo(() => {
  const inDay = (ev, day) => {
    if (ev.startDate) {
      return dayjs(day).isBetween(ev.startDate, ev.endDate, "day", "[]");
    }
    // compat: eventos antiguos con 'date'
    return ev.date === day;
  };

  const intersects = (ev, start, end) => {
    if (ev.startDate) {
      // hay intersección si alguno de los extremos cae dentro del otro
      const evStart = dayjs(ev.startDate), evEnd = dayjs(ev.endDate);
      return (
        evStart.isBetween(start, end, "day", "[]") ||
        evEnd.isBetween(start, end, "day", "[]") ||
        start.isBetween(evStart, evEnd, "day", "[]") ||
        end.isBetween(evStart, evEnd, "day", "[]")
      );
    }
    // compat: evento antiguo de un único día
    const d = dayjs(ev.date);
    return d.isBetween(start, end, "day", "[]");
  };

  if (rangeStart && rangeEnd) {
    const s = dayjs(rangeStart), e = dayjs(rangeEnd);
    return events
      .filter(ev => intersects(ev, s, e))
      .sort((a, b) => {
        const aKey = (a.startDate || a.date) || "";
        const bKey = (b.startDate || b.date) || "";
        return aKey.localeCompare(bKey) || a.time.localeCompare(b.time);
      });
  }

  // sin rango: listar eventos que incluyen el día seleccionado
  return events
    .filter(ev => inDay(ev, selected))
    .sort((a, b) => a.time.localeCompare(b.time));
}, [events, selected, rangeStart, rangeEnd]);

const markedDates = useMemo(() => {
  const marks = {};

  // 1) Sombrear rango de selección (si lo hay)
  if (rangeStart && rangeEnd) {
    const start = dayjs(rangeStart);
    const end = dayjs(rangeEnd);
    let cur = start;
    while (cur.isBefore(end, "day") || cur.isSame(end, "day")) {
      const key = cur.format("YYYY-MM-DD");
      const isStart = cur.isSame(start, "day");
      const isEnd = cur.isSame(end, "day");
      marks[key] = {
        ...(marks[key] || {}),
        startingDay: isStart,
        endingDay: isEnd,
        color: "#15A266",
        textColor: "#fff",
      };
      cur = cur.add(1, "day");
    }
  } else {
    marks[selected] = {
      ...(marks[selected] || {}),
      selected: true,
      selectedColor: "#15A266",
    };
  }

  // 2) Para CADA evento, recorré su rango y marcá dots + bloqueo por día
  events.forEach(ev => {
    const days = ev.startDate ? eachDateInclusive(ev.startDate, ev.endDate)
                              : [ev.date]; // compat
    days.forEach(d => {
      const prev = marks[d] || {};
      const prevDots = prev.dots || [];
      const hasBlue = prevDots.some(dot => dot.key === BLUE_DOT.key);
      marks[d] = {
        ...prev,
        dots: hasBlue ? prevDots : [...prevDots, BLUE_DOT],
        marked: true,
        disabled: true,
        disableTouchEvent: true,
      };
    });
  });

  return marks;
}, [events, selected, rangeStart, rangeEnd]);
const openNew = (presetDate) => {
  // si hay rango, por defecto usa el inicio; si no, la fecha seleccionada
  const base = presetDate || (rangeStart ? rangeStart : selected);
  setEditingEvent(null);
  setSelected(base);
  setModalVisible(true);
};

  const onEdit = (ev) => {
    setEditingEvent(ev);
    setModalVisible(true);
  };

  const onDelete = (ev) => {
    Alert.alert("Eliminar evento", `¿Eliminar "${ev.title}"?`, [
      { text: "Cancelar", style: "cancel" },
      { text: "Eliminar", style: "destructive", onPress: () => {
        setEvents(prev => prev.filter(p => p.id !== ev.id));
      } }
    ]);
  };

 const renderItem = ({ item }) => {
  const labelDate = item.startDate
    ? `${dayjs(item.startDate).format("DD/MM/YYYY")} → ${dayjs(item.endDate).format("DD/MM/YYYY")}`
    : dayjs(item.date).format("DD/MM/YYYY"); // compat

  return (
    <View style={styles.item}>
      <View style={{ flex: 1 }}>
        <Text style={styles.itemTitle}>
          {labelDate}  •  {item.time}  •  {item.title}
        </Text>
        {item.notes ? <Text style={styles.itemNotes}>{item.notes}</Text> : null}
      </View>
      <View style={styles.itemActions}>
        <TouchableOpacity style={[styles.actionBtn, styles.edit]} onPress={() => onEdit(item)}>
          <Text style={styles.actionText}>Editar</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionBtn, styles.delete]} onPress={() => onDelete(item)}>
          <Text style={styles.actionText}>Borrar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

return (
  <View style={styles.container}>
    <Text style={styles.heading}>Calendario</Text>

<Calendar
  onDayPress={handleDayPress}
  onDayLongPress={(d) => openNew(d.dateString)}   // no se llamará en días bloqueados
  markedDates={markedDates}
  markingType="period"
  theme={{
    arrowColor: "#15A266",
    todayTextColor: "#15A266",
    selectedDayBackgroundColor: "#15A266",
    // opcional: color de texto de días deshabilitados
    textDisabledColor: "#b5b5b5",
  }}
/>

    {/* Header con rango o día */}
    <View style={styles.dayHeader}>
                <TouchableOpacity
        style={[styles.chipBtn, { backgroundColor: "#0CA5FF" }]}
        onPress={() => setAllVisible(true)}
        >
        <Text style={styles.chipText}>Eventos</Text>
        </TouchableOpacity>
      <Text
        style={styles.dayTitle}
        numberOfLines={1}
        ellipsizeMode="tail"
      >
        {rangeStart && rangeEnd
          ? `Rango: ${dayjs(rangeStart).format("DD/MM/YYYY")} → ${dayjs(rangeEnd).format("DD/MM/YYYY")}`
          : dayjs(selected).format("dddd DD/MM/YYYY")
        }
      </Text>

      <View style={styles.headerActions}>
        {rangeStart ? (
          <TouchableOpacity
            style={[styles.chipBtn, styles.chipGrey]}
            onPress={() => { setRangeStart(null); setRangeEnd(null); }}
          >
            <Text style={styles.chipText}>Limpiar</Text>
          </TouchableOpacity>
        ) : null}
        <TouchableOpacity
          style={[styles.chipBtn, styles.chipGreen]}
          onPress={() => openNew()}
        >
          <Text style={styles.chipText}>+ Evento</Text>
        </TouchableOpacity>
      </View>
    </View>

    {/* Lista de eventos o vacío */}
    {rangeEvents.length === 0 ? (
      <Text style={styles.empty}>
        {rangeStart && rangeEnd
          ? "No hay eventos en el rango seleccionado."
          : "No hay eventos para este día."
        }
      </Text>
    ) : (
      <FlatList
        data={rangeEvents}
        keyExtractor={(it) => it.id}
        renderItem={renderItem}
        ItemSeparatorComponent={() => <View style={styles.sep} />}
        contentContainerStyle={{ paddingBottom: 16 }}
      />
    )}

    {/* Modal para agregar/editar eventos */}
        <EventFormModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSave={onSaveEvent}
        initialDate={!rangeStart ? selected : undefined}
        initialStartDate={rangeStart || undefined}
        initialEndDate={rangeEnd || undefined}
        editingEvent={editingEvent}
        />
    <Modal visible={allVisible} animationType="slide" transparent>
  <View style={styles.backdrop}>
<View style={[styles.card, { maxHeight: "80%" }]}>
  <Text style={styles.title}>Todos los eventos</Text>

  {events.length === 0 ? (
    <Text style={styles.empty}>No hay eventos guardados.</Text>
  ) : (
    <FlatList
  data={[...events].sort(
    (a, b) =>
      ((a.startDate || a.date || "").localeCompare(b.startDate || b.date || "")) ||
      a.time.localeCompare(b.time)
  )}
  keyExtractor={(it) => it.id}
  ItemSeparatorComponent={() => <View style={styles.sep} />}
  renderItem={({ item }) => {
    const labelDate = item.startDate
      ? `${dayjs(item.startDate).format("DD/MM/YYYY")} → ${dayjs(item.endDate).format("DD/MM/YYYY")}`
      : dayjs(item.date).format("DD/MM/YYYY"); // compat con eventos viejos

    return (
      <View style={styles.item}>
        <View style={{ flex: 1 }}>
          <Text style={styles.itemTitle}>
            {labelDate} • {item.time} • {item.title}
          </Text>
          {!!item.notes && <Text style={styles.itemNotes}>{item.notes}</Text>}
        </View>
        <View style={styles.itemActions}>
          <TouchableOpacity
            style={[styles.actionBtn, styles.delete]}
            onPress={() => {
              setEvents(prev => prev.filter(p => p.id !== item.id));
            }}
          >
            <Text style={styles.actionText}>Borrar</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }}
  contentContainerStyle={{ paddingBottom: 16 }}
/>
  )}

  <View style={[styles.row, { marginTop: 12 }]}>
    <TouchableOpacity style={[styles.btn, styles.cancel]} onPress={() => setAllVisible(false)}>
      <Text style={styles.btnText}>Cerrar</Text>
    </TouchableOpacity>
            </View>
        </View>
  </View>
  </Modal>
</View>

);
}

const styles = StyleSheet.create({
  container: { 
    marginTop: 16, 
    flex: 1 
  },

  heading: { 
    fontSize: 20, 
    fontWeight: "bold", 
    marginBottom: 8 
  },
  dayHeader: {
    marginTop: 8,
    paddingHorizontal: 4,
    paddingVertical: 6,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  dayTitle: {
    flex: 1,
    minWidth: 0,              // permite que se trunque el texto
    fontSize: 16,
    fontWeight: "600",
  },

  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginLeft: 8,
    flexShrink: 0,
  },

  chipBtn: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 8,
  },
  chipGrey: { backgroundColor: "#999" },
  chipGreen: { backgroundColor: "#15A266" },
  chipText: { color: "#fff", fontWeight: "600" },
  empty: { 
    marginTop: 8, 
    color: "#666" 
  },

  sep: { 
    height: 10 
  },

  item: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#F6FDF9",
    borderRadius: 12,
    padding: 12,
  },

  itemTitle: { 
    fontSize: 15, 
    fontWeight: "600", 
    marginBottom: 4 
  },

  itemNotes: { 
    fontSize: 14, 
    color: "#333" 
  },

  itemActions: { 
    flexDirection: "row", 
    gap: 8, 
    marginLeft: 8 
  },

  actionBtn: { 
    paddingHorizontal: 10, 
    paddingVertical: 8, 
    borderRadius: 8 
  },

  edit: { backgroundColor: "#0CA5FF" },
  delete: { backgroundColor: "#F04438" },
  actionText: { 
    color: "#fff", 
    fontWeight: "600" 
  },
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
},
});
