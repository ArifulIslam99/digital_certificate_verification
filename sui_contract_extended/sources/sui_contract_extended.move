
module sui_contract_extended::certificate_system {
    use sui::table::{Self, Table};
    use std::string::{String, utf8};
    use sui::clock::{Self, Clock};
    use sui::dynamic_field;

    public struct Certificate has key, store {
        id: UID,
        student_name: String,
        faculty_name: String,
        issue_date: u64,
        blob_id: String,
        revoked: bool
    }

    public struct ExamController has key {
        id: UID,
    }

    public struct ProViceChancellor has key {
        id: UID,
    }

    public struct Registrar has key {
        id: UID,
    }

    public struct CertificateStore has key, store {
        id: UID,
        certificates: Table<address, Certificate>,
        authority: Table<String, address>
    }


    public struct Faculties has key {
        id: UID,
        faculty_of_science: address,
        faculty_of_humanities: address,
        faculty_of_business: address,
    }

    fun init(ctx: &mut tx_context::TxContext) {
        let mut authority: Table<String, address> = table::new(ctx);
        table::add(&mut authority, utf8(b"exam_controller"), @0x123);
        table::add(&mut authority, utf8(b"provc"), @0x231);
        table::add(&mut authority, utf8(b"registrar"), @0x321);
        let store = CertificateStore {
            id: object::new(ctx),
            certificates: table::new(ctx),
            authority
        };
        transfer::share_object(store);

        let exam_controller = ExamController { 
            id: object::new(ctx)
         };
         let pro_vice_chancellor = ProViceChancellor { 
            id: object::new(ctx)
         };
            let registrar = Registrar { 
                id: object::new(ctx)
            };
         transfer::transfer(exam_controller, @0x123);
         transfer::transfer(pro_vice_chancellor, @0x231);
         transfer::transfer(registrar, @0x321);
    }


    public fun list_new_certificate(
        certificate_store: &mut CertificateStore,
        faculties: &Faculties,
        student_name: String,
        blob_id: String,
        ctx: &mut TxContext
    ):address{  
        let certificate_id = object::new(ctx);
        let certificate_id_address = object::uid_to_address(&certificate_id);
        assert!(tx_context::sender(ctx) == faculties.faculty_of_science || 
                tx_context::sender(ctx) == faculties.faculty_of_humanities || 
                tx_context::sender(ctx) == faculties.faculty_of_business, 100);
        let cert = Certificate {
            id: certificate_id,
            student_name,
            faculty_name: if (tx_context::sender(ctx) == faculties.faculty_of_science) {
                utf8(b"Faculty of Science")
            } else if (tx_context::sender(ctx) == faculties.faculty_of_humanities) {
                utf8(b"Faculty of Humanities")
            } else if (tx_context::sender(ctx) == faculties.faculty_of_business) {
                utf8(b"Faculty of Business")
            } else {abort 101},
            issue_date:0,
            blob_id,
            revoked: true // Default to revoked
        };
        table::add(&mut certificate_store.certificates, certificate_id_address, cert);
        certificate_id_address
    }

    public fun exam_controller_sign_certificate(
        _exam_controller: &ExamController,
        certificate_store: &mut CertificateStore,
        cert_id: address,
        ctx: &mut tx_context::TxContext
    ) {
        assert!(table::contains(&certificate_store.certificates, cert_id), 102);
        let cert = table::borrow_mut(&mut certificate_store.certificates, cert_id);
        assert!(cert.revoked, 104); // Certificate must be revoked before signing
        dynamic_field::add(
            &mut cert.id,
            utf8(b"Sign_of_Exam_Controller"),
            tx_context::sender(ctx),
        );
    }

    public fun registrar_sign_certificate(
        _registrar: &Registrar,
        certificate_store: &mut CertificateStore,
        cert_id: address,
        ctx: &mut tx_context::TxContext
    ) {
        assert!(table::contains(&certificate_store.certificates, cert_id), 102);
        let exam_controller = table::borrow(&certificate_store.authority, utf8(b"exam_controller"));
        let cert = table::borrow_mut(&mut certificate_store.certificates, cert_id);
        assert!(!cert.revoked, 104); // Certificate must not be revoked before signing
        assert!(dynamic_field::borrow(&cert.id, utf8(b"Sign_of_Exam_Controller")) == exam_controller, 106); // ExamController must sign first
        dynamic_field::add(
            &mut cert.id,
            utf8(b"Sign_of_Registrar"),
            tx_context::sender(ctx),
        );
    }

    public fun provc_sign_and_issue_certificate(
        _pro_vice_chancellor: &ProViceChancellor,
        certificate_store: &mut CertificateStore,
        cert_id: address,
        clock: &Clock,
        ctx: &mut tx_context::TxContext
    ) {
        assert!(table::contains(&certificate_store.certificates, cert_id), 102);
        let registrar = table::borrow(&certificate_store.authority, utf8(b"registrar"));
        let cert = table::borrow_mut(&mut certificate_store.certificates, cert_id);
        assert!(!cert.revoked, 104); // Certificate must not be revoked before signing
        assert!(dynamic_field::borrow(&cert.id, utf8(b"Sign_of_Registrar")) == registrar, 105); // Registrar must sign first
        cert.revoked = false; // Mark certificate as issued
        cert.issue_date = clock::timestamp_ms(clock);
        dynamic_field::add(
            &mut cert.id,
            utf8(b"Sign_of_ProViceChancellor"),
            tx_context::sender(ctx),
        );
    }


    public entry fun revoke_certificate(
        _pro_vice_chancellor: &ProViceChancellor,
        certificate_store: &mut CertificateStore,
        cert_id: address,
    ) {
        assert!(table::contains(&certificate_store.certificates, cert_id), 102);
        let provc = table::borrow(&certificate_store.authority, utf8(b"provc"));
        let cert = table::borrow_mut(&mut certificate_store.certificates, cert_id);
        assert!(dynamic_field::borrow(&cert.id, utf8(b"Sign_of_ProViceChancellor")) == provc, 106);
        cert.revoked = true;
    }

    public entry fun verify_certificate(
        store: &CertificateStore,
        cert_id: address,
    ): (bool, String, String) {
        if (!table::contains(&store.certificates, cert_id)) {
            return (false, utf8(b""), utf8(b""))
        };
        let cert = table::borrow(&store.certificates, cert_id);
        if (cert.revoked) {
            return (false, utf8(b""), utf8(b""))
        };
        (true, cert.student_name, cert.blob_id)
    }

    public fun change_exam_controller(
        certificate_store: &mut CertificateStore,
        exam_controller: ExamController,
        new_exam_controller: address
    ) {
        let controller = table::borrow_mut(&mut certificate_store.authority, utf8(b"exam_controller"));
        *controller = new_exam_controller;
        transfer::transfer(exam_controller, new_exam_controller);
    }

    public fun change_registrar(
        certificate_store: &mut CertificateStore,
        registrar: Registrar,
        new_registrar: address
    ) {
        let reg = table::borrow_mut(&mut certificate_store.authority, utf8(b"registrar"));
        *reg = new_registrar;
        transfer::transfer(registrar, new_registrar);
    }

}





