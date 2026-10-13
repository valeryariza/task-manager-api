import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import { AuthenticationError, ConflictError } from '../errors';
import { PublicUser, userRepository } from '../persistence/userRepository';

const SALT_ROUNDS = 10;

/** Lógica de negocio de autenticación. */
export const authService = {
  /**
   * Registra un usuario nuevo con la contraseña hasheada.
   * @throws ConflictError si el email ya está registrado.
   */
  async register(nombre: string, email: string, password: string): Promise<PublicUser> {
    const normalizedEmail = email.trim().toLowerCase();

    const existing = await userRepository.findByEmail(normalizedEmail);
    if (existing) {
      throw new ConflictError('El email ya está registrado');
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    try {
      return await userRepository.create(nombre.trim(), normalizedEmail, passwordHash);
    } catch (error) {
      // 23505 = violación de UNIQUE (dos registros simultáneos con el mismo email)
      if ((error as { code?: string }).code === '23505') {
        throw new ConflictError('El email ya está registrado');
      }
      throw error;
    }
  },

  /**
   * Verifica las credenciales y devuelve un JWT.
   * @throws AuthenticationError si el email o la contraseña son incorrectos.
   */
  async login(email: string, password: string): Promise<{ token: string; user: PublicUser }> {
    const user = await userRepository.findByEmail(email.trim().toLowerCase());

    const isValid = user ? await bcrypt.compare(password, user.password_hash) : false;
    if (!user || !isValid) {
      throw new AuthenticationError('Credenciales inválidas');
    }

    const token = jwt.sign({ email: user.email }, config.jwt.secret, {
      subject: String(user.id),
      expiresIn: config.jwt.expiresIn as jwt.SignOptions['expiresIn'],
      algorithm: 'HS256',
    });

    const { password_hash: _omit, ...publicUser } = user;
    return { token, user: publicUser };
  },
};