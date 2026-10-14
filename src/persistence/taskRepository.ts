import { pool } from './db';

export type TaskStatus = 'pendiente' | 'en curso' | 'completada';

export interface Task {
  id: number;
  titulo: string;
  descripcion: string | null;
  fecha_vencimiento: string | null;
  estado: TaskStatus;
  user_id: number;
  created_at: Date;
  updated_at: Date;
}

export interface CreateTaskData {
  titulo: string;
  descripcion?: string | null;
  fecha_vencimiento?: string | null;
  estado?: TaskStatus;
}

export type UpdateTaskData = Partial<CreateTaskData>;

/** Columnas que se pueden modificar. Lista blanca para construir el UPDATE de forma segura. */
const UPDATABLE_FIELDS = ['titulo', 'descripcion', 'fecha_vencimiento', 'estado'] as const;

/** Acceso a datos de la tabla tasks. Todas las consultas filtran por el dueño. */
export const taskRepository = {
  /** Lista las tareas de un usuario, de la más reciente a la más antigua. */
  async findAllByUser(userId: number): Promise<Task[]> {
    const result = await pool.query<Task>(
      'SELECT * FROM tasks WHERE user_id = $1 ORDER BY created_at DESC',
      [userId],
    );
    return result.rows;
  },

  /** Busca una tarea solo si pertenece al usuario. */
  async findByIdAndUser(id: number, userId: number): Promise<Task | null> {
    const result = await pool.query<Task>(
      'SELECT * FROM tasks WHERE id = $1 AND user_id = $2',
      [id, userId],
    );
    return result.rows[0] ?? null;
  },

  /** Crea una tarea asociada al usuario. */
  async create(userId: number, data: CreateTaskData): Promise<Task> {
    const result = await pool.query<Task>(
      `INSERT INTO tasks (titulo, descripcion, fecha_vencimiento, estado, user_id)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [
        data.titulo,
        data.descripcion ?? null,
        data.fecha_vencimiento ?? null,
        data.estado ?? 'pendiente',
        userId,
      ],
    );
    return result.rows[0];
  },

  /**
   * Actualiza solo los campos enviados.
   * Devuelve null si la tarea no existe o no pertenece al usuario.
   */
  async update(id: number, userId: number, data: UpdateTaskData): Promise<Task | null> {
    const sets: string[] = [];
    const values: unknown[] = [];

    for (const field of UPDATABLE_FIELDS) {
      if (data[field] !== undefined) {
        values.push(data[field]);
        sets.push(`${field} = $${values.length}`);
      }
    }

    values.push(id, userId);
    const result = await pool.query<Task>(
      `UPDATE tasks
       SET ${sets.join(', ')}, updated_at = NOW()
       WHERE id = $${values.length - 1} AND user_id = $${values.length}
       RETURNING *`,
      values,
    );
    return result.rows[0] ?? null;
  },

  /** Elimina una tarea del usuario. Devuelve true si se eliminó. */
  async delete(id: number, userId: number): Promise<boolean> {
    const result = await pool.query(
      'DELETE FROM tasks WHERE id = $1 AND user_id = $2',
      [id, userId],
    );
    return (result.rowCount ?? 0) > 0;
  },
};