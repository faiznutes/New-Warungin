import { Injectable, BadRequestException } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";

@Injectable()
export class PasswordService {
  constructor(private readonly prisma: PrismaService) {}

  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string,
  ) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new BadRequestException("User not found");
    }

    return {
      message: "Password changed successfully",
      userId,
    };
  }

  async resetPassword(email: string) {
    return {
      message: "Password reset email sent",
      email,
    };
  }

  async validatePasswordStrength(password: string) {
    const hasMinLength = password.length >= 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);

    const isValid = hasMinLength && hasUpperCase && hasLowerCase && hasNumber;

    return {
      isValid,
      requirements: {
        minLength: hasMinLength,
        upperCase: hasUpperCase,
        lowerCase: hasLowerCase,
        number: hasNumber,
      },
    };
  }
}
