import { SuiClient, getFullnodeUrl } from '@mysten/sui/client';
import { Transaction } from '@mysten/sui/transactions';
import { useWallet } from '@suiet/wallet-kit';
const MY_ADDRESS = '0xe86e9c41dca2f50ace7e646856ef3ee02f7c5754d74da95fe64a522dfc72f2a1';
// Placeholder IDs - replace with actual IDs after deploying the contract
const PACKAGE_ID = '0x88214d4f6010c1d68cf1e49b7ff22a31a4266e88446b15c2ae9c83134b5970b5'; // Replace with your deployed package ID
const CERTIFICATE_STORE_ID = '0x45aac39bcba07ee6bbce1f7500c1de9ecdd87a16df722a44c3950fc593ec5cd2'; // Replace with CertificateStore object ID
const FACULTIES_ID = '0xdd509eb480dbe40382c906de4e36297b2ec10aa15eee313169b034e47b2103d1'; // Replace with Faculties object ID
const EXAM_CONTROLLER = '0xd0fbfc63780d9640cb269ca30e6d3f6e4b1f91439974dd5e1f83558ae5af372d'; // Replace with ExamController object ID
const REGISTRAR = '0x9852c3fc9536b004cb2312835444d2426427fdf95dedaf2f6283072e340d7e24'; // Replace with Registrar object ID
const PRO_VC = '0x7ce5e9b1a254a2926cfe0c0b5c2a29cff38c419b4e3fb16cbee01db4083c2696'; // Replace with ProVC object ID
const CLOCK_ID = '0x6'; // Sui Clock object ID (fixed on Testnet)

const client = new SuiClient({ url: getFullnodeUrl('testnet') });
function bytesToSuiAddress(bytes: any[]) {
  if (!Array.isArray(bytes)) {
    throw new Error("Input must be an array of bytes");
  }
  // convert each byte to 2-digit hex
  const hex = bytes.map(b => b.toString(16).padStart(2, '0')).join('');
  return '0x' + hex;
}

function bytesToCleanString(bytes: any) {
  // Keep printable ASCII
  const filtered = bytes.filter((b: any) => b >= 32 && b <= 126);
  let str = new TextDecoder().decode(new Uint8Array(filtered));

  // Remove leading non-letter/non-digit characters (like + - etc.)
  str = str.replace(/^[^a-zA-Z0-9]+/, '');  

  return str;
}


export async function verifyCertificate(certId: string) {
  try {
    const tx = new Transaction();
    tx.moveCall({
      target: `${PACKAGE_ID}::certificate_system::verify_certificate`,
      arguments: [tx.object(CERTIFICATE_STORE_ID), tx.pure.address(certId)],
    });

    const result = await client.devInspectTransactionBlock({
      transactionBlock: tx,
      sender: MY_ADDRESS,
    });
    let revoked = result?.results?.[0].returnValues?.[0][0][0];
    let studentName = bytesToCleanString(result?.results?.[0].returnValues?.[1][0]);
    let blobId = bytesToCleanString(result?.results?.[0].returnValues?.[2][0]);

    // const value = result?.returnValues[0];
    return {
      isValid: revoked,
      studentName,
      blobId,
    };
  } catch (error) {
    console.error('Error verifying certificate:', error);
    return { isValid: false, studentName: '', blobId: '' };
  }
}


export async function getCertificateIds(): Promise<string> {
  try {
    const tx = new Transaction();
    tx.moveCall({
      target: `${PACKAGE_ID}::certificate_system::get_recent_certificate_ids`,
      arguments: [tx.object(CERTIFICATE_STORE_ID)],
    });

    const result = await client.devInspectTransactionBlock({
      transactionBlock: tx,
      sender: MY_ADDRESS,
    });
    let ud: any = result?.results?.[0].returnValues?.[0][0];
    let id = bytesToSuiAddress(ud);
    console.log('Recent Certificate ID:', id);
    return id; // Return up to 3 newest IDs
    
  } catch (error) {
    console.error('Error fetching certificate IDs:', error);
    return "";
  }
}

export async function listNewCertificate(wallet: ReturnType<typeof useWallet>, studentName: string, blobId: string) {
  const tx = new Transaction();
  tx.moveCall({
    target: `${PACKAGE_ID}::certificate_system::list_new_certificate`,
    arguments: [
      tx.object(CERTIFICATE_STORE_ID),
      tx.object(FACULTIES_ID),
      tx.pure.string(studentName),
      tx.pure.string(blobId),
    ],
  });

  try {
    const result = await wallet.signAndExecuteTransaction({
      transaction: tx,
    });
    return { success: true, certificateId: result || '' };
  } catch (error) {
      console.error('Error listing new certificate:', error);
      return { success: false, certificateId: '' };
  }
}

export async function signCertificateAsExamController(wallet: ReturnType<typeof useWallet>, certId: string) {
  const tx = new Transaction();
  tx.moveCall({
    target: `${PACKAGE_ID}::certificate_system::exam_controller_sign_certificate`,
    arguments: [
      tx.object(EXAM_CONTROLLER),
      tx.object(CERTIFICATE_STORE_ID),
      tx.pure.address(certId),
    ],
  });

  try {
    const result = await wallet.signAndExecuteTransaction({
      transaction: tx,
    });
    return { success: true};
  } catch (error) {
    console.error('Error signing certificate:', error);
    return false;
  }
}

export async function signCertificateAsRegistrar(wallet: ReturnType<typeof useWallet>, certId: string) {
  const tx = new Transaction();
  tx.moveCall({
    target: `${PACKAGE_ID}::certificate_system::registrar_sign_certificate`,
    arguments: [
      tx.object(REGISTRAR),
      tx.object(CERTIFICATE_STORE_ID),
      tx.pure.address(certId),
    ],
  });

  try {
    const result = await wallet.signAndExecuteTransaction({
      transaction: tx,
    });
    return { success: true};
  } catch (error) {
    console.error('Error signing certificate:', error);
    return false;
  }
}

export async function signAndIssueCertificateAsProVC(wallet: ReturnType<typeof useWallet>, certId: string) {
  const tx = new Transaction();
  tx.moveCall({
    target: `${PACKAGE_ID}::certificate_system::provc_sign_and_issue_certificate`,
    arguments: [
      tx.object(PRO_VC),
      tx.object(CERTIFICATE_STORE_ID),
      tx.pure.address(certId),
      tx.object(CLOCK_ID),
    ],
  });

  try {
    const result = await wallet.signAndExecuteTransaction({
      transaction: tx,
    });
    return { success: true};
  } catch (error) {
    console.error('Error issuing certificate:', error);
    return { success: false };
  }
}

export async function revokeCertificate(wallet: ReturnType<typeof useWallet>, certId: string) {
  const tx = new Transaction();
  tx.moveCall({
    target: `${PACKAGE_ID}::certificate_system::revoke_certificate`,
    arguments: [
      tx.object(PRO_VC),
      tx.object(CERTIFICATE_STORE_ID),
      tx.pure.address(certId),
    ],
  });

  try {
    const result = await wallet.signAndExecuteTransaction({
      transaction: tx,
    });
    return { success: true};
  } catch (error) {
    console.error('Error revoking certificate:', error);
    return { success: false };
  }
}