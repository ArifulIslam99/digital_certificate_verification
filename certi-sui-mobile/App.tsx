import { Buffer } from 'buffer';
global.Buffer = Buffer; // Polyfill Buffer for React Native

import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Dimensions, Image, SafeAreaView } from 'react-native';
import { Transaction } from '@mysten/sui/transactions';
import { SuiClient, getFullnodeUrl } from '@mysten/sui/client';
import Navbar from './components/Navbar';

// Placeholder IDs - replace with actual IDs after deploying the contract
const PACKAGE_ID = '0x88214d4f6010c1d68cf1e49b7ff22a31a4266e88446b15c2ae9c83134b5970b5';
const CERTIFICATE_STORE_ID = '0x45aac39bcba07ee6bbce1f7500c1de9ecdd87a16df722a44c3950fc593ec5cd2';

const client = new SuiClient({ url: getFullnodeUrl('testnet') });

function bytesToCleanString(bytes: any) {
  // Keep printable ASCII
  const filtered = bytes.filter((b: any) => b >= 32 && b <= 126);
  let str = new TextDecoder().decode(new Uint8Array(filtered));

  // Remove leading non-letter/non-digit characters (like + - etc.)
  str = str.replace(/^[^a-zA-Z0-9]+/, '');  

  return str;
}

export default function App() {
  const [certId, setCertId] = useState<string>('');
  const [studentName, setStudentName] = useState<string>('');
  const [blobId, setBlobId] = useState<string>('');
  const [isValid, setIsValid] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<string>('');

  const handleVerify = async () => {
    setLoading(true);
    setMessage('');
    setIsValid(false);
    setStudentName('');
    setBlobId('');

    try {
      const tx = new Transaction();
      tx.moveCall({
        target: `${PACKAGE_ID}::certificate_system::verify_certificate`,
        arguments: [tx.object(CERTIFICATE_STORE_ID), tx.pure.address(certId)],
      });

      const result = await client.devInspectTransactionBlock({
        transactionBlock: tx,
        sender: '0xe86e9c41dca2f50ace7e646856ef3ee02f7c5754d74da95fe64a522dfc72f2a1',
      });

      let revoked = result?.results?.[0].returnValues?.[0][0][0];
      let studentNameValue = bytesToCleanString(result?.results?.[0].returnValues?.[1][0]);
      let blobIdValue = bytesToCleanString(result?.results?.[0].returnValues?.[2][0]);

      const isValidValue = typeof revoked === 'number' ? revoked === 1 : false;


      setIsValid(isValidValue);
      setStudentName(studentNameValue);
      setBlobId(blobIdValue);

      if (!isValidValue) {
        setMessage('Certificate is invalid or revoked.');
      }
    } catch (error) {
      console.error('Error verifying certificate:', error);
      setMessage('Failed to verify certificate. Check console for details.');
    }

    setLoading(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Navbar />
      <View style={styles.main}>
        <View style={styles.card}>
          <Text style={styles.title}>On-chain Certificate Verification</Text>
          <TextInput
            style={styles.input}
            value={certId}
            onChangeText={setCertId}
            placeholder="Enter Certificate ID"
            placeholderTextColor="#6b7280"
          />
          <TouchableOpacity
            style={[styles.button, (loading || !certId) && styles.buttonDisabled]}
            onPress={handleVerify}
            disabled={loading || !certId}
          >
            <Text style={styles.buttonText}>{loading ? 'Verifying...' : 'Verify Certificate'}</Text>
          </TouchableOpacity>
          {message && (
            <Text style={[styles.message, message.includes('successful') ? styles.messageSuccess : styles.messageError]}>
              {message}
            </Text>
          )}
          {isValid && studentName && (
            <View style={styles.result}>
              <Text style={styles.resultText}>
                <Text style={styles.resultLabel}>Student Name: </Text>
                {studentName}
              </Text>
              <Text style={styles.resultText}>
                <Text style={styles.resultLabel}>Status: </Text>
                <Text style={isValid ? styles.statusValid : styles.statusInvalid}>
                  {isValid ? 'Valid' : 'Invalid'}
                </Text>
              </Text>
            </View>
          )}
          {isValid && blobId && (
            <View style={styles.imageContainer}>
              <Text style={styles.imageTitle}>Certificate</Text>
              <Image
                source={{ uri: `https://ipfs.io/ipfs/${blobId}` }}
                style={styles.certificateImage}
                resizeMode="contain"
                onError={() => setMessage('Failed to load certificate image.')}
              />
            </View>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}

const { width } = Dimensions.get('window');
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  main: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: '100%',
    maxWidth: 500,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2563eb',
    textAlign: 'center',
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 4,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
    color: '#111827',
  },
  button: {
    backgroundColor: '#2563eb',
    padding: 12,
    borderRadius: 4,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#9ca3af',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  message: {
    textAlign: 'center',
    marginTop: 16,
    fontSize: 14,
  },
  messageSuccess: {
    color: '#16a34a',
  },
  messageError: {
    color: '#dc2626',
  },
  result: {
    marginTop: 16,
    alignItems: 'center',
  },
  resultText: {
    fontSize: 16,
    color: '#111827',
    marginBottom: 8,
  },
  resultLabel: {
    fontWeight: '600',
  },
  statusValid: {
    color: '#15803d',
  },
  statusInvalid: {
    color: '#dc2626',
  },
  imageContainer: {
    marginTop: 16,
    alignItems: 'center',
  },
  imageTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  certificateImage: {
    width: width * 0.7,
    height: width * 0.7 * (3 / 4),
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
});