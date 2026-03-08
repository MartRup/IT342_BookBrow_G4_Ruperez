package edu.cit.ruperez.bookbrow.service;

import edu.cit.ruperez.bookbrow.dto.request.LoginRequest;
import edu.cit.ruperez.bookbrow.dto.request.RegisterRequest;
import edu.cit.ruperez.bookbrow.dto.response.AuthResponse;

public interface AuthService {
    AuthResponse register(RegisterRequest request);
    AuthResponse login(LoginRequest request);
}
