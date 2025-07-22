import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import SignUp from "../pages/SignUp";

vi.mock("react-router-dom", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react-router-dom")>();
  return {
    ...actual,
    Link: actual.Link,
    useNavigate: vi.fn(),
    MemoryRouter: actual.MemoryRouter,
  };
});

vi.mock("../config/api", () => ({
  api: {
    post: vi.fn(),
  },
  API_ROUTES: {
    REGISTER: "/register",
  },
}));

import { API_ROUTES, api as mockedApi } from "../config/api";

import { SIGNUP_TEXT } from "../constants/text";

describe("Sign Up Page (Basic Tests)", () => {
  beforeEach(() => {
    (mockedApi.post as ReturnType<typeof vi.fn>).mockClear();
    vi.spyOn(console, "log").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  const renderWithRouter = () => {
    return render(
      <MemoryRouter>
        <SignUp />
      </MemoryRouter>
    );
  };

  test("renders name, email, password, confirm password inputs and signup button", () => {
    renderWithRouter();

    expect(
      screen.getByPlaceholderText(SIGNUP_TEXT.placeholders.name)
    ).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText(SIGNUP_TEXT.placeholders.email)
    ).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText(SIGNUP_TEXT.placeholders.password)
    ).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText(SIGNUP_TEXT.placeholders.confirmPassword)
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button", { name: SIGNUP_TEXT.button })
    ).toBeInTheDocument();

    expect(screen.getByRole("link", { name: /log in/i })).toBeInTheDocument();
  });

  test("allows typing into all input fields", async () => {
    renderWithRouter();
    const user = userEvent.setup();

    const nameInput = screen.getByPlaceholderText(
      SIGNUP_TEXT.placeholders.name
    );
    const emailInput = screen.getByPlaceholderText(
      SIGNUP_TEXT.placeholders.email
    );
    const passwordInput = screen.getByPlaceholderText(
      SIGNUP_TEXT.placeholders.password
    );
    const confirmPasswordInput = screen.getByPlaceholderText(
      SIGNUP_TEXT.placeholders.confirmPassword
    );

    await user.type(nameInput, "John Doe");
    await user.type(emailInput, "john.doe@example.com");
    await user.type(passwordInput, "SecureP@ss1");
    await user.type(confirmPasswordInput, "SecureP@ss1");

    expect(nameInput).toHaveValue("John Doe");
    expect(emailInput).toHaveValue("john.doe@example.com");
    expect(passwordInput).toHaveValue("SecureP@ss1");
    expect(confirmPasswordInput).toHaveValue("SecureP@ss1");
  });

  test("displays validation errors for invalid name, email, short password, and password mismatch on submit", async () => {
    renderWithRouter();
    const user = userEvent.setup();

    const nameInput = screen.getByPlaceholderText(
      SIGNUP_TEXT.placeholders.name
    );
    const emailInput = screen.getByPlaceholderText(
      SIGNUP_TEXT.placeholders.email
    );
    const passwordInput = screen.getByPlaceholderText(
      SIGNUP_TEXT.placeholders.password
    );
    const confirmPasswordInput = screen.getByPlaceholderText(
      SIGNUP_TEXT.placeholders.confirmPassword
    );
    const signUpButton = screen.getByRole("button", {
      name: SIGNUP_TEXT.button,
    });

    await user.type(nameInput, "John");
    await user.type(emailInput, "invalid-email");
    await user.type(passwordInput, "short");
    await user.type(confirmPasswordInput, "mismatch");

    await user.click(signUpButton);

    await waitFor(() => {
      expect(screen.getByText(/Full name is required/i)).toBeInTheDocument();
      expect(screen.getByText(/Enter a valid email/i)).toBeInTheDocument();
      expect(
        screen.getByText(/Password must be at least 6 characters/i)
      ).toBeInTheDocument();
      expect(screen.getByText(/Passwords do not match/i)).toBeInTheDocument();
    });

    expect(mockedApi.post).not.toHaveBeenCalled();
  });

  test("clears validation errors when input becomes valid", async () => {
    renderWithRouter();
    const user = userEvent.setup();

    const nameInput = screen.getByPlaceholderText(
      SIGNUP_TEXT.placeholders.name
    );
    const emailInput = screen.getByPlaceholderText(
      SIGNUP_TEXT.placeholders.email
    );
    const passwordInput = screen.getByPlaceholderText(
      SIGNUP_TEXT.placeholders.password
    );
    const confirmPasswordInput = screen.getByPlaceholderText(
      SIGNUP_TEXT.placeholders.confirmPassword
    );
    const signUpButton = screen.getByRole("button", {
      name: SIGNUP_TEXT.button,
    });

    await user.click(signUpButton);
    await user.type(nameInput, "John");
    await user.type(emailInput, "invalid-email");
    await user.type(passwordInput, "short");
    await user.type(confirmPasswordInput, "mismatch");

    await waitFor(() => {
      expect(screen.getByText(/Full name is required/i)).toBeInTheDocument();
      expect(screen.getByText(/Enter a valid email/i)).toBeInTheDocument();
      expect(
        screen.getByText(/Password must be at least 6 characters/i)
      ).toBeInTheDocument();
      expect(screen.getByText(/Passwords do not match/i)).toBeInTheDocument();
    });

    await user.clear(nameInput);
    await user.type(nameInput, "Valid Name");
    expect(
      screen.queryByText(/Full name is required/i)
    ).not.toBeInTheDocument();

    await user.clear(emailInput);
    await user.type(emailInput, "valid@example.com");
    expect(screen.queryByText(/Enter a valid email/i)).not.toBeInTheDocument();

    await user.clear(passwordInput);
    await user.type(passwordInput, "ValidP@ss1");
    expect(
      screen.queryByText(/Password must be at least 6 characters/i)
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText(
        /Password must contain both uppercase and lowercase letters/i
      )
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText(/Password must include at least one number/i)
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText(
        /Password must include at least one special character/i
      )
    ).not.toBeInTheDocument();

    await user.clear(confirmPasswordInput);
    await user.type(confirmPasswordInput, "ValidP@ss1");
    expect(
      screen.queryByText(/Passwords do not match/i)
    ).not.toBeInTheDocument();
  });

  test("handles successful signup: calls API and clears form", async () => {
    renderWithRouter();
    const user = userEvent.setup();

    const nameInput = screen.getByPlaceholderText(
      SIGNUP_TEXT.placeholders.name
    );
    const emailInput = screen.getByPlaceholderText(
      SIGNUP_TEXT.placeholders.email
    );
    const passwordInput = screen.getByPlaceholderText(
      SIGNUP_TEXT.placeholders.password
    );
    const confirmPasswordInput = screen.getByPlaceholderText(
      SIGNUP_TEXT.placeholders.confirmPassword
    );
    const signUpButton = screen.getByRole("button", {
      name: SIGNUP_TEXT.button,
    });

    (mockedApi.post as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce({
        status: 201,
        data: { message: "User registered successfully" },
      })
      .mockResolvedValueOnce({
        status: 200,
        data: { message: "User logged in successfully" },
      });

    await user.type(nameInput, "Test User");
    await user.type(emailInput, "test@example.com");
    await user.type(passwordInput, "SecureP@ss1");
    await user.type(confirmPasswordInput, "SecureP@ss1");

    await user.click(signUpButton);

    expect(mockedApi.post).toHaveBeenCalledTimes(2);
    expect(mockedApi.post).toHaveBeenCalledWith(API_ROUTES.REGISTER, {
      name: "Test User",
      email: "test@example.com",
      password: "SecureP@ss1",
    });
    expect(mockedApi.post).toHaveBeenCalledWith(API_ROUTES.LOGIN, {
      email: "test@example.com",
      password: "SecureP@ss1",
    });

    await waitFor(() => {
      expect(nameInput).toHaveValue("");
      expect(emailInput).toHaveValue("");
      expect(passwordInput).toHaveValue("");
      expect(confirmPasswordInput).toHaveValue("");
    });

    expect(console.log).toHaveBeenCalledWith(
      SIGNUP_TEXT.logs.success,
      expect.any(Object)
    );
    expect(screen.queryByTestId("form-error-box")).not.toBeInTheDocument();
  });

  test("displays conflict error for 409 API response (user already exists)", async () => {
    renderWithRouter();
    const user = userEvent.setup();

    const nameInput = screen.getByPlaceholderText(
      SIGNUP_TEXT.placeholders.name
    );
    const emailInput = screen.getByPlaceholderText(
      SIGNUP_TEXT.placeholders.email
    );
    const passwordInput = screen.getByPlaceholderText(
      SIGNUP_TEXT.placeholders.password
    );
    const confirmPasswordInput = screen.getByPlaceholderText(
      SIGNUP_TEXT.placeholders.confirmPassword
    );
    const signUpButton = screen.getByRole("button", {
      name: SIGNUP_TEXT.button,
    });

    (mockedApi.post as ReturnType<typeof vi.fn>).mockRejectedValue({
      response: { status: 409 },
    });

    await user.type(nameInput, "Existing User");
    await user.type(emailInput, "existing@example.com");
    await user.type(passwordInput, "SecureP@ss1");
    await user.type(confirmPasswordInput, "SecureP@ss1");

    await user.click(signUpButton);

    await waitFor(() => {
      expect(screen.getByText(SIGNUP_TEXT.alerts.conflict)).toBeInTheDocument();
    });
    expect(console.error).toHaveBeenCalledWith(
      SIGNUP_TEXT.logs.failure,
      expect.any(Object)
    );
  });

  test("displays invalid data error for 400 API response", async () => {
    renderWithRouter();
    const user = userEvent.setup();

    const nameInput = screen.getByPlaceholderText(
      SIGNUP_TEXT.placeholders.name
    );
    const emailInput = screen.getByPlaceholderText(
      SIGNUP_TEXT.placeholders.email
    );
    const passwordInput = screen.getByPlaceholderText(
      SIGNUP_TEXT.placeholders.password
    );
    const confirmPasswordInput = screen.getByPlaceholderText(
      SIGNUP_TEXT.placeholders.confirmPassword
    );
    const signUpButton = screen.getByRole("button", {
      name: SIGNUP_TEXT.button,
    });

    (mockedApi.post as ReturnType<typeof vi.fn>).mockRejectedValue({
      response: { status: 400 },
    });

    await user.type(nameInput, "Server Invalid");
    await user.type(emailInput, "server.invalid@example.com");
    await user.type(passwordInput, "SecureP@ss1");
    await user.type(confirmPasswordInput, "SecureP@ss1");

    await user.click(signUpButton);

    await waitFor(() => {
      expect(screen.getByText(SIGNUP_TEXT.alerts.invalid)).toBeInTheDocument();
    });
    expect(console.error).toHaveBeenCalledWith(
      SIGNUP_TEXT.logs.failure,
      expect.any(Object)
    );
  });

  test("displays generic server error for 500 API response", async () => {
    renderWithRouter();
    const user = userEvent.setup();

    const nameInput = screen.getByPlaceholderText(
      SIGNUP_TEXT.placeholders.name
    );
    const emailInput = screen.getByPlaceholderText(
      SIGNUP_TEXT.placeholders.email
    );
    const passwordInput = screen.getByPlaceholderText(
      SIGNUP_TEXT.placeholders.password
    );
    const confirmPasswordInput = screen.getByPlaceholderText(
      SIGNUP_TEXT.placeholders.confirmPassword
    );
    const signUpButton = screen.getByRole("button", {
      name: SIGNUP_TEXT.button,
    });

    (mockedApi.post as ReturnType<typeof vi.fn>).mockRejectedValue({
      response: { status: 500 },
    });

    await user.type(nameInput, "Server Error");
    await user.type(emailInput, "server.error@example.com");
    await user.type(passwordInput, "SecureP@ss1");
    await user.type(confirmPasswordInput, "SecureP@ss1");

    await user.click(signUpButton);

    await waitFor(() => {
      expect(screen.getByText(SIGNUP_TEXT.alerts.server)).toBeInTheDocument();
    });
    expect(console.error).toHaveBeenCalledWith(
      SIGNUP_TEXT.logs.failure,
      expect.any(Object)
    );
  });

  test("displays network error when no API response is received", async () => {
    renderWithRouter();
    const user = userEvent.setup();

    const nameInput = screen.getByPlaceholderText(
      SIGNUP_TEXT.placeholders.name
    );
    const emailInput = screen.getByPlaceholderText(
      SIGNUP_TEXT.placeholders.email
    );
    const passwordInput = screen.getByPlaceholderText(
      SIGNUP_TEXT.placeholders.password
    );
    const confirmPasswordInput = screen.getByPlaceholderText(
      SIGNUP_TEXT.placeholders.confirmPassword
    );
    const signUpButton = screen.getByRole("button", {
      name: SIGNUP_TEXT.button,
    });

    (mockedApi.post as ReturnType<typeof vi.fn>).mockRejectedValue(
      new Error("Network Down")
    );

    await user.type(nameInput, "Network Error");
    await user.type(emailInput, "network.error@example.com");
    await user.type(passwordInput, "SecureP@ss1");
    await user.type(confirmPasswordInput, "SecureP@ss1");

    await user.click(signUpButton);

    await waitFor(() => {
      expect(screen.getByText(SIGNUP_TEXT.alerts.network)).toBeInTheDocument();
    });
    expect(console.error).toHaveBeenCalledWith(
      SIGNUP_TEXT.logs.failure,
      expect.any(Object)
    );
  });
});
