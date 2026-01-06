import { UserService } from "#services/user.service";
import { UserDto } from "#dto/user.dto";
import { signToken } from "#lib/jwt";
import { validateData } from "#lib/validate";
import { registerSchema, loginSchema } from "#schemas/user.schema";

export class UserController {
  //register
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

  //Login
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

  //Logout
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


  //Refresh
  static async refresh(req, res) {
    const { refreshToken } = req.body;
    const result = await UserService.refresh(refreshToken, req.ip, req.headers['user-agent']);
    res.json({ success: true, ...result });
  }

  //Search User by Id
  static async getById(req, res) {
    const user = await UserService.findById(parseInt(req.params.id));
    res.json({
      success: true,
      user: UserDto.transform(user),
    });
  }
}
