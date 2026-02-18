import {
  Controller,
  Get,
  Post,
  Put,
  Param,
  Body,
  Query,
  UseGuards,
} from "@nestjs/common";
import { ContactService } from "./contact.service";
import { CreateContactDto } from "./dto/create-contact.dto";
import { UpdateContactDto } from "./dto/update-contact.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../../common/guards/roles.guard";
import { Roles } from "../../common/decorators/roles.decorator";

@Controller("contacts")
export class ContactController {
  constructor(private readonly contactService: ContactService) {}

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("SUPER_ADMIN")
  async getContacts(@Query() query: any) {
    return this.contactService.getContacts(query);
  }

  @Get(":id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("SUPER_ADMIN")
  async getContactById(@Param("id") id: string) {
    return this.contactService.getContactById(id);
  }

  @Post()
  async createContact(@Body() createContactDto: CreateContactDto) {
    return this.contactService.createContact(createContactDto);
  }

  @Put(":id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("SUPER_ADMIN")
  async updateContact(
    @Param("id") id: string,
    @Body() updateContactDto: UpdateContactDto,
  ) {
    return this.contactService.updateContact(id, updateContactDto);
  }

  @Put(":id/read")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("SUPER_ADMIN")
  async markAsRead(@Param("id") id: string) {
    return this.contactService.markAsRead(id);
  }

  @Post("demo")
  async submitDemoRequest(@Body() body: any) {
    return { success: true, message: "Demo request submitted" };
  }

  @Post(":id/reply")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("SUPER_ADMIN")
  async replyToContact(
    @Param("id") id: string,
    @Body() body: { message: string },
  ) {
    return { success: true, message: "Reply sent" };
  }
}
