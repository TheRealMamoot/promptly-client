import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, test, vi } from "vitest";
import Login from "../pages/Login";

const mockNavigate = vi.fn();
vi.mock("react-router-dom", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react-router-dom")>();
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    Link: actual.Link,
    MemoryRouter: actual.MemoryRouter,
  };
});

vi.mock("../config/api", () => ({
  api: {
    post: vi.fn(),
  },
  API_ROUTES: {
    LOGIN: "/login",
  },
}));

import { API_ROUTES, api as mockedApi } from "../config/api";
import { SIGNUP_TEXT } from "../constants/text";

describe("Login Page (Basic Tests)", () => {
  beforeEach(() => {
    mockNavigate.mockClear();
    (mockedApi.post as ReturnType<typeof vi.fn>).mockClear();
  });

  const renderWithRouter = () => {
    return render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>,
    );
  };

  test("renders email and password inputs and a login button", () => {
    renderWithRouter();

    expect(screen.getByPlaceholderText("Email")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Password")).toBeInTheDocument();

    expect(screen.getByRole("button", { name: /log in/i })).toBeInTheDocument();

    expect(
      screen.getByRole("link", { name: SIGNUP_TEXT.title }),
    ).toBeInTheDocument();
    expect(screen.getByText("Don't have an account?")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /sign up/i })).toBeInTheDocument();
  });

  test("allows typing into email and password fields", async () => {
    renderWithRouter();
    const user = userEvent.setup();

    const emailInput = screen.getByPlaceholderText("Email");
    const passwordInput = screen.getByPlaceholderText("Password");

    await user.type(emailInput, "test@example.com");
    await user.type(passwordInput, "password123");

    expect(emailInput).toHaveValue("test@example.com");
    expect(passwordInput).toHaveValue("password123");
  });

  test("handles successful login: calls API, clears form, navigates to home", async () => {
    renderWithRouter();
    const user = userEvent.setup();

    const emailInput = screen.getByPlaceholderText("Email");
    const passwordInput = screen.getByPlaceholderText("Password");
    const loginButton = screen.getByRole("button", { name: /log in/i });

    (mockedApi.post as ReturnType<typeof vi.fn>).mockResolvedValue({
      status: 200,
      data: { message: "Login successful" },
    });

    await user.type(emailInput, "test@example.com");
    await user.type(passwordInput, "password123");

    await user.click(loginButton);

    expect(mockedApi.post).toHaveBeenCalledTimes(1);
    expect(mockedApi.post).toHaveBeenCalledWith(API_ROUTES.LOGIN, {
      email: "test@example.com",
      password: "password123",
    });

    await waitFor(() => {
      expect(emailInput).toHaveValue("");
      expect(passwordInput).toHaveValue("");
    });

    expect(mockNavigate).toHaveBeenCalledTimes(1);
    expect(mockNavigate).toHaveBeenCalledWith("/home");
  });

  test("displays validation errors for invalid email and empty password on submit", async () => {
    renderWithRouter();
    const user = userEvent.setup();

    const emailInput = screen.getByPlaceholderText("Email");
    const loginButton = screen.getByRole("button", { name: /log in/i });

    await user.type(emailInput, "invalid-email");

    await user.click(loginButton);

    await waitFor(() => {
      expect(screen.getByText("Enter a valid email")).toBeInTheDocument();
      expect(screen.getByText("Password is required")).toBeInTheDocument();
    });

    expect(mockedApi.post).not.toHaveBeenCalled();
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  test("clears validation errors when input becomes valid", async () => {
    renderWithRouter();
    const user = userEvent.setup();

    const emailInput = screen.getByPlaceholderText("Email");
    const passwordInput = screen.getByPlaceholderText("Password");
    const loginButton = screen.getByRole("button", { name: /log in/i });

    await user.click(loginButton);

    await waitFor(() => {
      expect(screen.getByText("Enter a valid email")).toBeInTheDocument();
      expect(screen.getByText("Password is required")).toBeInTheDocument();
    });

    await user.clear(emailInput);
    await user.type(emailInput, "valid@example.com");

    expect(screen.queryByText("Enter a valid email")).not.toBeInTheDocument();

    await user.clear(passwordInput);
    await user.type(passwordInput, "ValidPassword123!");

    expect(screen.queryByText("Password is required")).not.toBeInTheDocument();
  });
});
