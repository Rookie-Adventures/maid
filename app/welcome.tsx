import React, { useState, useMemo } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, StyleSheet, 
  ScrollView, Alert, ActivityIndicator 
} from 'react-native';
import { useSystem } from '@/context';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Welcome() {
  const router = useRouter();
  const { colorScheme, setUserName } = useSystem();
  
  const [step, setStep] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);

  // Form State
  const [accessCode, setAccessCode] = useState<string>("");
  const [nickName, setNickName] = useState<string>("");
  const [birthYear, setBirthYear] = useState<string>("");
  const [knowledgeLevel, setKnowledgeLevel] = useState<string>("");

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colorScheme.surface,
      padding: 24,
      justifyContent: 'center',
    },
    title: {
      color: colorScheme.primary,
      fontSize: 28,
      fontWeight: 'bold',
      marginBottom: 8,
      textAlign: 'center',
    },
    subtitle: {
      color: colorScheme.onSurfaceVariant,
      fontSize: 16,
      marginBottom: 32,
      textAlign: 'center',
    },
    input: {
      backgroundColor: colorScheme.surfaceVariant,
      color: colorScheme.onSurface,
      borderRadius: 12,
      padding: 16,
      fontSize: 18,
      marginBottom: 16,
    },
    button: {
      backgroundColor: colorScheme.primary,
      borderRadius: 12,
      padding: 16,
      alignItems: 'center',
      marginTop: 16,
    },
    buttonText: {
      color: colorScheme.onPrimary,
      fontSize: 18,
      fontWeight: 'bold',
    },
    stepContainer: {
      width: '100%',
    }
  });

  const nextStep = () => setStep(prev => prev + 1);

  // Step 0: Access Code Verification
  const verifyAccessCode = async () => {
    setLoading(true);
    // TODO: Connect to backend for real verification
    setTimeout(() => {
      if (accessCode.toUpperCase() === "MAID2026" || accessCode.startsWith("INV-")) {
        nextStep();
      } else {
        Alert.alert("Invalid Code", "Please enter a valid Beta Code or Invite Code.");
      }
      setLoading(false);
    }, 1000);
  };

  // Step 1: Identity & Compliance
  const handleIdentity = () => {
    if (nickName.length < 2) {
      Alert.alert("Invalid Name", "Please enter a real nickname.");
      return;
    }
    const year = parseInt(birthYear);
    if (isNaN(year) || year < 1920 || year > 2026) {
      Alert.alert("Invalid Year", "Please enter a valid birth year.");
      return;
    }
    setUserName(nickName);
    nextStep();
  };

  const finishOnboarding = async () => {
    await AsyncStorage.setItem("has_seen_welcome", "true");
    router.replace("/account/login");
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}>
        
        {step === 0 && (
          <View style={styles.stepContainer}>
            <Text style={styles.title}>Welcome to Maid</Text>
            <Text style={styles.subtitle}>Enter your Beta Access Code to begin.</Text>
            <TextInput 
              style={styles.input} 
              placeholder="e.g. MAID2026" 
              placeholderTextColor={colorScheme.onSurfaceVariant}
              value={accessCode}
              onChangeText={setAccessCode}
              autoCapitalize="characters"
            />
            <TouchableOpacity style={styles.button} onPress={verifyAccessCode}>
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Verify Code</Text>}
            </TouchableOpacity>
          </View>
        )}

        {step === 1 && (
          <View style={styles.stepContainer}>
            <Text style={styles.title}>Tell us about you</Text>
            <Text style={styles.subtitle}>Setting your foundation.</Text>
            <TextInput 
              style={styles.input} 
              placeholder="Nickname" 
              placeholderTextColor={colorScheme.onSurfaceVariant}
              value={nickName}
              onChangeText={setNickName}
            />
            <TextInput 
              style={styles.input} 
              placeholder="Birth Year (Non-editable later)" 
              placeholderTextColor={colorScheme.onSurfaceVariant}
              value={birthYear}
              onChangeText={setBirthYear}
              keyboardType="numeric"
            />
            <TouchableOpacity style={styles.button} onPress={handleIdentity}>
              <Text style={styles.buttonText}>Next Step</Text>
            </TouchableOpacity>
          </View>
        )}

        {step === 2 && (
          <View style={styles.stepContainer}>
            <Text style={styles.title}>Ready to Start?</Text>
            <Text style={styles.subtitle}>The full questionnaire logic will be expanded here (Risk, Platform Intro, etc.)</Text>
            <TouchableOpacity style={styles.button} onPress={finishOnboarding}>
              <Text style={styles.buttonText}>Complete Onboarding</Text>
            </TouchableOpacity>
          </View>
        )}

      </ScrollView>
    </View>
  );
}