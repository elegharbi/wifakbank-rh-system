# Exemples de migration du code - De Employee vers User

Ce document montre des exemples pratiques pour mettre à jour le code existant vers la nouvelle architecture.

---

## 📋 Table des matières
1. [Repositories](#repositories)
2. [Services](#services)
3. [Contrôleurs](#contrôleurs)
4. [DTOs](#dtos)
5. [Requêtes personnalisées](#requêtes-personnalisées)

---

## Repositories

### ❌ AVANT : Utiliser EmployeeRepository
```java
@Service
public class PerformanceService {
    private final EmployeeRepository employeeRepository;

    @Autowired
    public PerformanceService(EmployeeRepository employeeRepository) {
        this.employeeRepository = employeeRepository;
    }

    public void updateScore(Long employeeId, Integer points, String reason) {
        Optional<Employee> empOpt = employeeRepository.findById(employeeId);
        if (empOpt.isPresent()) {
            Employee emp = empOpt.get();
            emp.setPerformanceScore(emp.getPerformanceScore() + points);
            employeeRepository.save(emp);
        }
    }

    public List<Employee> getLeaderboard() {
        return employeeRepository.findAll()
            .stream()
            .sorted((a, b) -> b.getPerformanceScore().compareTo(a.getPerformanceScore()))
            .limit(10)
            .collect(Collectors.toList());
    }
}
```

### ✅ APRÈS : Utiliser UserRepository
```java
@Service
public class PerformanceService {
    private final UserRepository userRepository;
    private final PointLogRepository pointLogRepository;

    @Autowired
    public PerformanceService(UserRepository userRepository, PointLogRepository pointLogRepository) {
        this.userRepository = userRepository;
        this.pointLogRepository = pointLogRepository;
    }

    public void updateScore(Long userId, Integer points, String reason) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new UserNotFoundException("Utilisateur non trouvé: " + userId));
        
        user.setPerformanceScore(user.getPerformanceScore() + points);
        userRepository.save(user);

        // Créer un log de points
        PointLog log = PointLog.builder()
            .user(user)
            .pointsChanged(points)
            .reason(reason)
            .date(LocalDateTime.now())
            .build();
        pointLogRepository.save(log);
    }

    public List<User> getLeaderboard() {
        return userRepository.findAll()
            .stream()
            .sorted((a, b) -> b.getPerformanceScore().compareTo(a.getPerformanceScore()))
            .limit(10)
            .collect(Collectors.toList());
    }

    public List<PointLog> getUserPointLogs(Long userId) {
        return pointLogRepository.findByUserIdOrderByDateDesc(userId);
    }
}
```

---

## Services

### ❌ AVANT : Service de congés avec Employee
```java
@Service
public class LeaveService {
    private final LeaveRepository leaveRepository;
    private final EmployeeRepository employeeRepository;

    public List<Leave> getLeavesByEmployee(Long employeeId) {
        Employee emp = employeeRepository.findById(employeeId)
            .orElseThrow(() -> new RuntimeException("Employé non trouvé"));
        
        return leaveRepository.findAll()
            .stream()
            .filter(l -> l.getEmployee().getId().equals(employeeId))
            .collect(Collectors.toList());
    }

    public void createLeave(Long employeeId, Leave leave) {
        Employee emp = employeeRepository.findById(employeeId)
            .orElseThrow();
        leave.setEmployee(emp);
        leave.setStatus(LeaveStatus.PENDING);
        leaveRepository.save(leave);
    }
}
```

### ✅ APRÈS : Service de congés avec User
```java
@Service
public class LeaveService {
    private final LeaveRepository leaveRepository;
    private final UserRepository userRepository;
    private final EmailService emailService;

    public List<Leave> getLeavesByUser(Long userId) {
        return leaveRepository.findByUserIdOrderByStartDateDesc(userId);
    }

    public void createLeave(Long userId, Leave leave) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new UserNotFoundException("Utilisateur non trouvé"));
        
        leave.setUser(user);
        leave.setStatus(LeaveStatus.PENDING);
        leaveRepository.save(leave);

        // Notifier le RH
        try {
            String subject = "Nouvelle demande de congé";
            String content = String.format(
                "L'utilisateur %s %s a demandé des congés du %s au %s.\nRaison: %s",
                user.getFirstName(),
                user.getLastName(),
                leave.getStartDate(),
                leave.getEndDate(),
                leave.getReason()
            );
            // emailService.notifyHRManagers(subject, content);
        } catch (Exception e) {
            logger.error("Erreur notification congé", e);
        }
    }

    public void approveLeave(Long leaveId, Long approvedBy) {
        Leave leave = leaveRepository.findById(leaveId)
            .orElseThrow();
        leave.setStatus(LeaveStatus.APPROVED);
        leaveRepository.save(leave);

        // Log pour traçabilité
        logger.info("Congé {} approuvé par {}", leaveId, approvedBy);
    }

    public void rejectLeave(Long leaveId, Long rejectedBy) {
        Leave leave = leaveRepository.findById(leaveId)
            .orElseThrow();
        leave.setStatus(LeaveStatus.REJECTED);
        leaveRepository.save(leave);
    }
}
```

---

## Contrôleurs

### ❌ AVANT : Contrôleur employé
```java
@RestController
@RequestMapping("/api/employee")
@PreAuthorize("hasRole('ROLE_HR') or hasRole('ROLE_ADMIN')")
public class EmployeeController {
    private final EmployeeRepository employeeRepository;
    private final LeaveService leaveService;

    @GetMapping("/{employeeId}/stats")
    public ResponseEntity<Map<String, Object>> getEmployeeStats(@PathVariable Long employeeId) {
        Map<String, Object> stats = new HashMap<>();
        
        Optional<Employee> empOpt = employeeRepository.findById(employeeId);
        if (empOpt.isPresent()) {
            Employee emp = empOpt.get();
            stats.put("employee", emp);
            stats.put("performance", emp.getPerformanceScore());
            stats.put("leaves", leaveService.getLeavesByEmployee(employeeId));
        }
        
        return ResponseEntity.ok(stats);
    }

    @PostMapping("/{employeeId}/request-leave")
    public ResponseEntity<?> requestLeave(@PathVariable Long employeeId, @RequestBody Leave leave) {
        leaveService.createLeave(employeeId, leave);
        return ResponseEntity.ok(Map.of("message", "Demande de congé créée"));
    }
}
```

### ✅ APRÈS : Contrôleur utilisateur avec gestion des rôles
```java
@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "*")
public class UserController {
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final LeaveService leaveService;
    private final PerformanceService performanceService;

    @GetMapping("/{userId}/profile")
    @PreAuthorize("hasRole('ADMIN') or #userId == principal.id")
    public ResponseEntity<User> getUserProfile(@PathVariable Long userId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new UserNotFoundException("Utilisateur non trouvé"));
        return ResponseEntity.ok(user);
    }

    @GetMapping("/{userId}/dashboard")
    @PreAuthorize("hasRole('ADMIN') or #userId == principal.id")
    public ResponseEntity<Map<String, Object>> getUserDashboard(@PathVariable Long userId) {
        Map<String, Object> dashboard = new HashMap<>();
        
        User user = userRepository.findById(userId)
            .orElseThrow();

        dashboard.put("user", user);
        dashboard.put("role", user.getRoleEntity().getName());
        dashboard.put("performanceScore", user.getPerformanceScore());
        dashboard.put("recentActivities", performanceService.getUserPointLogs(userId));
        
        if ("EMPLOYEE".equals(user.getRoleEntity().getName())) {
            dashboard.put("leaves", leaveService.getLeavesByUser(userId));
        }
        
        return ResponseEntity.ok(dashboard);
    }

    @PostMapping("/{userId}/leaves")
    @PreAuthorize("hasRole('ADMIN') or #userId == principal.id")
    public ResponseEntity<?> requestLeave(
        @PathVariable Long userId,
        @RequestBody LeaveDTO leaveDTO
    ) {
        Leave leave = new Leave();
        leave.setStartDate(leaveDTO.getStartDate());
        leave.setEndDate(leaveDTO.getEndDate());
        leave.setReason(leaveDTO.getReason());
        leave.setLeaveType(leaveDTO.getLeaveType());
        
        leaveService.createLeave(userId, leave);
        return ResponseEntity.ok(Map.of("message", "Demande de congé créée avec succès"));
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(userRepository.findAll());
    }

    @GetMapping("/by-role/{roleId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<User>> getUsersByRole(@PathVariable Long roleId) {
        List<User> users = userRepository.findAll()
            .stream()
            .filter(u -> u.getRoleEntity() != null && u.getRoleEntity().getId().equals(roleId))
            .collect(Collectors.toList());
        return ResponseEntity.ok(users);
    }
}
```

---

## DTOs

### ❌ AVANT : LeaveDTO avec employeeId
```java
@Data
@NoArgsConstructor
@AllArgsConstructor
public class LeaveDTO {
    private Long id;
    private Long employeeId;
    private String employeeName;
    private String employeeSurname;
    private String startDate;
    private String endDate;
    private String reason;
    private String leaveType;
    private String status;
}
```

### ✅ APRÈS : LeaveDTO avec userId
```java
@Data
@NoArgsConstructor
@AllArgsConstructor
public class LeaveDTO {
    private Long id;
    private Long userId;
    private String userName;
    private String userFirstName;
    private String userLastName;
    private String startDate;
    private String endDate;
    private String reason;
    private String leaveType;
    private String status;

    public LeaveDTO(Leave leave) {
        this.id = leave.getId();
        if (leave.getUser() != null) {
            this.userId = leave.getUser().getId();
            this.userName = leave.getUser().getUsername();
            this.userFirstName = leave.getUser().getFirstName();
            this.userLastName = leave.getUser().getLastName();
        }
        this.startDate = leave.getStartDate();
        this.endDate = leave.getEndDate();
        this.reason = leave.getReason();
        this.leaveType = leave.getLeaveType();
        this.status = leave.getStatus().name();
    }
}
```

---

## Requêtes personnalisées

### ❌ AVANT : Requête avec Employee
```java
public interface EmployeeRepository extends JpaRepository<Employee, Long> {
    @Query("SELECT e.department as department, COUNT(e) as count FROM Employee e GROUP BY e.department")
    List<Map<String, Object>> countEmployeesByDepartment();

    Optional<Employee> findByUserId(Long userId);
}
```

### ✅ APRÈS : Requête avec User
```java
public interface UserRepository extends JpaRepository<User, Long> {
    @Query("SELECT u.department as department, COUNT(u.id) as count " +
           "FROM User u WHERE u.roleEntity.name = 'EMPLOYEE' " +
           "GROUP BY u.department")
    List<Map<String, Object>> countEmployeesByDepartment();

    @Query("SELECT u FROM User u WHERE u.roleEntity.name = :roleName")
    List<User> findByRole(@Param("roleName") String roleName);

    @Query("SELECT u FROM User u WHERE u.performanceScore > :minScore ORDER BY u.performanceScore DESC")
    List<User> findTopPerformers(@Param("minScore") Integer minScore);

    Optional<User> findByUsername(String username);
    Optional<User> findByEmail(String email);
    Optional<User> findByPhone(String phone);
}

@Query("SELECT new com.wifakbank.rh_system.dto.UserStatsDTO(" +
       "u.id, u.username, COUNT(l.id) as leaveCount, " +
       "COALESCE(AVG(e.score), 0) as avgScore) " +
       "FROM User u " +
       "LEFT JOIN Leave l ON u.id = l.user_id " +
       "LEFT JOIN Evaluation e ON u.id = e.user_id " +
       "GROUP BY u.id, u.username")
List<UserStatsDTO> getUsersWithStats();
```

---

## Patterns courants

### 1. Obtenir un utilisateur et ses données liées
```java
// AVANT
Employee emp = employeeRepository.findById(empId).orElseThrow();
User user = emp.getUser();

// APRÈS
User user = userRepository.findById(userId).orElseThrow();
// Toutes les données sont déjà dans User
```

### 2. Créer une entité avec utilisateur
```java
// AVANT
Leave leave = new Leave();
Employee emp = employeeRepository.findById(empId).orElseThrow();
leave.setEmployee(emp);

// APRÈS
Leave leave = new Leave();
User user = userRepository.findById(userId).orElseThrow();
leave.setUser(user);
```

### 3. Filtrer par rôle
```java
// AVANT - Pas possible directement, besoin d'aller via l'énumération User.role

// APRÈS
List<User> admins = userRepository.findAll()
    .stream()
    .filter(u -> "ADMIN".equals(u.getRoleEntity().getName()))
    .collect(Collectors.toList());

// OU avec une requête optimisée
@Query("SELECT u FROM User u WHERE u.roleEntity.name = 'ADMIN'")
List<User> findAdmins();
```

### 4. Mettre à jour le score de performance
```java
// AVANT
Employee emp = employeeRepository.findById(empId).orElseThrow();
emp.setPerformanceScore(emp.getPerformanceScore() + 10);
employeeRepository.save(emp);

// APRÈS
User user = userRepository.findById(userId).orElseThrow();
user.setPerformanceScore(user.getPerformanceScore() + 10);
userRepository.save(user);

// Plus log des points
PointLog log = PointLog.builder()
    .user(user)
    .pointsChanged(10)
    .reason("Tâche complétée")
    .date(LocalDateTime.now())
    .build();
pointLogRepository.save(log);
```

---

## Checklist de migration

- [ ] Remplacer tous les imports `Employee` par `User` où approprié
- [ ] Mettre à jour les appels `findByUserId()` pour utiliser `findById()`
- [ ] Remplacer `.getEmployee()` par `.getUser()`
- [ ] Remplacer `.setEmployee()` par `.setUser()`
- [ ] Mettre à jour les DTOs pour utiliser userId au lieu de employeeId
- [ ] Vérifier que tous les contrôleurs utilisent les bonnes requêtes
- [ ] Tester les performances avec les nouvelles requêtes
- [ ] Valider que toutes les relations sont correctes

---

**Dernière mise à jour** : Juin 2026
