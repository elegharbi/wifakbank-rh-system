package com.wifakbank.rh_system;

import com.wifakbank.rh_system.repository.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import java.time.LocalDateTime;
import com.wifakbank.rh_system.model.Role;
import com.wifakbank.rh_system.service.PasswordEncoderService;

@Component
public class DbSeeder implements CommandLineRunner {

    private final JobPositionRepository jobRepo;
    private final CandidateRepository candidateRepo;
    private final DepartmentRepository deptRepo;
    private final TrainingRepository trainingRepo;
    private final SystemConfigRepository systemConfigRepo;
    private final UserRepository userRepo;
    private final LeaveRepository leaveRepo;
    private final PointLogRepository pointLogRepo;
    private final EventRepository eventRepo;
    private final PasswordEncoderService passwordEncoderService;

    @Value("${huggingface.api.token:}")
    private String hfToken;

    public DbSeeder(JobPositionRepository jobRepo, CandidateRepository candidateRepo, 
                    DepartmentRepository deptRepo, TrainingRepository trainingRepo,
                    SystemConfigRepository systemConfigRepo, UserRepository userRepo,
                    LeaveRepository leaveRepo,
                    PointLogRepository pointLogRepo, EventRepository eventRepo,
                    PasswordEncoderService passwordEncoderService) {
        this.jobRepo = jobRepo;
        this.candidateRepo = candidateRepo;
        this.deptRepo = deptRepo;
        this.trainingRepo = trainingRepo;
        this.systemConfigRepo = systemConfigRepo;
        this.userRepo = userRepo;
        this.leaveRepo = leaveRepo;
        this.pointLogRepo = pointLogRepo;
        this.eventRepo = eventRepo;
        this.passwordEncoderService = passwordEncoderService;
    }

