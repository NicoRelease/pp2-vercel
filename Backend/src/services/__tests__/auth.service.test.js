// 👇 Primero mockeamos los módulos ESM
jest.unstable_mockModule("../../models/index.js", () => ({
  default: {
    User: {
      findOne: jest.fn(),
      create: jest.fn(),
    },
    Op: { or: Symbol("or") }
  }
}));

jest.unstable_mockModule("bcrypt", () => ({
  default: {
    hash: jest.fn(),
    compare: jest.fn()
  }
}));

jest.unstable_mockModule("jsonwebtoken", () => ({
  default: {
    sign: jest.fn()
  }
}));

// 👇 IMPORTACIONES después de mockear
import db from "../../models/index.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import { loginUser, registerUser } from "../auth.service.js";

describe("Auth Service", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  describe("loginUser()", () => {
    test("Debe loguear correctamente", async () => {
      const fakeUser = {
        id: 1,
        username: "test",
        email: "test@mail.com",
        password: "hashedPass"
      };

      db.User.findOne.mockResolvedValue(fakeUser);
      bcrypt.compare.mockResolvedValue(true);
      jwt.sign.mockReturnValue("fakeToken");

      const result = await loginUser("test", "123");

      expect(result).toEqual({
        user: {
          id: 1,
          username: "test",
          email: "test@mail.com"
        },
        token: "fakeToken"
      });
    });

    test("Debe fallar si usuario no existe", async () => {
      db.User.findOne.mockResolvedValue(null);

      await expect(loginUser("noExiste", "123"))
        .rejects
        .toThrow("Credenciales inválidas. Usuario o contraseña incorrectos.");
    });
  });

  describe("registerUser()", () => {
    test("Debe registrar correctamente", async () => {
      db.User.findOne.mockResolvedValue(null);
      bcrypt.hash.mockResolvedValue("hashedPass");
      db.User.create.mockResolvedValue({
        id: 2,
        username: "nuevo",
        email: "nuevo@mail.com"
      });
      jwt.sign.mockReturnValue("fakeToken");

      const result = await registerUser("nuevo", "nuevo@mail.com", "123456");

      expect(result.token).toBe("fakeToken");
      expect(result.user.email).toBe("nuevo@mail.com");
    });

    test("Debe fallar si el mail ya existe", async () => {
      db.User.findOne.mockResolvedValue({});

      await expect(registerUser("dup", "dup@mail.com", "123"))
        .rejects
        .toThrow("El correo electrónico ya está registrado.");
    });
  });
});
