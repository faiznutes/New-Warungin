import { Controller, Post, Body, UseGuards } from "@nestjs/common";
import { PasswordService } from "./password.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { CurrentUser } from "../../common/decorators/current-user.decorator";

@Controller("password")
export class PasswordController {
  constructor(private readonly passwordService: PasswordService) {}

  @Post("change")
  @UseGuards(JwtAuthGuard)
  async changePassword(
    @Body() body: { currentPassword: string; newPassword: string },
    @CurrentUser() user: any,
  ) {
    return this.passwordService.changePassword(
      user.id,
      body.currentPassword,
      body.newPassword,
    );
  }

  @Post("reset")
  async resetPassword(@Body() body: { email: string }) {
    return this.passwordService.resetPassword(body.email);
  }

  @Post("validate")
  async validatePasswordStrength(@Body() body: { password: string }) {
    return this.passwordService.validatePasswordStrength(body.password);
  }
}
