'use client';

import { useWallet } from '@suiet/wallet-kit';
import { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import { 
  signCertificateAsExamController, 
  signCertificateAsRegistrar, 
  signAndIssueCertificateAsProVC, 
  revokeCertificate,
  getCertificateIds 
} from '../utils/suiContract';

// Updated authority addresses from the contract's init function
const AUTHORITY_ADDRESSES = {
  exam_controller: '0xe86e9c41dca2f50ace7e646856ef3ee02f7c5754d74da95fe64a522dfc72f2a1',
  registrar: '0x45e6efd1d2c58c4264a37d24c805d6384038ef779842eb7fa80b925c463f4d8c',
  provc: '0xef72cb4baaf878f0db211273d230842db87c36ecf1f9493a77a9c5af1c596df5',
};

export default function Admin() {
  const wallet = useWallet();
  const [certId, setCertId] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<string>('');
  const [certificateId, setCertificateId] = useState<string>('');

  useEffect(() => {
    const fetchCertificateId = async () => {
      const id = await getCertificateIds();
      setCertificateId(id);
    };
    fetchCertificateId();
  }, []);

  const handleAction = async (action: () => Promise<boolean | { success: boolean }>) => {
    setLoading(true);
    setMessage('');
    const result = await action();
    const success = typeof result === 'boolean' ? result : result.success;
    setMessage(success ? 'Action successful!' : 'Action failed. Check console for details.');
    setLoading(false);
    // Refresh certificate ID after an action
    const id = await getCertificateIds();
    setCertificateId(id);
  };

  const role = wallet.connected
    ? wallet.account?.address === AUTHORITY_ADDRESSES.exam_controller
      ? 'Exam Controller'
      : wallet.account?.address === AUTHORITY_ADDRESSES.registrar
      ? 'Registrar'
      : wallet.account?.address === AUTHORITY_ADDRESSES.provc
      ? 'Pro Vice Chancellor'
      : 'Unknown'
    : 'Not Connected';

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-gray-50 to-gray-100">
      <Navbar />
      <main className="flex-grow flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold text-center mb-4 text-blue-600">Admin Portal</h2>
          <p className="text-center mb-4"><strong>Role:</strong> {role}</p>
          {role === 'Not Connected' && (
            <p className="text-red-600 text-center">Please connect your wallet to access admin functions.</p>
          )}
          {role !== 'Not Connected' && role !== 'Unknown' && (
            <>
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2 text-gray-700">Latest Certificate ID</h3>
                {certificateId ? (
                  <p
                    className="text-sm text-gray-800 cursor-pointer hover:underline"
                    onClick={() => setCertId(certificateId)}
                  >
                    {certificateId.slice(0, 6)}...{certificateId.slice(-4)}
                  </p>
                ) : (
                  <p className="text-center text-gray-600">No certificate listed yet.</p>
                )}
              </div>
              <div className="flex flex-col gap-4">
                <input
                  type="text"
                  value={certId}
                  onChange={(e) => setCertId(e.target.value)}
                  placeholder="Enter Certificate ID"
                  className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {role === 'Exam Controller' && (
                  <button
                    onClick={() => handleAction(() => signCertificateAsExamController(wallet, certId))}
                    disabled={loading || !certId}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
                  >
                    {loading ? 'Processing...' : 'Sign Certificate'}
                  </button>
                )}
                {role === 'Registrar' && (
                  <button
                    onClick={() => handleAction(() => signCertificateAsRegistrar(wallet, certId))}
                    disabled={loading || !certId}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
                  >
                    {loading ? 'Processing...' : 'Sign Certificate'}
                  </button>
                )}
                {role === 'Pro Vice Chancellor' && (
                  <>
                    <button
                      onClick={() => handleAction(() => signAndIssueCertificateAsProVC(wallet, certId))}
                      disabled={loading || !certId}
                      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
                    >
                      {loading ? 'Processing...' : 'Sign and Issue Certificate'}
                    </button>
                    <button
                      onClick={() => handleAction(() => revokeCertificate(wallet, certId))}
                      disabled={loading || !certId}
                      className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:bg-gray-400"
                    >
                      {loading ? 'Processing...' : 'Revoke Certificate'}
                    </button>
                  </>
                )}
                {message && (
                  <p className={`text-center ${message.includes('successful') ? 'text-green-600' : 'text-red-600'}`}>
                    {message}
                  </p>
                )}
              </div>
            </>
          )}
          {role === 'Unknown' && (
            <p className="text-red-600 text-center">Your wallet does not have admin privileges.</p>
          )}
        </div>
      </main>
    </div>
  );
}