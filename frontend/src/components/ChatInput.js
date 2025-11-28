import React from "react";
import { View, TextInput, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function ChatInput({ inputText, setInputText, onSend }) {
  return (
    <View style={{ flexDirection: "row", padding: 14, backgroundColor: "#fff" }}>
      <TextInput
        style={{
          flex: 1,
          backgroundColor: "#f5f5f5",
          borderRadius: 24,
          paddingHorizontal: 16,
          paddingVertical: 12,
        }}
        placeholder="Escribe tu mensaje..."
        value={inputText}
        onChangeText={setInputText}
        multiline
      />

      <TouchableOpacity onPress={onSend} disabled={!inputText.trim()}>
        <Ionicons name="send" size={22} color="#15A266" />
      </TouchableOpacity>
    </View>
  );
}
