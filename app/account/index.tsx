import { useLLM, useSystem } from '@/context';
import { HermesContextProps } from '@/context/language-model/types';
import getSupabase from '@/utilities/supabase';
import { User } from '@supabase/supabase-js';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View, ScrollView, ProgressBarAndroid, Platform } from 'react-native';
import UserImageView from '@/components/views/user-image-view';

export default function Index() {
  const router = useRouter();
  const { 
    colorScheme, userName, 
    level, exp, inviteCount, membershipTier 
  } = useSystem();
  
  const llm = useLLM();
  const [user, setUser] = useState<User | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<boolean>(false);

  // Hermes connection check
  const isHermes = llm.type === "Hermes";
  const hermesProps = isHermes ? (llm as unknown as HermesContextProps) : null;

  // Calculate EXP progress (Example: each level needs 5000 tokens)
  const expNeeded = level * 5000;
  const progress = Math.min(exp / expNeeded, 1);

  useEffect(() => {
    getSupabase().auth.getUser().then(({ data }) => {
      setUser(data.user);
    });
  }, []);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colorScheme.surface,
    },
    header: {
      padding: 24,
      alignItems: 'center',
      borderBottomWidth: 1,
      borderBottomColor: colorScheme.surfaceVariant,
    },
    userName: {
      color: colorScheme.onSurface,
      fontSize: 22,
      fontWeight: 'bold',
      marginTop: 12,
    },
    membershipBadge: {
      backgroundColor: membershipTier === "VIP" ? "#FFD700" : colorScheme.secondary,
      paddingHorizontal: 12,
      paddingVertical: 4,
      borderRadius: 12,
      marginTop: 8,
      fontSize: 12,
      fontWeight: 'bold',
      color: membershipTier === "VIP" ? "#000" : colorScheme.onSecondary,
    },
    section: {
      marginTop: 24,
      paddingHorizontal: 16,
    },
    sectionTitle: {
      color: colorScheme.primary,
      fontSize: 12,
      fontWeight: 'bold',
      textTransform: 'uppercase',
      marginBottom: 8,
      marginLeft: 16,
    },
    card: {
      backgroundColor: colorScheme.surfaceVariant,
      borderRadius: 16,
      padding: 16,
      gap: 12,
    },
    progressBarBackground: {
      height: 8,
      backgroundColor: colorScheme.surface,
      borderRadius: 4,
      width: '100%',
      overflow: 'hidden',
    },
    progressBarFill: {
      height: '100%',
      backgroundColor: colorScheme.primary,
      width: `${progress * 100}%`,
    },
    statsRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    statsLabel: {
      color: colorScheme.onSurfaceVariant,
      fontSize: 14,
    },
    statsValue: {
      color: colorScheme.onSurface,
      fontWeight: 'bold',
    },
    inviteBox: {
      backgroundColor: inviteCount >= 3 ? "#4CAF50" : colorScheme.errorContainer,
      padding: 12,
      borderRadius: 12,
      alignItems: 'center',
    },
    inviteText: {
      color: inviteCount >= 3 ? "#fff" : colorScheme.onErrorContainer,
      fontWeight: 'bold',
    },
    item: {
      paddingVertical: 12,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      borderBottomWidth: 1,
      borderBottomColor: colorScheme.surface,
    },
    itemLabel: {
      color: colorScheme.onSurface,
      fontSize: 16,
    }
  });

  const logout = async () => {
    try {
      await getSupabase().auth.signOut();
      router.replace("/account/login");
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* Identity Header */}
      <View style={styles.header}>
        <UserImageView />
        <Text style={styles.userName}>{userName || "User"}</Text>
        <Text style={styles.membershipBadge}>{membershipTier} MEMBER</Text>
      </View>

      {/* Level & Experience */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Level & Growth</Text>
        <View style={styles.card}>
          <View style={styles.statsRow}>
            <Text style={styles.statsLabel}>Level {level}</Text>
            <Text style={styles.statsLabel}>{exp} / {expNeeded} EXP</Text>
          </View>
          <View style={styles.progressBarBackground}>
            <View style={styles.progressBarFill} />
          </View>
          <Text style={{ fontSize: 12, color: colorScheme.onSurfaceVariant }}>
            Hint: Consume tokens to gain experience.
          </Text>
        </View>
      </View>

      {/* Invitation Gate */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Container Access</Text>
        <View style={styles.card}>
          <View style={styles.inviteBox}>
            <Text style={styles.inviteText}>
              Invites: {inviteCount} / 3
            </Text>
          </View>
          <TouchableOpacity 
            disabled={inviteCount < 3}
            style={{ 
              backgroundColor: inviteCount >= 3 ? colorScheme.primary : colorScheme.outline, 
              padding: 12, 
              borderRadius: 12, 
              alignItems: 'center' 
            }}
          >
            <Text style={{ color: inviteCount >= 3 ? colorScheme.onPrimary : colorScheme.surface, fontWeight: 'bold' }}>
              {inviteCount >= 3 ? "PROVISION PRIVATE AGENT" : "LOCK: NEED 3 INVITES"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Account Settings */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account Settings</Text>
        <View style={[styles.card, { padding: 0 }]}>
          <TouchableOpacity style={[styles.item, { paddingHorizontal: 16 }]} onPress={logout}>
            <Text style={styles.itemLabel}>Logout</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.item, { paddingHorizontal: 16 }]} onPress={() => setShowDeleteConfirm(true)}>
            <Text style={[styles.itemLabel, { color: colorScheme.error }]}>Delete Account</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={{ height: 64 }} />
    </ScrollView>
  );
}