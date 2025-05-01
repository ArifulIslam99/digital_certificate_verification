
module certificate_system::certificate_system {
    use sui::table::{Self, Table};
    use std::string::{String, utf8};
    use sui::clock::{Self, Clock};
    use sui::zklogin_verified_issuer::{check_zklogin_issuer};


    public struct Certificate has key, store {
        id: UID,
        student_name: String,
        course_name: String,
        issue_date: u64,
        expiry_date: u64,
        ipfs_hash: String,
        issuer: address,
        revoked: bool
    }

    public struct Issuer has store {
        name: String,
        authorized: bool
    }

    /// Structure for tracking issuer approval requests
    public struct IssuerProposal has key, store {
        id: UID,
        issuer: address,
        name: String,
        approvals: u64
    }


    public struct CentralAdmin has key {
        id: UID,
    }

    public struct CertificateStore has key, store {
        id: UID,
        certificates: Table<address, Certificate>,
        issuers: Table<address, Issuer>,
        proposals: Table<address, IssuerProposal>
    }

    fun init(ctx: &mut tx_context::TxContext) {
        let store = CertificateStore {
            id: object::new(ctx),
            certificates: table::new(ctx),
            issuers: table::new(ctx),
            proposals: table::new(ctx)
        };
        transfer::share_object(store);

        let central_admin = CentralAdmin { 
            id: object::new(ctx)
         };
         transfer::transfer(central_admin, tx_context::sender(ctx));
    }

    /// Propose a new issuer (requires multiple approvals)
    public entry fun propose_issuer(
        _central_admin: &CentralAdmin,
        store: &mut CertificateStore,
        new_issuer: address,
        name: String,
        ctx: &mut tx_context::TxContext
    ) {
        
        assert!(!(table::contains(&store.issuers, new_issuer)), 201);
        let proposal = IssuerProposal {
            id: object::new(ctx),
            issuer: new_issuer,
            name,
            approvals: 0
        };
        table::add(&mut store.proposals, new_issuer, proposal);
    }

    /// Approve a proposed issuer
    public entry fun approve_issuer(
        store: &mut CertificateStore,
        approver: address,
        issuer: address
    ) {
        assert!(table::contains(&store.issuers, approver), 202);
        assert!(table::contains(&store.proposals, issuer), 203);
        let proposal = table::borrow_mut(&mut store.proposals, issuer);
        proposal.approvals = proposal.approvals + 1;

        if (proposal.approvals >= 3) {
            table::add(&mut store.issuers, issuer, Issuer { name: proposal.name, authorized: true});
        }
    }

    public entry fun authorize_issuer(
        _central_admin: &CentralAdmin,
        store: &mut CertificateStore,
        issuer:address,
        name: String
    ) {
        table::add(&mut store.issuers, issuer, Issuer { name, authorized: true });
    }

    public entry fun issue_100_certificate(
        store: &mut CertificateStore,
        student_name: String,
        course_name: String,
        expiry_date: u64,
        ipfs_hash: String,
        clock: &Clock,
        ctx: &mut tx_context::TxContext
    ) {
        let mut i = 0;
        while( i <  100){
            issue_certificate(store, student_name, course_name, expiry_date, ipfs_hash, clock, ctx);
            i = i + 1;
        };
      
    }

    public entry fun issue_certificate(
        store: &mut CertificateStore,
        student_name: String,
        course_name: String,
        expiry_date: u64,
        ipfs_hash: String,
        clock: &Clock,
        ctx: &mut tx_context::TxContext
    ) {
        assert!(table::contains(&store.issuers, tx_context::sender(ctx)), 101); // Verify issuer is authorized
        assert!(expiry_date > clock::timestamp_ms(clock), 104); // Ensure expiry date is in the future
        assert!(!table::contains(&store.certificates, tx_context::sender(ctx)), 105);

        let cert_id = object::new(ctx);
        let cert_id_reference = object::uid_to_address(&cert_id);
        let certificate = Certificate {
            id: cert_id,
            student_name,
            course_name,
            issue_date: clock::timestamp_ms(clock),
            expiry_date,
            ipfs_hash,
            issuer: tx_context::sender(ctx),
            revoked: false
        };
        table::add(&mut store.certificates, cert_id_reference, certificate);
    }

    public entry fun revoke_certificate(
        store: &mut CertificateStore,
        cert_id: address,
        ctx: &mut tx_context::TxContext
    ) {
        assert!(table::contains(&store.certificates, cert_id), 102);
        assert!(table::contains(&store.issuers, tx_context::sender(ctx)), 101); // Verify issuer is authorized
        let cert = table::borrow_mut(&mut store.certificates, cert_id);
        cert.revoked = true;
    }

    

    public entry fun verify_certificate(
        store: &CertificateStore,
        cert_id: address,
        clock: &Clock,
    ): (bool, String, String) {
        if (!table::contains(&store.certificates, cert_id)) {
            return (false, utf8(b""), utf8(b""))
        };
        let cert = table::borrow(&store.certificates, cert_id);
        if (cert.revoked || clock::timestamp_ms(clock) > cert.expiry_date) {
            return (false, utf8(b""), utf8(b""))
        };
      
        (true, cert.student_name, cert.ipfs_hash)
    }

    /// Verify a certificate without exposing details (ZKP-based)
    public fun verify_certificate_private(
        store: &CertificateStore,
        cert_id: address,
        zk_proof: String,
        address_seed: u256,
        clock: &Clock
    ): bool {
        assert!(table::contains(&store.certificates, cert_id), 501);
        let cert = table::borrow(&store.certificates, cert_id);
        if (cert.revoked || clock::timestamp_ms(clock) > cert.expiry_date) {
            return false
        };
        check_zklogin_issuer(cert_id, address_seed, &zk_proof)
    }
}






