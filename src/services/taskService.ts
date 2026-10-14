import { NotFoundError, ValidationError } from '../errors';
import {
  CreateTaskData,
  Task,
  taskRepository,
  UpdateTaskData,
} from '../persistence/taskRepository';

const TASK_NOT_FOUND = 'Tarea no encontrada';

/** Lógica de negocio de las tareas. */
export const taskService = {
  /** Devuelve las tareas del usuario. */
  getAll(userId: number): Promise<Task[]> {
    return taskRepository.findAllByUser(userId);
  },

  /**
   * Devuelve una tarea del usuario.
   * @throws NotFoundError si no existe o pertenece a otro usuario.
   */
  async getById(id: number, userId: number): Promise<Task> {
    const task = await taskRepository.findByIdAndUser(id, userId);
    if (!task) {
      throw new NotFoundError(TASK_NOT_FOUND);
    }
    return task;
  },

  /** Crea una tarea para el usuario. */
  create(userId: number, data: CreateTaskData): Promise<Task> {
    return taskRepository.create(userId, data);
  },

  /**
   * Modifica una tarea del usuario.
   * @throws ValidationError si no se envía ningún campo.
   * @throws NotFoundError si no existe o pertenece a otro usuario.
   */
  async update(id: number, userId: number, data: UpdateTaskData): Promise<Task> {
    const hasChanges = Object.values(data).some((value) => value !== undefined);
    if (!hasChanges) {
      throw new ValidationError('Debes enviar al menos un campo para actualizar');
    }

    const task = await taskRepository.update(id, userId, data);
    if (!task) {
      throw new NotFoundError(TASK_NOT_FOUND);
    }
    return task;
  },

  /**
   * Elimina una tarea del usuario.
   * @throws NotFoundError si no existe o pertenece a otro usuario.
   */
  async delete(id: number, userId: number): Promise<void> {
    const deleted = await taskRepository.delete(id, userId);
    if (!deleted) {
      throw new NotFoundError(TASK_NOT_FOUND);
    }
  },
};