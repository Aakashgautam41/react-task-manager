import { render, screen, fireEvent } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { describe, it, expect, vi } from "vitest";
import Login from "./Login";

// 1. Mock the Service directly
// We tell Vitest: "Intercept calls to '../services/auth' and replace loginUser with a dummy function"
vi.mock("../services/auth", () => ({
  loginUser: vi.fn(), // A fake function that does nothing
}));

describe("Login Component", () => {
  it("should have the login button disabled initially", () => {
    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );

    // Find the button (case insensitive search for "Login")
    const button = screen.getByRole("button", { name: /login/i });

    // It should be disabled because fields are empty
    expect(button).toBeDisabled();
  });

  it("should enable the button when inputs are filled", () => {
    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );

    const button = screen.getByRole("button", { name: /login/i });
    const usernameInput = screen.getByPlaceholderText(/username/i); // Matches placeholder="Enter your username"
    const passwordInput = screen.getByPlaceholderText(/••••••••/i);

    // 2. Simulate User Typing
    // The component re-renders because we set mode: "onChange"
    fireEvent.change(usernameInput, { target: { value: "testuser" } });
    fireEvent.change(passwordInput, { target: { value: "password123" } });

    // 3. Assert it is now enabled
    expect(button).not.toBeDisabled();
  });
});
