import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import "../i18n";
import AuthLayout from "../components/auth/AuthLayout";

// Mock useAuth
const mockLogin = vi.fn();
const mockRegister = vi.fn();

vi.mock("../hooks/useAuth", () => ({
  useAuth: () => ({
    login: mockLogin,
    register: mockRegister,
    user: null,
    isAuthenticated: false,
    logout: vi.fn(),
  }),
}));

describe("AuthLayout Component (Double-Slider Sliding Overlay Auth)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders correctly in initial 'login' mode", () => {
    render(
      <MemoryRouter>
        <AuthLayout initialMode="login" />
      </MemoryRouter>
    );

    // Headline and branding
    expect(screen.getByText("Arif Car Sell")).toBeDefined();
    expect(screen.getByRole("heading", { name: "Welcome Back" })).toBeDefined();

    // Trust badges below card
    expect(screen.getByText(/500\+ Verified Cars/i)).toBeDefined();
    expect(screen.getByText(/99\.4% Buyer Satisfaction/i)).toBeDefined();

    // Inputs present
    expect(screen.getByLabelText(/Email address/i)).toBeDefined();
    expect(screen.getByLabelText("Password", { exact: true })).toBeDefined();

    // Quick fill demo buttons
    expect(screen.getByText(/Quick Test Demo Accounts:/i)).toBeDefined();
  });

  it("renders correctly in initial 'register' mode with role selection cards", () => {
    render(
      <MemoryRouter>
        <AuthLayout initialMode="register" />
      </MemoryRouter>
    );

    // Headline and register title
    expect(screen.getByRole("heading", { name: "Create Your Account" })).toBeDefined();

    // Role options present
    expect(screen.getByText(/I want to register as a:/i)).toBeDefined();
    expect(screen.getByText("Customer")).toBeDefined();
    expect(screen.getByText("Direct Car Listing")).toBeDefined();
    expect(screen.getByText("Auto Broker")).toBeDefined();

    // Form inputs present
    expect(screen.getByLabelText(/Full Name/i)).toBeDefined();
    expect(screen.getByLabelText(/Email Address/i)).toBeDefined();
    expect(screen.getByLabelText(/Phone Number/i)).toBeDefined();
  });

  it("allows switching between Sign In and Register tabs", () => {
    render(
      <MemoryRouter>
        <AuthLayout initialMode="login" />
      </MemoryRouter>
    );

    // Initially in login mode
    expect(screen.queryByLabelText(/Full Name/i)).toBeNull();

    // Click register tab on overlay
    const registerTabBtns = screen.getAllByRole("button", { name: "Register New Account" });
    fireEvent.click(registerTabBtns[0]);

    // Now full name input and role selector are visible
    expect(screen.getByLabelText(/Full Name/i)).toBeDefined();
    expect(screen.getByText(/I want to register as a:/i)).toBeDefined();

    // Switch back to login tab using exact tab button
    const signInTabBtns = screen.getAllByRole("button", { name: "Sign In" });
    fireEvent.click(signInTabBtns[0]);

    expect(screen.queryByLabelText(/Full Name/i)).toBeNull();
  });

  it("populates fields when a demo account button is clicked", () => {
    render(
      <MemoryRouter>
        <AuthLayout initialMode="login" />
      </MemoryRouter>
    );

    const emailInput = screen.getByLabelText(/Email address/i) as HTMLInputElement;
    const passwordInput = screen.getByLabelText("Password", { exact: true }) as HTMLInputElement;

    expect(emailInput.value).toBe("");

    // Click on Admin demo account button
    const adminBtn = screen.getByText("Administrator");
    fireEvent.click(adminBtn);

    expect(emailInput.value).toBe("abebe.k@autobroker.et");
    expect(passwordInput.value).toBe("password123");
  });

  it("toggles password visibility with eye icon", () => {
    render(
      <MemoryRouter>
        <AuthLayout initialMode="login" />
      </MemoryRouter>
    );

    const passwordInput = screen.getByLabelText("Password", { exact: true }) as HTMLInputElement;
    expect(passwordInput.type).toBe("password");

    const toggleBtn = screen.getByLabelText("Show password");
    fireEvent.click(toggleBtn);

    expect(passwordInput.type).toBe("text");

    fireEvent.click(screen.getByLabelText("Hide password"));
    expect(passwordInput.type).toBe("password");
  });

  it("calculates live password strength in register mode", () => {
    render(
      <MemoryRouter>
        <AuthLayout initialMode="register" />
      </MemoryRouter>
    );

    const passwordInput = screen.getByLabelText("Password", { exact: true }) as HTMLInputElement;

    // Type a weak password
    fireEvent.change(passwordInput, { target: { value: "123" } });
    expect(screen.getByText("Weak")).toBeDefined();

    // Type a stronger password with mixed case and numbers
    fireEvent.change(passwordInput, { target: { value: "Pass12345!" } });
    expect(screen.getByText("Strong")).toBeDefined();
  });

  it("calls login when login form is submitted", async () => {
    mockLogin.mockResolvedValueOnce({
      id: "user-1",
      name: "Dawit Lemma",
      email: "dawit.l@gmail.com",
      role: "buyer",
    });

    render(
      <MemoryRouter>
        <AuthLayout initialMode="login" />
      </MemoryRouter>
    );

    const emailInput = screen.getByLabelText(/Email address/i);
    const passwordInput = screen.getByLabelText("Password", { exact: true });
    const submitBtn = screen.getByRole("button", { name: /Sign In to Account/i });

    fireEvent.change(emailInput, { target: { value: "dawit.l@gmail.com" } });
    fireEvent.change(passwordInput, { target: { value: "password123" } });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith("dawit.l@gmail.com", "password123");
    });
  });

  it("calls register when registration form is submitted", async () => {
    mockRegister.mockResolvedValueOnce({
      id: "user-2",
      name: "Abebe Kebede",
      email: "abebe@example.com",
      phone: "+251 911 223344",
      role: "seller",
    });

    render(
      <MemoryRouter>
        <AuthLayout initialMode="register" defaultRole="seller" />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText(/Full Name/i), { target: { value: "Abebe Kebede" } });
    fireEvent.change(screen.getByLabelText(/Email Address/i), { target: { value: "abebe@example.com" } });
    fireEvent.change(screen.getByLabelText(/Phone Number/i), { target: { value: "+251 911 223344" } });
    fireEvent.change(screen.getByLabelText("Password", { exact: true }), { target: { value: "SecurePass123" } });

    const submitBtn = screen.getByRole("button", { name: /Create My Account/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(mockRegister).toHaveBeenCalledWith({
        name: "Abebe Kebede",
        email: "abebe@example.com",
        phone: "+251 911 223344",
        password: "SecurePass123",
        role: "seller",
      });
    });
  });
});
