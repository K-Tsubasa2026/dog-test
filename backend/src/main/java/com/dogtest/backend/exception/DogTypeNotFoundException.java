package com.dogtest.backend.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.NOT_FOUND)
public class DogTypeNotFoundException extends RuntimeException {
    public DogTypeNotFoundException(String message) {
        super(message);
    }
}
