package com.wifakbank.rh_system.repository;

import com.wifakbank.rh_system.Event;
import org.springframework.data.jpa.repository.JpaRepository;

public interface EventRepository extends JpaRepository<Event, Long> {
}
