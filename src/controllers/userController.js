import * as userService from '../services/userService.js';

export async function createUserController(req, res) {
  try {
    const { name, email, password, role } = req.body;
    const avatarUrl = req.avatarUrl || null;
    const tenantId = req.tenant?.id;

    const user = await userService.createUser({
      tenantId,
      name,
      avatarUrl,
      email,
      password,
      role,
    });

    res.status(201).json(user);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

export async function getUsersController(req, res) {
  try {
    const tenantId = req.tenant?.id;
    const users = await userService.getUsers(tenantId);
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function getUserByIdController(req, res) {
  try {
    const { id } = req.params;
    if (!id) {
      throw new Error('ID do usuario e obrigatorio');
    }
    const tenantId = req.tenant?.id;
    const user = await userService.getUserById(tenantId, id);
    res.status(200).json(user);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

export async function deleteUserController(req, res) {
  try {
    const { id } = req.params;
    if (!id) {
      throw new Error('ID do usuario e obrigatorio');
    }
    const tenantId = req.tenant?.id;
    const deletedUser = await userService.deleteUser(tenantId, id);
    res.status(200).json(deletedUser);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

export async function updateUserController(req, res) {
  try {
    const { id } = req.params;

    const data = {
      ...req.body,
    };

    if (req.avatarUrl) {
      data.avatarUrl = req.avatarUrl;
    }

    const tenantId = req.tenant?.id;
    const updatedUser = await userService.updateUser(tenantId, id, data);

    res.status(200).json(updatedUser);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}
