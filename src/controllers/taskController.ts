import { Request, Response } from 'express';
import { taskService } from '../services/taskService';
import { getUserId, parseId } from '../utils/requestHelpers';

/** Controlador de los endpoints de tareas. */
export const taskController = {
  /** GET /tasks */
  async getAll(req: Request, res: Response): Promise<void> {
    const tasks = await taskService.getAll(getUserId(req));
    res.json({ tasks });
  },

  /** GET /tasks/:id */
  async getById(req: Request, res: Response): Promise<void> {
    const task = await taskService.getById(parseId(req.params.id), getUserId(req));
    res.json({ task });
  },

  /** POST /tasks */
  async create(req: Request, res: Response): Promise<void> {
    const { titulo, descripcion, fecha_vencimiento, estado } = req.body;
    const task = await taskService.create(getUserId(req), {
      titulo,
      descripcion,
      fecha_vencimiento,
      estado,
    });
    res.status(201).json({ task });
  },

  /** PUT /tasks/:id */
  async update(req: Request, res: Response): Promise<void> {
    const { titulo, descripcion, fecha_vencimiento, estado } = req.body;
    const task = await taskService.update(parseId(req.params.id), getUserId(req), {
      titulo,
      descripcion,
      fecha_vencimiento,
      estado,
    });
    res.json({ task });
  },

  /** DELETE /tasks/:id */
  async delete(req: Request, res: Response): Promise<void> {
    await taskService.delete(parseId(req.params.id), getUserId(req));
    res.status(204).send();
  },
};