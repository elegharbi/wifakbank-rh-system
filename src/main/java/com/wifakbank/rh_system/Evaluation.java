package com.wifakbank.rh_system;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "evaluations")
public class Evaluation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Min(value = 1, message = "Le score minimum est 1")
    @Max(value = 5, message = "Le score maximum est 5")
    @NotNull(message = "Le score est obligatoire")
    private Integer score;
    
    @NotBlank(message = "Le feedback est obligatoire")
    private String feedback;
    private String strengthPoints;
    private String improvementAreas;
    private String evaluationDate;
    
    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    @ManyToOne(optional = true)
    @JoinColumn(name = "evaluator_id", nullable = true)
    private User evaluator;

    public Evaluation() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Integer getScore() { return score; }
    public void setScore(Integer score) { this.score = score; }
    public String getFeedback() { return feedback; }
    public void setFeedback(String feedback) { this.feedback = feedback; }
    public String getStrengthPoints() { return strengthPoints; }
    public void setStrengthPoints(String strengthPoints) { this.strengthPoints = strengthPoints; }
    public String getImprovementAreas() { return improvementAreas; }
    public void setImprovementAreas(String improvementAreas) { this.improvementAreas = improvementAreas; }
    public String getEvaluationDate() { return evaluationDate; }
    public void setEvaluationDate(String evaluationDate) { this.evaluationDate = evaluationDate; }
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
    public User getEvaluator() { return evaluator; }
    public void setEvaluator(User evaluator) { this.evaluator = evaluator; }


}