    @Override
    public void run(String... args) throws Exception {
        // 1. Initialisation des Départements (Kaggle Dataset alignment)
        if (deptRepo.count() == 0) {
            deptRepo.save(new Department(null, "Informatique", "Gestion des systèmes d'information bancaires et IA.", null));
            deptRepo.save(new Department(null, "Finance & Crédit", "Analyse des risques et gestion financière.", null));
            deptRepo.save(new Department(null, "Ressources Humaines", "Gestion du capital humain et recrutement.", null));
            deptRepo.save(new Department(null, "Marketing et Digital", "Transformation digitale et marketing bancaire.", null));
            deptRepo.save(new Department(null, "Risques & Conformité", "Audit interne et contrôle de gestion des risques.", null));
            deptRepo.save(new Department(null, "Direction Commerciale", "Développement commercial et relation agences.", null));
        }

        // 2. Initialisation des Utilisateurs — createOrUpdate pour garantir
        //    que les mots de passe sont toujours corrects après chaque redémarrage.
        User adminUser = findOrCreateUser("admin", "admin@wifakbank.tn");
        adminUser.setPassword(passwordEncoderService.encode("admin123"));
        adminUser.setEmail("admin@wifakbank.tn");
        adminUser.setRole(Role.ADMIN);
        adminUser.setFirstName("Admin");
        adminUser.setLastName("System");
        adminUser.setPhone("71000000");
        adminUser.setActive(true);
        adminUser.setDeleted(false);
        userRepo.save(adminUser);
        System.out.println("[SEEDER] admin / admin123  -> OK");

        User rhUser = findOrCreateUser("rh", "rh@wifakbank.com");
        rhUser.setUsername("rh");
        rhUser.setPassword(passwordEncoderService.encode("rh1234"));
        rhUser.setEmail("rh@wifakbank.com");
        rhUser.setRole(Role.HR);
        rhUser.setFirstName("Directeur");
        rhUser.setLastName("Ressources Humaines");
        rhUser.setPhone("22111221");
        deptRepo.findByName("Ressources Humaines").ifPresent(rhUser::setDepartment);
        rhUser.setActive(true);
        rhUser.setDeleted(false);
        rhUser.setPasswordChanged(false);
        userRepo.save(rhUser);
        System.out.println("[SEEDER] rh / rh1234  -> OK");

        User employeeUser = findOrCreateUser("user", "employee@wifakbank.tn");
        employeeUser.setPassword(passwordEncoderService.encode("user123"));
        employeeUser.setEmail("employee@wifakbank.tn");
        employeeUser.setRole(Role.EMPLOYEE);
        employeeUser.setFirstName("Mohamed");
        employeeUser.setLastName("Ahmed");
        employeeUser.setPhone("55444333");
        deptRepo.findByName("Informatique").ifPresent(employeeUser::setDepartment);
        employeeUser.setActive(true);
        employeeUser.setDeleted(false);
        employeeUser.setPerformanceScore(1150);
        employeeUser = userRepo.save(employeeUser);
        System.out.println("[SEEDER] user / user123  -> OK");

        User emp1 = findOrCreateUser("emp1", "emp1@wifakbank.tn");
        emp1.setPassword(passwordEncoderService.encode("emp123"));
        emp1.setEmail("emp1@wifakbank.tn");
        emp1.setRole(Role.EMPLOYEE);
        emp1.setFirstName("Ali");
        emp1.setLastName("Ben Salah");
        emp1.setPhone("55111222");
        deptRepo.findByName("Finance & Crédit").ifPresent(emp1::setDepartment);
        emp1.setActive(true);
        emp1.setDeleted(false);
        emp1.setPerformanceScore(1000);
        userRepo.save(emp1);

        User emp2 = findOrCreateUser("emp2", "emp2@wifakbank.tn");
        emp2.setPassword(passwordEncoderService.encode("emp123"));
        emp2.setEmail("emp2@wifakbank.tn");
        emp2.setRole(Role.EMPLOYEE);
        emp2.setFirstName("Sami");
        emp2.setLastName("Trabelsi");
        emp2.setPhone("55222333");
        deptRepo.findByName("Ressources Humaines").ifPresent(emp2::setDepartment);
        emp2.setActive(true);
        emp2.setDeleted(false);
        emp2.setPerformanceScore(1200);
        userRepo.save(emp2);

        User emp3 = findOrCreateUser("emp3", "emp3@wifakbank.tn");
        emp3.setPassword(passwordEncoderService.encode("emp123"));
        emp3.setEmail("emp3@wifakbank.tn");
        emp3.setRole(Role.EMPLOYEE);
        emp3.setFirstName("Sarra");
        emp3.setLastName("Kallel");
        emp3.setPhone("55333444");
        deptRepo.findByName("Informatique").ifPresent(emp3::setDepartment);
        emp3.setActive(true);
        emp3.setDeleted(false);
        emp3.setPerformanceScore(1100);
        userRepo.save(emp3);

        // Kaggle HR Dataset Additional Employees
        User emp4 = findOrCreateUser("youssef.b", "youssef.b@wifakbank.tn");
        emp4.setPassword(passwordEncoderService.encode("emp123"));
        emp4.setEmail("youssef.b@wifakbank.tn");
        emp4.setRole(Role.EMPLOYEE);
        emp4.setFirstName("Youssef");
        emp4.setLastName("Bouaziz");
        emp4.setPhone("55444555");
        deptRepo.findByName("Informatique").ifPresent(emp4::setDepartment);
        emp4.setActive(true);
        emp4.setDeleted(false);
        emp4.setPerformanceScore(1350);
        userRepo.save(emp4);

        User emp5 = findOrCreateUser("ines.h", "ines.h@wifakbank.tn");
        emp5.setPassword(passwordEncoderService.encode("emp123"));
        emp5.setEmail("ines.h@wifakbank.tn");
        emp5.setRole(Role.EMPLOYEE);
        emp5.setFirstName("Ines");
        emp5.setLastName("Hammami");
        emp5.setPhone("55666777");
        deptRepo.findByName("Marketing et Digital").ifPresent(emp5::setDepartment);
        emp5.setActive(true);
        emp5.setDeleted(false);
        emp5.setPerformanceScore(1050);
        userRepo.save(emp5);

        User emp6 = findOrCreateUser("nader.l", "nader.l@wifakbank.tn");
        emp6.setPassword(passwordEncoderService.encode("emp123"));
        emp6.setEmail("nader.l@wifakbank.tn");
        emp6.setRole(Role.EMPLOYEE);
        emp6.setFirstName("Nader");
        emp6.setLastName("Louati");
        emp6.setPhone("55888999");
        deptRepo.findByName("Risques & Conformité").ifPresent(emp6::setDepartment);
        emp6.setActive(true);
        emp6.setDeleted(false);
        emp6.setPerformanceScore(1280);
        userRepo.save(emp6);

        User candidatUser = findOrCreateUser("candidat", "candidat@gmail.com");
        candidatUser.setPassword(passwordEncoderService.encode("candidat123"));
        candidatUser.setEmail("candidat@gmail.com");
        candidatUser.setRole(Role.CANDIDATE);
        candidatUser.setFirstName("Nouveau");
        candidatUser.setLastName("Candidat");
        candidatUser.setPhone("22334455");
        candidatUser.setActive(true);
        candidatUser.setDeleted(false);
        userRepo.save(candidatUser);
        System.out.println("[SEEDER] Kaggle HR dataset employees & candidates created -> OK");

        // 3. Initialisation des Postes vacants (Kaggle HR Dataset)
        if (jobRepo.count() == 0) {
            JobPosition jp1 = new JobPosition();
            jp1.setTitle("Data Engineer & Analytics");
            jp1.setDepartment("Informatique");
            jp1.setDescription("Conception des pipelines de données bancaires et modèles décisionnels.");
            jp1.setStatus("OPEN");
            jp1.setPostedDate(LocalDateTime.now());
            jobRepo.save(jp1);

            JobPosition jp2 = new JobPosition();
            jp2.setTitle("Spécialiste IA & Chatbots");
            jp2.setDepartment("Informatique");
            jp2.setDescription("Développement d'agents intelligents pour l'assistance bancaire.");
            jp2.setStatus("OPEN");
            jp2.setPostedDate(LocalDateTime.now());
            jobRepo.save(jp2);

            JobPosition jp3 = new JobPosition();
            jp3.setTitle("Analyste Gestion des Risques");
            jp3.setDepartment("Risques & Conformité");
            jp3.setDescription("Modélisation du risque de crédit et conformité prudentielle.");
            jp3.setStatus("OPEN");
            jp3.setPostedDate(LocalDateTime.now());
            jobRepo.save(jp3);
        }

        // 4. Initialisation des Formations (Kaggle Dataset)
        if (trainingRepo.count() == 0) {
            com.wifakbank.rh_system.Training t1 = new com.wifakbank.rh_system.Training();
            t1.setTitle("Cybersécurité Bancaire & RGPD");
            t1.setDescription("Formation certifiante sur la sécurité des données bancaires.");
            t1.setTrainingType("ONLINE");
            t1.setTrainerName("Expert Certifié IT");
            t1.setTrainingDate(java.time.LocalDate.now().plusDays(30));
            trainingRepo.save(t1);

            com.wifakbank.rh_system.Training t2 = new com.wifakbank.rh_system.Training();
            t2.setTitle("Intelligence Artificielle appliquée à la Finance");
            t2.setDescription("Introduction au Machine Learning pour l'évaluation des risques.");
            t2.setTrainingType("PRESENTIEL");
            t2.setTrainerName("Formateur IA");
            t2.setTrainingDate(java.time.LocalDate.now().plusDays(45));
            trainingRepo.save(t2);

            com.wifakbank.rh_system.Training t3 = new com.wifakbank.rh_system.Training();
            t3.setTitle("Management Agile & Scrum Master");
            t3.setDescription("Ateliers pratiques de gestion de projet agile.");
            t3.setTrainingType("PRESENTIEL");
            t3.setTrainerName("Coach Agile");
            t3.setTrainingDate(java.time.LocalDate.now().plusDays(60));
            trainingRepo.save(t3);
        }

        // 5. Initialisation de congés réels dans la base de données
        if (leaveRepo.count() == 0) {
            Leave approvedLeave = new Leave();
            approvedLeave.setUser(employeeUser);
            approvedLeave.setStartDate("2026-05-01");
            approvedLeave.setEndDate("2026-05-03");
            approvedLeave.setReason("Congé Annuel - Vacances d'été");
            approvedLeave.setStatus(com.wifakbank.rh_system.model.LeaveStatus.APPROVED);
            leaveRepo.save(approvedLeave);

            Leave pendingLeave = new Leave();
            pendingLeave.setUser(employeeUser);
            pendingLeave.setStartDate("2026-05-25");
            pendingLeave.setEndDate("2026-05-25");
            pendingLeave.setReason("Rendez-vous médical");
            pendingLeave.setStatus(com.wifakbank.rh_system.model.LeaveStatus.PENDING);
            leaveRepo.save(pendingLeave);

            Leave emp1Leave = new Leave();
            emp1Leave.setUser(emp1);
            emp1Leave.setStartDate("2026-06-10");
            emp1Leave.setEndDate("2026-06-15");
            emp1Leave.setReason("Congé de formation professionnelle");
            emp1Leave.setStatus(com.wifakbank.rh_system.model.LeaveStatus.APPROVED);
            leaveRepo.save(emp1Leave);
        }

        // 6. Initialisation de l'historique des points de performance réels
        if (pointLogRepo.count() == 0) {
            PointLog log1 = new PointLog();
            log1.setUser(employeeUser);
            log1.setPointsChanged(50);
            log1.setReason("Participation active au Hackathon interne");
            log1.setDate(LocalDateTime.now().minusDays(2));
            pointLogRepo.save(log1);

            PointLog log2 = new PointLog();
            log2.setUser(employeeUser);
            log2.setPointsChanged(100);
            log2.setReason("Atteinte des objectifs du trimestre");
            log2.setDate(LocalDateTime.now().minusDays(1));
            pointLogRepo.save(log2);

            PointLog log3 = new PointLog();
            log3.setUser(emp4);
            log3.setPointsChanged(150);
            log3.setReason("Optimisation de la base de données de production");
            log3.setDate(LocalDateTime.now().minusDays(5));
            pointLogRepo.save(log3);
        }

        // 7. Initialisation d'événements réels
        if (eventRepo.count() == 0) {
            Event event1 = new Event();
            event1.setTitle("Séminaire Annuel Wifak Bank");
            event1.setDescription("Présentation des résultats annuels et ateliers de team building.");
            event1.setLocation("Hôtel Wifak Palace");
            event1.setEventDate(java.time.LocalDate.now().plusDays(20));
            eventRepo.save(event1);

            Event event2 = new Event();
            event2.setTitle("Hackathon Wifak Innovation 2026");
            event2.setDescription("Compétition interne d'innovation autour de l'IA et de la Fintech.");
            event2.setLocation("Siège Wifak Bank - Salles Innovation");
            event2.setEventDate(java.time.LocalDate.now().plusDays(45));
            eventRepo.save(event2);
        }
        
        System.out.println("DEBUG: Base de données initialisée avec succès avec le dataset Kaggle HR !");
        
        seedToken();
    }

    private User findOrCreateUser(String username, String email) {
        return userRepo.findByEmail(email)
                .orElseGet(() -> userRepo.findByUsername(username).orElseGet(() -> {
                    User user = new User();
                    user.setUsername(username);
                    user.setEmail(email);
                    return user;
                }));
    }

    private void seedToken() {
        if (systemConfigRepo.findByConfigKey("HF_TOKEN").isEmpty() && hfToken != null && !hfToken.isEmpty()) {
            systemConfigRepo.save(new SystemConfig("HF_TOKEN", hfToken));
            System.out.println("DEBUG: Token Hugging Face initialisé.");
        }
    }
}
