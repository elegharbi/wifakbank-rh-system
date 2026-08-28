package com.wifakbank.rh_system.repository;

import com.wifakbank.rh_system.PointLog;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface PointLogRepository extends JpaRepository<PointLog, Long> {
    List<PointLog> findByUserIdOrderByDateDesc(Long userId);


}


