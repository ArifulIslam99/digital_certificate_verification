'use client';

import { useState } from 'react';
import Navbar from '../components/Navbar';
import { verifyCertificate } from '../app/utils/suiContract';
import Image from 'next/image';
import { QRCodeSVG } from 'qrcode.react';

export default function Home() {
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
      const result = await verifyCertificate(certId);
      setIsValid(!!result.isValid);
      setStudentName(result.studentName);
      setBlobId(result.blobId);

      if (!result.isValid) {
        setMessage('Certificate is invalid or revoked.');
      }
    } catch (error) {
      console.error('Error verifying certificate:', error);
      setMessage('Failed to verify certificate. Check console for details.');
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-gray-50 to-gray-100">
      <Navbar />
      <main className="flex-grow flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold text-center mb-4 text-blue-600">On-Chain Certificate Verification</h2>
          <div className="flex flex-col gap-4">
            <input
              type="text"
              value={certId}
              onChange={(e) => setCertId(e.target.value)}
              placeholder="Enter Certificate ID"
              className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={handleVerify}
              disabled={loading || !certId}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
            >
              {loading ? 'Verifying...' : 'Verify Certificate'}
            </button>
            {message && (
              <p className={`text-center ${message.includes('successful') ? 'text-green-600' : 'text-red-600'}`}>
                {message}
              </p>
            )}
            {isValid && studentName && (
              <div>
                <p className="text-center text-gray-800">
                  <strong>Student Name:</strong> {studentName}
                </p>
                <p className="text-center text-gray-800">
                  <strong>Status:</strong>{' '}
                  <span className={isValid ? 'text-green-800' : 'text-red-800'}>
                    {isValid ? 'Valid' : 'Invalid'}
                  </span>
                </p>
              </div>
            )}
            {isValid && blobId && (
              <div className="mt-4">
                <h3 className="text-lg font-semibold mb-2 text-gray-700">Certificate</h3>
                <Image
                  src={`https://ipfs.io/ipfs/${blobId}`}
                  alt="Certificate"
                  className="w-full rounded shadow-md"
                  width={0}
                  height={0}
                  sizes="70vw"
                  style={{ width: '100%', height: 'auto' }}
                  onError={() => setMessage('Failed to load certificate image.')}
                />
              </div>
            )}
          </div>
        </div>
      </main>
      {isValid && certId && (
        <div className="fixed bottom-4 left-4 bg-white p-2 rounded-lg shadow-lg">
          <QRCodeSVG className='mx-auto' value={certId} size={100} />
          <p className="text-center text-sm text-gray-600 mt-2">Scan for Certificate ID</p>
        </div>
      )}
    </div>
  );
}