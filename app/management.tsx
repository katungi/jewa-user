import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, FlatList, Alert, Modal, SafeAreaView, Image, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { defaultStyles } from '~/constants/Styles';
import { router } from 'expo-router';
import Colors from '~/constants/Colors';
import { Picker } from '@react-native-picker/picker';
import JewaText from '~/components/JewaText';

type DomesticHelp = {
    id: string;
    name: string;
    type: string;
    phoneNumber: string;
    passcode: string;
    status: 'in' | 'out';
    lastEntry?: Date;
    lastExit?: Date;
    avatar?: string;
};

const DomesticHelpManagement: React.FC = () => {
    const [domesticHelps, setDomesticHelps] = useState<DomesticHelp[]>([]);
    const [activeHelps, setActiveHelps] = useState<DomesticHelp[]>([]);
    const [isAddingHelp, setIsAddingHelp] = useState(false);
    const [newHelp, setNewHelp] = useState<Partial<DomesticHelp>>({});
    const [selectedHelp, setSelectedHelp] = useState<DomesticHelp | null>(null);

    useEffect(() => {
        const initialHelps = [
            { id: '1', name: 'John Doe', type: 'Cook', phoneNumber: '1234567890', passcode: '123456', status: 'out', avatar: `https://i.pravatar.cc/150?u=1` },
            { id: '2', name: 'Jane Smith', type: 'Maid', phoneNumber: '0987654321', passcode: '654321', status: 'in', lastEntry: new Date(), avatar: `https://i.pravatar.cc/150?u=2` },
        ];
        setDomesticHelps(initialHelps);
        updateActiveHelps(initialHelps);
    }, []);

    const updateActiveHelps = (helps: DomesticHelp[]) => {
        setActiveHelps(helps.filter(help => help.status === 'in'));
    };

    const addDomesticHelp = () => {
        if (!newHelp.name || !newHelp.type || !newHelp.phoneNumber) {
            Alert.alert('Error', 'Please fill all fields');
            return;
        }
        const passcode = Math.floor(100000 + Math.random() * 900000).toString();
        const help: DomesticHelp = {
            ...newHelp as DomesticHelp,
            id: Date.now().toString(),
            passcode,
            status: 'out',
            avatar: `https://i.pravatar.cc/150?u=${Date.now()}`
        };
        const updatedHelps = [...domesticHelps, help];
        setDomesticHelps(updatedHelps);
        updateActiveHelps(updatedHelps);
        setIsAddingHelp(false);
        setNewHelp({});
        Alert.alert('Success', `Passcode for ${help.name}: ${passcode}`);
    };

    const updateHelpStatus = (id: string, status: 'in' | 'out') => {
        const updatedHelps = domesticHelps.map(help => {
            if (help.id === id) {
                return {
                    ...help,
                    status,
                    ...(status === 'in' ? { lastEntry: new Date() } : { lastExit: new Date() })
                };
            }
            return help;
        });
        setDomesticHelps(updatedHelps);
        updateActiveHelps(updatedHelps);
    };

    const renderActiveHelpItem = ({ item }: { item: DomesticHelp }) => (
        <TouchableOpacity style={styles.activeHelpItem} onPress={() => setSelectedHelp(item)}>
            <Image source={{ uri: item.avatar }} style={styles.activeAvatar} />
            <JewaText style={styles.activeName}>{item.name}</JewaText>
        </TouchableOpacity>
    );

    const renderHelpItem = ({ item }: { item: DomesticHelp }) => (
        <TouchableOpacity style={styles.helpItem} onPress={() => setSelectedHelp(item)}>
            <Image source={{ uri: item.avatar }} style={styles.avatar} />
            <View style={styles.helpInfo}>
                <JewaText style={styles.helpName}>{item.name}</JewaText>
                <JewaText>{item.type}</JewaText>
                <JewaText>Status: {item.status}</JewaText>
            </View>
            <TouchableOpacity onPress={() => updateHelpStatus(item.id, item.status === 'in' ? 'out' : 'in')}>
                <Ionicons name={item.status === 'in' ? 'exit-outline' : 'enter-outline'} size={24} color="black" />
            </TouchableOpacity>
        </TouchableOpacity>
    );

    const HelpTicket = () => (
        <Modal
            visible={!!selectedHelp}
            transparent
            animationType="slide"
            onRequestClose={() => setSelectedHelp(null)}
        >
            <View style={styles.modalContainer}>
                <View style={styles.ticketContainer}>
                    {selectedHelp && (
                        <>
                            <Image source={{ uri: selectedHelp.avatar }} style={styles.ticketAvatar} />
                            <JewaText style={styles.ticketName}>{selectedHelp.name}</JewaText>
                            <JewaText style={styles.ticketType}>{selectedHelp.type}</JewaText>
                            <JewaText style={styles.ticketPhone}>Phone: {selectedHelp.phoneNumber}</JewaText>
                            <JewaText style={styles.ticketPasscode}>Passcode: {selectedHelp.passcode}</JewaText>
                            <JewaText style={styles.ticketStatus}>Status: {selectedHelp.status}</JewaText>
                            {selectedHelp.lastEntry && <JewaText style={styles.ticketDate}>Last Entry: {selectedHelp.lastEntry.toLocaleString()}</JewaText>}
                            {selectedHelp.lastExit && <JewaText style={styles.ticketDate}>Last Exit: {selectedHelp.lastExit.toLocaleString()}</JewaText>}
                            <TouchableOpacity style={styles.closeButton} onPress={() => setSelectedHelp(null)}>
                                <Ionicons name="close-circle" size={24} color={Colors.primary} />
                            </TouchableOpacity>
                        </>
                    )}
                </View>
            </View>
        </Modal>
    );

    return (
        <SafeAreaView style={defaultStyles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color="black" />
                </TouchableOpacity>
                <JewaText style={styles.title}>Domestic Help</JewaText>
                <TouchableOpacity onPress={() => setIsAddingHelp(true)}>
                    <Ionicons name="add-circle-outline" size={24} color="black" />
                </TouchableOpacity>
            </View>

            <View style={styles.activeHelpsContainer}>
                <JewaText style={styles.sectionTitle}>Currently Active</JewaText>
                <FlatList
                    data={activeHelps}
                    renderItem={renderActiveHelpItem}
                    keyExtractor={item => item.id}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                />
            </View>

            <View style={styles.allHelpsContainer}>
                <JewaText style={styles.sectionTitle}>All Domestic Helps</JewaText>
                <FlatList
                    data={domesticHelps}
                    renderItem={renderHelpItem}
                    keyExtractor={item => item.id}
                    ListEmptyComponent={<JewaText style={styles.emptyJewaText}>No domestic help registered.</JewaText>}
                />
            </View>

            <Modal visible={isAddingHelp} animationType="slide">
                <SafeAreaView style={styles.addHelpForm}>
                    <JewaText style={styles.modalTitle}>Add New Domestic Help</JewaText>
                    <TextInput
                        style={styles.input}
                        placeholder="Name"
                        value={newHelp.name}
                        onChangeText={JewaText => setNewHelp({ ...newHelp, name: JewaText })}
                    />
                    <Picker
                        selectedValue={newHelp.type}
                        onValueChange={(itemValue) => setNewHelp({ ...newHelp, type: itemValue })}
                        style={styles.picker}
                    >
                        <Picker.Item label="Select Type" value="" />
                        <Picker.Item label="Cook" value="Cook" />
                        <Picker.Item label="Maid" value="Maid" />
                        <Picker.Item label="Driver" value="Driver" />
                        <Picker.Item label="Gardener" value="Gardener" />
                    </Picker>
                    <TextInput
                        style={styles.input}
                        placeholder="Phone Number"
                        value={newHelp.phoneNumber}
                        onChangeText={JewaText => setNewHelp({ ...newHelp, phoneNumber: JewaText })}
                        keyboardType="phone-pad"
                    />
                    <TouchableOpacity style={defaultStyles.pillButton} onPress={addDomesticHelp}>
                        <JewaText style={defaultStyles.buttonJewaText}>Add Domestic Help</JewaText>
                    </TouchableOpacity>
                    <TouchableOpacity style={[defaultStyles.pillButton, styles.cancelButton]} onPress={() => setIsAddingHelp(false)}>
                        <JewaText style={defaultStyles.buttonJewaText}>Cancel</JewaText>
                    </TouchableOpacity>
                </SafeAreaView>
            </Modal>

            <HelpTicket />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
        marginLeft: 20,
        marginTop: 10
    },
    activeHelpsContainer: {
        marginBottom: 20,
    },
    activeHelpItem: {
        alignItems: 'center',
        marginHorizontal: 10,
    },
    activeAvatar: {
        width: 60,
        height: 60,
        borderRadius: 30,
    },
    activeName: {
        marginTop: 5,
        fontSize: 12,
    },
    allHelpsContainer: {
        flex: 1,
    },
    helpItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'white',
        padding: 16,
        marginHorizontal: 16,
        marginBottom: 8,
        borderRadius: 8,
    },
    avatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
        marginRight: 16,
    },
    helpInfo: {
        flex: 1,
    },
    helpName: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    emptyJewaText: {
        textAlign: 'center',
        marginTop: 32,
    },
    addHelpForm: {
        padding: 20,
        backgroundColor: 'white',
        borderRadius: 16,
        margin: 20,
    },
    modalTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 16,
    },
    input: {
        backgroundColor: Colors.lightGray,
        padding: 20,
        borderRadius: 16,
        fontSize: 20,
        marginBottom: 20,
    },
    picker: {
        backgroundColor: Colors.lightGray,
        borderRadius: 16,
        marginBottom: 20,
    },
    cancelButton: {
        backgroundColor: Colors.gray,
        marginTop: 10,
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    ticketContainer: {
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 20,
        alignItems: 'center',
        width: '80%',
    },
    ticketAvatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        marginBottom: 10,
    },
    ticketName: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    ticketType: {
        fontSize: 18,
        marginBottom: 5,
    },
    ticketPhone: {
        fontSize: 16,
        marginBottom: 5,
    },
    ticketPasscode: {
        fontSize: 16,
        marginBottom: 5,
    },
    ticketStatus: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    ticketDate: {
        fontSize: 14,
        color: Colors.gray,
    },
    closeButton: {
        position: 'absolute',
        top: 10,
        right: 10,
    },
});

export default DomesticHelpManagement;