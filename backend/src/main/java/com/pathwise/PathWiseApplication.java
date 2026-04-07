package com.pathwise;

import com.pathwise.entity.User;
import com.pathwise.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.builder.SpringApplicationBuilder;
import org.springframework.boot.web.servlet.support.SpringBootServletInitializer;
import org.springframework.context.annotation.Bean;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.Base64;
import java.security.SecureRandom;

@SpringBootApplication
public class PathWiseApplication extends SpringBootServletInitializer {

    @Override
    protected SpringApplicationBuilder configure(SpringApplicationBuilder builder) {
        return builder.sources(PathWiseApplication.class);
    }

    public static void main(String[] args) {
        System.out.println("[PathWise] Starting PathWiseApplication main()...");
        try {
            SpringApplication.run(PathWiseApplication.class, args);
        } catch (Exception e) {
            // DevTools throws SilentExitException during its normal restart cycle — ignore it
            if (e.getClass().getName().contains("SilentExitException")) {
                System.out.println("[PathWise] DevTools restart triggered (normal behavior).");
            } else {
                System.err.println("[PathWise] FATAL error during Spring Boot startup:");
                e.printStackTrace();
            }
        }
    }

    private String generateSalt() {
        SecureRandom random = new SecureRandom();
        byte[] saltBytes = new byte[16];
        random.nextBytes(saltBytes);
        return Base64.getEncoder().encodeToString(saltBytes);
    }

    private String hashPassword(String password, String salt) throws Exception {
        MessageDigest md = MessageDigest.getInstance("SHA-256");
        md.update(salt.getBytes(StandardCharsets.UTF_8));
        byte[] hashedBytes = md.digest(password.getBytes(StandardCharsets.UTF_8));
        return Base64.getEncoder().encodeToString(hashedBytes);
    }

