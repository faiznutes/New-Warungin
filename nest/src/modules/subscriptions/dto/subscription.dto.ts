import { IsString, IsOptional, IsNumber, IsPositive } from "class-validator";

export class GetSubscriptionsDto {
  @IsOptional()
  @IsNumber()
  page: number = 1;

  @IsOptional()
  @IsNumber()
  limit: number = 10;
}

export class CreateSubscriptionDto {
  @IsString()
  planId: string;
}

export class UpgradeSubscriptionDto {
  @IsString()
  newPlanId: string;

  @IsString()
  plan: string;
}

export class AddAddonDto {
  @IsString()
  addonId: string;

  @IsOptional()
  @IsPositive()
  quantity: number = 1;
}
