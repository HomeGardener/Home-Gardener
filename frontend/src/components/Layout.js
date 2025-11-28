import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import Footer from './Footer';
import Navbar from './Navbar';
import Notifications from './Notifications';
import Ionicons from 'react-native-vector-icons/Ionicons';

export default function Layout({ children, navigation, showBackButton = true }) {
    return (
        <View style={styles.container}>
            {showBackButton && (
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#000" />
                </TouchableOpacity>
            )}
            <Navbar style={styles.navbar} />
            <Notifications />
            <View style={styles.content}>{children}</View>
            <Footer navigation={navigation} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    navbar: { height: 60 },
    content: { flex: 1 },
    backButton: {
        position: 'absolute',
        top: 10,
        left: 10,
        padding: 10,
        zIndex: 10,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        borderRadius: 20,
    },
});
