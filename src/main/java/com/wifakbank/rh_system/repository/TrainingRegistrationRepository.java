package com.wifakbank.rh_system.repository;

import com.wifakbank.rh_system.TrainingRegistration;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface TrainingRegistrationRepository extends JpaRepository<TrainingRegistration, Long> {
    List<TrainingRegistration> findByUserId(Long userId);
    List<TrainingRegistration> findByTrainingId(Long trainingId);
    boolean existsByUserIdAndTrainingId(Long userId, Long trainingId);


}

