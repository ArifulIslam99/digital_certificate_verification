
module sui_contract_extended::certificate_system {
    use sui::table::{Self, Table};
    use std::string::{String, utf8};
    use sui::clock::{Self, Clock};
    use sui::dynamic_field;
    use sui::vec_set;
    use sui::vec_set::VecSet;

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
        certificate_ids: VecSet<address>,
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
        table::add(&mut authority, utf8(b"exam_controller"), @0xe86e9c41dca2f50ace7e646856ef3ee02f7c5754d74da95fe64a522dfc72f2a1);
        table::add(&mut authority, utf8(b"provc"), @0xef72cb4baaf878f0db211273d230842db87c36ecf1f9493a77a9c5af1c596df5);
        table::add(&mut authority, utf8(b"registrar"), @0x45e6efd1d2c58c4264a37d24c805d6384038ef779842eb7fa80b925c463f4d8c);
        let store = CertificateStore {
            id: object::new(ctx),
            certificates: table::new(ctx),
            certificate_ids: vec_set::empty(),
            authority
        };
        transfer::share_object(store);
        let faculties = Faculties {
            id: object::new(ctx),
            faculty_of_science: @0xe86e9c41dca2f50ace7e646856ef3ee02f7c5754d74da95fe64a522dfc72f2a1,
            faculty_of_humanities:@0xef72cb4baaf878f0db211273d230842db87c36ecf1f9493a77a9c5af1c596df5,
            faculty_of_business:@0x45e6efd1d2c58c4264a37d24c805d6384038ef779842eb7fa80b925c463f4d8c
        };
        transfer::share_object(faculties);
         // Initialize authority objects
         // These addresses are placeholders and should be replaced with actual addresses
         // of the ExamController, ProViceChancellor, and Registrar.
        let exam_controller = ExamController { 
            id: object::new(ctx)
         };
         let pro_vice_chancellor = ProViceChancellor { 
            id: object::new(ctx)
         };
            let registrar = Registrar { 
                id: object::new(ctx)
            };
         transfer::transfer(exam_controller, @0xe86e9c41dca2f50ace7e646856ef3ee02f7c5754d74da95fe64a522dfc72f2a1);
         transfer::transfer(pro_vice_chancellor, @0xef72cb4baaf878f0db211273d230842db87c36ecf1f9493a77a9c5af1c596df5);
         transfer::transfer(registrar, @0x45e6efd1d2c58c4264a37d24c805d6384038ef779842eb7fa80b925c463f4d8c);
    }


    public entry fun list_new_certificate(
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
        vec_set::insert(&mut certificate_store.certificate_ids, certificate_id_address);
        certificate_id_address
    }

    public entry fun exam_controller_sign_certificate(
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

    public entry fun registrar_sign_certificate(
        _registrar: &Registrar,
        certificate_store: &mut CertificateStore,
        cert_id: address,
        ctx: &mut tx_context::TxContext
    ) {
        assert!(table::contains(&certificate_store.certificates, cert_id), 102);
        let exam_controller = table::borrow(&certificate_store.authority, utf8(b"exam_controller"));
        let cert = table::borrow_mut(&mut certificate_store.certificates, cert_id);
        assert!(cert.revoked, 104); // Certificate must not be revoked before signing
        assert!(dynamic_field::borrow(&cert.id, utf8(b"Sign_of_Exam_Controller")) == exam_controller, 106); // ExamController must sign first
        dynamic_field::add(
            &mut cert.id,
            utf8(b"Sign_of_Registrar"),
            tx_context::sender(ctx),
        );
    }

    public entry fun provc_sign_and_issue_certificate(
        _pro_vice_chancellor: &ProViceChancellor,
        certificate_store: &mut CertificateStore,
        cert_id: address,
        clock: &Clock,
        ctx: &mut tx_context::TxContext
    ) {
        assert!(table::contains(&certificate_store.certificates, cert_id), 102);
        let registrar = table::borrow(&certificate_store.authority, utf8(b"registrar"));
        let cert = table::borrow_mut(&mut certificate_store.certificates, cert_id);
        assert!(cert.revoked, 104); // Certificate must not be revoked before signing
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

    public fun get_recent_certificate_ids(certificate_store: &CertificateStore): address{
        let mut ids = vec_set::into_keys(certificate_store.certificate_ids);
        vector::reverse(&mut ids);
        let element = vector::borrow(&ids, 0);
        *element
    }

}





