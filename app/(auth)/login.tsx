// Login.tsx
import React, { useState, useEffect } from 'react';
import { router, Link, Redirect } from 'expo-router';
import {
  View,
  StyleSheet,
  Platform,
  KeyboardAvoidingView,
  ActivityIndicator,
  TouchableOpacity,
  TextInput,
  Alert,
  Text
} from 'react-native';
import Colors from '~/constants/Colors';
import { defaultStyles } from '~/constants/Styles';
import { Ionicons } from '@expo/vector-icons';
import { UserDetails, useUserStore } from '~/store/user-storage';

interface LoginResponse {
  message: string;
  userdetails: UserDetails[];
}

export default function Login(): JSX.Element {
  const [loading, setLoading] = useState<boolean>(false);
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const keyboardVerticalOffset: number = Platform.OS === 'ios' ? 80 : 0;
  const { user, setUser } = useUserStore();

  if (user) {
    // router.replace('/(tabs)');
    return (
      <Redirect href="/(tabs)" />
    )
  }

  const onSignInPress = async (): Promise<void> => {
    setLoading(true);
    try {
      const response = await fetch('https://jewapropertypro.com/infinity/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data: LoginResponse = await response.json();

      if (data.userdetails) {
        setUser(data.userdetails[0]);
        Alert.alert('Success', 'Login successful');
        router.replace('/(tabs)');
      } else if (data.message === 'Your email has not been verified, please verify your email first') {
        router.push('/pending-approval');
      } else {
        Alert.alert('Login Failed', 'Invalid email or password');
      }
    } catch (error) {
      console.error('Login error:', error);
      Alert.alert('Login Failed', error instanceof Error ? error.message : 'An error occurred during login');
      router.replace('/')
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={keyboardVerticalOffset}
    >
      <View style={[styles.container]}>
        <Text style={styles.header}>Log In to your account</Text>
        <View style={styles.inputContainer}>
          <Ionicons name="mail-outline" size={24} color={Colors.gray} style={styles.icon} />
          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor={Colors.gray}
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
          />
        </View>
        <View style={styles.inputContainer}>
          <Ionicons name="lock-closed-outline" size={24} color={Colors.gray} style={styles.icon} />
          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor={Colors.gray}
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
        </View>
        <TouchableOpacity
          style={[
            styles.button,
            (email !== '' && password !== '') ? styles.enabled : styles.disabled,
          ]}
          onPress={onSignInPress}
          disabled={loading || email === '' || password === ''}
        >
          {loading ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <Text style={styles.buttonText}>Sign In</Text>
          )}
        </TouchableOpacity>
        <Link href="/(auth)/register" asChild>
          <TouchableOpacity style={styles.registerLink}>
            <Text style={styles.linkText}>Don't have an account? Sign Up</Text>
          </TouchableOpacity>
        </Link>
        <Link href="/(auth)/forgot-password" asChild>
          <TouchableOpacity style={styles.loginLink}>
            <Text style={styles.linkText}>Forgot Password?</Text>
          </TouchableOpacity>
        </Link>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  header: {
    fontSize: 24,
    fontFamily: 'Nunito_700Bold',
    marginBottom: 30,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: Colors.lightGray,
    marginBottom: 20,
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 13,
    paddingVertical: 10,
    fontFamily: 'Nunito_400Regular',
  },
  button: {
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  enabled: {
    opacity: 1,
  },
  disabled: {
    opacity: 0.5,
  },
  registerLink: {
    alignItems: 'center',
    marginTop: 20,
  },
  linkText: {
    color: 'black',
    fontSize: 14,
  },
  loginLink: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 40,
  },
});