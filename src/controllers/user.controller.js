import { UserService } from "#services/user.service";
import { UserDto } from "#dto/user.dto";
import { signToken } from "#lib/jwt";
import { validateData } from "#lib/validate";
import { registerSchema, loginSchema } from "#schemas/user.schema";

export class UserController {
  static async register(req, res) {
    const validatedData = validateData(registerSchema, req.body);
    const user = await UserService.register(validatedData);
    const token = await signToken({ userId: user.id });

    res.status(201).json({
      success: true,
      user: UserDto.transform(user),
      token,
    });
  }

  static async login(req, res) {
    const validatedData = validateData(loginSchema, req.body);
    const { email, password } = validatedData;

    const {accessToken, refreshToken, user} = await UserService.login(
      req.body.email, 
      req.body.password,
      req.ip,
      req.headers['user-agent']
    );

    res.json({
      success: true,
      user: UserDto.transform(user),
      accessToken,
      refreshToken,
    });
  }

  static async logout(req, res) {
    const accessToken = req.headers.authorization?.split(' ')[1];
    const { refreshToken } = req.body;

    await UserService.logout(req.user.id, accessToken, refreshToken);
    
    res.json({ success: true, message: "Déconnexion réussie" });
  }

  static async getAll(req, res) {
    const users = await UserService.findAll();
    res.json({
      success: true,
      users: UserDto.transform(users),
    });
  }

  static async getById(req, res) {
    const user = await UserService.findById(parseInt(req.params.id));
    res.json({
      success: true,
      user: UserDto.transform(user),
    });
  }
}
