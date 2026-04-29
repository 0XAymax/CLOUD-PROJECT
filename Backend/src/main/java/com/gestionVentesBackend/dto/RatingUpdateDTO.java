package com.gestionVentesBackend.dto;

public class RatingUpdateDTO {
    private Double rating;

    public RatingUpdateDTO() {
    }

    public RatingUpdateDTO(Double rating) {
        this.rating = rating;
    }

    public Double getRating() {
        return rating;
    }

    public void setRating(Double rating) {
        this.rating = rating;
    }
}
