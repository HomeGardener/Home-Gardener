import React from "react";
import { View, Text, Image } from "react-native";

export default function ChatMessage({ message, formatTime }) {
  const isUser = message.sender === "user";

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "flex-end",
        marginBottom: 12,
        maxWidth: "80%",
        alignSelf: isUser ? "flex-end" : "flex-start",
      }}
    >
      {!isUser && (
        <Image
          source={{ uri: "https://cdn-icons-png.flaticon.com/512/4712/4712035.png" }}
          style={{ width: 30, height: 30, borderRadius: 15, marginRight: 8 }}
        />
      )}

      <View
        style={{
          backgroundColor: isUser ? "#15A266" : "#fff",
          padding: 12,
          borderRadius: 18,
        }}
      >
        <Text style={{ color: isUser ? "#fff" : "#333" }}>{message.text}</Text>
        <Text style={{ fontSize: 10, marginTop: 4, opacity: 0.7 }}>
          {formatTime(message.timestamp)}
        </Text>
      </View>

      {isUser && (
        <Image
          source={{ uri: "https://cdn-icons-png.flaticon.com/512/3135/3135715.png" }}
          style={{ width: 30, height: 30, borderRadius: 15, marginLeft: 8 }}
        />
      )}
    </View>
  );
}