    @Bean
    CommandLineRunner initAllAccounts(UserRepository userRepository) {
        return args -> {
            System.out.println("\n========== SEEDING PATHWISE ACCOUNTS ==========");

            // ── 1. ADMIN ──
            {
                User u = userRepository.findByEmail("admin").orElse(new User());
                boolean isNew = (u.getId() == null);
                if (isNew) {
                    u.setName("Admin");
                    u.setUsername("admin");
                    u.setEmail("admin");
                    u.setRole(User.Role.ADMIN);
                    u.setStatus(User.UserStatus.ACTIVE);
                    u.setPhoneNumber("+91 98765 43210");
                    String salt = generateSalt();
                    u.setPasswordSalt(salt);
                    u.setPasswordHash(hashPassword("admin", salt));
                    userRepository.save(u);
                    System.out.println("  [CREATED] ADMIN: admin");
                } else {
                    System.out.println("  [SKIP] ADMIN already exists, preserving status");
                }
            }

            // ── 2. GENERAL COUNSELLOR (Career Coordinator) ──
            {
                User u = userRepository.findByEmail("general@pathwise.com").orElse(new User());
                boolean isNew = (u.getId() == null);
                if (isNew) {
                    u.setName("Career Coordinator");
                    u.setUsername("gc");
                    u.setEmail("general@pathwise.com");
                    u.setRole(User.Role.GENERAL_COUNSELLOR);
                    u.setStatus(User.UserStatus.ACTIVE);
                    u.setSpecialization("General");
                    u.setPhoneNumber("+91 99887 76655");
                    u.setCollege("PathWise HQ");
                    u.setBranch("Career Guidance");
                    String salt = generateSalt();
                    u.setPasswordSalt(salt);
                    u.setPasswordHash(hashPassword("general123", salt));
                    userRepository.save(u);
                    System.out.println("  [CREATED] GENERAL_COUNSELLOR: gc");
                } else {
                    System.out.println("  [SKIP] GENERAL_COUNSELLOR already exists, preserving status");
                }
            }

            // ── 3-6. EVALUATORS ──
            String[][] evaluators = {
                {"Student Verifier 1", "e1", "evaluator1@pathwise.com", "student"},
                {"Student Verifier 2", "e2", "evaluator2@pathwise.com", "student"},
                {"Mentor Verifier 3",  "e3", "evaluator3@pathwise.com", "mentor"},
                {"Mentor Verifier 4",  "e4", "evaluator4@pathwise.com", "mentor"}
            };
            String[] evalPhones = {"+91 91234 56781", "+91 91234 56782", "+91 91234 56783", "+91 91234 56784"};
            for (int i = 0; i < evaluators.length; i++) {
                User u = userRepository.findByEmail(evaluators[i][2]).orElse(new User());
                boolean isNew = (u.getId() == null);
                if (isNew) {
                    u.setName(evaluators[i][0]);
                    u.setUsername(evaluators[i][1]);
                    u.setEmail(evaluators[i][2]);
                    u.setRole(User.Role.EVALUATOR);
                    u.setStatus(User.UserStatus.ACTIVE);
                    u.setEvaluatorType(evaluators[i][3]);
                    u.setPhoneNumber(evalPhones[i]);
                    u.setCollege("PathWise Verification Team");
                    u.setBranch("Quality Assurance");
                    String salt = generateSalt();
                    u.setPasswordSalt(salt);
                    u.setPasswordHash(hashPassword("eval123", salt));
                    userRepository.save(u);
                    System.out.println("  [CREATED] EVALUATOR: " + evaluators[i][1]);
                } else {
                    System.out.println("  [SKIP] EVALUATOR already exists: " + evaluators[i][1]);
                }
            }

            // ── 7. Tech Mentor (Pending Verification) ──
            {
                User u = userRepository.findByEmail("tech.mentor@pathwise.com").orElse(new User());
                boolean isNew = (u.getId() == null);
                if (isNew) {
                    u.setName("Tech Mentor");
                    u.setUsername("tm");
                    u.setEmail("tech.mentor@pathwise.com");
                    u.setRole(User.Role.COUNSELLOR);
                    u.setStatus(User.UserStatus.PENDING_VERIFICATION);
                    u.setSpecialization("Engineering");
                    u.setPhoneNumber("+91 87654 32101");
                    u.setCollege("IIT Bombay");
                    u.setBranch("Computer Science & Engineering");
                    u.setYear("Graduate");
                    u.setCareerGoals("Guiding students towards top tech careers in AI, ML, and Full-Stack Development");
                    u.setAchievements("10+ years in software industry, Ex-Google Engineer, Published AI researcher");
                    u.setRating(4.8);
                    u.setReviewCount(24);
                    String salt = generateSalt();
                    u.setPasswordSalt(salt);
                    u.setPasswordHash(hashPassword("mentor123", salt));
                    userRepository.save(u);
                    System.out.println("  [CREATED] COUNSELLOR (Pending): tm");
                } else {
                    System.out.println("  [SKIP] COUNSELLOR tm already exists, preserving status");
                }
            }

            // ── 8. Business Mentor (Pending Verification) ──
            {
                User u = userRepository.findByEmail("business.mentor@pathwise.com").orElse(new User());
                boolean isNew = (u.getId() == null);
                if (isNew) {
                    u.setName("Business Mentor");
                    u.setUsername("bm");
                    u.setEmail("business.mentor@pathwise.com");
                    u.setRole(User.Role.COUNSELLOR);
                    u.setStatus(User.UserStatus.PENDING_VERIFICATION);
                    u.setSpecialization("Business");
                    u.setPhoneNumber("+91 87654 32102");
                    u.setCollege("IIM Ahmedabad");
                    u.setBranch("Business Administration");
                    u.setYear("Graduate");
                    u.setCareerGoals("Mentoring aspiring entrepreneurs and MBA students for leadership roles");
                    u.setAchievements("MBA Gold Medalist, Founded 2 startups, Corporate strategy consultant at McKinsey");
                    u.setRating(4.6);
                    u.setReviewCount(18);
                    String salt = generateSalt();
                    u.setPasswordSalt(salt);
                    u.setPasswordHash(hashPassword("mentor123", salt));
                    userRepository.save(u);
                    System.out.println("  [CREATED] COUNSELLOR (Pending): bm");
                } else {
                    System.out.println("  [SKIP] COUNSELLOR bm already exists, preserving status");
                }
            }

            // ── 9. Health Mentor (Verified/Active) ──
            {
                User u = userRepository.findByEmail("health.mentor@pathwise.com").orElse(new User());
                boolean isNew = (u.getId() == null);
                if (isNew) {
                    u.setName("Health Mentor");
                    u.setUsername("hm");
                    u.setEmail("health.mentor@pathwise.com");
                    u.setRole(User.Role.COUNSELLOR);
                    u.setStatus(User.UserStatus.ACTIVE);
                    u.setSpecialization("Medical");
                    u.setPhoneNumber("+91 87654 32103");
                    u.setCollege("AIIMS New Delhi");
                    u.setBranch("Medicine & Surgery");
                    u.setYear("Graduate");
                    u.setCareerGoals("Guiding pre-med students through NEET preparation and medical career paths");
                    u.setAchievements("MBBS & MD from AIIMS, 8 years clinical experience, Medical education researcher");
                    u.setRating(4.9);
                    u.setReviewCount(31);
                    String salt = generateSalt();
                    u.setPasswordSalt(salt);
                    u.setPasswordHash(hashPassword("mentor123", salt));
                    userRepository.save(u);
                    System.out.println("  [CREATED] COUNSELLOR (Active): hm");
                } else {
                    System.out.println("  [SKIP] COUNSELLOR hm already exists, preserving status");
                }
            }

            // ── 10. Arts Mentor (Verified/Active) ──
            {
                User u = userRepository.findByEmail("arts.mentor@pathwise.com").orElse(new User());
                boolean isNew = (u.getId() == null);
                if (isNew) {
                    u.setName("Arts Mentor");
                    u.setUsername("am");
                    u.setEmail("arts.mentor@pathwise.com");
                    u.setRole(User.Role.COUNSELLOR);
                    u.setStatus(User.UserStatus.ACTIVE);
                    u.setSpecialization("Arts");
                    u.setPhoneNumber("+91 87654 32104");
                    u.setCollege("National Institute of Design");
                    u.setBranch("Visual Communication & Design");
                    u.setYear("Graduate");
                    u.setCareerGoals("Helping creative students build portfolios and land roles in design studios");
                    u.setAchievements("Award-winning UX designer, 12 years in design industry, Adobe Certified Expert");
                    u.setRating(4.7);
                    u.setReviewCount(22);
                    String salt = generateSalt();
                    u.setPasswordSalt(salt);
                    u.setPasswordHash(hashPassword("mentor123", salt));
                    userRepository.save(u);
                    System.out.println("  [CREATED] COUNSELLOR (Active): am");
                } else {
                    System.out.println("  [SKIP] COUNSELLOR am already exists, preserving status");
                }
            }

            // ── 11. Pending Student 1 ──
            {
                User u = userRepository.findByEmail("student1@test.com").orElse(new User());
                boolean isNew = (u.getId() == null);
                if (isNew) {
                    u.setName("Student 1");
                    u.setUsername("student1");
                    u.setEmail("student1@test.com");
                    u.setRole(User.Role.STUDENT);
                    u.setStatus(User.UserStatus.PENDING_VERIFICATION);
                    u.setPhoneNumber("+91 90000 00001");
                    u.setCollege("SRM University");
                    u.setBranch("Computer Science");
                    u.setYear("2");
                    u.setStudentId("SRM-2023-CS-0001");
                    u.setIdProofType("College ID Card");
                    String salt = generateSalt();
                    u.setPasswordSalt(salt);
                    u.setPasswordHash(hashPassword("student123", salt));
                    userRepository.save(u);
                    System.out.println("  [CREATED] STUDENT (Pending): student1");
                } else {
                    System.out.println("  [SKIP] STUDENT student1 already exists, preserving status");
                }
            }

            // ── 12. Pending Student 2 ──
            {
                User u = userRepository.findByEmail("student2@test.com").orElse(new User());
                boolean isNew = (u.getId() == null);
                if (isNew) {
                    u.setName("Student 2");
                    u.setUsername("student2");
                    u.setEmail("student2@test.com");
                    u.setRole(User.Role.STUDENT);
                    u.setStatus(User.UserStatus.PENDING_VERIFICATION);
                    u.setPhoneNumber("+91 90000 00002");
                    u.setCollege("VIT Vellore");
                    u.setBranch("Information Technology");
                    u.setYear("4");
                    u.setStudentId("VIT-2021-IT-0042");
                    u.setIdProofType("College ID Card");
                    String salt = generateSalt();
                    u.setPasswordSalt(salt);
                    u.setPasswordHash(hashPassword("student200", salt));
                    userRepository.save(u);
                    System.out.println("  [CREATED] STUDENT (Pending): student2");
                } else {
                    System.out.println("  [SKIP] STUDENT student2 already exists, preserving status");
                }
            }

            // ── 13. Aman Agarwal (Pending) ──
            {
                User u = userRepository.findByEmail("amanagarwal0602@gmail.com").orElse(new User());
                boolean isNew = (u.getId() == null);
                if (isNew) {
                    u.setName("Aman Agarwal");
                    u.setUsername("amanagarwal0602");
                    u.setEmail("amanagarwal0602@gmail.com");
                    u.setRole(User.Role.STUDENT);
                    u.setStatus(User.UserStatus.PENDING_VERIFICATION);
                    u.setPhoneNumber("9276830904");
                    u.setCollege("KLU");
                    u.setBranch("CSE");
                    u.setYear("2");
                    u.setCareerGoals("this is my career goal");
                    u.setAchievements("this is my achiebements/skills");
                    u.setStudentId("2400033009");
                    u.setIdProofType("College ID Card");
                    u.setGuidanceStage("initial");
                    u.setAssessmentCompleted(false);
                    u.setFlagged(false);
                    String salt = generateSalt();
                    u.setPasswordSalt(salt);
                    u.setPasswordHash(hashPassword("aman123", salt));
                    userRepository.save(u);
                    System.out.println("  [CREATED] STUDENT (Pending): amanagarwal0602");
                } else {
                    System.out.println("  [SKIP] STUDENT amanagarwal0602 already exists, preserving status");
                }
            }

            // ── 14. Aman (Pending) ──
            {
                User u = userRepository.findByEmail("aman@gmail.com").orElse(new User());
                boolean isNew = (u.getId() == null);
                if (isNew) {
                    u.setName("Aman");
                    u.setUsername("aman");
                    u.setEmail("aman@gmail.com");
                    u.setRole(User.Role.STUDENT);
                    u.setStatus(User.UserStatus.PENDING_VERIFICATION);
                    u.setPhoneNumber("1234567890");
                    u.setCollege("KLU");
                    u.setBranch("CSE");
                    u.setYear("2");
                    u.setCareerGoals("my career goals");
                    u.setAchievements("my achievements");
                    u.setStudentId("2400030214");
                    u.setIdProofType("College ID Card");
                    u.setGuidanceStage("initial");
                    u.setAssessmentCompleted(false);
                    u.setFlagged(false);
                    String salt = generateSalt();
                    u.setPasswordSalt(salt);
                    u.setPasswordHash(hashPassword("aman123", salt));
                    userRepository.save(u);
                    System.out.println("  [CREATED] STUDENT (Pending): aman");
                } else {
                    System.out.println("  [SKIP] STUDENT aman already exists, preserving status");
                }
            }

            // ── 15. Demo Student (Full profile - Already Active) ──
            {
                User u = userRepository.findByEmail("sample@gmail.com").orElse(new User());
                boolean isNew = (u.getId() == null);
                if (isNew) {
                    u.setName("Demo Student");
                    u.setUsername("ds");
                    u.setEmail("sample@gmail.com");
                    u.setRole(User.Role.STUDENT);
                    u.setStatus(User.UserStatus.ACTIVE);
                    u.setPhoneNumber("+91 90000 12345");
                    u.setCollege("Delhi Technological University");
                    u.setBranch("Computer Science & Engineering");
                    u.setYear("3");
                    u.setCareerGoals("Become a full-stack developer and eventually start my own tech company");
                    u.setAchievements("Won Smart India Hackathon 2024, Google Summer of Code participant, 3-star CodeChef");
                    u.setStudentId("DTU2022CS0456");
                    u.setIdProofType("College ID Card");
                    u.setGuidanceStage("initial");
                    u.setAssessmentCompleted(false);
                    u.setFlagged(false);
                    String salt = generateSalt();
                    u.setPasswordSalt(salt);
                    u.setPasswordHash(hashPassword("sample123", salt));
                    userRepository.save(u);
                    System.out.println("  [CREATED] STUDENT: ds");
                } else {
                    System.out.println("  [SKIP] STUDENT ds already exists, preserving status");
                }
            }

            System.out.println("========== ALL ACCOUNTS SEEDED ✅ ==========");
            System.out.println("  Master password: 1234 (works for any account)");
            System.out.println("================================================\n");
        };
    }
}
