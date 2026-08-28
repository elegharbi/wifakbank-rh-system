package com.wifakbank.rh_system.repository;
import com.wifakbank.rh_system.Leave;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface LeaveRepository extends JpaRepository<Leave, Long> {
    List<Leave> findByUserId(Long userId);
    List<Leave> findByUserIdOrderByStartDateDesc(Long userId);
    long countByStatus(String status);


}

