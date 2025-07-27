'use client';

import { useWallet } from '@suiet/wallet-kit';
import { useState } from 'react';
import Navbar from '../../components/Navbar';
import { listNewCertificate } from '../utils/suiContract';

// Faculty addresses from the contract's init function
const FACULTY_ADDRESSES = {
  faculty_of_science: '0xe86e9c41dca2f50ace7e646856ef3ee02f7c5754d74da95fe64a522dfc72f2a1',
  faculty_of_humanities: '0xef72cb4baaf878f0db211273d230842db87c36ecf1f9493a77a9c5af1c596df5',
  faculty_of_business: '0x45e6efd1d2c58c4264a37d24c805d6384038ef779842eb7fa80b925c463f4d8c',
};

export default function Faculty() {
  const wallet = useWallet();
  const [studentName, setStudentName] = useState<string>('');
  const [blobId, setBlobId] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<string>('');
  const [certificateId, setCertificateId] = useState<string>('');

  const handleListCertificate = async () => {
    setLoading(true);
    setMessage('');
    setCertificateId('');

    const result = await listNewCertificate(wallet, studentName, blobId);
    if (result.success && result) {
      setMessage('Certificate listed successfully!');
      console.log(result?.certificateId)
    } else {
      setMessage('Failed to list certificate. Check console for details.');
    }
    setLoading(false);
  };

  const role = wallet.connected
    ? wallet.account?.address === FACULTY_ADDRESSES.faculty_of_science
      ? 'Faculty of Science'
      : wallet.account?.address === FACULTY_ADDRESSES.faculty_of_humanities
      ? 'Faculty of Humanities'
      : wallet.account?.address === FACULTY_ADDRESSES.faculty_of_business
      ? 'Faculty of Business'
      : 'Unknown'
    : 'Not Connected';

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-gray-50 to-gray-100">
      <Navbar />
      <main className="flex-grow flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold text-center mb-4 text-blue-600">Faculty Portal</h2>
          <p className="text-center mb-4"><strong>Role:</strong> {role}</p>
          {role === 'Not Connected' && (
            <p className="text-red-600 text-center">Please connect your wallet to access faculty functions.</p>
          )}
          {role !== 'Not Connected' && role !== 'Unknown' && (
            <div className="flex flex-col gap-4">
              <input
                type="text"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                placeholder="Enter Student Name"
                className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="text"
                value={blobId}
                onChange={(e) => setBlobId(e.target.value)}
                placeholder="Enter Blob ID"
                className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={handleListCertificate}
                disabled={loading || !studentName || !blobId}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
              >
                {loading ? 'Processing...' : 'List New Certificate'}
              </button>
              {message && (
                <p className={`text-center ${message.includes('successfully') ? 'text-green-600' : 'text-red-600'}`}>
                  {message}
                </p>
              )}
              {certificateId && (
                <p className="text-center text-green-600">
                  <strong>Certificate ID:</strong> {certificateId}
                </p>
              )}
            </div>
          )}
          {role === 'Unknown' && (
            <p className="text-red-600 text-center">Your wallet does not have faculty privileges.</p>
          )}
        </div>
      </main>
    </div>
  );
}